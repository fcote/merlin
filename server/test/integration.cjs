const { test, before, after } = require('node:test')
const assert = require('node:assert/strict')
const { createHash } = require('node:crypto')
const { app } = require('../dist/src/app')
const { knexDriver } = require('../dist/src/drivers/knex')
const {
  pubSub,
  SubscriptionChannel,
  subscriptionJobs,
  subscriptionStorages,
} = require('../dist/src/drivers/pubSub')
const { createClient } = require('graphql-ws')
const WebSocket = require('ws')

let endpoint, user
const username = `integration-${Date.now()}`
async function graphql(query, variables, token = user?.apiToken) {
  const response = await fetch(`${endpoint}/graphql`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { 'x-api-token': token } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })
  return response.json()
}

before(async () => {
  await knexDriver.connect()
  await app.connect()
  endpoint = `http://127.0.0.1:${app.server.address().port}`
})
after(async () => {
  if (user) {
    await knexDriver.knex('user_accounts').where('user_id', user.id).del()
    await knexDriver.knex('users').where('id', user.id).del()
  }
  await app.disconnect()
  await knexDriver.disconnect()
})

test('sign-up, sign-in and protected profile queries', async () => {
  const created = await graphql(
    'mutation($inputs: SignUpField!) { userSignUp(inputs: $inputs) { id username apiToken } }',
    { inputs: { username, password: 'test-password' } }
  )
  assert.equal(created.errors, undefined, JSON.stringify(created.errors))
  user = created.data.userSignUp
  const signedIn = await graphql(
    'mutation($inputs: SignInFields!) { userSignIn(inputs: $inputs) { id apiToken } }',
    { inputs: { username, password: 'test-password' } }
  )
  assert.equal(signedIn.data.userSignIn.apiToken, user.apiToken)
  const profile = await graphql('{ self { user { id username } } }')
  assert.equal(profile.data.self.user.username, username)
  const denied = await graphql(
    '{ self { user { id } } }',
    undefined,
    'invalid-token'
  )
  assert.ok(denied.errors?.length)
  const invalid = await graphql(
    'mutation { userSignIn(inputs: {username: "missing", password: "wrong"}) { id } }'
  )
  assert.equal(invalid.errors[0].extensions.code, 'USER_NOT_FOUND')
})

test('persisted queries negotiate over POST and execute over GET', async () => {
  const query = '{ self { user { username } } }'
  const extensions = {
    persistedQuery: {
      version: 1,
      sha256Hash: createHash('sha256').update(query).digest('hex'),
    },
  }
  const headers = {
    'content-type': 'application/json',
    'x-api-token': user.apiToken,
  }
  const send = (body) =>
    fetch(`${endpoint}/graphql`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }).then((r) => r.json())
  assert.equal(
    (await send({ extensions })).errors[0].message,
    'PersistedQueryNotFound'
  )
  assert.equal((await send({ query, extensions })).errors, undefined)
  const result = await fetch(
    `${endpoint}/graphql?extensions=${encodeURIComponent(JSON.stringify(extensions))}`,
    { headers }
  ).then((r) => r.json())
  assert.equal(result.data.self.user.username, username)
})

test('account mutations commit, failed mutations roll back, and archived rows stay hidden', async () => {
  const query =
    'mutation($inputs: UserAccountFields!) { self { upsertUserAccount(inputs: $inputs) { id name balance } } }'
  const created = await graphql(query, {
    inputs: { name: 'Savings', type: 'saving', balance: 100 },
  })
  assert.equal(created.errors, undefined, JSON.stringify(created.errors))
  const account = created.data.self.upsertUserAccount
  const updated = await graphql(query, {
    inputs: { id: account.id, balance: 250 },
  })
  assert.equal(updated.data.self.upsertUserAccount.balance, 250)
  const rollbackName = `rollback-${Date.now()}`
  const failed = await graphql(
    `mutation { first: userSignUp(inputs: {username: "${rollbackName}", password: "test"}) { id } second: userSignUp(inputs: {username: "${username}", password: "test"}) { id } }`
  )
  assert.ok(failed.errors?.length)
  assert.equal(
    (await knexDriver.knex('users').where('username', rollbackName)).length,
    0
  )
  const deleted = await graphql(query, {
    inputs: { id: account.id, deletedAt: new Date().toISOString() },
  })
  assert.equal(deleted.errors, undefined, JSON.stringify(deleted.errors))
  const { UserAccount } = require('../dist/src/models/userAccount')
  assert.equal(await UserAccount.query().findById(account.id), undefined)
})

