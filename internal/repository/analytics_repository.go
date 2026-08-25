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

func NewAnalyticsRepository(sql *sql.DB) *AnalyticsRepository {
	return &AnalyticsRepository{db: sql}
}

func (a *AnalyticsRepository) BatchInsert(ctx context.Context, events []model.ClickEvent) error {
	if len(events) == 0 {
		return nil
	}
	valueString := make([]string, 0, len(events))
	valueArgs := make([]any, 0, len(events)*13)

	for i, e := range events {
		idx := i * 13
		valueString = append(valueString, fmt.Sprintf(
			"($%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d)",
			idx+1, idx+2, idx+3, idx+4, idx+5, idx+6, idx+7, idx+8, idx+9, idx+10, idx+11, idx+12, idx+13,
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
		)
	}
	query := fmt.Sprintf(`INSERT INTO click_events (
			short_code, clicked_at, response_time_ms, http_status,
			user_agent, referer, ip_address, visitor_hash,
			country, city, device_type, browser, os
		) VALUES %s`, strings.Join(valueString, ","))

	_, err := a.db.ExecContext(ctx, query, valueArgs...)
	return err
}
