package pg

import (
	"context"
	"fmt"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/gmonitor"
)

func (r Repository) BatchInsertSecurities(ctx context.Context, securities domain.Securities) ([]int, error) {
	statement := `
insert into securities (
	ticker,
	currency,
	type,
	current_price,
	day_change,
	day_change_percent,
	high52_week,
	low52_week,
	market_capitalization,
	shares_outstanding,
	company_id
) 
values (
	unnest($1::varchar[]),
	unnest($2::varchar[]),
	unnest($3::varchar[]),
	unnest($4::decimal[]),
	unnest($5::decimal[]),
	unnest($6::decimal[]),
	unnest($7::decimal[]),
	unnest($8::decimal[]),
	unnest($9::decimal[]),
	unnest($10::decimal[]),
	unnest($11::int[])
) 
on conflict (ticker) do update set 
	ticker = excluded.ticker,
	currency = excluded.currency,
	type = excluded.type,
	current_price = excluded.current_price,
	day_change = excluded.day_change,
	day_change_percent = excluded.day_change_percent,
	high52_week = excluded.high52_week,
	low52_week = excluded.low52_week,
	market_capitalization = excluded.market_capitalization,
	shares_outstanding = excluded.shares_outstanding,
	company_id = excluded.company_id,
	updated_at = now()
returning id;
	`

	segment := gmonitor.StartDatastoreSegment(ctx, "securities", "insert", statement)
	defer segment.End()

	uniqueInputs := securities.Unique()
	rows, err := r.db.Query(
		ctx,
		statement,
		uniqueInputs.Tickers(),
		uniqueInputs.Currencies(),
		uniqueInputs.Types(),
		uniqueInputs.CurrentPrices(),
		uniqueInputs.DayChanges(),
		uniqueInputs.DayChangePercents(),
		uniqueInputs.High52Weeks(),
		uniqueInputs.Low52Weeks(),
		uniqueInputs.MarketCapitalizations(),
		uniqueInputs.SharesOutstandings(),
		uniqueInputs.CompanyIds(),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert securities: %w", err)
	}

	uniqueIds := make([]int, 0, len(uniqueInputs))
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("could not scan security id: %w", err)
		}
		uniqueIds = append(uniqueIds, id)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("could not read security rows: %w", err)
	}

	return securities.IdsFromUniques(uniqueInputs, uniqueIds), nil
}

func (r Repository) GetSecurities(ctx context.Context) (domain.Securities, error) {
	statement := `
select id, ticker
from securities;
`
	segment := gmonitor.StartDatastoreSegment(ctx, "securities", "select", statement)
	defer segment.End()

	rows, err := r.db.Query(ctx, statement)
	if err != nil {
		return nil, fmt.Errorf("failed to select securities: %w", err)
	}

	var securities domain.Securities
	for rows.Next() {
		var security domain.Security
		if err := rows.Scan(&security.Id, &security.Ticker); err != nil {
			return nil, fmt.Errorf("could not scan security id: %w", err)
		}
		securities = append(securities, security)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("could not read security rows: %w", err)
	}

	return securities, nil
}
