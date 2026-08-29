package worker

import (
	"context"
	"log"
	"sync"
	"time"

	"linkit-v2/internal/repository"
)

type AggregatorWorker struct {
	repo          *repository.AnalyticsRepository
	interval      time.Duration
	bucketMinutes int
	wg            sync.WaitGroup
}

func NewAggregatorWorker(repo *repository.AnalyticsRepository, interval time.Duration, bucketMinutes int) *AggregatorWorker {
	if interval <= 0 {
		interval = 1 * time.Minute
	}
	if bucketMinutes <= 0 {
		bucketMinutes = 5
	}
	return &AggregatorWorker{
		repo:          repo,
		interval:      interval,
		bucketMinutes: bucketMinutes,
	}
}

// Start runs the aggregator in a background goroutine 
func (w *AggregatorWorker) Start(ctx context.Context) {
	w.wg.Add(1)
	go func() {
		defer w.wg.Done()
		log.Println("Aggregator Worker started (computing 5-min buckets)")
		w.run(ctx)

		ticker := time.NewTicker(w.interval)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				w.run(ctx)
			case <-ctx.Done():
				log.Println("Aggregator Worker stopping...")
				return
			}
		}
	}()
}

// Stop waits for ongoing aggregation queries to finish
func (w *AggregatorWorker) Stop() {
	w.wg.Wait()
}

func (w *AggregatorWorker) run(ctx context.Context) {
	timeoutCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	rows, err := w.repo.AggregateTrafficBuckets(timeoutCtx, w.bucketMinutes)
	if err != nil {
		log.Printf("[AGGREGATOR] Error: %v", err)
		return
	}
	if rows > 0 {
		log.Printf("[AGGREGATOR] Updated %d traffic buckets", rows)
	}
}
