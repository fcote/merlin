package pg

import (
	"context"
	"fmt"

	"github.com/fcote/merlin/sheduler/internal/domain"
)

func (r Repository) BatchInsertIndustries(ctx context.Context, industries domain.Industries) ([]int, error) {
	statement := `
insert into industries (
	name
)
values (
	unnest($1::varchar[])
)
on conflict (name) do update set
	name = excluded.name
returning id;
	`

	uniqueInputs := industries.Unique()
	rows, err := r.db.Query(
		ctx,
		statement,
		uniqueInputs.Names(),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert industries: %w", err)
	}

	uniqueIds := make([]int, 0, len(uniqueInputs))
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("could not scan industry id: %w", err)
		}
		uniqueIds = append(uniqueIds, id)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("could not read industry rows: %w", err)
	}

	return industries.IdsFromUniques(uniqueInputs, uniqueIds), nil
}
