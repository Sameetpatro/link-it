-- migrations/005_create_powerbi_views.sql
-- Step 5: Power BI Reporting Views (Star Schema)

-- 1. Dim_Users (User Dimension)
CREATE OR REPLACE VIEW view_dim_users AS
SELECT 
    id AS user_id,
    username,
    role,
    created_at AS user_created_at
FROM users;

-- 2. Dim_Links (Link Dimension)
CREATE OR REPLACE VIEW view_dim_links AS
SELECT 
    u.id AS link_id,
    u.short_code,
    u.original_url,
    u.user_id,
    u.created_at AS link_created_at
FROM urls u;

-- 3. Fact_ClickEvents (Granular Telemetry Fact)
CREATE OR REPLACE VIEW view_fact_click_events AS
SELECT 
    ce.id AS event_id,
    ce.short_code,
    ce.clicked_at,
    ce.response_time_ms,
    ce.http_status,
    ce.is_bot,
    COALESCE(ce.device_type, 'Desktop') AS device_type,
    COALESCE(ce.browser, 'Unknown') AS browser,
    COALESCE(ce.os, 'Unknown') AS os,
    COALESCE(ce.country, 'Unknown') AS country,
    COALESCE(ce.city, 'Unknown') AS city,
    COALESCE(ce.referer, 'Direct') AS referer,
    ce.visitor_hash
FROM click_events ce;

-- 4. Fact_TrafficAggregates (5-Minute Rollup Fact from Step 4)
CREATE OR REPLACE VIEW view_fact_traffic_aggs AS
SELECT 
    ta.id AS agg_id,
    ta.short_code,
    ta.user_id,
    ta.bucket_start,
    ta.bucket_end,
    ta.request_count,
    ta.unique_visitors,
    ta.avg_latency_ms,
    ta.p50_latency_ms,
    ta.p95_latency_ms,
    ta.p99_latency_ms,
    ta.error_count,
    ta.bot_count,
    CASE 
        WHEN ta.request_count > 0 THEN ROUND((ta.error_count::numeric / ta.request_count::numeric) * 100, 2)
        ELSE 0 
    END AS error_rate_pct
FROM traffic_aggregates ta;
