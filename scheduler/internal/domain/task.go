package domain

type SecurityTask struct {
	Ticker     string
	SecurityId int
}

func (t SecurityTask) GetKey() string {
	return t.Ticker
}

func SecurityTasks(securities map[string]int) []SecurityTask {
	var tasks []SecurityTask
	for ticker, securityId := range securities {
		tasks = append(tasks, SecurityTask{ticker, securityId})
	}
	return tasks
}
