package repository

import (
	"context"
	"database/sql"
	"fmt"
	"linkit-v2/internal/model"
	"strings"
)

type AnalyticsRepository struct {
	db *sql.DB
}

// URLAnalyticsData holds all metrics for a single short URL
type URLAnalyticsData struct {
	ShortCode      string            `json:"short_code"`
	TotalClicks    int               `json:"total_clicks"`
	UniqueVisitors int               `json:"unique_visitors"`
	AvgLatencyMs   float64           `json:"avg_latency_ms"`
	BotClicks      int               `json:"bot_clicks"`
	Countries      map[string]int    `json:"countries"`
	Devices        map[string]int    `json:"devices"`
	Browsers       map[string]int    `json:"browsers"`
	Referrers      map[string]int    `json:"referrers"`
	TimeSeries     []TimeSeriesPoint `json:"time_series"`
}

type TimeSeriesPoint struct {
	Timestamp string `json:"timestamp"`
	Clicks    int    `json:"clicks"`
}

// GetURLDetailedAnalytics fetches all stats for a specific short code
func (a *AnalyticsRepository) GetURLDetailedAnalytics(ctx context.Context, shortCode string, days int) (*URLAnalyticsData, error) {
	if days <= 0 {
		days = 30
	}

	data := &URLAnalyticsData{
		ShortCode: shortCode,
		Countries: make(map[string]int),
		Devices:   make(map[string]int),
		Browsers:  make(map[string]int),
		Referrers: make(map[string]int),
	}

	// 1. Overall Summary Stats
	summaryQuery := `
		SELECT 
			COUNT(id) AS total_clicks,
			COUNT(DISTINCT COALESCE(visitor_hash, ip_address, 'anon')) AS unique_visitors,
			COALESCE(AVG(response_time_ms), 0) AS avg_latency,
			COUNT(id) FILTER (WHERE is_bot = TRUE) AS bot_clicks
		FROM click_events
		WHERE short_code = $1 AND clicked_at >= NOW() - ($2 || ' days')::INTERVAL;
	`
	err := a.db.QueryRowContext(ctx, summaryQuery, shortCode, days).Scan(
		&data.TotalClicks, &data.UniqueVisitors, &data.AvgLatencyMs, &data.BotClicks,
	)
	if err != nil {
		return nil, err
	}

	// 2. Breakdown by Country
	countryRows, err := a.db.QueryContext(ctx, `
		SELECT COALESCE(country, 'Unknown'), COUNT(id) 
		FROM click_events 
		WHERE short_code = $1 AND clicked_at >= NOW() - ($2 || ' days')::INTERVAL
		GROUP BY country ORDER BY COUNT(id) DESC LIMIT 5;
	`, shortCode, days)
	if err == nil {
		defer countryRows.Close()
		for countryRows.Next() {
			var k string
			var v int
			if err := countryRows.Scan(&k, &v); err == nil {
				data.Countries[k] = v
			}
		}
	}

	// 3. Breakdown by Device
	deviceRows, err := a.db.QueryContext(ctx, `
		SELECT COALESCE(device_type, 'Desktop'), COUNT(id) 
		FROM click_events 
		WHERE short_code = $1 AND clicked_at >= NOW() - ($2 || ' days')::INTERVAL
		GROUP BY device_type;
	`, shortCode, days)
	if err == nil {
		defer deviceRows.Close()
		for deviceRows.Next() {
			var k string
			var v int
			if err := deviceRows.Scan(&k, &v); err == nil {
				data.Devices[k] = v
			}
		}
	}

	// 4. Breakdown by Referrer
	refRows, err := a.db.QueryContext(ctx, `
		SELECT COALESCE(referer, 'Direct'), COUNT(id) 
		FROM click_events 
		WHERE short_code = $1 AND clicked_at >= NOW() - ($2 || ' days')::INTERVAL
		GROUP BY referer ORDER BY COUNT(id) DESC LIMIT 5;
	`, shortCode, days)
	if err == nil {
		defer refRows.Close()
		for refRows.Next() {
			var k string
			var v int
			if err := refRows.Scan(&k, &v); err == nil {
				data.Referrers[k] = v
			}
		}
	}

	// 5. Hourly Time-Series for Chart
	tsRows, err := a.db.QueryContext(ctx, `
		SELECT 
			TO_CHAR(DATE_TRUNC('hour', clicked_at), 'YYYY-MM-DD HH24:00') AS hour_bucket,
			COUNT(id) AS clicks
		FROM click_events
		WHERE short_code = $1 AND clicked_at >= NOW() - ($2 || ' days')::INTERVAL
		GROUP BY hour_bucket ORDER BY hour_bucket ASC;
	`, shortCode, days)
	if err == nil {
		defer tsRows.Close()
		for tsRows.Next() {
			var p TimeSeriesPoint
			if err := tsRows.Scan(&p.Timestamp, &p.Clicks); err == nil {
				data.TimeSeries = append(data.TimeSeries, p)
			}
		}
	}

	return data, nil
}