test('graphql-ws delivers authenticated, filtered subscription events and closes cleanly', async () => {
  const client = createClient({
    url: endpoint.replace('http:', 'ws:') + '/graphql/subscriptions',
    webSocketImpl: WebSocket,
    connectionParams: { 'x-api-token': user.apiToken },
  })
  let unsubscribe
  const result = new Promise((resolve, reject) => {
    unsubscribe = client.subscribe(
      {
        query:
          'subscription { securitySyncProgressChanges(ticker: "TEST") { ticker progress } }',
      },
      { next: resolve, error: reject, complete: () => {} }
    )
  })
  const timer = setInterval(() => {
    pubSub.publish(SubscriptionChannel.securitySyncProgressChanges, {
      ticker: 'OTHER',
      progress: 0.1,
    })
    pubSub.publish(SubscriptionChannel.securitySyncProgressChanges, {
      ticker: 'TEST',
      progress: 0.5,
    })
  }, 50)
  const timeout = setTimeout(() => client.dispose(), 5000)
  try {
    const payload = await result
    assert.equal(payload.errors, undefined, JSON.stringify(payload.errors))
    assert.deepEqual(payload.data.securitySyncProgressChanges, {
      ticker: 'TEST',
      progress: 0.5,
    })
  } finally {
    clearInterval(timer)
    clearTimeout(timeout)
    unsubscribe()
    await client.dispose()
  }
})

test('price subscriptions initialize authenticated state and remove it on cancellation', async () => {
  const channel = SubscriptionChannel.securityPricesChanges
  const originalJob = subscriptionJobs[channel]
  subscriptionJobs[channel] = async () => true
  const client = createClient({
    url: endpoint.replace('http:', 'ws:') + '/graphql/subscriptions',
    webSocketImpl: WebSocket,
    connectionParams: { 'x-api-token': user.apiToken },
  })
  let failure
  const stop = client.subscribe(
    {
      query:
        'subscription { securityPriceChanges(tickers: ["TEST"]) { ticker } }',
    },
    {
      next: () => {},
      error: (err) => {
        failure = err
      },
      complete: () => {},
    }
  )
  const waitFor = async (predicate) => {
    for (let i = 0; i < 100; i++) {
      if (failure) throw failure
      if (predicate()) return
      await new Promise((resolve) => setTimeout(resolve, 20))
    }
    assert.fail('subscription state did not settle')
  }
  try {
    await waitFor(() =>
      subscriptionStorages[channel][user.id]?.includes('TEST')
    )
    stop()
    await waitFor(
      () => !subscriptionStorages[channel][user.id]?.includes('TEST')
    )
  } finally {
    stop()
    await client.dispose()
    subscriptionJobs[channel] = originalJob
  }
})

