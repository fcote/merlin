package fmp

import "context"

type StockNews struct {
	Symbol        string `json:"symbol"`
	PublishedDate string `json:"publishedDate"`
	Title         string `json:"title"`
	Image         string `json:"image"`
	Site          string `json:"site"`
	Text          string `json:"text"`
	URL           string `json:"url"`
}

func (fmp FMP) StockNews(ctx context.Context, ticker string) ([]StockNews, error) {
	url := fmp.url.JoinPath("/v3/stock_news")
	q := url.Query()
	q.Add("tickers", ticker)
	url.RawQuery = q.Encode()

	var news []StockNews
	if err := fmp.request(ctx, url, &news); err != nil {
		return nil, err
	}
	return news, nil
}

type PressRelease struct {
	Symbol string `json:"symbol"`
	Date   string `json:"date"`
	Title  string `json:"title"`
	Text   string `json:"text"`
}

func (fmp FMP) PressReleases(ctx context.Context, ticker string) ([]PressRelease, error) {
	url := fmp.url.JoinPath("/v3/press-releases", ticker)

	var news []PressRelease
	if err := fmp.request(ctx, url, &news); err != nil {
		return nil, err
	}
	return news, nil
}
