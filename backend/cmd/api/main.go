package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/upiw256/be-educore/internal/handler"
	"github.com/upiw256/be-educore/pkg/db"
	"github.com/upiw256/be-educore/pkg/utils"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using defaults")
	}

	db.ConnectDB()

	r := gin.Default()

	// CORS configuration for mobile access
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		utils.JSONResponse(c, http.StatusOK, "API is running", nil)
	})

	api := r.Group("/api/v1")
	{
		authHandler := handler.NewAuthHandler()
		api.POST("/auth/login", authHandler.Login)

		studentHandler := handler.NewStudentHandler()
		api.GET("/students", studentHandler.GetStudents)

		recordHandler := handler.NewRecordHandler()
		api.POST("/izins", recordHandler.CreateIzin)
		api.POST("/late-records", recordHandler.CreateLateRecord)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
