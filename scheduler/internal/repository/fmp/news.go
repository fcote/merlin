package fmp

import (
	"context"

	"github.com/fcote/merlin/sheduler/internal/domain"
	"github.com/fcote/merlin/sheduler/pkg/fmp"
)

func (r Repository) SecurityNews(ctx context.Context, ticker string) ([]domain.NewsBase, error) {
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

func (r Repository) News(ctx context.Context) ([]domain.NewsBase, error) {
	news, err := r.client.News(ctx)
	if err != nil {
		return nil, err
	}

	var result []domain.NewsBase
	for _, news := range news {
		result = append(result, NewsBaseFromFMPStockNews(news))
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
		Ticker:  fmpNews.Symbol,
	}
}

func NewsBaseFromFMPPressRelease(fmpNews fmp.PressRelease) domain.NewsBase {
	return domain.NewsBase{
		Date:    fmpNews.Date,
		Type:    domain.NewsTypePressRelease,
		Title:   fmpNews.Title,
		Content: fmpNews.Text,
	}
}
