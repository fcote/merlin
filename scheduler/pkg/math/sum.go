package math

func Sum(values ...float64) float64 {
	total := float64(0)
	for _, value := range values {
		total += value
	}
	return total
}
