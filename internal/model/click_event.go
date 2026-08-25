package model

import "time"

type ClickEvent struct {
	ID             int64     `json:"id,omitempty"`
	ShortCode      string    `json:"short_code"`
	ClickedAt      time.Time `json:"clicked_at"`
	ResponseTimeMs int       `json:"response_time_ms"`
	HTTPStatus     int       `json:"http_status"`
	UserAgent      string    `json:"user_agent"`
	Referer        string    `json:"referer"`
	IPAddress      string    `json:"ip_address"`
	VisitorHash    string    `json:"visitor_hash"`
	Country        string    `json:"country"`
	City           string    `json:"city"`
	DeviceType     string    `json:"device_type"`
	Browser        string    `json:"browser"`
	OS             string    `json:"os"`
	IsBot          bool      `json:"is_bot"`
}
