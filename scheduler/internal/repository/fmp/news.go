package fmp

import (
	"context"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/fmp"
)

func (r Repository) News(ctx context.Context, ticker string) ([]domain.NewsBase, error) {
	stockNews, err := r.client.StockNews(ctx, ticker)
	if err != nil {
		return nil, err
	}

	pressReleases, err := r.client.PressReleases(ctx, ticker)
	if err != nil {
		return nil, err
	}

	result := make([]domain.NewsBase, len(stockNews)+len(pressReleases))
	for i, news := range stockNews {
		result[i] = NewsBaseFromFMPStockNews(news)
	}
	for i, news := range pressReleases {
		result[len(stockNews)+i] = NewsBaseFromFMPPressRelease(news)
	}

	return result, nil
}

func NewsBaseFromFMPStockNews(fmpNews fmp.StockNews) domain.NewsBase {
	return domain.NewsBase{
		Date:    fmpNews.PublishedDate,
		Type:    domain.NewsTypeStandard,
		Title:   fmpNews.Title,
		Content: fmpNews.Text,
		Website: fmpNews.Site,
		Url:     fmpNews.URL,
	}
}

func NewsBaseFromFMPPressRelease(fmpNews fmp.PressRelease) domain.NewsBase {
	return domain.NewsBase{
		Date:    fmpNews.Date,
		Type:    domain.NewsTypeStandard,
		Title:   fmpNews.Title,
		Content: fmpNews.Text,
	}
}
