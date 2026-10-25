package purchase_order

import (
	"template/middleware"
	"template/modules/procurement_request"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.RouterGroup, db *gorm.DB) {
	if err := MigratePurchaseOrder(db); err != nil {
		panic("failed to migrate purchase order tables: " + err.Error())
	}

	repo := NewPurchaseOrderRepository(db)
	procReqRepo := procurement_request.NewProcurementRequestRepository(db)
	service := NewPurchaseOrderService(repo, procReqRepo)
	handler := NewPurchaseOrderHandler(service)

	register := func(app *gin.RouterGroup) {
		app.Use(middleware.JWTMiddleware())
		// Base PO endpoints
		app.GET("", handler.IndexPO)
		app.GET("/", handler.IndexPO)
		app.GET("/:id", handler.ShowPO)
		app.POST("", handler.CreatePO)
		app.POST("/", handler.CreatePO)
		app.DELETE("/:id", handler.DestroyPO)

		// PO
		app.GET("/po", handler.IndexPO)
		app.GET("/po/:id", handler.ShowPO)
		app.POST("/po/create", handler.CreatePO)
		app.PATCH("/po/update/:id", handler.UpdatePO)
		app.DELETE("/po/destroy/:id", handler.DestroyPO)

		// Bank Guarantee
		app.GET("/bank-guarantee", handler.IndexBG)
		app.GET("/bank-guarantees", handler.IndexBG)
		app.GET("/bank-guarantee/:id", handler.ShowBG)
		app.POST("/bank-guarantee", handler.CreateBG)
		app.POST("/bank-guarantees", handler.CreateBG)
		app.POST("/bank-guarantee/create", handler.CreateBG)
		app.PATCH("/bank-guarantee/:id/verify", handler.UpdateBG)
		app.PATCH("/bank-guarantees/:id/verify", handler.UpdateBG)
		app.PATCH("/bank-guarantee/update/:id", handler.UpdateBG)
		app.DELETE("/bank-guarantee/destroy/:id", handler.DestroyBG)
	}

	register(router.Group("/purchase-order"))
	register(router.Group("/purchase-orders"))
}
