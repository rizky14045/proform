package approval

import (
	"template/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.RouterGroup, db *gorm.DB) {
	if err := MigrateApproval(db); err != nil {
		panic("failed to migrate approval tables: " + err.Error())
	}

	repo := NewApprovalRepository(db)
	service := NewApprovalService(repo)
	handler := NewApprovalHandler(service)

	app := router.Group("/approval")
	app.Use(middleware.JWTMiddleware())
	{
		// Master Approval Structures
		app.GET("/structures", handler.IndexStructures)
		app.GET("/structures/:id", handler.ShowStructure)
		app.POST("/structures", handler.CreateStructure)
		app.POST("/structures/create", handler.CreateStructure)
		app.PUT("/structures/:id", handler.UpdateStructure)
		app.PATCH("/structures/update/:id", handler.UpdateStructure)
		app.DELETE("/structures/:id", handler.DestroyStructure)
		app.DELETE("/structures/destroy/:id", handler.DestroyStructure)

		// Approval Actions & Tracking
		app.GET("/histories/:request_id", handler.GetHistories)
		app.POST("/action", handler.SubmitAction)
	}

	registerApprovalStructures := func(group *gin.RouterGroup) {
		group.Use(middleware.JWTMiddleware())
		group.GET("", handler.IndexStructures)
		group.GET("/", handler.IndexStructures)
		group.GET("/:id", handler.ShowStructure)
		group.POST("", handler.CreateStructure)
		group.POST("/", handler.CreateStructure)
		group.POST("/create", handler.CreateStructure)
		group.PUT("/:id", handler.UpdateStructure)
		group.PATCH("/:id", handler.UpdateStructure)
		group.PATCH("/update/:id", handler.UpdateStructure)
		group.DELETE("/:id", handler.DestroyStructure)
		group.DELETE("/destroy/:id", handler.DestroyStructure)
	}

	registerApprovalStructures(router.Group("/approval-structures"))
	registerApprovalStructures(router.Group("/approval-structure"))
}

