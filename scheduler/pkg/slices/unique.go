package slices

type Hasher interface {
	Hash() string
}

func Unique[T Hasher](slice []T) []T {
	result := make([]T, 0, len(slice))
	seen := make(map[string]struct{}, len(slice))

	for _, item := range slice {
		hash := item.Hash()

		if _, ok := seen[hash]; ok {
			continue
		}

		seen[hash] = struct{}{}
		result = append(result, item)
	}

	return result
}
