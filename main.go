package main

import (
	"context"
	"database/sql"
	"fmt"
	"linkit-v2/internal/cache"
	"linkit-v2/internal/handler"
	"linkit-v2/internal/model"
	"linkit-v2/internal/repository"
	"linkit-v2/internal/service"
	"linkit-v2/internal/worker"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/linkit?sslmode=disable"
	}
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Failed to open DB: %v", err)
	}
	defer db.Close()

	db.SetMaxOpenConns(25)                 //this limits the max concurrent TCP connections to 25 to avoid bottleneck of DB... instead of creating 1000 of different connection for each queries, all requests should submerge to 25 pools (25 channels)
	db.SetMaxIdleConns(5)                  //this is the min no of connections to keep alive even no requests are alive
	db.SetConnMaxLifetime(5 * time.Minute) //dont let a connection live for 5 min long
	errr := db.Ping()
	if errr != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v", err)
	}
	fmt.Println("Connected to PostgreSQL successfully!")

	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "localhost:6379"
	}
	redisCache, err := cache.NewRedisCache(redisURL)
	if err != nil {
		log.Printf("Running in pure PostgreSQL mode (Redis not found: %v)", err)
		redisCache = nil
	} else {
		log.Println("⚡ Connected to Redis Cache successfully!")
		defer redisCache.Close()
	}
	urlRepo := repository.NewURLRepository(db)
	analyticsRepo := repository.NewAnalyticsRepository(db)
	urlService := service.NewUrlService(urlRepo, analyticsRepo, redisCache)

	eventsChan := make(chan model.ClickEvent, 10000)
	pool := worker.NewWorkerPool(eventsChan, 5, 100, analyticsRepo)
	workerCtx, cancelWorkers := context.WithCancel(context.Background())
	pool.Start(workerCtx)

	aggregator := worker.NewAggregatorWorker(analyticsRepo, 1*time.Minute, 5)
	aggregator.Start(workerCtx)

	app := handler.NewAppHandler(urlService, eventsChan)
	http.HandleFunc("POST /shorten", app.HandleShorten)
	http.HandleFunc("GET /api/forecast/", app.HandleForecast)
	http.HandleFunc("GET /api/analytics/", app.HandleAnalyticsAPI)
	http.HandleFunc("GET /analytics/", app.HandleAnalyticsPage)
	http.HandleFunc("/", app.HandleRedirect)

	server := &http.Server{
		Addr:         ":8080",
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	go func() {
		fmt.Println(" LinkIT Server running on http://localhost:8080")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	//graceful shutdown 
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)
	<-stopChan
	log.Println("Shutting down server gracefully......")

	shutdownCtx, cancelShutdown := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelShutdown()
	server.Shutdown(shutdownCtx)

	cancelWorkers()
	pool.Wait()
	aggregator.Stop()
	log.Println("All workers completed..... Bye babe")
}
