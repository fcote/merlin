package pg

import (
	"context"
	"fmt"

	"github.com/fcote/merlin/sheduler/internal/domain"
)

func (r Repository) GetFinancialItemMap(ctx context.Context) (map[string]domain.FinancialItem, error) {
	statement := `
select 
	id,
	slug,
	type,
	statement,
	label,
	unit,
	unit_type,
	is_main,
	index,
	direction,
	latex_description
from financial_items;
	`

	rows, err := r.pool.Query(ctx, statement)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve financial items: %w", err)
	}

	financialMap := make(map[string]domain.FinancialItem)
	for rows.Next() {
		var financialItem domain.FinancialItem
		err := rows.Scan(
			&financialItem.Id,
			&financialItem.Slug,
			&financialItem.Type,
			&financialItem.Statement,
			&financialItem.Label,
			&financialItem.Unit,
			&financialItem.UnitType,
			&financialItem.IsMain,
			&financialItem.Index,
			&financialItem.Direction,
			&financialItem.LatexDescription,
		)
		if err != nil {
			return nil, fmt.Errorf("could not scan financial item: %w", err)
		}
		financialMap[financialItem.Hash()] = financialItem
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("could not read financial item rows: %w", err)
	}

	return financialMap, nil
}