func NewAnalyticsRepository(sql *sql.DB) *AnalyticsRepository {
	return &AnalyticsRepository{db: sql}
}

func (a *AnalyticsRepository) BatchInsert(ctx context.Context, events []model.ClickEvent) error {
	if len(events) == 0 {
		return nil
	}
	valueString := make([]string, 0, len(events))
	valueArgs := make([]any, 0, len(events)*14)

	for i, e := range events {
		idx := i * 14
		valueString = append(valueString, fmt.Sprintf(
			"($%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d)",
			idx+1, idx+2, idx+3, idx+4, idx+5, idx+6, idx+7, idx+8, idx+9, idx+10, idx+11, idx+12, idx+13, idx+14,
		))
		valueArgs = append(valueArgs,
			e.ShortCode,
			e.ClickedAt,
			e.ResponseTimeMs,
			e.HTTPStatus,
			e.UserAgent,
			e.Referer,
			e.IPAddress,
			e.VisitorHash,
			e.Country,
			e.City,
			e.DeviceType,
			e.Browser,
			e.OS,
			e.IsBot,
		)
	}
	query := fmt.Sprintf(`INSERT INTO click_events (
			short_code, clicked_at, response_time_ms, http_status,
			user_agent, referer, ip_address, visitor_hash,
			country, city, device_type, browser, os, is_bot
		) VALUES %s`, strings.Join(valueString, ","))

	_, err := a.db.ExecContext(ctx, query, valueArgs...)
	return err
}

func (a *AnalyticsRepository) AggregateTrafficBuckets(ctx context.Context, intervalMinutes int) (int64, error) {
	if intervalMinutes <= 0 {
		intervalMinutes = 5
	}

	query := fmt.Sprintf(`
		INSERT INTO traffic_aggregates (
			short_code,
			user_id,
			bucket_start,
			bucket_end,
			request_count,
			unique_visitors,
			avg_latency_ms,
			p50_latency_ms,
			p95_latency_ms,
			p99_latency_ms,
			error_count,
			bot_count,
			created_at
		)
		SELECT 
			ce.short_code,
			u.user_id,
			-- 1. Round timestamp down to 5-minute mark (e.g. 14:03 -> 14:00)
			to_timestamp(floor(extract(epoch from ce.clicked_at) / (%d * 60)) * (%d * 60)) AS b_start,
			to_timestamp(floor(extract(epoch from ce.clicked_at) / (%d * 60)) * (%d * 60)) + interval '%d minutes' AS b_end,
			
			-- 2. Compute aggregated metrics
			COUNT(ce.id) AS request_count,
			COUNT(DISTINCT COALESCE(ce.visitor_hash, ce.ip_address, 'anon')) AS unique_visitors,
			COALESCE(AVG(ce.response_time_ms), 0.0) AS avg_latency_ms,
			COALESCE(percentile_cont(0.50) WITHIN GROUP (ORDER BY ce.response_time_ms), 0.0) AS p50_latency_ms,
			COALESCE(percentile_cont(0.95) WITHIN GROUP (ORDER BY ce.response_time_ms), 0.0) AS p95_latency_ms,
			COALESCE(percentile_cont(0.99) WITHIN GROUP (ORDER BY ce.response_time_ms), 0.0) AS p99_latency_ms,
			COUNT(ce.id) FILTER (WHERE ce.http_status >= 400) AS error_count,
			COUNT(ce.id) FILTER (WHERE ce.is_bot = TRUE) AS bot_count,
			NOW()
		FROM click_events ce
		LEFT JOIN urls u ON ce.short_code = u.short_code
		WHERE ce.clicked_at >= NOW() - INTERVAL '24 hours'
		GROUP BY ce.short_code, u.user_id, b_start, b_end
		-- 3. If bucket already exists, update it with newest values
		ON CONFLICT (short_code, bucket_start) DO UPDATE SET
			request_count = EXCLUDED.request_count,
			unique_visitors = EXCLUDED.unique_visitors,
			avg_latency_ms = EXCLUDED.avg_latency_ms,
			p50_latency_ms = EXCLUDED.p50_latency_ms,
			p95_latency_ms = EXCLUDED.p95_latency_ms,
			p99_latency_ms = EXCLUDED.p99_latency_ms,
			error_count = EXCLUDED.error_count,
			bot_count = EXCLUDED.bot_count,
			user_id = EXCLUDED.user_id;
	`, intervalMinutes, intervalMinutes, intervalMinutes, intervalMinutes, intervalMinutes)

	res, err := a.db.ExecContext(ctx, query)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

