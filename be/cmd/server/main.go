package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "money-tracker-be/docs"
	"money-tracker-be/internal/bootstrap"
	"money-tracker-be/internal/config"
	"money-tracker-be/internal/router"
)

// @title Money Tracker API
// @version 1.0
// @description Backend API for Money Tracker - a mobile-first PWA for family financial management.
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@money-tracker.local

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @BasePath /api
// @securityDefinitions.cookie session
// @in cookie
// @name session_id
func main() {
	cfg := config.Load()

	container, err := bootstrap.NewContainer(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize container: %v", err)
	}
	defer container.Close()

	r := router.New(container)

	srv := &http.Server{
		Addr:    ":" + cfg.ServerPort,
		Handler: r,
	}

	go func() {
		log.Printf("Server starting on port %s", cfg.ServerPort)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	fmt.Println("Server exited")
}