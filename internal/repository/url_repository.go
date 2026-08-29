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