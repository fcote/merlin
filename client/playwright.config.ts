import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  use: { baseURL: 'http://localhost:4400', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run serve -- --host localhost --port 4400',
    url: 'http://localhost:4400',
    reuseExistingServer: !process.env.CI,
  },
})
