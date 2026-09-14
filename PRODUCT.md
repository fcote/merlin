# Merlin

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Merlin is for the owner's personal use. The confirmed priorities are portfolio
tracking and company research. Future product decisions should serve those
tasks; no broader commercial audience has been established.

## Product Purpose

Bring personal holdings and public-company information into one workspace so
the owner can follow investments and investigate companies. Success means
understanding portfolio exposure and performance, then reaching the financial
information needed to evaluate a holding or a company of interest.

The existing home page also supports personal accounts, income, expenses, and
forecasts. These are secondary capabilities to preserve unless a later request
changes their scope.

## Operating Context

The existing implementation supports these workflows:

- Sign in, review holdings and portfolio statistics, and add or edit positions.
- Open a holding or search for a ticker to investigate a security.
- Review financial statements, ratios, price charts, earnings, and news.
- Organize securities into watchlists and trackers, and refresh market data.
- Review the earnings calendar and follow links to external research sources.
- Maintain personal accounts, income, expenses, forecasts, and profile currency.

The application has an authenticated React client, a GraphQL API, PostgreSQL
storage, and a Go scheduler. The repository provides Docker deployment examples
and a script for creating users. These describe supported setup mechanisms;
the owner's actual deployment environment has not been specified.

## Capabilities and Constraints

- Portfolio views combine holdings with prices, allocation, profit/loss, and
  currency conversion using the profile currency. Preserve financial units,
  signs, periods, and the distinction between position and market values.
- Research views expose annual/quarterly financial information, ratios, charts,
  earnings, news, and company details. Available information varies by security
  type and upstream data availability.
- Market information comes through the repository's FMP, Yahoo, and Macrotrends
  integrations. Access and freshness depend on upstream services, credentials,
  subscription coverage, and synchronization. Do not imply every value is live
  or every dataset is available to every installation.
- Authentication and user-scoped data are part of the existing product even
  though the intended use here is personal.
- Current routes and terminology live in `client/src/App.tsx` and
  `client/src/pages/`. Preserve working behavior when changing the interface.
- Runtime and integration constraints are documented in
  `docs/dependency-upgrade.md`. Automated fixtures verify behavior, not live
  market-feed accuracy.

## Brand Commitments

The existing product name is Merlin. Its current name and assets are repository
evidence; no additional binding voice or visual direction was requested during
initialization.

## Evidence on Hand

- `README.md`: project purpose, setup, feature descriptions, and data sources.
- `client/src/pages/` and `client/src/components/`: implemented workflows and UI
  copy; use these to establish current behavior.
- `examples/screenshots/`: historical interface captures. Check them against
  current code before treating them as evidence of the present interface.
- `client/public/`: existing favicon and web manifest.
- `server/test/` and the client Playwright suite: behavior verification, with
  coverage and external-service limits described in `docs/dependency-upgrade.md`.

No customer testimonials, investment-return claims, or commercial positioning
have been supplied for this personal-use brief.

## Product Principles

1. Prioritize the owner's portfolio review and company-research tasks.
2. Keep holdings and their supporting research easy to move between.
3. Preserve the meaning of financial data, including currency, period, source
   limitations, and synchronization state.
4. Keep personal financial information and authenticated workflows intact.
5. Base product claims on implemented and verified capabilities.

## Open Decisions

- Primary devices, screen sizes, and frequency of use are not yet specified.
- The desired interface language is unconfirmed: visible copy is predominantly
  English, while the HTML shell currently declares French.
- No product-specific accessibility needs or compliance target were specified.
- The owner's data subscriptions, deployment, and preferred currency are unknown.

These are open decisions, not reasons to invent requirements or block a scoped
change that does not depend on them.
