package pg

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v4"

	"github.com/fcote/merlin/sheduler/internal/domain"
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
		return nil, fmt.Errorf("failed to insert financials: %w", err)
	}

	return unwrapFinancialRows(rows, financials, uniqueInputs)
}

func unwrapFinancialRows(rows pgx.Rows, financials domain.Financials, uniqueInputs domain.Financials) ([]int, error) {
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
