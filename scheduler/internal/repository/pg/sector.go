package pg

import (
	"context"
	"fmt"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/gmonitor"
)

func (r Repository) BatchInsertSectors(ctx context.Context, sectors domain.Sectors) ([]int, error) {
	statement := `
insert into sectors (
	name
)
values (
	unnest($1::varchar[])
)
on conflict (name) do update set
	name = excluded.name
returning id;
	`

	segment := gmonitor.StartDatastoreSegment(ctx, "sectors", "insert", statement)
	defer segment.End()

	uniqueInputs := sectors.Unique()
	rows, err := r.db.Query(
		ctx,
		statement,
		uniqueInputs.Names(),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert sectors: %w", err)
	}

	uniqueIds := make([]int, 0, len(uniqueInputs))
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("could not scan sector id: %w", err)
		}
		uniqueIds = append(uniqueIds, id)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("could not read sector rows: %w", err)
	}

	return sectors.IdsFromUniques(uniqueInputs, uniqueIds), nil
}
