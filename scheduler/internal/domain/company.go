package domain

import (
	"github.com/fcote/merlin/sheduler/pkg/slices"
)

type CompanyBase struct {
	Name        string
	Employees   *int64
	Address     *string
	Description *string
	Cik         *string
	Isin        *string
	Cusip       *string
	Industry    string
	Sector      string
}

type Company struct {
	CompanyBase
	SectorID   *int
	IndustryID *int
}

func CompanyFromBase(base CompanyBase, sectorId *int, industryId *int) Company {
	return Company{
		CompanyBase: base,
		SectorID:    sectorId,
		IndustryID:  industryId,
	}
}

func (c Company) Hash() string {
	return c.Name
}

func (c Company) Equal(comp Company) bool {
	return c.Name == comp.Name
}

type Companies []Company

func (companies Companies) Names() []string {
	return slices.Map(companies, func(a Company) string {
		return a.Name
	})
}

func (companies Companies) Employees() []*int64 {
	return slices.Map(companies, func(a Company) *int64 {
		return a.Employees
	})
}

func (companies Companies) Addresses() []*string {
	return slices.Map(companies, func(a Company) *string {
		return a.Address
	})
}

func (companies Companies) Descriptions() []*string {
	return slices.Map(companies, func(a Company) *string {
		return a.Description
	})
}

func (companies Companies) Ciks() []*string {
	return slices.Map(companies, func(a Company) *string {
		return a.Cik
	})
}

func (companies Companies) Isins() []*string {
	return slices.Map(companies, func(a Company) *string {
		return a.Isin
	})
}

func (companies Companies) Cusips() []*string {
	return slices.Map(companies, func(a Company) *string {
		return a.Cusip
	})
}

func (companies Companies) SectorIds() []*int {
	return slices.Map(companies, func(a Company) *int {
		return a.SectorID
	})
}

func (companies Companies) IndustryIds() []*int {
	return slices.Map(companies, func(a Company) *int {
		return a.IndustryID
	})
}

func (companies Companies) Unique() Companies {
	return slices.Unique(companies)
}

func (companies Companies) IdsFromUniques(uniques Companies, uniqueIds []int) []int {
	ids := make([]int, len(companies))
	for i, company := range companies {
		pos := slices.FindIndex(uniques, company)
		ids[i] = uniqueIds[pos]
	}
	return ids
}
