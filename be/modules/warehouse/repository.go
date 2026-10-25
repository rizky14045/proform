package warehouse

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type WarehouseRepository interface {
	// Goods Receipt
	FindAllReceipts(search string, status string, page int, limit int) ([]GoodsReceipt, int64, error)
	GetReceiptByID(id uuid.UUID) (*GoodsReceipt, error)
	CreateReceipt(receipt *GoodsReceipt) error
	UpdateReceipt(receipt *GoodsReceipt) error
	DeleteReceipt(id uuid.UUID, deletedBy *uuid.UUID) error
	GenerateReceiptNumber() (string, error)

	// Inspection Act (BAPHB / BAST)
	FindAllActs(actType string, status string, page int, limit int) ([]InspectionAcceptanceAct, int64, error)
	GetActByID(id uuid.UUID) (*InspectionAcceptanceAct, error)
	CreateAct(act *InspectionAcceptanceAct) error
	UpdateAct(act *InspectionAcceptanceAct) error
	DeleteAct(id uuid.UUID, deletedBy *uuid.UUID) error
	GenerateActNumber(actType string) (string, error)
}

type warehouseRepository struct {
	db *gorm.DB
}

func NewWarehouseRepository(db *gorm.DB) WarehouseRepository {
	return &warehouseRepository{db: db}
}

func (r *warehouseRepository) FindAllReceipts(search string, status string, page int, limit int) ([]GoodsReceipt, int64, error) {
	var list []GoodsReceipt
	var total int64
	query := r.db.Model(&GoodsReceipt{})

	if search != "" {
		query = query.Where("receipt_number ILIKE ? OR delivery_note_number ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if status != "" && status != "ALL" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if limit > 0 {
		query = query.Limit(limit).Offset(offset)
	}

	if err := query.Preload("PO.Supplier").Preload("InspectedBy").Order("created_at desc").Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

func (r *warehouseRepository) GetReceiptByID(id uuid.UUID) (*GoodsReceipt, error) {
	var item GoodsReceipt
	if err := r.db.Preload("PO.Supplier").Preload("PO.Request.Items").Preload("InspectedBy").First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *warehouseRepository) CreateReceipt(receipt *GoodsReceipt) error {
	return r.db.Create(receipt).Error
}

func (r *warehouseRepository) UpdateReceipt(receipt *GoodsReceipt) error {
	return r.db.Save(receipt).Error
}

func (r *warehouseRepository) DeleteReceipt(id uuid.UUID, deletedBy *uuid.UUID) error {
	if deletedBy != nil {
		_ = r.db.Model(&GoodsReceipt{}).Where("id = ?", id).Update("deleted_by", *deletedBy).Error
	}
	return r.db.Delete(&GoodsReceipt{}, "id = ?", id).Error
}

func (r *warehouseRepository) GenerateReceiptNumber() (string, error) {
	var count int64
	year := time.Now().Year()
	r.db.Model(&GoodsReceipt{}).Count(&count)
	return fmt.Sprintf("%04d/PPR/600/UPMT/%d", count+1, year), nil
}

func (r *warehouseRepository) FindAllActs(actType string, status string, page int, limit int) ([]InspectionAcceptanceAct, int64, error) {
	var list []InspectionAcceptanceAct
	var total int64
	query := r.db.Model(&InspectionAcceptanceAct{})

	if actType != "" && actType != "ALL" {
		query = query.Where("act_type = ?", actType)
	}
	if status != "" && status != "ALL" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if limit > 0 {
		query = query.Limit(limit).Offset(offset)
	}

	if err := query.Preload("PO.Supplier").Preload("LeadInspector").Preload("Secretary").Preload("Member1").Preload("Member2").Preload("Member3").
		Order("created_at desc").Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

func (r *warehouseRepository) GetActByID(id uuid.UUID) (*InspectionAcceptanceAct, error) {
	var item InspectionAcceptanceAct
	if err := r.db.Preload("PO.Supplier").Preload("PO.Request.Items").Preload("LeadInspector").Preload("Secretary").Preload("Member1").Preload("Member2").Preload("Member3").
		First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *warehouseRepository) CreateAct(act *InspectionAcceptanceAct) error {
	return r.db.Create(act).Error
}

func (r *warehouseRepository) UpdateAct(act *InspectionAcceptanceAct) error {
	return r.db.Save(act).Error
}

func (r *warehouseRepository) DeleteAct(id uuid.UUID, deletedBy *uuid.UUID) error {
	if deletedBy != nil {
		_ = r.db.Model(&InspectionAcceptanceAct{}).Where("id = ?", id).Update("deleted_by", *deletedBy).Error
	}
	return r.db.Delete(&InspectionAcceptanceAct{}, "id = ?", id).Error
}

func (r *warehouseRepository) GenerateActNumber(actType string) (string, error) {
	var count int64
	year := time.Now().Year()
	r.db.Model(&InspectionAcceptanceAct{}).Where("act_type = ?", actType).Count(&count)
	prefix := "BAPHB"
	if actType == "BAST_JASA" {
		prefix = "BAST"
	}
	return fmt.Sprintf("%04d/%s/600/UPMT/%d", count+1, prefix, year), nil
}
