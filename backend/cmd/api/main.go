package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	_ "github.com/upiw256/be-educore/docs"
	"github.com/upiw256/be-educore/internal/handler"
	"github.com/upiw256/be-educore/pkg/db"
	"github.com/upiw256/be-educore/pkg/utils"
)

// @title           EduCore API
// @version         1.0
// @description     This is the schools management EduCore API.
// @host            localhost:8082
// @BasePath        /
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

	// Swagger documentation handler
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api/v1")
	{
		// Auth
		authHandler := handler.NewAuthHandler()
		api.POST("/auth/login", authHandler.Login)
		api.POST("/auth/change-password", authHandler.ChangePassword)

		// Students
		studentHandler := handler.NewStudentHandler()
		api.GET("/students", studentHandler.GetStudents)

		// Izin & Late
		recordHandler := handler.NewRecordHandler()
		api.GET("/izins", recordHandler.GetIzins)
		api.POST("/izins", recordHandler.CreateIzin)
		api.GET("/late-records", recordHandler.GetLateRecords)
		api.POST("/late-records", recordHandler.CreateLateRecord)

		// Pelanggaran
		pelanggaranHandler := handler.NewPelanggaranHandler()
		api.GET("/pelanggarans", pelanggaranHandler.GetPelanggarans)
		api.POST("/pelanggarans", pelanggaranHandler.CreatePelanggaran)

		// Schedule
		scheduleHandler := handler.NewScheduleHandler()
		api.GET("/schedules", scheduleHandler.GetSchedules)
		api.GET("/schedules/classes", scheduleHandler.GetClasses)

		// Pengumuman
		pengumumanHandler := handler.NewPengumumanHandler()
		api.GET("/pengumuman", pengumumanHandler.GetPengumuman)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
