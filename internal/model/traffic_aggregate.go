package model

import "time"

type TrafficAggregate struct {
	ID             int64     `json:"id"`
	ShortCode      string    `json:"short_code"`
	UserID         *int64    `json:"user_id,omitempty"`
	BucketStart    time.Time `json:"bucket_start"`
	BucketEnd      time.Time `json:"bucket_end"`
	RequestCount   int       `json:"request_count"`
	UniqueVisitors int       `json:"unique_visitors"`
	AvgLatencyMs   float64   `json:"avg_latency_ms"`
	P50LatencyMs   float64   `json:"p50_latency_ms"`
	P95LatencyMs   float64   `json:"p95_latency_ms"`
	P99LatencyMs   float64   `json:"p99_latency_ms"`
	ErrorCount     int       `json:"error_count"`
	BotCount       int       `json:"bot_count"`
	CreatedAt      time.Time `json:"created_at"`
}
