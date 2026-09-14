const { test } = require('node:test')
const assert = require('node:assert/strict')
const { spawn } = require('node:child_process')
const { once } = require('node:events')

test('the production entrypoint exits cleanly on SIGTERM', async () => {
  const child = spawn(
    process.execPath,
    ['-r', './tsconfig.paths.js', './index.js'],
    {
      env: {
        ...process.env,
        SERVER_PORT: '0',
        SCHEDULER_PRICES_SUBSCRIBED_ENABLED: 'false',
        SCHEDULER_NEWS_SUBSCRIBED_ENABLED: 'false',
        SCHEDULER_EARNINGS_SUBSCRIBED_ENABLED: 'false',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  )
  const exited = once(child, 'exit')
  let output = ''
  child.stdout.on('data', (chunk) => {
    output += chunk
  })
  child.stderr.on('data', (chunk) => {
    output += chunk
  })
  let timer
  const deadline = (promise, message) =>
    Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${message}\n${output}`)),
          5000
        )
      }),
    ]).finally(() => clearTimeout(timer))
  try {
    await deadline(
      new Promise((resolve, reject) => {
        child.once('error', reject)
        child.once('exit', (code) =>
          reject(new Error(`server exited before startup: ${code}\n${output}`))
        )
        child.stdout.on('data', () => {
          if (output.includes('Merlin server started')) resolve()
        })
      }),
      'server did not start'
    )
    child.kill('SIGTERM')
    const [code, signal] = await deadline(exited, 'server did not stop')
    assert.equal(signal, null)
    assert.equal(code, 0)
  } finally {
    if (child.exitCode === null) child.kill('SIGKILL')
  }
})
