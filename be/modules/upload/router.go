package upload

import (
	"path/filepath"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.RouterGroup, db *gorm.DB) {
	uploadDir := filepath.Join("uploads")
	handler := NewUploadHandler(db, uploadDir)

	// Upload endpoint: POST /api/v1/upload
	router.POST("/upload", handler.Upload)

	// Safe view/download endpoint: GET /api/v1/uploads/:filename
	router.GET("/uploads/:filename", handler.ServeFile)
}

