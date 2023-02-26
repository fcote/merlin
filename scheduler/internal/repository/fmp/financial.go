package fmp

import (
	"context"
	"fmt"

	"github.com/sourcegraph/conc/pool"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/fmp"
	"github.com/fcote/merlin/sheduler/pkg/slices"
)

type fmpFinancialRequest func(ctx context.Context) ([]domain.FinancialBase, error)

func (r Repository) Financials(ctx context.Context, ticker string, financialItemMap map[string]domain.FinancialItem) ([]domain.FinancialBase, error) {
	p := pool.NewWithResults[[]domain.FinancialBase]().
		WithErrors().
		WithContext(ctx)

	p.Go(r.incomeStatements(ticker, fmp.PeriodYear, financialItemMap))
	p.Go(r.incomeStatements(ticker, fmp.PeriodQuarter, financialItemMap))
	p.Go(r.balanceSheetStatements(ticker, fmp.PeriodYear, financialItemMap))
	p.Go(r.balanceSheetStatements(ticker, fmp.PeriodQuarter, financialItemMap))
	p.Go(r.cashFlowStatements(ticker, fmp.PeriodYear, financialItemMap))
	p.Go(r.cashFlowStatements(ticker, fmp.PeriodQuarter, financialItemMap))

	res, err := p.Wait()
	if err != nil {
		return nil, err
	}

	return slices.FlatMap(res, func(f []domain.FinancialBase) []domain.FinancialBase {
		return f
	}), nil
}

func (r Repository) incomeStatements(
	ticker string,
	period fmp.Period,
	financialItemMap map[string]domain.FinancialItem,
) fmpFinancialRequest {
	return func(ctx context.Context) ([]domain.FinancialBase, error) {
		statements, err := r.client.IncomeStatements(ctx, ticker, period)
		if err != nil {
			return nil, fmt.Errorf("could not retrieve income statements: %w", err)
		}
		return slices.FlatMap(statements, func(statement fmp.IncomeStatement) []domain.FinancialBase {
			return fromIncomeStatement(statement, financialItemMap)
		}), nil
	}
}

func (r Repository) balanceSheetStatements(
	ticker string,
	period fmp.Period,
	financialItemMap map[string]domain.FinancialItem,
) fmpFinancialRequest {
	return func(ctx context.Context) ([]domain.FinancialBase, error) {
		statements, err := r.client.BalanceSheetStatements(ctx, ticker, period)
		if err != nil {
			return nil, fmt.Errorf("could not retrieve balance sheets: %w", err)
		}
		return slices.FlatMap(statements, func(statement fmp.BalanceSheetStatement) []domain.FinancialBase {
			return fromBalanceSheetStatement(statement, financialItemMap)
		}), nil
	}
}

func (r Repository) cashFlowStatements(
	ticker string,
	period fmp.Period,
	financialItemMap map[string]domain.FinancialItem,
) fmpFinancialRequest {
	return func(ctx context.Context) ([]domain.FinancialBase, error) {
		statements, err := r.client.CashFlowStatements(ctx, ticker, period)
		if err != nil {
			return nil, fmt.Errorf("could not retrieve cash flows: %w", err)
		}
		return slices.FlatMap(statements, func(statement fmp.CashFlowStatement) []domain.FinancialBase {
			return fromCashFlowStatement(statement, financialItemMap)
		}), nil
	}
}
