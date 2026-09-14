# Dependency upgrade — 2026-09-14

The client, server, scheduler, lockfiles, Docker images and GitHub Actions have been updated. npm versions were checked against the registry's `latest` tag. Go modules were refreshed with `go get -u ./...`, followed by `go mod tidy`; gocron was migrated to v2.

## Compatibility limits

Follow-up upgrades address the remaining Renovate PRs for ESLint, TypeScript,
GraphQL, and graphql-scalars. The current versions and compatibility arrangements
are:

| Package | Selected | Registry latest | Reason |
| --- | --- | --- | --- |
| GraphQL, client | 17.0.2 | 17.0.2 | Apollo Client, graphql-ws, and typed-document-node support GraphQL 17. The wire schema remains compatible with the GraphQL 16 server. |
| GraphQL, server | 16.14.2 | 17.0.2 | Apollo Server 5, TypeGraphQL, and graphql-subscriptions still require GraphQL 16. TypeGraphQL also rejects GraphQL 17 during schema construction. |
| graphql-scalars, server | 2.0.0 | 2.0.0 | A scoped npm override supplies v2 to TypeGraphQL, whose published peer range remains `^1.25.0`; see the compatibility ownership below. |
| TypeScript builds, both applications | 7.0.2 | 7.0.2 | Native compiler installed as `@typescript/native`; the `tsc` command uses v7. |
| ESLint, both applications | 10.10.0 | 10.10.0 | Replaced the client's incompatible eslint-plugin-react with eslint-plugin-react-x, preserving the missing-key rule and React Hooks checks. |

### TypeScript compiler and tooling

Both applications use Microsoft's documented [side-by-side migration](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/):
`@typescript/native` aliases `typescript@7.0.2`, while `typescript` aliases
`@typescript/typescript6@6.0.2`. TypeScript 7 does not expose the JavaScript compiler
API required by typescript-eslint and ts-node; those tools use the compatibility
package. Production builds and type checking run TypeScript 7. The server's
development scripts and config-copy script continue using ts-node with the v6 API.

Removed the deprecated `baseUrl` and `ignoreDeprecations` options. All path aliases
are now relative to their config file. The production alias loader retains its
explicit runtime base directory. npm aliases let Renovate track each underlying
package independently.

### graphql-scalars compatibility ownership

