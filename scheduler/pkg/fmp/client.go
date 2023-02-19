package fmp

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/fcote/merlin/sheduler/pkg/gmonitor"
)

const fmpEndpoint = "https://financialmodelingprep.com/api"

type FMP struct {
	client         http.Client
	url            url.URL
	apiKey         string
	rateLimitTimer *RateLimitTimer
}

func NewClient(apiKey string) FMP {
	fmpURL, err := url.Parse(fmpEndpoint)
	if err != nil {
		panic(err)
	}

	return FMP{
		client:         http.Client{},
		url:            *fmpURL,
		apiKey:         apiKey,
		rateLimitTimer: NewRateLimitTimer(300),
	}
}

func (fmp FMP) request(ctx context.Context, url *url.URL, result interface{}) error {
	q := url.Query()
	q.Set("apikey", fmp.apiKey)
	url.RawQuery = q.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url.String(), nil)
	if err != nil {
		return fmt.Errorf("request initialization: %w", err)
	}

	segment := gmonitor.StartExternalSegment(ctx, req)
	resp, err := fmp.client.Do(req)
	segment.End()
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}

	defer func() {
		_ = resp.Body.Close()
	}()

	// Wait until we can make another request
	fmp.rateLimitTimer.Wait()

	// Retry on 429 Too many requests
	if resp.StatusCode == 429 {
		time.Sleep(2 * time.Second)
		return fmp.request(ctx, url, &result)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("request read body: %w", err)
	}

	if resp.StatusCode != 200 {
		return fmt.Errorf("request (%s) failed got status code: %d (%s)", url.String(), resp.StatusCode, string(body))
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return fmt.Errorf("request unmarshal: %w", err)
	}

	return nil
}
