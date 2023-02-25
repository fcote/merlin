package handler

import (
	"context"
	"errors"

	"github.com/fcote/merlin/sheduler/internal/domain"
)

type fullSyncChunk struct {
	fs      *FullSync
	tickers []string

	err error

	securities   map[string]int
	commonStocks map[string]int
	prices       map[string]domain.HistoricalPrices
}

func syncChunk(ctx context.Context, fs *FullSync, tickers []string) error {
	c := &fullSyncChunk{
		fs:      fs,
		tickers: tickers,
	}
	return c.withSecurities(ctx).
		withHistoricalPrices(ctx).
		withNews(ctx).
		withEarnings(ctx).
		withFinancials(ctx).
		err
}

func (c *fullSyncChunk) withSecurities(ctx context.Context) *fullSyncChunk {
	securities, commonStocks, err := c.fs.security.SyncSecurities(ctx, c.tickers)
	c.err = errors.Join(c.err, err)
	c.securities = securities
	c.commonStocks = commonStocks
	return c
}

func (c *fullSyncChunk) withHistoricalPrices(ctx context.Context) *fullSyncChunk {
	if len(c.securities) == 0 {
		return c
	}
	prices, err := c.fs.historicalPrice.SyncSecurityHistoricalPrices(ctx, c.securities)
	c.err = errors.Join(c.err, err)
	c.prices = prices
	return c
}

func (c *fullSyncChunk) withNews(ctx context.Context) *fullSyncChunk {
	if len(c.commonStocks) == 0 {
		return c
	}
	c.err = errors.Join(c.err, c.fs.news.SyncSecurityNews(ctx, c.commonStocks))
	return c
}

func (c *fullSyncChunk) withEarnings(ctx context.Context) *fullSyncChunk {
	if len(c.commonStocks) == 0 {
		return c
	}
	c.err = errors.Join(c.err, c.fs.earning.SyncSecurityEarnings(ctx, c.commonStocks))
	return c
}

func (c *fullSyncChunk) withFinancials(ctx context.Context) *fullSyncChunk {
	if len(c.commonStocks) == 0 || len(c.prices) == 0 {
		return c
	}
	c.err = errors.Join(c.err, c.fs.financialSecurity.SyncSecurityFinancials(ctx, c.commonStocks, c.prices))
	return c
}
