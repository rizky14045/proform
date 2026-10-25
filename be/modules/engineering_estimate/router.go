package engineering_estimate

import (
	"template/middleware"
	"template/modules/approval"
	"template/modules/procurement_request"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.RouterGroup, db *gorm.DB) {
	if err := MigrateEngineeringEstimate(db); err != nil {
		panic("failed to migrate engineering estimate tables: " + err.Error())
	}

	repo := NewEngineeringEstimateRepository(db)
	procReqRepo := procurement_request.NewProcurementRequestRepository(db)
	approvalRepo := approval.NewApprovalRepository(db)
	service := NewEngineeringEstimateService(repo, procReqRepo, approvalRepo)
	handler := NewEngineeringEstimateHandler(service)

	register := func(app *gin.RouterGroup) {
		app.Use(middleware.JWTMiddleware())
		// Base HPE endpoints
		app.GET("", handler.IndexHPE)
		app.GET("/", handler.IndexHPE)
		app.GET("/:id", handler.ShowHPE)
		app.POST("", handler.CreateHPE)
		app.POST("/", handler.CreateHPE)
		app.DELETE("/:id", handler.DestroyHPE)

		// HPE
		app.GET("/hpe", handler.IndexHPE)
		app.GET("/hpe/:id", handler.ShowHPE)
		app.POST("/hpe/create", handler.CreateHPE)
		app.PATCH("/hpe/update/:id", handler.UpdateHPE)
		app.DELETE("/hpe/destroy/:id", handler.DestroyHPE)
		app.POST("/hpe/submit/:id", handler.SubmitHPE)
		app.POST("/hpe/approve/:id", handler.ApproveHPE)

		// RKS
		app.GET("/rks", handler.IndexRKS)
		app.POST("/rks", handler.CreateRKS)
		app.POST("/rks/create", handler.CreateRKS)

		// VFM
		app.GET("/vfm", handler.IndexVFM)
		app.POST("/vfm", handler.CreateVFM)
		app.POST("/vfm/create", handler.CreateVFM)
	}

	register(router.Group("/engineering-estimate"))
	register(router.Group("/engineering-estimates"))
}

