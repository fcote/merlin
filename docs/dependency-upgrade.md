# Dependency upgrade — 2026-09-14

The client, server, scheduler, lockfiles, Docker images and GitHub Actions have been updated. npm versions were checked against the registry's `latest` tag. Go modules were refreshed with `go get -u ./...`, followed by `go mod tidy`; gocron was migrated to v2.

## Remaining major upgrades

All four remaining Renovate updates are included: ESLint (#761), TypeScript
(#762), GraphQL (#765), and graphql-scalars (#766).

| Package | Version | Integration |
| --- | --- | --- |
| GraphQL, client and server | 17.0.2 | Apollo Client on the client; GraphQL Yoga on the server. |
| graphql-scalars, server | 2.0.0 | Explicit DateTime, LocalDate, and JSON scalar registration. |
| TypeScript builds, both applications | 7.0.2 | Native compiler installed as `@typescript/native`; `tsc` runs v7. |
| ESLint, both applications | 10.10.0 | The client uses eslint-plugin-react-x with the missing-key rule and React Hooks checks. |

Both complete npm dependency trees validate without peer overrides, `--force`, or
`--legacy-peer-deps`. `npm outdated` reports no outdated direct dependencies in
either application.

### TypeScript compiler and tooling

Both applications use Microsoft's documented [side-by-side migration](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/):
`@typescript/native` aliases `typescript@7.0.2`, while `typescript` aliases
`@typescript/typescript6@6.0.2`. TypeScript 7 does not expose the JavaScript compiler
API required by typescript-eslint and ts-node; those tools use the compatibility
package. Production builds and type checking run TypeScript 7. The server's
development scripts and config-copy script continue using ts-node with the v6 API.

Removed deprecated `baseUrl` and `ignoreDeprecations` options. Path aliases are
relative to their config file; the production alias loader retains its explicit
runtime base directory. npm aliases let Renovate track each underlying package
independently.

### GraphQL 17 server migration

Replaced Apollo Server and TypeGraphQL, whose published stable peer ranges exclude
GraphQL 17, with GraphQL Yoga 5. The existing public SDL is now maintained in
`server/src/resolvers/schema.graphql` and copied into the production build.
`bindings.ts` explicitly connects the existing resolver methods and authorization;
`enumValues.ts` preserves the mapping between public enum names and database values.
Stored-column projections are listed in `models/base/databaseFields.ts` instead of
being inferred from decorator metadata. Update these files alongside model or API
changes. Models, services, database tables, and the public operation signatures
retain their behavior.

The Koa adapter retains `/graphql`, token authentication, persisted-query
negotiation, preflight protection, and per-operation transactions and dataloaders.
Transactions finish before responses are sent and roll back on resolver errors.
The existing `graphql-ws` endpoint remains `/graphql/subscriptions`. Yoga's
subscription utilities replace graphql-subscriptions, and the maintained field
collector handles GraphQL 17's coerced directive variables, fragments, and aliases.
Decorator metadata, class-validator, graphql-fields, and the temporary
TypeGraphQL/graphql-scalars override have been removed.

The schema contract fixture was captured from the executable GraphQL 16 schema at
`82f0aaf`, before migration. Tests compare the full canonical SDL hash, all 19
stored enum mappings, and all 54 resolver bindings, including authorization on
protected fields. Scalar tests exercise variable and literal coercion, timezone
normalization, leap dates, nested JSON, and invalid-date rejection. The public
`DateTime` name and ISO serialization are preserved.

Use **Node 24 LTS** (`.nvmrc`) and **Go 1.27.1**. Docker and CI use the corresponding toolchains.

## Compatibility changes

- React 19, Ant Design 6, Apollo Client 4, Vite 8 and Lightweight Charts 5. Updated refs, theme tokens, date components, public imports, chart APIs and event cleanup.
- Replaced the removed PageHeader component locally. Restored sidebar account controls, protected route redirects and failed-login recovery. Signing out clears cached account data and refreshes WebSocket authentication.
- GraphQL Yoga with Koa 3 and explicit schema/resolver registration. Both ends use **graphql-ws**, replacing the retired subscriptions transport. Deploy the client and server together when upgrading from that original transport.
- Updated transaction plugins, error formatting and subscription lifecycle handling. The service manager owns signal handling; the container launches Node directly and normal termination exits successfully.
- Added the required preflight header for persisted GET queries, while retaining the existing CSRF header contract.
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

The integration workflow provisions PostgreSQL and runs the API and browser suites.
The 13 server tests cover the complete schema contract, scalars, directive-aware
projections, authentication, CSRF headers, persisted GET queries, portfolio
holdings, watchlist links, financial statements, earnings, news, account writes,
soft deletion, rollback on resolver errors, authenticated WebSocket delivery and
cancellation, and clean SIGTERM shutdown. Three browser tests cover login and
failure recovery, all main routes, profile persistence, logout, and chart
rendering/interaction/remounting with deterministic market-data fixtures.

Live FMP, broker, Yahoo and Macrotrends requests require external services and, where applicable, credentials. They are outside the automated smoke tests; the chart fixture does not verify a live market feed.

Migration references: [GraphQL Yoga with Koa](https://the-guild.dev/graphql/yoga-server/docs/integrations/integration-with-koa), [persisted queries](https://the-guild.dev/graphql/yoga-server/docs/features/automatic-persisted-queries), [GraphQL over WebSocket](https://the-guild.dev/graphql/ws), and [Lightweight Charts](https://tradingview.github.io/lightweight-charts/docs/migrations/from-v4-to-v5).

Verified locally: clean installs, complete dependency trees, TypeScript 7 builds,
client/server lint, 13 server tests, three Chromium tests, and both affected Docker
builds. Production container smoke checks cover endpoint injection, GraphQL,
login, profile loading, and logout. Both npm audits report **zero vulnerabilities**.
The scheduler is unchanged in this follow-up; its Go tests, vet, lint, build, and
Docker smoke checks passed during the original upgrade.
