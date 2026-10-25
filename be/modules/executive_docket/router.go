package executive_docket

import (
	"template/middleware"
	"template/modules/procurement_request"
	"template/modules/purchase_order"
	"template/modules/user"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.RouterGroup, db *gorm.DB) {
	if err := MigrateExecutiveDocket(db); err != nil {
		panic("failed to migrate executive docket tables: " + err.Error())
	}

	repo := NewExecutiveDocketRepository(db)
	procReqRepo := procurement_request.NewProcurementRequestRepository(db)
	poRepo := purchase_order.NewPurchaseOrderRepository(db)
	userRepo := user.NewUserRepository(db)
	service := NewExecutiveDocketService(repo, procReqRepo, poRepo, userRepo)
	handler := NewExecutiveDocketHandler(service)

	app := router.Group("/executive-docket")
	app.Use(middleware.JWTMiddleware())
	{
		app.GET("/", handler.Index)
		app.GET("/:id", handler.Show)
		app.POST("/compile", handler.Compile)
		app.POST("/sign-bsre", handler.Sign)
		app.DELETE("/:id", handler.Destroy)
	}
}

