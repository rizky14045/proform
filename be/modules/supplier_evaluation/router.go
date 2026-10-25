package supplier_evaluation

import (
	"template/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.RouterGroup, db *gorm.DB) {
	if err := MigrateSupplierEvaluation(db); err != nil {
		panic("failed to migrate supplier evaluation table: " + err.Error())
	}

	repo := NewSupplierEvaluationRepository(db)
	service := NewSupplierEvaluationService(repo)
	handler := NewSupplierEvaluationHandler(service)

	register := func(app *gin.RouterGroup) {
		app.Use(middleware.JWTMiddleware())
		app.GET("", handler.ShowByPO)
		app.GET("/", handler.ShowByPO)
		app.GET("/po/:po_id", handler.ShowByPO)
		app.GET("/po/:po_id/summary", handler.ShowByPO)
		app.POST("", handler.Submit)
		app.POST("/", handler.Submit)
		app.POST("/submit", handler.Submit)
	}

	register(router.Group("/supplier-evaluation"))
	register(router.Group("/supplier-evaluations"))
}

