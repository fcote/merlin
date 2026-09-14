import { test, expect } from '@playwright/test'

const endpoint = process.env.TEST_API_ENDPOINT ?? 'http://localhost:4300'

test('sign in, navigate primary pages, edit profile, and sign out', async ({
  page,
  request,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const username = `browser-${Date.now()}`
  const response = await request.post(`${endpoint}/graphql`, {
    data: {
      query:
        'mutation($inputs: SignUpField!) { userSignUp(inputs: $inputs) { id username apiToken } }',
      variables: { inputs: { username, password: 'browser-test-password' } },
    },
  })
  expect((await response.json()).errors).toBeUndefined()
  await page.addInitScript((url) => {
    Object.defineProperty(window, 'ENDPOINT', { get: () => url, set: () => {} })
  }, endpoint)
  await page.goto('/login')
  await page.getByLabel('Username').fill(username)
  await page.getByLabel('Password').fill('browser-test-password')
  await page.locator('button[type=submit]').click()
  await expect(page).toHaveURL(/\/home$/)
  for (const route of [
    'portfolio',
    'watchlist',
    'tracker',
    'earnings-calendar',
    'profile',
    'logs',
  ]) {
    await page.goto(`/${route}`)
    await expect(page.locator('.site-content')).toBeVisible()
    await page.waitForTimeout(500)
    expect(errors, `browser errors on ${route}`).toEqual([])
  }
  await page.goto('/profile')
  await expect(page.getByLabel('Username')).toHaveValue(username)
  await page.getByLabel('Currency').fill('EUR')
  const saved = page.waitForResponse(
    (res) =>
      res.url().includes('/graphql') &&
      res.request().method() === 'POST' &&
      (res.request().postData() ?? '').includes('updateUser')
  )
  await page.locator('button[type=submit]').click()
  await saved
  await page.reload()
  await expect(page.getByLabel('Currency')).toHaveValue('EUR')
  await page.screenshot({ path: 'test-results/profile.png', fullPage: true })
  await page.getByRole('button', { name: 'Logout' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await page.goto('/portfolio')
  await expect(page).toHaveURL(/\/login$/)
  expect(errors).toEqual([])
})

test('a rejected login releases the spinner and allows retry', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.addInitScript((url) => {
    Object.defineProperty(window, 'ENDPOINT', { get: () => url, set: () => {} })
  }, endpoint)
  await page.goto('/login')
  await page.getByLabel('Username').fill('does-not-exist')
  await page.getByLabel('Password').fill('wrong-password')
  await page.locator('button[type=submit]').click()
  await expect(page.getByText('USER_NOT_FOUND')).toBeVisible()
  await expect(page.locator('button[type=submit]')).not.toHaveClass(
    /ant-btn-loading/
  )
  expect(errors).toEqual([])
})

test('chart renders historical data, responds to pointer movement, and remounts', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.context().addCookies([
    { name: 'userId', value: 'chart-test', url: 'http://localhost:4400' },
    { name: 'username', value: 'chart-test', url: 'http://localhost:4400' },
    { name: 'apiToken', value: 'chart-test', url: 'http://localhost:4400' },
  ])
  await page.addInitScript((url) => {
    Object.defineProperty(window, 'ENDPOINT', { get: () => url, set: () => {} })
  }, endpoint)
  await page.routeWebSocket('**/subscriptions', (ws) => {
    ws.onMessage((message) => {
      if (JSON.parse(String(message)).type === 'connection_init')
        ws.send(JSON.stringify({ type: 'connection_ack' }))
    })
  })
  await page.route('**/graphql*', async (route) => {
    const req = route.request()
    const operation =
      req.method() === 'POST'
        ? req.postDataJSON()?.operationName
        : new URL(req.url()).searchParams.get('operationName')
    const prices = Array.from({ length: 260 }, (_, i) => ({
      __typename: 'HistoricalPrice',
      id: String(i),
      date: new Date(Date.UTC(2025, 0, 1 + i)).toISOString().slice(0, 10),
      close: 100 + i / 10,
      volume: 1000 + i,
    }))
    const data =
      operation === 'getSecurity'
        ? {
            security: {
              __typename: 'Security',
              id: 'TEST',
              ticker: 'TEST',
              currency: 'USD',
              type: 'commonStock',
              currentPrice: 126,
              marketStatus: 'closed',
              dayChange: 1,
              dayChangePercent: 1,
              weekChange: 2,
              weekChangePercent: 2,
              extendedHoursPrice: null,
              extendedHoursChangePercent: null,
              high52Week: 130,
              low52Week: 90,
              marketCapitalization: 1000000,
              sharesOutstanding: 10000,
              company: null,
            },
          }
        : operation === 'getHistoricalPrices'
          ? {
              historicalPrices: {
                __typename: 'PaginatedHistoricalPrice',
                nodes: prices,
              },
            }
          : {
              self: {
                __typename: 'SelfQuery',
                user: {
                  __typename: 'User',
                  id: 'chart-test',
                  username: 'chart-test',
                  currency: 'USD',
                },
              },
            }
    await route.fulfill({ json: { data } })
  })
  for (let i = 0; i < 2; i++) {
    await page.goto('/security/TEST/chart')
    await expect(
      page.locator('#security-price-chart canvas').first()
    ).toBeVisible()
    await expect(
      page.locator('#security-volume-chart canvas').first()
    ).toBeVisible()
    await page
      .locator('#security-price-chart')
      .hover({ position: { x: 200, y: 100 } })
    await page.setViewportSize({ width: 1100 + i * 100, height: 800 })
    await expect(page.getByText('SMA 50', { exact: true })).toBeVisible()
    expect(errors).toEqual([])
    await page.getByRole('button', { name: 'Profile', exact: true }).click()
  }
  expect(errors).toEqual([])
})
