package fmp

import (
	"context"
	"fmt"
	"strings"
)

type Company struct {
	Symbol            string   `json:"symbol"`
	Price             float64  `json:"price"`
	Beta              float64  `json:"beta"`
	VolAvg            int64    `json:"vol_Avg"`
	MktCap            int64    `json:"mktCap"`
	LastDiv           float64  `json:"lastDiv"`
	Range             *string  `json:"range"`
	Changes           float64  `json:"changes"`
	CompanyName       string   `json:"companyName"`
	Currency          *string  `json:"currency"`
	Cik               *string  `json:"cik"`
	Isin              *string  `json:"isin"`
	Cusip             *string  `json:"cusip"`
	Exchange          string   `json:"exchange"`
	ExchangeShortName string   `json:"exchangeShortName"`
	Industry          *string  `json:"industry"`
	Website           *string  `json:"website"`
	Description       *string  `json:"description"`
	Ceo               *string  `json:"ceo"`
	Sector            *string  `json:"sector"`
	Country           *string  `json:"country"`
	FullTimeEmployees *string  `json:"fullTimeEmployees"`
	Phone             *string  `json:"phone"`
	Address           *string  `json:"address"`
	City              *string  `json:"city"`
	State             *string  `json:"state"`
	Zip               *string  `json:"zip"`
	DcfDiff           *float64 `json:"dcfDiff"`
	Dcf               *float64 `json:"dcf"`
	Image             *string  `json:"image"`
	IpoDate           *string  `json:"ipoDate"`
	DefaultImage      bool     `json:"defaultImage"`
	IsEtf             bool     `json:"isEtf"`
	IsActivelyTrading bool     `json:"isActivelyTrading"`
	IsAdr             bool     `json:"isAdr"`
	IsFund            bool     `json:"isFund"`
}

func (fmp FMP) BatchCompanies(ctx context.Context, tickers []string) ([]Company, error) {
	url := fmp.url.JoinPath("/v3/profile/", strings.Join(tickers, ","))

	var companies []Company
	if err := fmp.request(ctx, url, &companies); err != nil {
		return nil, err
	}
	return companies, nil
}

func (fmp FMP) Company(ctx context.Context, ticker string) (*Company, error) {
	results, err := fmp.BatchCompanies(ctx, []string{ticker})
	if err != nil {
		return nil, fmt.Errorf("fmp.Company: %w", err)
	}
	return &results[0], nil
}
