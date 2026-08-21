package service

import (
	"context"
	"linkit-v2/internal/model"
	"linkit-v2/internal/repository"
	"time"
)

type URLService struct {
	repo *repository.URLRepository
}

func NewUrlService(repo *repository.URLRepository) *URLService {
	return &URLService{repo: repo}
}

func (s *URLService) Shorten(ctx context.Context, originalURL string, userID *int64) (model.URL, error) {
	id, err := s.repo.NextID()
	if err != nil {
		return model.URL{}, err
	}
	shortCode := EncodeBase62(id)
	newURL := model.URL{
		Id:       int(id),
		Shcode:   shortCode,
		Orglink:  originalURL,
		UserId:   userID,
		CreateAt: time.Now(),
	}
	err = s.repo.Create(ctx, &newURL)
	if err != nil {
		return model.URL{}, err
	}
	return newURL, nil
}
func (s *URLService) GetOriginalURL(ctx context.Context, shortCode string) (string, error) {
	url, err := s.repo.GetByShortCode(ctx, shortCode)
	if err != nil {
		return "", err
	}
	return url.Orglink, nil
}
