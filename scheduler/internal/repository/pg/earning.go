package pg

import (
	"context"
	"fmt"

	"github.com/fcote/merlin/sheduler/internal/domain"
)

func (r Repository) BatchInsertEarnings(ctx context.Context, earnings domain.Earnings) ([]int, error) {
	statement := `
insert into earnings (
	date,
	fiscal_year,
	fiscal_quarter,
	time,
	eps,
	eps_estimate,
	eps_surprise_percent,
	revenue,
	revenue_estimate,
	revenue_surprise_percent,
	security_id
) 
values (
	unnest($1::varchar[]),
	unnest($2::int[]),
	unnest($3::int[]),
	unnest($4::varchar[]),
	unnest($5::decimal[]),
	unnest($6::decimal[]),
	unnest($7::decimal[]),
	unnest($8::decimal[]),
	unnest($9::decimal[]),
	unnest($10::decimal[]),
	unnest($11::int[])
)     
on conflict (security_id, fiscal_year, fiscal_quarter) do update set
	date = excluded.date,
	time = excluded.time,
	eps = excluded.eps,
	eps_estimate = excluded.eps_estimate,
	eps_surprise_percent = excluded.eps_surprise_percent,
	revenue = excluded.revenue,
	revenue_estimate = excluded.revenue_estimate,
	revenue_surprise_percent = excluded.revenue_surprise_percent,
	updated_at = now()
returning id;
	`

	uniqueInputs := earnings.Unique()
	rows, err := r.db.Query(
		ctx,
		statement,
		uniqueInputs.Dates(),
		uniqueInputs.FiscalYears(),
		uniqueInputs.FiscalQuarters(),
		uniqueInputs.Times(),
		uniqueInputs.Epss(),
		uniqueInputs.EpsEstimates(),
		uniqueInputs.EpsSurprisePercents(),
		uniqueInputs.Revenues(),
		uniqueInputs.RevenueEstimates(),
		uniqueInputs.RevenueSurprisePercents(),
		uniqueInputs.SecurityIds(),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert historical prices: %w", err)
	}

	uniqueIds := make([]int, 0, len(uniqueInputs))
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("could not scan historical price id: %w", err)
		}
		uniqueIds = append(uniqueIds, id)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("could not read historical price rows: %w", err)
	}

	return earnings.IdsFromUniques(uniqueInputs, uniqueIds), nil
}
