package main

import (
	"encoding/json"
	"fmt"
	"linkit-v2/internal/service"
	"log"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
)

type ShortenRequest struct {
	URL string `json:"url"`
}

type ShortenResponse struct {
	ShortCode   string `json:"short_code"`
	ShortUrl    string `json:"short_url"`
	OriginalURL string `json:"original_url"`
}

var (
	idCounter int64 = 1000000
	urlStore        = make(map[string]string)
	storeLock sync.RWMutex
)

func main() {
	// fmt.Println("hello")
	http.HandleFunc("POST /shorten", handleShorten)
	http.HandleFunc("/", handleRedirect)
	err := http.ListenAndServe(":8080", nil)
	fmt.Println("LinkIT Server running on http://localhost:8080")
	if err != nil {
		log.Fatal("error starting server: ", err)
	}
}

func handleShorten(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not allowed Baccha", http.StatusMethodNotAllowed)
		return
	}

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

func handleRedirect(w http.ResponseWriter, r *http.Request) {
	shortCode := strings.TrimPrefix(r.URL.Path, "/")
	if shortCode == "" || shortCode == "shorten" {
		return
	}
	storeLock.RLock()
	originalURL, exists := urlStore[shortCode]
	storeLock.RUnlock()
	if !exists {
		http.Error(w, "URL nahi mila bhai", http.StatusNotFound)
		return
	}
	http.Redirect(w, r, originalURL, http.StatusFound)
}
