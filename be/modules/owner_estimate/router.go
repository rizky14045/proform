package owner_estimate

import (
	"template/middleware"
	"template/modules/procurement_request"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.RouterGroup, db *gorm.DB) {
	if err := MigrateOwnerEstimate(db); err != nil {
		panic("failed to migrate owner estimate tables: " + err.Error())
	}

	repo := NewOwnerEstimateRepository(db)
	procReqRepo := procurement_request.NewProcurementRequestRepository(db)
	service := NewOwnerEstimateService(repo, procReqRepo)
	handler := NewOwnerEstimateHandler(service)

	register := func(app *gin.RouterGroup) {
		app.Use(middleware.JWTMiddleware())
		// Base HPS endpoints
		app.GET("", handler.IndexHPS)
		app.GET("/", handler.IndexHPS)
		app.GET("/:id", handler.ShowHPS)
		app.POST("", handler.CreateHPS)
		app.POST("/", handler.CreateHPS)
		app.DELETE("/:id", handler.DestroyHPS)

		// HPS
		app.GET("/hps", handler.IndexHPS)
		app.GET("/hps/:id", handler.ShowHPS)
		app.POST("/hps/create", handler.CreateHPS)
		app.PATCH("/hps/update/:id", handler.UpdateHPS)
		app.DELETE("/hps/destroy/:id", handler.DestroyHPS)

		// Tender Events (RFQ, Aanwijzing, BAPP, BAEP, BANH, BAHP)
		app.GET("/events", handler.IndexTenderEvents)
		app.GET("/events/:id", handler.ShowTenderEvent)
		app.POST("/events", handler.CreateTenderEvent)
		app.POST("/events/create", handler.CreateTenderEvent)
		app.POST("/tender-events", handler.CreateTenderEvent)
		app.GET("/tender-events/request/:id", handler.IndexTenderEvents)
		app.PATCH("/events/update/:id", handler.UpdateTenderEvent)
		app.DELETE("/events/destroy/:id", handler.DestroyTenderEvent)
	}

	register(router.Group("/owner-estimate"))
	register(router.Group("/owner-estimates"))
}

