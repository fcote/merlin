package pg

import (
	"context"
	"fmt"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/gmonitor"
)

func (r Repository) BatchInsertSecurityFinancials(ctx context.Context, financials domain.Financials) ([]int, error) {
	statement := `
insert into financials (
	value,
	year,
	period,
	report_date,
	is_estimate,
	security_id,
	financial_item_id
)
values (
	unnest($1::decimal[]),
	unnest($2::int[]),
	unnest($3::varchar[]),
	unnest($4::varchar[]),
	unnest($5::bool[]),
	unnest($6::int[]),
	unnest($7::int[])
)
on conflict (financial_item_id, security_id, period, year) do update set
	value = excluded.value,
	year = excluded.year,
	period = excluded.period,
	report_date = excluded.report_date,
	is_estimate = excluded.is_estimate,
	security_id = excluded.security_id,
	financial_item_id = excluded.financial_item_id,
	updated_at = now()
returning id;
	`

	segment := gmonitor.StartAsyncDatastoreSegment(ctx, "financials", "insert", statement)
	defer segment.End()

	uniqueInputs := financials.Unique()
	rows, err := r.db.Query(
		ctx,
		statement,
		uniqueInputs.Values(),
		uniqueInputs.Years(),
		uniqueInputs.Periods(),
		uniqueInputs.ReportDates(),
		uniqueInputs.IsEstimates(),
		uniqueInputs.SecurityIds(),
		uniqueInputs.FinancialItemIds(),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert security financials: %w", err)
	}

	uniqueIds := make([]int, 0, len(uniqueInputs))
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("could not scan financial id: %w", err)
		}
		uniqueIds = append(uniqueIds, id)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("could not read financial rows: %w", err)
	}

	return financials.IdsFromUniques(uniqueInputs, uniqueIds), nil
}

func (r Repository) BatchInsertSectorFinancials(ctx context.Context, financials domain.Financials) ([]int, error) {
	statement := `
insert into financials (
	value,
	year,
	period,
	report_date,
	is_estimate,
	sector_id,
	financial_item_id
)
values (
	unnest($1::decimal[]),
	unnest($2::int[]),
	unnest($3::varchar[]),
	unnest($4::varchar[]),
	unnest($5::bool[]),
	unnest($6::int[]),
	unnest($7::int[])
)
on conflict (financial_item_id, sector_id, period, year) do update set
	value = excluded.value,
	year = excluded.year,
	period = excluded.period,
	report_date = excluded.report_date,
	is_estimate = excluded.is_estimate,
	sector_id = excluded.sector_id,
	financial_item_id = excluded.financial_item_id,
	updated_at = now()
returning id;
	`

	segment := gmonitor.StartAsyncDatastoreSegment(ctx, "financials", "insert", statement)
	defer segment.End()

	uniqueInputs := financials.Unique()
	rows, err := r.db.Query(
		ctx,
		statement,
		uniqueInputs.Values(),
		uniqueInputs.Years(),
		uniqueInputs.Periods(),
		uniqueInputs.ReportDates(),
		uniqueInputs.IsEstimates(),
		uniqueInputs.SectorIds(),
		uniqueInputs.FinancialItemIds(),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert sector financials: %w", err)
	}

	uniqueIds := make([]int, 0, len(uniqueInputs))
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("could not scan financial id: %w", err)
		}
		uniqueIds = append(uniqueIds, id)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("could not read financial rows: %w", err)
	}

	return financials.IdsFromUniques(uniqueInputs, uniqueIds), nil
}

func (r Repository) GetSectorFinancials(
	ctx context.Context,
	sectorId int,
	statementType domain.FinancialType,
	year int,
	period domain.FinancialPeriod,
) (domain.Financials, error) {
	statement := `
select financials.id, financials.value, financials.financial_item_id
from financials
join securities s on s.id = financials.security_id
join companies c on c.id = s.company_id
join financial_items fi on fi.id = financials.financial_item_id
where c.sector_id = $1
and fi.type = $2
and financials.year = $3
and financials.period = $4
and financials.is_estimate = false
and financials.sector_id is null
and financials.value is not null;
`

	segment := gmonitor.StartAsyncDatastoreSegment(ctx, "financials", "select", statement)
	defer segment.End()

	rows, err := r.db.Query(
		ctx,
		statement,
		sectorId,
		statementType,
		year,
		period.String(),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to select financials: %w", err)
	}

	var financials domain.Financials
	for rows.Next() {
		var financial domain.Financial
		if err := rows.Scan(&financial.Id, &financial.Value, &financial.FinancialItemId); err != nil {
			return nil, fmt.Errorf("could not scan financial row: %w", err)
		}
		financials = append(financials, financial)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("could not read financial rows: %w", err)
	}

	return financials, nil
}

func (r Repository) GetSectorFinancialPeriods(ctx context.Context, sectorId int) ([]domain.FinancialYearPeriod, error) {
	statement := `
select distinct financials.year, financials.period
from financials
join securities s on s.id = financials.security_id
join companies c on c.id = s.company_id
where c.sector_id = $1;
`

	segment := gmonitor.StartAsyncDatastoreSegment(ctx, "financials", "select", statement)
	defer segment.End()

	rows, err := r.db.Query(
		ctx,
		statement,
		sectorId,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to select financial periods: %w", err)
	}

	var periods []domain.FinancialYearPeriod
	for rows.Next() {
		var financial domain.FinancialYearPeriod
		if err := rows.Scan(&financial.Year, &financial.Period); err != nil {
			return nil, fmt.Errorf("could not scan financial period row: %w", err)
		}
		periods = append(periods, financial)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("could not read financial period rows: %w", err)
	}

	return periods, nil
}
