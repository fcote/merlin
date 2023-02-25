package usecase

import (
	"context"
	"fmt"
	"strings"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/gmonitor"
	"github.com/fcote/merlin/sheduler/pkg/slices"
)

type SecurityUsecase struct {
	store DataStore
	fetch DataFetch
}

func NewSecurityUsecase(
	store DataStore,
	fetch DataFetch,
) SecurityUsecase {
	return SecurityUsecase{
		store: store,
		fetch: fetch,
	}
}

func (uc SecurityUsecase) SyncSecurities(ctx context.Context, tickers []string) (map[string]int, map[string]int, error) {
	ctx = gmonitor.NewContext(ctx, "sync.security")
	defer gmonitor.FromContext(ctx).End()

	rawCompanies, err := uc.fetch.Companies(ctx, tickers)
	if err != nil {
		return nil, nil, fmt.Errorf("%s | could not fetch companies: %w", strings.Join(tickers, ","), err)
	}

	rawSecurities, err := uc.fetch.Securities(ctx, tickers)
	if err != nil {
		return nil, nil, fmt.Errorf("%s | could not fetch securities: %w", strings.Join(tickers, ","), err)
	}

	securities := make(map[string]int)
	commonStocks := make(map[string]int)

	err = uc.store.Atomic(ctx, func(s DataStore) error {
		industryInputs := slices.Map(rawCompanies, func(c domain.CompanyBase) domain.Industry {
			return domain.IndustryFromString(c.Industry)
		})
		industryIds, err := s.BatchInsertIndustries(ctx, industryInputs)
		if err != nil {
			return err
		}

		sectorInputs := slices.Map(rawCompanies, func(c domain.CompanyBase) domain.Sector {
			return domain.SectorFromString(c.Sector)
		})
		sectorIds, err := s.BatchInsertSectors(ctx, sectorInputs)
		if err != nil {
			return err
		}

		companyInputs := slices.MapWithIndex(rawCompanies, func(i int, c domain.CompanyBase) domain.Company {
			return domain.CompanyFromBase(c, slices.Get(sectorIds, i), slices.Get(industryIds, i))
		})
		companyIds, err := s.BatchInsertCompanies(ctx, companyInputs)
		if err != nil {
			return err
		}

		securityInputs := slices.MapWithIndex(rawSecurities, func(i int, s domain.SecurityBase) domain.Security {
			return domain.SecurityFromBase(s, slices.Get(companyIds, i))
		})
		securityIds, err := s.BatchInsertSecurities(ctx, securityInputs)
		if err != nil {
			return err
		}

		for i, input := range securityInputs {
			securities[input.Ticker] = securityIds[i]
			if input.Type == domain.SecurityTypeCommonStock {
				commonStocks[input.Ticker] = securityIds[i]
			}
		}

		return nil
	})
	if err != nil {
		return nil, nil, fmt.Errorf("%s | could not sync securities: %w", strings.Join(tickers, ","), err)
	}

	return securities, commonStocks, nil
}

func (uc SecurityUsecase) GetSecurities(ctx context.Context) (map[string]int, error) {
	ctx = gmonitor.NewContext(ctx, "get.security")
	defer gmonitor.FromContext(ctx).End()

	securities := make(map[string]int)

	err := uc.store.Atomic(ctx, func(s DataStore) error {
		storeSecurities, err := s.GetSecurities(ctx)
		if err != nil {
			return err
		}

		for _, s := range storeSecurities {
			securities[s.Ticker] = s.Id
		}

		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("could not get securities: %w", err)
	}

	return securities, nil
}
