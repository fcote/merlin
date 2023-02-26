package usecase

import (
	"github.com/fcote/merlin/sheduler/internal/domain"
)

type financialPeriodMap = map[domain.FinancialPeriod]domain.Financial
type financialStatementMap map[domain.FinancialStatement]map[string]financialPeriodMap

type FinancialTTMProcessor struct {
	financials       financialStatementMap
	financialItemMap map[int]domain.FinancialItem
}

func (p FinancialTTMProcessor) Compute() domain.Financials {
	var ttmFinancials domain.Financials

	for _, m := range p.financials {
		for financialSlug, periodMap := range m {
			var value float64
			switch domain.FinancialTTMMap[financialSlug] {
			case domain.TTMOperationSum:
				value = sum(periodMap)
			case domain.TTMOperationLast:
				value = lastValue(periodMap)
			}

			ttm := ttmFinancial(periodMap, value)
			if ttm != nil {
				ttmFinancials = append(ttmFinancials, *ttm)
			}
		}
	}

	return ttmFinancials
}

func ttmFinancial(financials financialPeriodMap, value float64) *domain.Financial {
	lastFinancial := last(financials)
	if lastFinancial.SecurityId == nil {
		return nil
	}

	return &domain.Financial{
		FinancialBase: domain.FinancialBase{
			Value:           value,
			Period:          domain.FinancialPeriodTTM,
			ReportDate:      "TTM",
			IsEstimate:      false,
			FinancialItemId: lastFinancial.FinancialItemId,
		},
		SecurityId: lastFinancial.SecurityId,
	}
}

func last(financials financialPeriodMap) domain.Financial {
	var last domain.Financial
	for _, f := range financials {
		if f.Period.String() > last.Period.String() {
			last = f
		}
	}
	return last
}

func lastValue(financials financialPeriodMap) float64 {
	last := last(financials)
	return last.Value
}

func sum(financials financialPeriodMap) float64 {
	total := float64(0)
	for _, f := range financials {
		total += f.Value
	}
	return total
}

func NewFinancialTTMProcessor(financials domain.Financials, financialItemMap map[string]domain.FinancialItem) FinancialTTMProcessor {
	financialItemMappedById := mapFinancialItemById(financialItemMap)
	financialsMap := last4QuartersMap(financials, financialItemMappedById)

	return FinancialTTMProcessor{
		financials:       financialsMap,
		financialItemMap: financialItemMappedById,
	}
}

func mapFinancialItemById(financialItemMap map[string]domain.FinancialItem) map[int]domain.FinancialItem {
	result := make(map[int]domain.FinancialItem, len(financialItemMap))
	for _, fi := range financialItemMap {
		result[fi.Id] = fi
	}
	return result
}

func last4QuartersMap(financials domain.Financials, financialItemMap map[int]domain.FinancialItem) financialStatementMap {
	financialsMap := make(financialStatementMap)

	for _, financial := range financials {
		// Only store quarters financials
		if !financial.Period.IsQuarter() {
			continue
		}
		fi := financialItemMap[financial.FinancialItemId]

		_, exists := financialsMap[fi.Statement]
		if !exists {
			financialsMap[fi.Statement] = make(map[string]financialPeriodMap)
		}
		_, exists = financialsMap[fi.Statement][fi.Slug]
		if !exists {
			financialsMap[fi.Statement][fi.Slug] = make(financialPeriodMap)
		}

		// Keep the latest financial for each quarter
		current, exists := financialsMap[fi.Statement][fi.Slug][financial.Period]
		if !exists || current.Year < financial.Year {
			financialsMap[fi.Statement][fi.Slug][financial.Period] = financial
		}
	}

	return financialsMap
}
