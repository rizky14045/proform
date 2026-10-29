package report

import (
	"template/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(api *gin.RouterGroup, db *gorm.DB) {
	repo := NewReportRepository(db)
	service := NewReportService(repo)
	handler := NewReportHandler(service)

	r := api.Group("/reports")
	r.Use(middleware.JWTMiddleware())
	{
		r.GET("/revisions", handler.RevisionLogs)
		r.POST("/revisions", handler.CreateRevisionLog)
		r.GET("/archives", handler.ArchiveDocuments)
		r.POST("/archives", handler.CreateArchiveDocument)
		r.DELETE("/archives/:id", handler.DeleteArchiveDocument)
	}
}

