package handler

import (
	"encoding/json"
	"fmt"
	"linkit-v2/internal/model"
	"linkit-v2/internal/service"
	"log"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
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

	id := atomic.AddInt64(&idCounter, 1)
	shortCode := service.EncodeBase62(id)

	storeLock.Lock()
	urlStore[shortCode] = req.URL
	storeLock.Unlock()

	resp := ShortenResponse{
		ShortCode:   shortCode,
		ShortUrl:    fmt.Sprintf("http://localhost:8080/%s", shortCode),
		OriginalURL: req.URL,
	}
	w.Header().Set("Content-type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

func (h *AppHandler) HandleRedirect(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	shortCode := strings.TrimPrefix(r.URL.Path, "/")
	if shortCode == "" || shortCode == "shorten" {
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

type ShortenRequest struct {
	URL string `json:"url"`
}

type ShortenResponse struct {
	ShortCode   string `json:"short_code"`
	ShortUrl    string `json:"short_url"`
	OriginalURL string `json:"original_url"`
}
