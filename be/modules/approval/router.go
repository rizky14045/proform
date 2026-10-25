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
		app.POST("/structures/create", handler.CreateStructure)
		app.PATCH("/structures/update/:id", handler.UpdateStructure)
		app.DELETE("/structures/destroy/:id", handler.DestroyStructure)

		// Approval Actions & Tracking
		app.GET("/histories/:request_id", handler.GetHistories)
		app.POST("/action", handler.SubmitAction)
	}
}

