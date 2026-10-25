package supplier

import (
	"template/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.RouterGroup, db *gorm.DB) {
	if err := MigrateSupplier(db); err != nil {
		panic("failed to migrate supplier table: " + err.Error())
	}

	repo := NewSupplierRepository(db)
	service := NewSupplierService(repo)
	handler := NewSupplierHandler(service)

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

	register(router.Group("/supplier"))
	register(router.Group("/suppliers"))
}

