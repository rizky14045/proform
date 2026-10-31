package database

import (
	"log"
	"template/middleware"
	"template/modules/approval"
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
	"template/modules/upload"
	"template/modules/user"
	"template/modules/warehouse"

	"gorm.io/gorm"
)

// Migrate runs AutoMigrate for all system entities
func Migrate(db *gorm.DB) error {
	log.Println("[Migration] Memulai auto-migration skema database...")

	// 1. Idempotency Key
	if err := db.AutoMigrate(&middleware.IdempotencyKey{}); err != nil {
		log.Printf("[Migration Error] Gagal migrate IdempotencyKey: %v", err)
		return err
	}

	// 2. Master Data: Role, Structure, User, General, Supplier, StockCode
	if err := role.MigrateRole(db); err != nil {
		log.Printf("[Migration Error] Gagal migrate Role: %v", err)
		return err
	}
	if err := structure.MigrateStructure(db); err != nil {
		log.Printf("[Migration Error] Gagal migrate Structure: %v", err)
		return err
	}
	if err := user.MigrateUser(db); err != nil {
		log.Printf("[Migration Error] Gagal migrate User: %v", err)
		return err
	}
	if err := general.MigrateGeneral(db); err != nil {
		log.Printf("[Migration Error] Gagal migrate General: %v", err)
		return err
	}
	if err := supplier.MigrateSupplier(db); err != nil {
		log.Printf("[Migration Error] Gagal migrate Supplier: %v", err)
		return err
	}
	if err := stock_code.MigrateStockCode(db); err != nil {
		log.Printf("[Migration Error] Gagal migrate StockCode: %v", err)
		return err
	}
	if err := master_document.MigrateMasterDocument(db); err != nil {
		log.Printf("[Migration Error] Gagal migrate MasterDocument: %v", err)
		return err
	}

	// 3. Workflow Usulan & Approval
	if err := procurement_request.MigrateProcurementRequest(db); err != nil {
		log.Printf("[Migration Error] Gagal migrate ProcurementRequest: %v", err)
		return err
	}
	if err := approval.MigrateApproval(db); err != nil {
		log.Printf("[Migration Error] Gagal migrate Approval: %v", err)
		return err
	}

	// 4. Enjiniring & HPE / RKS
	if err := engineering_estimate.MigrateEngineeringEstimate(db); err != nil {
		log.Printf("[Migration Error] Gagal migrate EngineeringEstimate: %v", err)
		return err
	}

	// 5. Owner Estimate & Tender / Pengadaan
	if err := owner_estimate.MigrateOwnerEstimate(db); err != nil {
		log.Printf("[Migration Error] Gagal migrate OwnerEstimate: %v", err)
		return err
	}

	// 6. Kontrak & Purchase Order (PO) / Jaminan Bank
	if err := purchase_order.MigratePurchaseOrder(db); err != nil {
		log.Printf("[Migration Error] Gagal migrate PurchaseOrder: %v", err)
		return err
	}

	// 7. Gudang & Berita Acara (BAPHB / BAST)
	if err := warehouse.MigrateWarehouse(db); err != nil {
		log.Printf("[Migration Error] Gagal migrate Warehouse: %v", err)
		return err
	}

	// 8. Evaluasi Kinerja Rekanan / Supplier
	if err := supplier_evaluation.MigrateSupplierEvaluation(db); err != nil {
		log.Printf("[Migration Error] Gagal migrate SupplierEvaluation: %v", err)
		return err
	}

	// 9. Berkas Eksekutif (Executive Docket) & TTE BSrE
	if err := executive_docket.MigrateExecutiveDocket(db); err != nil {
		log.Printf("[Migration Error] Gagal migrate ExecutiveDocket: %v", err)
		return err
	}

	// 10. Alih Tugas / Task Delegation
	if err := task_delegation.MigrateTaskDelegation(db); err != nil {
		log.Printf("[Migration Error] Gagal migrate TaskDelegation: %v", err)
		return err
	}

	// 11. Reports & Archives
	if err := report.MigrateReport(db); err != nil {
		log.Printf("[Migration Error] Gagal migrate Report: %v", err)
		return err
	}

	// 12. Uploaded Files & Security Metadata
	if err := upload.MigrateUpload(db); err != nil {
		log.Printf("[Migration Error] Gagal migrate Upload: %v", err)
		return err
	}

	log.Println("[Migration] Seluruh auto-migration skema database berhasil dijalankan.")
	return nil
}

