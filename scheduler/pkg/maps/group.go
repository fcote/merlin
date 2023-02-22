package maps

func GroupBy[T any, C comparable](s []T, fn func(a T) C) map[C]T {
	ret := make(map[C]T)
	for _, input := range s {
		key := fn(input)
		ret[key] = input
	}
	return ret
}
