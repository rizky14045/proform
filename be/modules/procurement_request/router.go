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

		// Sub-modules static routes MUST be declared BEFORE wildcard /:id routes
		app.GET("/distributions", handler.Distributions)
		app.POST("/distributions", handler.CreateDistribution)
		app.GET("/addendums", handler.Addendums)
		app.POST("/addendums", handler.CreateAddendum)
		app.GET("/evaluations", handler.Evaluations)
		app.POST("/evaluations", handler.CreateEvaluation)
		app.GET("/technical-evaluations", handler.Evaluations)
		app.POST("/technical-evaluations", handler.CreateEvaluation)

		// Root collection routes
		app.GET("", handler.Index)
		app.GET("/", handler.Index)
		app.POST("", handler.Create)
		app.POST("/", handler.Create)
		app.POST("/create", handler.Create)

		// Specific actions with prefix
		app.POST("/distribute/:id", handler.Distribute)
		app.POST("/submit/:id", handler.Submit)
		app.POST("/approve/:id", handler.Approve)
		app.POST("/revise/:id", handler.Revise)
		app.POST("/reject/:id", handler.Reject)
		app.PATCH("/update/:id", handler.Update)
		app.DELETE("/destroy/:id", handler.Destroy)

		// Wildcard routes
		app.GET("/:id", handler.Show)
		app.PUT("/:id", handler.Update)
		app.PATCH("/:id", handler.Update)
		app.DELETE("/:id", handler.Destroy)
		app.POST("/:id/distribute", handler.Distribute)
	}

	register(router.Group("/procurement-request"))
	register(router.Group("/procurement-requests"))
}

