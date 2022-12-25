package worker

import (
	"context"
	"sync"

	"github.com/fcote/merlin/sheduler/internal/domain"
)

type Task interface {
	GetKey() string
}

type taskHandler[T Task, R any] func(ctx context.Context, task T) (R, *domain.SyncError)

type jobResult[R any] struct {
	err *domain.SyncError
	key string
	res R
}

type Pool[T Task, R any] struct {
	concurrency int

	tasksChan   chan T
	resultsChan chan jobResult[R]
	wg          *sync.WaitGroup

	taskHandler taskHandler[T, R]
	results     map[string]R
	errors      domain.SyncErrors
}

func NewPool[T Task, R any](concurrency int, taskHandler taskHandler[T, R]) *Pool[T, R] {
	return &Pool[T, R]{
		concurrency: concurrency,

		tasksChan:   make(chan T),
		resultsChan: make(chan jobResult[R]),
		wg:          &sync.WaitGroup{},

		taskHandler: taskHandler,
		results:     make(map[string]R),
	}
}

func (p *Pool[T, R]) Run(ctx context.Context, tasks []T) (map[string]R, domain.SyncErrors) {
	for i := 0; i < p.concurrency; i++ {
		go p.worker(ctx)
	}

	go p.collect()

	p.feed(tasks)

	p.wg.Wait()

	close(p.tasksChan)
	close(p.resultsChan)

	return p.results, p.errors
}

func (p *Pool[T, R]) feed(tasks []T) {
	for _, t := range tasks {
		p.wg.Add(1)
		p.tasksChan <- t
	}
}

func (p *Pool[T, R]) collect() {
	for r := range p.resultsChan {
		if r.err != nil {
			p.errors = append(p.errors, *r.err)
		} else {
			p.results[r.key] = r.res
		}
		p.wg.Done()
	}
}

func (p *Pool[T, R]) worker(ctx context.Context) {
	for task := range p.tasksChan {
		res, err := p.taskHandler(ctx, task)
		if err != nil {
			p.resultsChan <- jobResult[R]{key: task.GetKey(), err: err}
		} else {
			p.resultsChan <- jobResult[R]{key: task.GetKey(), res: res}
		}
	}
}
