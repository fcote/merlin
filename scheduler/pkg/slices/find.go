package slices

type Equalizer[T any] interface {
	Equal(T) bool
}

func FindIndex[T Equalizer[T]](s []T, needle T) int {
	for i, input := range s {
		if input.Equal(needle) {
			return i
		}
	}
	return -1
}

func Find[T comparable](s []T, needle T) *T {
	for _, input := range s {
		if input == needle {
			return &input
		}
	}
	return nil
}

func Get[T any](s []T, index int) *T {
	if index >= len(s) {
		return nil
	}
	return &s[index]
}
