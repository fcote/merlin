package domain

type SyncResult[T any] struct {
	ticker string
	result T
}

func NewSyncResult[T any](ticker string, result T) *SyncResult[T] {
	return &SyncResult[T]{ticker, result}
}

func MapSyncResults[T any](results []*SyncResult[T]) map[string]T {
	m := make(map[string]T)
	for _, sync := range results {
		m[sync.ticker] = sync.result
	}
	return m
}
