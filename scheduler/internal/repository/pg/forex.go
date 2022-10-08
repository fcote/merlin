package pg

import (
	"context"
	"fmt"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/gmonitor"
)

func (r Repository) BatchInsertForex(ctx context.Context, forex domain.Forexes) ([]int, error) {
	statement := `
insert into forex (
	from_currency,
	to_currency,
	exchange_rate
) 
values (
	unnest($1::varchar[]),
	unnest($2::varchar[]),
	unnest($3::decimal[])
)     
on conflict (from_currency, to_currency) do update set
	exchange_rate = excluded.exchange_rate,
	updated_at = now()
returning id;
	`

	segment := gmonitor.StartAsyncDatastoreSegment(ctx, "forex", "insert", statement)
	defer segment.End()

	uniqueInputs := forex.Unique()
	rows, err := r.db.Query(
		ctx,
		statement,
		uniqueInputs.FromCurrencies(),
		uniqueInputs.ToCurrencies(),
		uniqueInputs.ExchangeRates(),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert forex: %w", err)
	}

	uniqueIds := make([]int, 0, len(uniqueInputs))
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("could not scan forex id: %w", err)
		}
		uniqueIds = append(uniqueIds, id)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("could not read forex rows: %w", err)
	}

	return forex.IdsFromUniques(uniqueInputs, uniqueIds), nil
}
