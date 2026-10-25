package task_delegation

import (
	"template/middleware"
	"template/modules/procurement_request"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.RouterGroup, db *gorm.DB) {
	if err := MigrateTaskDelegation(db); err != nil {
		panic("failed to migrate task_delegation table: " + err.Error())
	}

	repo := NewTaskDelegationRepository(db)
	procReqRepo := procurement_request.NewProcurementRequestRepository(db)
	service := NewTaskDelegationService(repo, procReqRepo)
	handler := NewTaskDelegationHandler(service)

	register := func(app *gin.RouterGroup) {
		app.Use(middleware.JWTMiddleware())
		app.GET("", handler.Index)
		app.GET("/", handler.Index)
		app.GET("/:id", handler.Show)
		app.POST("", handler.Create)
		app.POST("/", handler.Create)
		app.POST("/create", handler.Create)
		app.DELETE("/:id", handler.Destroy)
		app.DELETE("/destroy/:id", handler.Destroy)
	}

	register(router.Group("/task-delegation"))
	register(router.Group("/task-delegations"))
}

