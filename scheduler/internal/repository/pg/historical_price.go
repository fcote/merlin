package pg

import (
	"context"
	"fmt"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/gmonitor"
)

func (r Repository) BatchInsertHistoricalPrices(ctx context.Context, historicalPrices domain.HistoricalPrices) ([]int, error) {
	statement := `
insert into historical_prices (
	date,
	open,
	close,
	high,
	low,
	volume,
	change,
	change_percent,
	security_id
) 
values (
	unnest($1::varchar[]),
	unnest($2::decimal[]),
	unnest($3::decimal[]),
	unnest($4::decimal[]),
	unnest($5::decimal[]),
	unnest($6::decimal[]),
	unnest($7::decimal[]),
	unnest($8::decimal[]),
	unnest($9::int[])
)     
on conflict (security_id, date) do update set
	open = excluded.open,
	high = excluded.high,
	low = excluded.low,
	close = excluded.close,
	volume = excluded.volume,
	change = excluded.change,
	change_percent = excluded.change_percent
returning id;
	`

	segment := gmonitor.StartAsyncDatastoreSegment(ctx, "historical_prices", "insert", statement)
	defer segment.End()

	uniqueInputs := historicalPrices.Unique()
	rows, err := r.db.Query(
		ctx,
		statement,
		uniqueInputs.Dates(),
		uniqueInputs.Opens(),
		uniqueInputs.Closes(),
		uniqueInputs.Highs(),
		uniqueInputs.Lows(),
		uniqueInputs.Volumes(),
		uniqueInputs.Changes(),
		uniqueInputs.ChangePercents(),
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

	return historicalPrices.IdsFromUniques(uniqueInputs, uniqueIds), nil
}
