package math

func Divide(values ...float64) float64 {
	result := float64(0)
	for _, value := range values {
		if result == float64(0) {
			result = value
			continue
		}
		result /= value
	}
	return result
}
