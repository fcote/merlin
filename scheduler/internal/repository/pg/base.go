package pg

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"

	"github.com/fcote/merlin/sheduler/internal/usecase"
)

type Repository struct {
	pool *pgxpool.Pool
	db   *pgx.Conn
}

func NewRepository(pool *pgxpool.Pool) Repository {
	return Repository{
		pool: pool,
	}
}

func (r Repository) Atomic(
	ctx context.Context,
	fn func(repo usecase.DataStore) error,
) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}

	repo := Repository{
		db: tx.Conn(),
	}

	err = fn(repo)
	if err != nil {
		if rbErr := tx.Rollback(ctx); rbErr != nil {
			err = fmt.Errorf("failed to rollback transaction: %w", rbErr)
		}
	} else {
		err = tx.Commit(ctx)
	}

	return err
}
