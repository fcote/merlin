package pg

import (
	"context"
	"fmt"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/gmonitor"
)

func (r Repository) BatchInsertCompanies(ctx context.Context, companies domain.Companies) ([]int, error) {
	statement := `
insert into companies (
	name,
	employees,
	address,
	description,
	cik,
	isin,
	cusip,
	sector_id,
	industry_id
) 
values (
	unnest($1::varchar[]),
	unnest($2::int[]),
	unnest($3::varchar[]),
	unnest($4::varchar[]),
	unnest($5::varchar[]),
	unnest($6::varchar[]),
	unnest($7::varchar[]),
	unnest($8::int[]),
	unnest($9::int[])
) 
on conflict (name) do update set 
	employees = excluded.employees, 
	address = excluded.address, 
	description = excluded.description, 
	cik = excluded.cik, 
	isin = excluded.isin, 
	cusip = excluded.cusip, 
	sector_id = excluded.sector_id, 
	industry_id = excluded.industry_id, 
	updated_at = now()
returning id;
	`

	segment := gmonitor.StartDatastoreSegment(ctx, "companies", "insert", statement)
	defer segment.End()

	uniqueInputs := companies.Unique()
	rows, err := r.db.Query(
		ctx,
		statement,
		uniqueInputs.Names(),
		uniqueInputs.Employees(),
		uniqueInputs.Addresses(),
		uniqueInputs.Descriptions(),
		uniqueInputs.Ciks(),
		uniqueInputs.Isins(),
		uniqueInputs.Cusips(),
		uniqueInputs.SectorIds(),
		uniqueInputs.IndustryIds(),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert companies: %w", err)
	}

	uniqueIds := make([]int, 0, len(uniqueInputs))
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("could not scan company id: %w", err)
		}
		uniqueIds = append(uniqueIds, id)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("could not read company rows: %w", err)
	}

	return companies.IdsFromUniques(uniqueInputs, uniqueIds), nil
}
