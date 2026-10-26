package main

import (
	"log"
	"os"
	"time"

	"template/config"
	"template/database"
	"template/middleware"
	"template/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/ulule/limiter/v3"
	"github.com/ulule/limiter/v3/drivers/store/memory"
)

func main() {
	// Load environment variables
	_ = config.LoadEnv()

	db, err := database.Connect()
	if err != nil {
		log.Fatal("Failed DB:", err)
	}

	// Run database migrations
	if err := database.Migrate(db); err != nil {
		log.Fatal("Failed database migration:", err)
	}

	rate, err := limiter.NewRateFromFormatted("100-M")
	if err != nil {
		log.Fatal(err)
	}

	store := memory.NewStore()
	limiterInstance := limiter.New(store, rate)

	// Init Gin router
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Idempotency-Key"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.Use(middleware.RateLimiter(limiterInstance))
	r.Use(middleware.IdempotencyMiddleware(db))

	// Setup application routes
	routes.SetupRoutes(r, db)

	// Seed initial data if tables are empty
	database.SeedDatabase(db)

	// Run the server on configured PORT
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // default fallback
	}
	log.Printf("INTERLOGS Backend running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}
