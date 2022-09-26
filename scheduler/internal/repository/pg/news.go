package pg

import (
	"context"
	"fmt"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/gmonitor"
)

func (r Repository) BatchInsertNews(ctx context.Context, news domain.Newses) ([]int, error) {
	statement := `
insert into news (
	date,
	type,
	title,
	content,
	website,
	url,
	security_id
) 
values (
	unnest($1::timestamp[]),
	unnest($2::varchar[]),
	unnest($3::varchar[]),
	unnest($4::varchar[]),
	unnest($5::varchar[]),
	unnest($6::varchar[]),
	unnest($7::int[])
)     
on conflict (security_id, type, title) do update set
	date = excluded.date,
	content = excluded.content,
	website = excluded.website,
	url = excluded.url
returning id;
	`

	segment := gmonitor.StartAsyncDatastoreSegment(ctx, "news", "insert", statement)
	defer segment.End()

	uniqueInputs := news.Unique()
	rows, err := r.db.Query(
		ctx,
		statement,
		uniqueInputs.Dates(),
		uniqueInputs.Types(),
		uniqueInputs.Titles(),
		uniqueInputs.Contents(),
		uniqueInputs.Websites(),
		uniqueInputs.Urls(),
		uniqueInputs.SecurityIds(),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert news: %w", err)
	}

	uniqueIds := make([]int, 0, len(uniqueInputs))
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("could not scan news id: %w", err)
		}
		uniqueIds = append(uniqueIds, id)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("could not read news rows: %w", err)
	}

	return news.IdsFromUniques(uniqueInputs, uniqueIds), nil
}
