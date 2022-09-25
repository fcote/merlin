package slices

func Map[A, B any](s []A, fn func(a A) B) []B {
	ret := make([]B, len(s))
	for i, input := range s {
		ret[i] = fn(input)
	}
	return ret
}

func MapWithIndex[A, B any](s []A, fn func(i int, a A) B) []B {
	ret := make([]B, len(s))
	for i, input := range s {
		ret[i] = fn(i, input)
	}
	return ret
}

func FlatMap[A, B any](s []A, fn func(a A) []B) []B {
	var ret []B
	for _, input := range s {
		ret = append(ret, fn(input)...)
	}
	return ret
}
