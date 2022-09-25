package fmp

import (
	"context"
	"fmt"
	"sync"

	"go.uber.org/multierr"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/fmp"
	"github.com/fcote/merlin/sheduler/pkg/slices"
)

func (r Repository) Financials(ctx context.Context, ticker string, financialItemMap map[string]domain.FinancialItem) ([]domain.FinancialBase, error) {
	fetcher := newFinancialFetcher(ctx, ticker, r.client, financialItemMap)
	fetcher.wg.Add(6)

	go fetcher.incomeStatements(fmp.PeriodYear)
	go fetcher.incomeStatements(fmp.PeriodQuarter)
	go fetcher.balanceSheetStatements(fmp.PeriodYear)
	go fetcher.balanceSheetStatements(fmp.PeriodQuarter)
	go fetcher.cashFlowStatements(fmp.PeriodYear)
	go fetcher.cashFlowStatements(fmp.PeriodQuarter)

	go fetcher.collectFinancials()
	go fetcher.collectErrors()

	fetcher.wg.Wait()

	return fetcher.result, fetcher.err
}

type financialFetcher struct {
	ctx    context.Context
	ticker string

	client           *fmp.FMP
	financialItemMap map[string]domain.FinancialItem

	result []domain.FinancialBase
	err    error

	wg            *sync.WaitGroup
	financialChan chan []domain.FinancialBase
	errChan       chan error
}

func newFinancialFetcher(
	ctx context.Context,
	ticker string,
	client *fmp.FMP,
	financialItemMap map[string]domain.FinancialItem,
) *financialFetcher {
	return &financialFetcher{
		ctx:    ctx,
		ticker: ticker,

		client:           client,
		financialItemMap: financialItemMap,

		wg:            &sync.WaitGroup{},
		financialChan: make(chan []domain.FinancialBase),
		errChan:       make(chan error),
	}
}

func (f *financialFetcher) incomeStatements(period fmp.Period) {
	statements, err := f.client.IncomeStatements(f.ctx, f.ticker, period)
	if err != nil {
		f.errChan <- fmt.Errorf("could not retrieve income statements: %w", err)
		return
	}
	f.financialChan <- slices.FlatMap(statements, func(statement fmp.IncomeStatement) []domain.FinancialBase {
		return fromIncomeStatement(statement, f.financialItemMap)
	})
}

func (f *financialFetcher) balanceSheetStatements(period fmp.Period) {
	statements, err := f.client.BalanceSheetStatements(f.ctx, f.ticker, period)
	if err != nil {
		f.errChan <- fmt.Errorf("could not retrieve balance sheets: %w", err)
		return
	}
	f.financialChan <- slices.FlatMap(statements, func(statement fmp.BalanceSheetStatement) []domain.FinancialBase {
		return fromBalanceSheetStatement(statement, f.financialItemMap)
	})
}

func (f *financialFetcher) cashFlowStatements(period fmp.Period) {
	statements, err := f.client.CashFlowStatements(f.ctx, f.ticker, period)
	if err != nil {
		f.errChan <- fmt.Errorf("could not retrieve cash flows: %w", err)
		return
	}
	f.financialChan <- slices.FlatMap(statements, func(statement fmp.CashFlowStatement) []domain.FinancialBase {
		return fromCashFlowStatement(statement, f.financialItemMap)
	})
}

func (f *financialFetcher) collectFinancials() {
	for financials := range f.financialChan {
		f.result = append(f.result, financials...)
		f.wg.Done()
	}
}

func (f *financialFetcher) collectErrors() {
	for e := range f.errChan {
		multierr.AppendInto(&f.err, e)
		f.wg.Done()
	}
}
