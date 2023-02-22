package fmp

import (
	"context"
	"strconv"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/fmp"
	"github.com/fcote/merlin/sheduler/pkg/maps"
)

func (r Repository) Companies(ctx context.Context, tickers []string) ([]domain.CompanyBase, error) {
	companies, err := r.client.BatchCompanies(ctx, tickers)
	if err != nil {
		return nil, err
	}
	companiesByTicker := maps.GroupBy(companies, func(c fmp.Company) string {
		return c.Symbol
	})

	result := make([]domain.CompanyBase, len(tickers))
	for i, ticker := range tickers {
		result[i] = CompanyBaseFromFMP(companiesByTicker[ticker])
	}

	return result, nil
}

func CompanyBaseFromFMP(fmpCompany fmp.Company) domain.CompanyBase {
	var employees *int64
	if fmpCompany.FullTimeEmployees != nil {
		e, err := strconv.ParseInt(*fmpCompany.FullTimeEmployees, 10, 64)
		if err == nil {
			employees = &e
		}
	}

	var industry string
	if fmpCompany.Industry != nil {
		industry = *fmpCompany.Industry
	}

	var sector string
	if fmpCompany.Sector != nil {
		sector = *fmpCompany.Sector
	}

	return domain.CompanyBase{
		Name:        fmpCompany.CompanyName,
		Employees:   employees,
		Address:     fmpCompany.Address,
		Description: fmpCompany.Description,
		Cik:         fmpCompany.Cik,
		Isin:        fmpCompany.Isin,
		Cusip:       fmpCompany.Cusip,
		Industry:    industry,
		Sector:      sector,
	}
}
