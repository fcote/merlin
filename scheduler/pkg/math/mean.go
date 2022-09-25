package math

func Mean(values ...float64) float64 {
	sum := Sum(values...)
	if len(values) == 0 {
		return 0
	}
	return sum / float64(len(values))
}
