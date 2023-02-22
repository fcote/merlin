package math

import "math"

func IsEmpty(f float64) bool {
	return f == 0 ||
		math.IsNaN(f) ||
		math.IsInf(f, 0) ||
		math.IsInf(f, -1)
}
