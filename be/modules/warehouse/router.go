package warehouse

import (
	"template/middleware"
	"template/modules/procurement_request"
	"template/modules/purchase_order"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.RouterGroup, db *gorm.DB) {
	if err := MigrateWarehouse(db); err != nil {
		panic("failed to migrate warehouse tables: " + err.Error())
	}

	repo := NewWarehouseRepository(db)
	poRepo := purchase_order.NewPurchaseOrderRepository(db)
	procReqRepo := procurement_request.NewProcurementRequestRepository(db)
	service := NewWarehouseService(repo, poRepo, procReqRepo)
	handler := NewWarehouseHandler(service)

	register := func(app *gin.RouterGroup) {
		app.Use(middleware.JWTMiddleware())
		// Default root lists receipts
		app.GET("", handler.IndexReceipts)
		app.GET("/", handler.IndexReceipts)

		// Sub-module Aliases
		app.GET("/distributions", handler.IndexReceipts)
		app.POST("/distributions", handler.CreateReceipt)
		app.GET("/inspections", handler.IndexReceipts)
		app.POST("/inspections", handler.CreateReceipt)
		app.GET("/completions", handler.IndexActs)
		app.POST("/completions", handler.CreateAct)

		// Receipts
		app.GET("/receipts", handler.IndexReceipts)
		app.GET("/goods-receipts", handler.IndexReceipts)
		app.GET("/receipts/:id", handler.ShowReceipt)
		app.GET("/goods-receipts/:id", handler.ShowReceipt)
		app.POST("/receipts", handler.CreateReceipt)
		app.POST("/goods-receipts", handler.CreateReceipt)
		app.POST("/receipts/create", handler.CreateReceipt)
		app.PATCH("/receipts/update/:id", handler.UpdateReceipt)
		app.DELETE("/receipts/:id", handler.DestroyReceipt)
		app.DELETE("/goods-receipts/:id", handler.DestroyReceipt)
		app.DELETE("/receipts/destroy/:id", handler.DestroyReceipt)

		// Inspection Acts (BAPHB / BAST)
		app.GET("/acts", handler.IndexActs)
		app.GET("/inspection-acts", handler.IndexActs)
		app.GET("/acts/:id", handler.ShowAct)
		app.GET("/inspection-acts/:id", handler.ShowAct)
		app.POST("/acts", handler.CreateAct)
		app.POST("/inspection-acts", handler.CreateAct)
		app.POST("/acts/create", handler.CreateAct)
		app.PATCH("/acts/update/:id", handler.UpdateAct)
		app.DELETE("/acts/:id", handler.DestroyAct)
		app.DELETE("/inspection-acts/:id", handler.DestroyAct)
		app.DELETE("/acts/destroy/:id", handler.DestroyAct)
	}

	register(router.Group("/warehouse"))
	register(router.Group("/warehouses"))
}

