package purchase_order

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PurchaseOrderRepository interface {
	// PO
	FindAllPO(search string, status string) ([]PurchaseOrder, error)
	GetPOByID(id uuid.UUID) (*PurchaseOrder, error)
	GetPOByNumber(poNumber string) (*PurchaseOrder, error)
	GetPOByRequestID(requestID uuid.UUID) (*PurchaseOrder, error)
	CreatePO(po *PurchaseOrder) error
	UpdatePO(po *PurchaseOrder) error
	DeletePO(id uuid.UUID, deletedBy *uuid.UUID) error
	GeneratePONumber() (string, error)

	// Bank Guarantee
	FindAllBG(search string, status string) ([]BankGuarantee, error)
	GetBGByID(id uuid.UUID) (*BankGuarantee, error)
	CreateBG(bg *BankGuarantee) error
	UpdateBG(bg *BankGuarantee) error
	DeleteBG(id uuid.UUID, deletedBy *uuid.UUID) error
}

type purchaseOrderRepository struct {
	db *gorm.DB
}

func NewPurchaseOrderRepository(db *gorm.DB) PurchaseOrderRepository {
	return &purchaseOrderRepository{db: db}
}

func (r *purchaseOrderRepository) FindAllPO(search string, status string) ([]PurchaseOrder, error) {
	var list []PurchaseOrder
	query := r.db.Preload("Request").Preload("Supplier").Preload("PICResolution").Preload("Creator").
		Order("created_at desc")

	if search != "" {
		query = query.Where("po_number ILIKE ? OR notes ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if status != "" && status != "ALL" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *purchaseOrderRepository) GetPOByID(id uuid.UUID) (*PurchaseOrder, error) {
	var item PurchaseOrder
	if err := r.db.Preload("Request.Items").Preload("Supplier").Preload("PICResolution").Preload("Creator").
		First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *purchaseOrderRepository) GetPOByNumber(poNumber string) (*PurchaseOrder, error) {
	var item PurchaseOrder
	if err := r.db.Preload("Request.Items").Preload("Supplier").Preload("PICResolution").Preload("Creator").
		First(&item, "po_number = ?", poNumber).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *purchaseOrderRepository) GetPOByRequestID(requestID uuid.UUID) (*PurchaseOrder, error) {
	var item PurchaseOrder
	if err := r.db.Preload("Request.Items").Preload("Supplier").Preload("PICResolution").Preload("Creator").
		First(&item, "request_id = ?", requestID).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *purchaseOrderRepository) CreatePO(po *PurchaseOrder) error {
	return r.db.Create(po).Error
}

func (r *purchaseOrderRepository) UpdatePO(po *PurchaseOrder) error {
	return r.db.Save(po).Error
}

func (r *purchaseOrderRepository) DeletePO(id uuid.UUID, deletedBy *uuid.UUID) error {
	if deletedBy != nil {
		_ = r.db.Model(&PurchaseOrder{}).Where("id = ?", id).Update("deleted_by", *deletedBy).Error
	}
	return r.db.Delete(&PurchaseOrder{}, "id = ?", id).Error
}

func (r *purchaseOrderRepository) GeneratePONumber() (string, error) {
	var count int64
	year := time.Now().Year()
	r.db.Model(&PurchaseOrder{}).Count(&count)
	return fmt.Sprintf("%04d/PO/600/UPMT/%d", count+1, year), nil
}

func (r *purchaseOrderRepository) FindAllBG(search string, status string) ([]BankGuarantee, error) {
	var list []BankGuarantee
	query := r.db.Preload("Supplier").Preload("Request").Order("created_at desc")

	if search != "" {
		query = query.Where("serial_number ILIKE ? OR issuing_bank ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if status != "" && status != "ALL" {
		query = query.Where("confirmation_status = ?", status)
	}

	if err := query.Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *purchaseOrderRepository) GetBGByID(id uuid.UUID) (*BankGuarantee, error) {
	var item BankGuarantee
	if err := r.db.Preload("Supplier").Preload("Request").First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *purchaseOrderRepository) CreateBG(bg *BankGuarantee) error {
	return r.db.Create(bg).Error
}

func (r *purchaseOrderRepository) UpdateBG(bg *BankGuarantee) error {
	return r.db.Save(bg).Error
}

func (r *purchaseOrderRepository) DeleteBG(id uuid.UUID, deletedBy *uuid.UUID) error {
	if deletedBy != nil {
		_ = r.db.Model(&BankGuarantee{}).Where("id = ?", id).Update("deleted_by", *deletedBy).Error
	}
	return r.db.Delete(&BankGuarantee{}, "id = ?", id).Error
}
