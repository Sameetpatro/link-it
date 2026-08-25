package worker

import (
	"context"
	"linkit-v2/internal/model"
	"linkit-v2/internal/repository"
	"log"
	"sync"
	"sync/atomic"
	"time"
)

type WorkerPool struct {
	eventsChan    <-chan model.ClickEvent
	numWorkers    int
	batchSize     int
	flushInterval time.Duration
	repo          *repository.AnalyticsRepository
	wg            sync.WaitGroup

	processedEvents atomic.Int64
	flushedBatches  atomic.Int64
}


func NewWorkerPool (eventChan <- chan model.ClickEvent, numPool int, batchSize int,  repo *repository.AnalyticsRepository) *WorkerPool {
	return &WorkerPool{
		eventsChan: eventChan,
		numWorkers: numPool,
		batchSize: batchSize,
		flushInterval: 1* time.Second,
		repo: repo,
	}
}

func (wp *WorkerPool) Start(ctx context.Context){
	for i := 1; i <= wp.numWorkers; i++{
		wp.wg.Add(1);
		go wp.worker(ctx, i)
	}
	log.Println("Workers have been deployed")
}

func (p *WorkerPool) worker(ctx context.Context, workerID int) {
	defer p.wg.Done()
	batch := make([]model.ClickEvent, 0, p.batchSize)
	ticker := time.NewTicker(p.flushInterval)
	defer ticker.Stop()
	flush := func() {
		if len(batch) == 0 {
			return
		}
		flushCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		err := p.repo.BatchInsert(flushCtx, batch)
		cancel()
		if err != nil {
			log.Printf("[Worker %d] Failed to flush %d events: %v", workerID, len(batch), err)
		} else {
			p.processedEvents.Add(int64(len(batch)))
			p.flushedBatches.Add(1)
		}
		batch = batch[:0]
	}
	for {
		select {
		case <-ctx.Done():
			flush()
			return
		case <-ticker.C:
			flush()
		case event, ok := <-p.eventsChan:
			if !ok {
				flush()
				return
			}
			batch = append(batch, event)
			if len(batch) >= p.batchSize {
				flush()
			}
		}
	}
}


func (wp *WorkerPool) Wait(){
	wp.wg.Wait()
}
