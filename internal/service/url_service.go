package service

import (
	"context"
	"linkit-v2/internal/cache"
	"linkit-v2/internal/model"
	"linkit-v2/internal/repository"
	"log"
	"sync/atomic"
	"time"
)

type CacheStats struct {
	Hits     int64   `json:"hits"`
	Misses   int64   `json:"misses"`
	HitRate  float64 `json:"hit_rate"`
	HasRedis bool    `json:"has_redis"`
}

type URLService struct {
	repo          *repository.URLRepository
	analyticsRepo *repository.AnalyticsRepository // Added: to fetch analytics for the dashboard
	cache         *cache.RedisCache
	cacheHit      atomic.Int64
	cacheMiss     atomic.Int64
}

// Updated Constructor to accept analyticsRepo
func NewUrlService(repo *repository.URLRepository, analyticsRepo *repository.AnalyticsRepository, cache *cache.RedisCache) *URLService {
	return &URLService{
		repo:          repo,
		analyticsRepo: analyticsRepo,
		cache:         cache,
	}
}

func (s *URLService) CacheStats() CacheStats {
	hits := s.cacheHit.Load()
	misses := s.cacheMiss.Load()
	total := hits + misses
	var hitRate float64
	if total > 0 {
		hitRate = float64(hits) / float64(total) * 100
	}
	return CacheStats{
		Hits:     hits,
		Misses:   misses,
		HitRate:  hitRate,
		HasRedis: s.cache != nil,
	}
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
		CreateAt: time.Now().UTC(),
	}
	err = s.repo.Create(ctx, &newURL)
	if err != nil {
		return model.URL{}, err
	}
	return newURL, nil
}

func (s *URLService) GetOriginalURL(ctx context.Context, shortCode string) (string, error) {
	cacheKey := "url:" + shortCode

	if s.cache != nil {
		cachedURL, err := s.cache.Get(ctx, cacheKey)
		if err == nil {
			s.cacheHit.Add(1)
			return cachedURL, nil
		}
		s.cacheMiss.Add(1)
	}

	url, err := s.repo.GetByShortCode(ctx, shortCode)
	if err != nil {
		return "", err
	}

	if s.cache != nil {
		bgCtx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		if err := s.cache.Set(bgCtx, cacheKey, url.Orglink, 24*time.Hour); err != nil {
			log.Printf("Failed to populate cache for %s: %v", shortCode, err)
		}
	}
	return url.Orglink, nil
}

// Added: Fetches detailed analytics from the repository
func (s *URLService) GetAnalytics(ctx context.Context, shortCode string, days int) (*repository.URLAnalyticsData, error) {
	return s.analyticsRepo.GetURLDetailedAnalytics(ctx, shortCode, days)
}

func (s *URLService) ListLinks(ctx context.Context, limit int, userID *int64) ([]model.UrlClickCount, error) {
	return s.repo.ListRecent(ctx, limit, userID)
}
