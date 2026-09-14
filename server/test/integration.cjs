const { test, before, after } = require('node:test')
const assert = require('node:assert/strict')
const { createHash } = require('node:crypto')
require('reflect-metadata')
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
