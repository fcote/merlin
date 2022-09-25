package slices

func Filter[V any](collection []V, predicate func(V) bool) []V {
	var result []V

	for _, item := range collection {
		if predicate(item) {
			result = append(result, item)
		}
	}

	return result
}