The [v2 release](https://github.com/graphql-hive/graphql-scalars/releases/tag/v2.0.0)
drops older GraphQL and Node releases that Merlin no longer uses. TypeGraphQL
re-exports its DateTimeISO and Timestamp implementations from graphql-scalars,
but has not expanded its peer range. Merlin deliberately overrides only
`type-graphql -> graphql-scalars` to the application's pinned v2 version. This is
a project-tested compatibility exception, not a claim of upstream TypeGraphQL
support. No GraphQL peer ranges are overridden, and clean installs need neither
`--force` nor `--legacy-peer-deps`.

`server/test/scalars.cjs` verifies the actual public DateTime, LocalDate, and JSON
scalars through GraphQL variable and literal coercion, timezone normalization,
leap dates, nested JSON, and invalid-date rejection. The existing API suite also
checks date input through soft deletion. The generated schema is unchanged by
these upgrades. Remove the override when TypeGraphQL declares v2 support; rerun
these tests when either package changes.

### Remaining server GraphQL upgrade

GraphQL 17 on the server requires a schema/server framework migration or upstream
support. The latest and next TypeGraphQL releases still require GraphQL 16, and
Apollo Server's experimental support targets a specific GraphQL 17 alpha rather
than the stable release. Updating only the version would fail at schema startup.
Client GraphQL 17 is verified against the existing server through the browser
suite; matching npm major versions across the HTTP/WebSocket boundary is not
required.

TypeGraphQL's official `latest` tag is **2.0.0-rc.3**, a release candidate. It is needed for the current Apollo/GraphQL stack; this is an intentional prerelease dependency. Lockfiles retain supported transitive versions rather than overriding dependency constraints.

Use **Node 24 LTS** (`.nvmrc`) and **Go 1.27.1**. Docker and CI use the corresponding toolchains.

## Compatibility changes

- React 19, Ant Design 6, Apollo Client 4, Vite 8 and Lightweight Charts 5. Updated refs, theme tokens, date components, public imports, chart APIs and event cleanup.
- Replaced the removed PageHeader component locally. Restored sidebar account controls, protected route redirects and failed-login recovery. Signing out clears cached account data and refreshes WebSocket authentication.
- Apollo Server 5 with Koa 3 and the maintained Koa integration. Both ends now use **graphql-ws**, replacing the retired subscriptions transport. Deploy the client and server together because the WebSocket protocol changed.
- Explicit resolver registration for TypeGraphQL 2. The existing `DateTime` scalar name is preserved. Updated transaction plugins, error formatting and subscription lifecycle handling. The service manager owns signal handling; the container launches Node directly and normal termination exits successfully.
- Added the required preflight header for persisted GET queries, while retaining Apollo's CSRF protection.
- Replaced the unmaintained transcript Markdown renderer with React text rendering. Speaker headings and statement line breaks are retained; HTML/Markdown embedded in statements is displayed as text.
- Go scheduler uses gocron v2, closes resources on shutdown, and starts with monitoring disabled when no New Relic license is supplied.
- ESLint flat configuration replaces the retired react-app configuration. Removed obsolete plugins, redundant type packages and unused dependencies. The client container uses the locked `serve` package instead of downloading it at startup.

## Verification

Run against a **disposable PostgreSQL database**. Tests run migrations and create test records; browser fixtures leave their test users in that database.

```sh
# From the repository root, after selecting Node 24:
npm ci --prefix server
npm ci --prefix client
npm run lint --prefix server
npm run lint --prefix client
npm run build --prefix client

# Configure DB_HOST, DB_PORT, DB_NAME, DB_USER and DB_PASS for your test DB.
npm test --prefix server

# In another terminal, start the built API (port 4300).
cd server/dist
SERVER_PORT=4300 SCHEDULER_PRICES_SUBSCRIBED_ENABLED=false \
  SCHEDULER_NEWS_SUBSCRIBED_ENABLED=false \
  SCHEDULER_EARNINGS_SUBSCRIBED_ENABLED=false npm start

# From the repository root:
cd client
npx playwright install --with-deps chromium
npm run test:e2e

# From scheduler/:
go test ./...
go vet ./...
golangci-lint run
go build .
```

The integration workflow provisions PostgreSQL and runs the API and browser suites. API coverage includes authentication, persisted GET queries, account writes and soft deletion, rollback on resolver errors, authenticated WebSocket delivery/cancellation, and clean SIGTERM shutdown. Browser coverage includes login and failure recovery, all main routes, profile persistence, logout, and chart rendering/interaction/remounting with deterministic market-data fixtures.

Live FMP, broker, Yahoo and Macrotrends requests require external services and, where applicable, credentials. They are outside the automated smoke tests; the chart fixture does not verify a live market feed.

Migration references: [Apollo Server](https://www.apollographql.com/docs/apollo-server/migration), [TypeGraphQL](https://typegraphql.com/docs/migration-guide.html), [GraphQL over WebSocket](https://the-guild.dev/graphql/ws), and [Lightweight Charts](https://tradingview.github.io/lightweight-charts/docs/migrations/from-v4-to-v5).

Verified locally: clean `npm ci` installs, client/server production builds and lint, six server integration tests, three Chromium browser tests, Go tests/vet/golangci-lint, and all three Docker builds. Production container smoke checks also passed endpoint injection, GraphQL, login, profile loading, logout and scheduler startup. Both npm audits reported **zero vulnerabilities**. Market-data responses in the chart browser test are fixtures, as noted above.

The follow-up upgrades passed clean installs, TypeScript 7 builds, client/server
lint, eight server tests (including two new scalar checks), all three Chromium
tests, both affected Docker builds, and development alias resolution through
ts-node. Both complete npm dependency trees validate and both audits report zero
vulnerabilities. The scheduler was unchanged in this follow-up.
