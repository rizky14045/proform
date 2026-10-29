package routes

import (
	"template/modules/approval"
	"template/modules/auth"
	"template/modules/engineering_estimate"
	"template/modules/executive_docket"
	"template/modules/general"
	"template/modules/master_document"
	"template/modules/owner_estimate"
	"template/modules/procurement_request"
	"template/modules/purchase_order"
	"template/modules/report"
	"template/modules/role"
	"template/modules/stock_code"
	"template/modules/structure"
	"template/modules/supplier"
	"template/modules/supplier_evaluation"
	"template/modules/task_delegation"
	"template/modules/user"
	"template/modules/warehouse"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.Engine, db *gorm.DB) {
	registerApiRoutes := func(api *gin.RouterGroup) {
		// Authentication & Profile
		auth.SetupRoutes(api, db)

		// Master Data
		role.SetupRoutes(api, db)
		structure.SetupRoutes(api, db)
		user.SetupRoutes(api, db)
		general.SetupRoutes(api, db)
		supplier.SetupRoutes(api, db)
		stock_code.SetupRoutes(api, db)
		master_document.SetupRoutes(api, db)
		approval.SetupRoutes(api, db)

		// Procurement Workflow
		procurement_request.SetupRoutes(api, db)
		engineering_estimate.SetupRoutes(api, db)
		owner_estimate.SetupRoutes(api, db)
		purchase_order.SetupRoutes(api, db)
		warehouse.SetupRoutes(api, db)
		supplier_evaluation.SetupRoutes(api, db)
		task_delegation.SetupRoutes(api, db)
		executive_docket.SetupRoutes(api, db)
		report.SetupRoutes(api, db)
	}

	// Support both /api and /api/v1
	registerApiRoutes(router.Group("/api"))
	registerApiRoutes(router.Group("/api/v1"))
}
