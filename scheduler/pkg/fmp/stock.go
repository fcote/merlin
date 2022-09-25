package fmp

import (
	"context"
	"strings"
)

type Stock struct {
	Symbol               string   `json:"symbol"`
	Name                 string   `json:"name"`
	Price                *float64 `json:"price"`
	ChangesPercentage    *float64 `json:"changesPercentage"`
	Change               *float64 `json:"change"`
	DayLow               *float64 `json:"dayLow"`
	DayHigh              *float64 `json:"dayHigh"`
	YearHigh             *float64 `json:"yearHigh"`
	YearLow              *float64 `json:"yearLow"`
	MarketCap            *float64 `json:"marketCap"`
	PriceAvg50           *float64 `json:"priceAvg50"`
	PriceAvg200          *float64 `json:"priceAvg200"`
	Volume               *float64 `json:"volume"`
	AvgVolume            *float64 `json:"avgVolume"`
	Exchange             string   `json:"exchange"`
	Open                 *float64 `json:"open"`
	PreviousClose        *float64 `json:"previousClose"`
	EPS                  *float64 `json:"eps"`
	PE                   *float64 `json:"pe"`
	EarningsAnnouncement *string  `json:"earningsAnnouncement"`
	SharesOutstanding    *float64 `json:"sharesOutstanding"`
	Timestamp            *float64 `json:"timestamp"`
}

func (fmp FMP) BatchStocks(ctx context.Context, tickers []string) ([]Stock, error) {
	url := fmp.url.JoinPath("/v3/quote/", strings.Join(tickers, ","))

	var stocks []Stock
	if err := fmp.request(ctx, url, &stocks); err != nil {
		return nil, err
	}
	return stocks, nil
}

func (fmp FMP) Stock(ctx context.Context, ticker string) (*Stock, error) {
	results, err := fmp.BatchStocks(ctx, []string{ticker})
	if err != nil {
		return nil, err
	}
	return &results[0], nil
}

type StockSearch struct {
	Symbol            string `json:"symbol"`
	Name              string `json:"name"`
	Currency          string `json:"currency"`
	StockExchange     string `json:"stockExchange"`
	ExchangeShortName string `json:"exchangeShortName"`
}

func (fmp FMP) StockSearch(ctx context.Context, query string) ([]StockSearch, error) {
	url := fmp.url.JoinPath("/v3/search-ticker")
	q := url.Query()
	q.Add("query", query)
	url.RawQuery = q.Encode()

	var search []StockSearch
	if err := fmp.request(ctx, url, &search); err != nil {
		return nil, err
	}

	return search, nil
}

type PartialStock struct {
	Symbol            string  `json:"symbol"`
	Name              string  `json:"name"`
	Price             float64 `json:"price"`
	Exchange          string  `json:"exchange"`
	ExchangeShortName string  `json:"exchangeShortName"`
	Type              string  `json:"type"`
}

func (fmp FMP) StockList(ctx context.Context) ([]PartialStock, error) {
	url := fmp.url.JoinPath("/v3/stock/list")

	var stocks []PartialStock
	if err := fmp.request(ctx, url, &stocks); err != nil {
		return nil, err
	}

	return stocks, nil
}
