CREATE TABLE IF NOT EXISTS traffic_aggregates (
    id                BIGSERIAL PRIMARY KEY,
    short_code        VARCHAR(16) NOT NULL,
    user_id           BIGINT REFERENCES users(id) ON DELETE SET NULL,
    bucket_start      TIMESTAMP WITH TIME ZONE NOT NULL,
    bucket_end        TIMESTAMP WITH TIME ZONE NOT NULL,
    request_count     INTEGER NOT NULL DEFAULT 0,
    unique_visitors   INTEGER NOT NULL DEFAULT 0,
    avg_latency_ms    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    p50_latency_ms    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    p95_latency_ms    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    p99_latency_ms    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    error_count       INTEGER NOT NULL DEFAULT 0,
    bot_count         INTEGER NOT NULL DEFAULT 0,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_traffic_aggregates_code_bucket UNIQUE (short_code, bucket_start)
);

CREATE INDEX IF NOT EXISTS idx_traffic_agg_short_code ON traffic_aggregates(short_code);
CREATE INDEX IF NOT EXISTS idx_traffic_agg_bucket_start ON traffic_aggregates(bucket_start);
