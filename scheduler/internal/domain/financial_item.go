package domain

import (
	"fmt"

	"github.com/fcote/merlin/sheduler/pkg/slices"
)

type FinancialType string

const (
	FinancialTypeStatement FinancialType = "statement"
	FinancialTypeRatio     FinancialType = "ratio"
)

type FinancialStatement string

const (
	FinancialStatementIncome                     FinancialStatement = "income-statement"
	FinancialStatementBalanceSheet               FinancialStatement = "balance-sheet-statement"
	FinancialStatementCashFlow                   FinancialStatement = "cash-flow-statement"
	FinancialStatementLiquidityRatios            FinancialStatement = "liquidity-ratios"
	FinancialStatementProfitabilityRatios        FinancialStatement = "profitability-ratios"
	FinancialStatementDebtRatios                 FinancialStatement = "debt-ratios"
	FinancialStatementCashFlowRatios             FinancialStatement = "cash-flow-ratios"
	FinancialStatementOperationPerformanceRatios FinancialStatement = "operating-performance-ratios"
	FinancialStatementValuationRatios            FinancialStatement = "valuation-ratios"
)

type FinancialUnit string

const (
	FinancialUnitMillions FinancialUnit = "millions"
	FinancialUnitUnit     FinancialUnit = "unit"
	FinancialUnitPercent  FinancialUnit = "percent"
	FinancialUnitDays     FinancialUnit = "days"
)

type FinancialUnitType string

const (
	FinancialUnitTypeRatio    FinancialUnitType = "ratio"
	FinancialUnitTypeAmount   FinancialUnitType = "amount"
	FinancialUnitTypeCurrency FinancialUnitType = "currency"
	FinancialUnitTypeDays     FinancialUnitType = "days"
)

type FinancialItem struct {
	Id               int
	Slug             string
	Type             FinancialType
	Statement        FinancialStatement
	Label            string
	Unit             FinancialUnit
	UnitType         FinancialUnitType
	IsMain           bool
	Index            int
	Direction        *string
	LatexDescription *string
}

func (fi FinancialItem) Hash() string {
	return fmt.Sprintf("%s-%s", fi.Statement, fi.Slug)
}

func (fi FinancialItem) Equal(comp FinancialItem) bool {
	return fi.Statement == comp.Statement && fi.Slug == comp.Slug
}

type FinancialItems []FinancialItem

func (financialItems FinancialItems) Slugs() []string {
	return slices.Map(financialItems, func(i FinancialItem) string {
		return i.Slug
	})
}

func (financialItems FinancialItems) Types() []FinancialType {
	return slices.Map(financialItems, func(i FinancialItem) FinancialType {
		return i.Type
	})
}

func (financialItems FinancialItems) Labels() []string {
	return slices.Map(financialItems, func(i FinancialItem) string {
		return i.Label
	})
}

func (financialItems FinancialItems) Statements() []FinancialStatement {
	return slices.Map(financialItems, func(i FinancialItem) FinancialStatement {
		return i.Statement
	})
}

func (financialItems FinancialItems) Units() []FinancialUnit {
	return slices.Map(financialItems, func(i FinancialItem) FinancialUnit {
		return i.Unit
	})
}

func (financialItems FinancialItems) UnitTypes() []FinancialUnitType {
	return slices.Map(financialItems, func(i FinancialItem) FinancialUnitType {
		return i.UnitType
	})
}

func (financialItems FinancialItems) Indexes() []int {
	return slices.Map(financialItems, func(i FinancialItem) int {
		return i.Index
	})
}

func (financialItems FinancialItems) IsMains() []bool {
	return slices.Map(financialItems, func(i FinancialItem) bool {
		return i.IsMain
	})
}

func (financialItems FinancialItems) Directions() []*string {
	return slices.Map(financialItems, func(i FinancialItem) *string {
		return i.Direction
	})
}

func (financialItems FinancialItems) LatexDescriptions() []*string {
	return slices.Map(financialItems, func(i FinancialItem) *string {
		return i.LatexDescription
	})
}

func (financialItems FinancialItems) Unique() FinancialItems {
	return slices.Unique(financialItems)
}

func (financialItems FinancialItems) IdsFromUniques(uniques FinancialItems, uniqueIds []int) []int {
	ids := make([]int, len(financialItems))
	for i, financialItem := range financialItems {
		pos := slices.FindIndex(uniques, financialItem)
		ids[i] = uniqueIds[pos]
	}
	return ids
}
