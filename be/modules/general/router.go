package general

import (
	"template/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.RouterGroup, db *gorm.DB) {
	if err := MigrateGeneral(db); err != nil {
		panic("failed to migrate general table: " + err.Error())
	}

	repo := NewGeneralRepository(db)
	service := NewGeneralService(repo)
	handler := NewGeneralHandler(service)

	register := func(app *gin.RouterGroup) {
		app.Use(middleware.JWTMiddleware())
		app.GET("", handler.Index)
		app.GET("/", handler.Index)
		app.GET("/:id", handler.Show)
		app.POST("", handler.Create)
		app.POST("/", handler.Create)
		app.POST("/create", handler.Create)
		app.PUT("/:id", handler.Update)
		app.PATCH("/:id", handler.Update)
		app.PATCH("/update/:id", handler.Update)
		app.DELETE("/:id", handler.Destroy)
		app.DELETE("/destroy/:id", handler.Destroy)
	}

	register(router.Group("/general"))
	register(router.Group("/generals"))
}

