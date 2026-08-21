CREATE TABLE IF NOT EXISTS click_events (
    id BIGSERIAL PRIMARY KEY,
    short_code VARCHAR(16) NOT NULL,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    response_time_ms INT DEFAULT 0,
    http_status INT DEFAULT 302,
    user_agent TEXT,
    referer TEXT,
    ip_address VARCHAR(45),
    visitor_hash VARCHAR(64),
    country VARCHAR(64) DEFAULT 'Unknown',
    city VARCHAR(64) DEFAULT 'Unknown',
    device_type VARCHAR(32) DEFAULT 'desktop',
    browser VARCHAR(64) DEFAULT 'Unknown',
    os VARCHAR(64) DEFAULT 'Unknown',
    is_bot BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_clicks_short_code ON click_events(short_code);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON click_events(clicked_at);
CREATE INDEX IF NOT EXISTS idx_clicks_code_time ON click_events(short_code, clicked_at DESC);
