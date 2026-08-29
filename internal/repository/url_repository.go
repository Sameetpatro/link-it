package repository

import (
	"context"
	"database/sql"
	"errors"
	"linkit-v2/internal/model"
)

var ErrURLNotFound = errors.New("Url not found mah brotherrr")

type URLRepository struct {
	db *sql.DB
}

func NewURLRepository(db *sql.DB) *URLRepository {
	return &URLRepository{db: db}
}
func (r *URLRepository) Create(ctx context.Context, url *model.URL) error {
	query := `INSERT INTO urls(id, short_code, original_url, user_id, created_at)
	VALUES($1, $2, $3, $4, $5)`
	_, err := r.db.ExecContext(ctx, query, url.Id, url.Shcode, url.Orglink, url.UserId, url.CreateAt)
	return err
}

func (r *URLRepository) GetByShortCode(ctx context.Context, shortCode string) (model.URL, error) {
	query := `
		SELECT id, short_code, original_url, created_at 
		FROM urls 
		WHERE short_code = $1
	`
	var url model.URL
	err := r.db.QueryRowContext(ctx, query, shortCode).Scan(
		&url.Id,
		&url.Shcode,
		&url.Orglink,
		&url.CreateAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return model.URL{}, ErrURLNotFound
		}
		return model.URL{}, err
	}
	return url, nil
}

func (r *URLRepository) NextID() (int64, error) {
	var id int64
	err := r.db.QueryRow("SELECT nextval('url_id_seq')").Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func (r *URLRepository) ListRecent(ctx context.Context, limit int, userID *int64) ([]model.UrlClickCount, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	var query string
	var args []any

	if userID != nil {
		query = `
			SELECT u.id, u.short_code, u.original_url, u.user_id, u.created_at,
			       COALESCE(COUNT(ce.id), 0) AS click_count
			FROM urls u
			LEFT JOIN click_events ce ON u.short_code = ce.short_code
			WHERE u.user_id = $1
			GROUP BY u.id, u.short_code, u.original_url, u.user_id, u.created_at
			ORDER BY u.created_at DESC
			LIMIT $2;
		`
		args = append(args, *userID, limit)
	} else {
		query = `
			SELECT u.id, u.short_code, u.original_url, u.user_id, u.created_at,
			       COALESCE(COUNT(ce.id), 0) AS click_count
			FROM urls u
			LEFT JOIN click_events ce ON u.short_code = ce.short_code
			GROUP BY u.id, u.short_code, u.original_url, u.user_id, u.created_at
			ORDER BY click_count DESC, u.created_at DESC
			LIMIT $1;
		`
		args = append(args, limit)
	}

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []model.UrlClickCount
	for rows.Next() {
		var item model.UrlClickCount
		var uid sql.NullInt64
		if err := rows.Scan(&item.Id, &item.Shcode, &item.OriginalURL, &uid, &item.CreatedAt, &item.ClickCount); err != nil {
			return nil, err
		}
		if uid.Valid {
			uVal := int(uid.Int64)
			item.UserId = &uVal
		}
		results = append(results, item)
	}
	return results, nil
}