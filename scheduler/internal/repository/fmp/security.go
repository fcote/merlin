package fmp

import (
	"context"
	"regexp"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/fmp"
	"github.com/fcote/merlin/sheduler/pkg/maps"
	"github.com/fcote/merlin/sheduler/pkg/pointer"
)

func (r Repository) SecurityTickerList(ctx context.Context) ([]string, error) {
	stocks, err := r.client.StockList(ctx)
	if err != nil {
		return nil, err
	}

	tickers := make([]string, len(stocks))
	for i, stock := range stocks {
		tickers[i] = stock.Symbol
	}

	return tickers, nil
}

func (r Repository) Securities(ctx context.Context, tickers []string) ([]domain.SecurityBase, error) {
	companies, err := r.client.BatchCompanies(ctx, tickers)
	if err != nil {
		return nil, err
	}
	companiesByTicker := maps.GroupBy(companies, func(c fmp.Company) string {
		return c.Symbol
	})

	stocks, err := r.client.BatchStocks(ctx, tickers)
	if err != nil {
		return nil, err
	}
	stocksByTicker := maps.GroupBy(stocks, func(s fmp.Stock) string {
		return s.Symbol
	})

	result := make([]domain.SecurityBase, len(tickers))
	for i, ticker := range tickers {
		result[i] = SecurityBaseFromFMP(stocksByTicker[ticker], companiesByTicker[ticker])
	}

	return result, nil
}

func SecurityBaseFromFMP(fmpStock fmp.Stock, fmpCompany fmp.Company) domain.SecurityBase {
	if fmpStock.MarketCap != nil {
		fmpStock.MarketCap = pointer.To(*fmpStock.MarketCap / 1e6)
	}
	if fmpStock.SharesOutstanding != nil {
		fmpStock.SharesOutstanding = pointer.To(*fmpStock.SharesOutstanding / 1e6)
	}

	return domain.SecurityBase{
		Ticker:               fmpStock.Symbol,
		Currency:             fmpCompany.Currency,
		Type:                 GetSecurityType(fmpStock, fmpCompany),
		CurrentPrice:         fmpStock.Price,
		DayChange:            fmpStock.Change,
		DayChangePercent:     fmpStock.ChangesPercentage,
		High52Week:           fmpStock.YearHigh,
		Low52Week:            fmpStock.YearLow,
		MarketCapitalization: fmpStock.MarketCap,
		SharesOutstanding:    fmpStock.SharesOutstanding,
	}
}

func GetSecurityType(fmpStock fmp.Stock, fmpCompany fmp.Company) string {
	if fmpCompany.ExchangeShortName == "INDEX" || fmpStock.Exchange == "INDEX" {
		return "Index"
	}
	if fmpCompany.ExchangeShortName == "COMMODITY" || fmpStock.Exchange == "COMMODITY" {
		return "Commodity"
	}
	if fmpCompany.IsFund || fmpCompany.ExchangeShortName == "MUTUAL_FUND" || fmpStock.Exchange == "MUTUAL_FUND" {
		return "Mutual Fund"
	}
	if fmpCompany.IsEtf || regexp.MustCompile("ETF|ETN|Index|Fund|Trust").Match([]byte(fmpStock.Name)) {
		return "ETF"
	}
	return "Common Stock"
}
