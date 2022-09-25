package usecase

import (
	"github.com/fcote/merlin/sheduler/internal/domain"
)

// financialByItem [netRevenue]financials
type financialByItem map[string]domain.Financial

// financialByDates [2010][Q4][netRevenue]financials
type financialByDates map[int]map[domain.FinancialPeriod]financialByItem

type FinancialRatioProcessor struct {
	financials       financialByDates
	financialItemMap map[string]domain.FinancialItem
	prices           domain.HistoricalPrices
}

func NewFinancialRatioProcessor(
	financials domain.Financials,
	financialItemMap map[string]domain.FinancialItem,
	prices domain.HistoricalPrices,
) FinancialRatioProcessor {
	return FinancialRatioProcessor{
		financials:       formatFinancialByDates(financials, mapFinancialItemById(financialItemMap)),
		financialItemMap: mapFinancialItemBySlug(financialItemMap),
		prices:           prices,
	}
}

func mapFinancialItemBySlug(financialItemMap map[string]domain.FinancialItem) map[string]domain.FinancialItem {
	result := make(map[string]domain.FinancialItem, len(financialItemMap))
	for _, fi := range financialItemMap {
		result[fi.Slug] = fi
	}
	return result
}

func (p FinancialRatioProcessor) Compute() domain.Financials {
	var ratioFinancials domain.Financials
	for year, financialsByPeriod := range p.financials {
		for period, financialsByItem := range financialsByPeriod {
			processor := newFinancialRatioPeriodProcessor(year, period, p.prices, financialsByItem, p.financialItemMap)
			ratioFinancials = append(ratioFinancials, processor.processPeriod()...)
		}
	}
	return ratioFinancials
}

func formatFinancialByDates(financials domain.Financials, financialItemMap map[int]domain.FinancialItem) financialByDates {
	financialMap := make(financialByDates)
	for _, financial := range financials {
		_, exists := financialMap[financial.Year]
		if !exists {
			financialMap[financial.Year] = make(map[domain.FinancialPeriod]financialByItem)
		}
		_, exists = financialMap[financial.Year][financial.Period]
		if !exists {
			financialMap[financial.Year][financial.Period] = make(financialByItem)
		}
		fi := financialItemMap[financial.FinancialItemId]
		_, exists = financialMap[financial.Year][financial.Period][fi.Slug]
		if !exists {
			financialMap[financial.Year][financial.Period][fi.Slug] = financial
		}
	}
	return financialMap
}
