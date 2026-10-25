package stock_code

import (
	"template/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.RouterGroup, db *gorm.DB) {
	if err := MigrateStockCode(db); err != nil {
		panic("failed to migrate stock_code table: " + err.Error())
	}

	repo := NewStockCodeRepository(db)
	service := NewStockCodeService(repo)
	handler := NewStockCodeHandler(service)

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

	register(router.Group("/stock-code"))
	register(router.Group("/stock-codes"))
}
