package procurement_request

import (
	"template/middleware"
	"template/modules/approval"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.RouterGroup, db *gorm.DB) {
	if err := MigrateProcurementRequest(db); err != nil {
		panic("failed to migrate procurement_request tables: " + err.Error())
	}

	repo := NewProcurementRequestRepository(db)
	approvalRepo := approval.NewApprovalRepository(db)
	service := NewProcurementRequestService(repo, approvalRepo)
	handler := NewProcurementRequestHandler(service)

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
		app.POST("/distribute/:id", handler.Distribute)
		app.POST("/:id/distribute", handler.Distribute)
		app.POST("/submit/:id", handler.Submit)
		app.POST("/approve/:id", handler.Approve)
		app.POST("/revise/:id", handler.Revise)
		app.POST("/reject/:id", handler.Reject)
	}

	register(router.Group("/procurement-request"))
	register(router.Group("/procurement-requests"))
}

