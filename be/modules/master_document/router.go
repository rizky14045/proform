package master_document

import (
	"template/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(api *gin.RouterGroup, db *gorm.DB) {
	repo := NewMasterDocumentRepository(db)
	service := NewMasterDocumentService(repo)
	handler := NewMasterDocumentHandler(service)

	register := func(group *gin.RouterGroup) {
		group.Use(middleware.JWTMiddleware())
		group.GET("", handler.Index)
		group.GET("/", handler.Index)
		group.GET("/:id", handler.Show)
		group.POST("", handler.Create)
		group.POST("/", handler.Create)
		group.POST("/create", handler.Create)
		group.PUT("/:id", handler.Update)
		group.PATCH("/:id", handler.Update)
		group.PATCH("/update/:id", handler.Update)
		group.DELETE("/:id", handler.Delete)
		group.DELETE("/destroy/:id", handler.Delete)
	}

	register(api.Group("/master-documents"))
	register(api.Group("/master-document"))
	register(api.Group("/master/documents"))
	register(api.Group("/master/document"))
}

