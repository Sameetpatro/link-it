package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"linkit-v2/internal/middleware"
	"linkit-v2/internal/model"
	"linkit-v2/internal/repository"
	"linkit-v2/internal/service"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

var (
	idCounter int64 = 1000000
	urlStore        = make(map[string]string)
	storeLock sync.RWMutex
)

type AppHandler struct {
	URLService *service.URLService
	EventsChan chan<- model.ClickEvent
}

// HandleAnalyticsAPI returns combined DB metrics + ML forecast in JSON
func (h *AppHandler) HandleAnalyticsAPI(w http.ResponseWriter, r *http.Request) {
	shortCode := strings.TrimPrefix(r.URL.Path, "/api/analytics/")
	if shortCode == "" {
		http.Error(w, "Short code required", http.StatusBadRequest)
		return
	}

	days := 30
	if d := r.URL.Query().Get("days"); d != "" {
		if val, err := strconv.Atoi(d); err == nil {
			days = val
		}
	}

	var (
		stats    *repository.URLAnalyticsData
		statsErr error
		mlData   any
		wg       sync.WaitGroup
	)

	// 1. Fetch DB Stats in parallel
	wg.Add(2)
	go func() {
		defer wg.Done()
		stats, statsErr = h.URLService.GetAnalytics(r.Context(), shortCode, days)
	}()

	// 2. Fetch ML Forecast concurrently with a fast 2.5s timeout
	go func() {
		defer wg.Done()
		mlURL := os.Getenv("ML_SERVICE_URL")
		if mlURL == "" {
			mlURL = "http://localhost:8000"
		}
		client := http.Client{Timeout: 2500 * time.Millisecond}
		resp, err := client.Get(fmt.Sprintf("%s/predict/%s?days=%d", mlURL, shortCode, days))
		if err == nil && resp.StatusCode == http.StatusOK {
			_ = json.NewDecoder(resp.Body).Decode(&mlData)
			resp.Body.Close()
		}
	}()

	wg.Wait()

	if statsErr != nil {
		http.Error(w, "Failed to fetch analytics", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"stats": stats,
		"ml":    mlData,
	})
}

// HandleListLinks returns the list of short links with click counts
func (h *AppHandler) HandleListLinks(w http.ResponseWriter, r *http.Request) {
	limit := 30
	if l := r.URL.Query().Get("limit"); l != "" {
		if val, err := strconv.Atoi(l); err == nil && val > 0 {
			limit = val
		}
	}

	userID := middleware.GetUserID(r.Context())
	links, err := h.URLService.ListLinks(r.Context(), limit, userID)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch links"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"links":       links,
		"cache_stats": h.URLService.CacheStats(),
	})
}

// HandleAnalyticsPage serves the HTML dashboard
func (h *AppHandler) HandleAnalyticsPage(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/analytics.html")
}

// HandleIndexPage serves the main MUI-inspired dashboard
func (h *AppHandler) HandleIndexPage(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/index.html")
}

func NewAppHandler(urlService *service.URLService, eventChan chan<- model.ClickEvent) *AppHandler {
	return &AppHandler{
		URLService: urlService,
		EventsChan: eventChan,
	}
}

func (h *AppHandler) HandleShorten(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not allowed Baccha", http.StatusMethodNotAllowed)
		return
	}
	defer r.Body.Close()
	//now read and decode incoming json req
	var req ShortenRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid Request", http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(req.URL) == "" {
		http.Error(w, "URL empty kaise hoga babu", http.StatusBadRequest)
		return
	}
	userID := middleware.GetUserID(r.Context())
	url, err := h.URLService.Shorten(r.Context(), req.URL, userID)
	if err != nil {
		log.Printf("ERROR: Shorten failed: %v", err)
		http.Error(w, "Failed to shorten URL", http.StatusInternalServerError)
		return
	}

	resp := ShortenResponse{
		ShortCode:   url.Shcode,
		ShortUrl:    fmt.Sprintf("http://localhost:8080/%s", url.Shcode),
		OriginalURL: url.Orglink,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

func (h *AppHandler) HandleRedirect(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	shortCode := strings.TrimPrefix(r.URL.Path, "/")
	if shortCode == "" {
		http.ServeFile(w, r, "static/index.html")
		return
	}
	if shortCode == "shorten" {
		http.NotFound(w, r)
		return
	}

	originalURL, err := h.URLService.GetOriginalURL(r.Context(), shortCode)
	if err != nil {
		http.Error(w, "URL not found", http.StatusNotFound)
		return
	}
	responseTime := time.Since(start)
	http.Redirect(w, r, originalURL, http.StatusFound)

	//here clickevent for ananlysis start hoga
	if h.EventsChan != nil {
		ua := r.UserAgent()
		ip := ExtractIP(r)
		browser, os, device := ParseUserAgent(ua)
		isBot := DetectBot(ua)
		visitorHash := GenerateVisitorHash(ip, ua)
		event := model.ClickEvent{
			ShortCode:      shortCode,
			ClickedAt:      time.Now().UTC(),
			ResponseTimeMs: int(responseTime.Milliseconds()),
			HTTPStatus:     http.StatusFound,
			UserAgent:      ua,
			Referer:        r.Referer(),
			IPAddress:      AnonymizeIP(ip),
			VisitorHash:    visitorHash,
			Country:        "Unknown", // (Can be enriched with GeoIP/Cloudflare headers)
			City:           "Unknown",
			DeviceType:     device,
			Browser:        browser,
			OS:             os,
			IsBot:          isBot,
		}
		// 4. Non-blocking channel push: If buffer (10,000) is full, don't hang the HTTP request
		select {
		case h.EventsChan <- event:
			//events are queued
		default:
			//channel full
			log.Printf("[Channel Full] Dropped click event for code: %s", shortCode)
		}
	}

}

// HandleForecast proxies the request to the Python ML Service
func (h *AppHandler) HandleForecast(w http.ResponseWriter, r *http.Request) {
	shortCode := r.URL.Path[len("/api/forecast/"):]
	if shortCode == "" {
		http.Error(w, "Short code required", http.StatusBadRequest)
		return
	}

	mlServiceURL := os.Getenv("ML_SERVICE_URL")
	if mlServiceURL == "" {
		mlServiceURL = "http://localhost:8000" // Default local Python server
	}

	// 1. Call Python ML microservice
	resp, err := http.Get(fmt.Sprintf("%s/predict/%s", mlServiceURL, shortCode))
	if err != nil {
		http.Error(w, "ML Service temporarily unavailable", http.StatusServiceUnavailable)
		return
	}
	defer resp.Body.Close()

	// 2. Stream the JSON response back to the user
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

type ShortenRequest struct {
	URL string `json:"url"`
}

type ShortenResponse struct {
	ShortCode   string `json:"short_code"`
	ShortUrl    string `json:"short_url"`
	OriginalURL string `json:"original_url"`
}