test('portfolio, watchlists and company research preserve stored values and resolver relations', async () => {
  const suffix = Date.now().toString()
  const ticker = `MIG${suffix}`
  const cleanup = []
  const insert = async (table, values) => {
    const [row] = await knexDriver.knex(table).insert(values).returning('*')
    cleanup.unshift([table, row.id])
    return row
  }
  try {
    const company = await insert('companies', { name: `Migration ${suffix}` })
    const security = await insert('securities', {
      ticker,
      type: 'Common Stock',
      companyId: company.id,
      currency: 'EUR',
      currentPrice: 15,
    })
    const item = await knexDriver.knex('financial_items').where({ slug: 'revenue', statement: 'income-statement' }).first()
    assert.ok(item, 'migrations seed the revenue financial item')
    await insert('financials', {
      securityId: security.id,
      financialItemId: item.id,
      value: 120,
      year: 2025,
      period: 'Y',
      reportDate: '2026-01-30',
      isEstimate: false,
    })
    await insert('historical_prices', {
      securityId: security.id,
      date: '2026-01-30',
      open: 10,
      high: 16,
      low: 9,
      close: 15,
      change: 5,
      changePercent: 50,
      volume: 1000,
    })
    await insert('earnings', {
      securityId: security.id,
      date: '2026-01-30',
      time: 'before-market-open',
      eps: 2,
    })
    await insert('news', {
      securityId: security.id,
      date: '2026-01-30T10:00:00Z',
      type: 'press-release',
      title: 'Results',
      content: 'Fixture results',
    })
    const accountResult = await graphql(
      'mutation { self { upsertUserAccount(inputs: {name: "Investments", type: securities, balance: 100}) { id } } }'
    )
    assert.equal(
      accountResult.errors,
      undefined,
      JSON.stringify(accountResult.errors)
    )
    const accountId = accountResult.data.self.upsertUserAccount.id
    cleanup.unshift(['user_accounts', accountId])
    const holding = await graphql(
      'mutation($inputs: UserAccountSecurityFields!) { self { upsertUserAccountSecurity(inputs: $inputs) { id volume openPrice openedAt security { ticker company { name } } } } }',
      {
        inputs: {
          name: ticker,
          securityId: String(security.id),
          userAccountId: accountId,
          volume: 2,
          openPrice: 10,
          currency: 'EUR',
          openedAt: '2026-01-01T00:00:00Z',
        },
      }
    )
    assert.equal(holding.errors, undefined, JSON.stringify(holding.errors))
    cleanup.unshift([
      'user_account_securities',
      holding.data.self.upsertUserAccountSecurity.id,
    ])
    assert.equal(
      holding.data.self.upsertUserAccountSecurity.security.company.name,
      company.name
    )
    const groupResult = await graphql(
      'mutation($name: String!) { self { upsertFollowedSecurityGroup(inputs: {name: $name, type: watchlist, index: 0}) { id } } }',
      { name: `Research ${suffix}` }
    )
    assert.equal(
      groupResult.errors,
      undefined,
      JSON.stringify(groupResult.errors)
    )
    const groupId = groupResult.data.self.upsertFollowedSecurityGroup.id
    cleanup.unshift(['followed_security_groups', groupId])
    const linked = await graphql(
      'mutation($inputs: FollowedSecurityFields!) { self { linkFollowedSecurity(inputs: $inputs) { id security { ticker } followedSecurityGroup { name type } } } }',
      {
        inputs: {
          followedSecurityGroupId: groupId,
          securityId: String(security.id),
          index: 0,
        },
      }
    )
    assert.equal(linked.errors, undefined, JSON.stringify(linked.errors))
    cleanup.unshift([
      'followed_securities',
      linked.data.self.linkFollowedSecurity.id,
    ])
    assert.equal(
      linked.data.self.linkFollowedSecurity.followedSecurityGroup.type,
      'watchlist'
    )
    const result = await graphql(
      `
        query ($ticker: String!, $show: Boolean!) {
          security(ticker: $ticker) {
            ticker
            company {
              name
            }
          }
          financials(
            filters: {
              ticker: $ticker
              freq: Y
              statement: incomeStatement
              type: statement
            }
          ) {
            total
            nodes {
              id
              value @include(if: $show)
              period
              securityId
              financialItemId
              financialItem {
                statement
                unitType
              }
            }
          }
          historicalPrices(filters: { ticker: $ticker }) {
            nodes {
              date
              close
              changePercent
            }
          }
          earnings(
            filters: {
              ticker: $ticker
              fromDate: "2026-01-01"
              toDate: "2026-02-01"
            }
          ) {
            nodes {
              time
              eps
              security {
                ticker
              }
            }
          }
          news(filters: { ticker: $ticker }) {
            nodes {
              title
              type
              date
            }
          }
          self {
            userAccountSecurities(filters: { ticker: $ticker }) {
              nodes {
                volume
                openPrice
                security {
                  ticker
                }
              }
            }
            followedSecurityGroups(filters: { type: watchlist }) {
              nodes {
                id
                followedSecurities {
                  nodes {
                    security {
                      ticker
                    }
                  }
                }
              }
            }
            user {
              accounts {
                nodes {
                  id
                  type
                }
              }
            }
          }
        }
      `,
      { ticker, show: true }
    )
    assert.equal(result.errors, undefined, JSON.stringify(result.errors))
    assert.equal(result.data.security.company.name, company.name)
    assert.equal(result.data.financials.total, 1)
    assert.equal(result.data.financials.nodes[0].value, 120)
    assert.equal(
      result.data.financials.nodes[0].financialItem.statement,
      'incomeStatement'
    )
    assert.equal(result.data.historicalPrices.nodes[0].close, 15)
    assert.equal(result.data.earnings.nodes[0].time, 'beforeMarketOpen')
    assert.equal(result.data.news.nodes[0].type, 'pressRelease')
    assert.equal(result.data.self.userAccountSecurities.nodes[0].volume, 2)
    assert.equal(
      result.data.self.followedSecurityGroups.nodes.find(
        (g) => g.id === groupId
      ).followedSecurities.nodes[0].security.ticker,
      ticker
    )
    assert.ok(
      result.data.self.user.accounts.nodes.some(
        (a) => a.id === accountId && a.type === 'securities'
      )
    )
  } finally {
    for (const [table, id] of cleanup)
      await knexDriver.knex(table).where({ id }).del()
  }
})

test('HTTP requests retain CSRF protection and reject missing authentication', async () => {
  const query = encodeURIComponent('{ __typename }')
  for (const headers of [
    {},
    { 'apollo-require-preflight': '' },
    { 'content-type': 'text/plain' },
  ]) {
    const response = await fetch(`${endpoint}/graphql?query=${query}`, {
      headers,
    })
    assert.equal(response.status, 400)
    assert.equal(
      (await response.json()).errors[0].extensions.code,
      'BAD_REQUEST'
    )
  }
  const allowed = await fetch(`${endpoint}/graphql?query=${query}`, {
    headers: { 'apollo-require-preflight': 'true' },
  })
  assert.equal((await allowed.json()).data.__typename, 'Query')
  const denied = await graphql('{ self { user { id } } }', undefined, null)
  assert.equal(denied.errors[0].extensions.code, 'ACCESS_DENIED')
})
