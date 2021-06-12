![client build](https://img.shields.io/github/workflow/status/fcote/merlin/client.build?label=client%20build)
![server build](https://img.shields.io/github/workflow/status/fcote/merlin/server.build?label=server%20build)
![release](https://img.shields.io/github/v/release/fcote/merlin)
![license](https://img.shields.io/github/license/fcote/merlin)

## About the project

When it comes to researching publicly traded companies information is either scattered or very expensive.

This app allows you to perform fundamental analysis on publicly traded with accurate data, as well as tracking your investments with the portfolio tab.

The main datasource used is Financial modeling prep ([website](https://financialmodelingprep.com/developer)) which is one the cheapest financial api. 

You can choose to use their free tier as it will unlock most of the features of the app, or you can subscribe to FMP to get the full feature set

## Disclaimer

This project is still under heavy development, some features might not work as intended

## Getting started

### Install

Use the docker-compose example [here](./examples/docker-compose)

Also take a look at the possible server environment variables for additional configuration:

[Server environment variables](https://github.com/fcote/merlin/wiki/Server-environment-variables)

#### Create users

Retrieve the `adduser.sh` file [here](./examples/adduser.sh)

````shell
chmod +x adduser.sh
ENDPOINT=https://example.com/graphql USERNAME=foo PASSWORD=s3cr3t ./adduser.sh
````

`ENDPOINT` should be the same value as the `ENDPOINT` variable defined in your `.env` file suffixed with `/graphql`

## Features

### Portfolio (Real time)

![portfolio](./examples/screenshots/portfolio.png)

### Watchlist (Real time)

![watchlists](./examples/screenshots/watchlist.png)

### Trackers

![trackers](./examples/screenshots/trackers.png)

### Security detail

#### Financials (15 years / quarters)

![trackers](./examples/screenshots/security-financials.png)

#### Ratios (15 years / quarters)

![trackers](./examples/screenshots/security-ratios.png)

#### Chart

Historical prices (Day period) (End of day refresh)

![trackers](./examples/screenshots/security-chart.png)

#### Earnings

![trackers](./examples/screenshots/security-earnings.png)

#### News

![trackers](./examples/screenshots/security-news.png)

## Data sources

- FMP (https://financialmodelingprep.com/developer)
- Macrotrends (https://www.macrotrends.net/)
- Yahoo finance (https://finance.yahoo.com/)

## License

GPL-3.0 License. See [LICENSE](https://github.com/fcote/merlin/blob/dev/LICENSE) for more information.
