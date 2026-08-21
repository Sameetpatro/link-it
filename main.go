package main

import (
	"database/sql"
	"fmt"
	"linkit-v2/internal/handler"
	"linkit-v2/internal/repository"
	"linkit-v2/internal/service"
	"log"
	"net/http"
	"os"
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
	urlRepo := repository.NewURLRepository(db)
	urlService := service.NewUrlService(urlRepo)
	app := handler.NewAppHandler(urlService)
	http.HandleFunc("POST /shorten", app.HandleShorten)
	http.HandleFunc("/", app.HandleRedirect)
	fmt.Println("LinkIT Server running on http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
