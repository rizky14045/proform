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

		// Tender Events and Sub-modules FIRST
		app.GET("/events", handler.IndexTenderEvents)
		app.GET("/events/:id", handler.ShowTenderEvent)
		app.POST("/events", handler.CreateTenderEvent)
		app.POST("/events/create", handler.CreateTenderEvent)
		app.POST("/tender-events", handler.CreateTenderEvent)
		app.GET("/tender-events/request/:id", handler.IndexTenderEvents)
		app.PATCH("/events/update/:id", handler.UpdateTenderEvent)
		app.DELETE("/events/destroy/:id", handler.DestroyTenderEvent)

		// Pengadaan Sub-module Aliases
		app.GET("/assignments", handler.IndexTenderEvents)
		app.POST("/assignments", handler.CreateTenderEvent)
		app.GET("/spmks", handler.IndexTenderEvents)
		app.POST("/spmks", handler.CreateTenderEvent)
		app.GET("/rfqs", handler.IndexTenderEvents)
		app.POST("/rfqs", handler.CreateTenderEvent)
		app.GET("/announcements", handler.IndexTenderEvents)
		app.POST("/announcements", handler.CreateTenderEvent)
		app.GET("/umbrella-contracts", handler.IndexTenderEvents)
		app.POST("/umbrella-contracts", handler.CreateTenderEvent)

		// HPS
		app.GET("/hps", handler.IndexHPS)
		app.GET("/hps/:id", handler.ShowHPS)
		app.POST("/hps/create", handler.CreateHPS)
		app.PATCH("/hps/update/:id", handler.UpdateHPS)
		app.DELETE("/hps/destroy/:id", handler.DestroyHPS)

		// Base HPS endpoints
		app.GET("", handler.IndexHPS)
		app.GET("/", handler.IndexHPS)
		app.POST("", handler.CreateHPS)
		app.POST("/", handler.CreateHPS)

		// Wildcards LAST
		app.GET("/:id", handler.ShowHPS)
		app.DELETE("/:id", handler.DestroyHPS)
	}

	register(router.Group("/owner-estimate"))
	register(router.Group("/owner-estimates"))
}

