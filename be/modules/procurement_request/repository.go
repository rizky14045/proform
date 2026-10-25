package procurement_request

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProcurementRequestRepository interface {
	FindAll(step string, status string, search string, creatorID *uuid.UUID, assignedToID *uuid.UUID, page int, limit int) ([]ProcurementRequest, int64, error)
	GetByID(id uuid.UUID) (*ProcurementRequest, error)
	GetByRequestNumber(reqNum string) (*ProcurementRequest, error)
	Create(req *ProcurementRequest) error
	Update(req *ProcurementRequest) error
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
	GenerateRequestNumber() (string, error)
	ReplaceItems(requestID uuid.UUID, items []RequestItem) error
}

type procurementRequestRepository struct {
	db *gorm.DB
}

func NewProcurementRequestRepository(db *gorm.DB) ProcurementRequestRepository {
	return &procurementRequestRepository{db: db}
}

func (r *procurementRequestRepository) FindAll(step string, status string, search string, creatorID *uuid.UUID, assignedToID *uuid.UUID, page int, limit int) ([]ProcurementRequest, int64, error) {
	var list []ProcurementRequest
	var total int64

	query := r.db.Model(&ProcurementRequest{})

	if step != "" && step != "ALL" {
		query = query.Where("current_step = ?", step)
	}
	if status != "" && status != "ALL" {
		query = query.Where("current_status = ?", status)
	}
	if creatorID != nil {
		query = query.Where("creator_id = ?", *creatorID)
	}
	if assignedToID != nil {
		query = query.Where("assigned_to_id = ?", *assignedToID)
	}
	if search != "" {
		query = query.Where("request_number ILIKE ? OR wo_number ILIKE ? OR prk_number ILIKE ? OR notes ILIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if limit > 0 {
		query = query.Limit(limit).Offset(offset)
	}

	if err := query.Preload("Creator").Preload("Structure").Preload("AssignedTo").Preload("Items.StockCode").
		Order("created_at desc").Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

func (r *procurementRequestRepository) GetByID(id uuid.UUID) (*ProcurementRequest, error) {
	var req ProcurementRequest
	if err := r.db.Preload("Creator").Preload("Structure").Preload("AssignedTo").Preload("PICResolution").Preload("Items.StockCode").
		First(&req, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &req, nil
}

func (r *procurementRequestRepository) GetByRequestNumber(reqNum string) (*ProcurementRequest, error) {
	var req ProcurementRequest
	if err := r.db.Preload("Creator").Preload("Structure").Preload("AssignedTo").Preload("Items.StockCode").
		First(&req, "request_number = ?", reqNum).Error; err != nil {
		return nil, err
	}
	return &req, nil
}

func (r *procurementRequestRepository) Create(req *ProcurementRequest) error {
	return r.db.Create(req).Error
}

func (r *procurementRequestRepository) Update(req *ProcurementRequest) error {
	return r.db.Save(req).Error
}

func (r *procurementRequestRepository) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	if deletedBy != nil {
		_ = r.db.Model(&ProcurementRequest{}).Where("id = ?", id).Update("deleted_by", *deletedBy).Error
		_ = r.db.Model(&RequestItem{}).Where("request_id = ?", id).Update("deleted_by", *deletedBy).Error
	}
	_ = r.db.Where("request_id = ?", id).Delete(&RequestItem{}).Error
	return r.db.Delete(&ProcurementRequest{}, "id = ?", id).Error
}

func (r *procurementRequestRepository) GenerateRequestNumber() (string, error) {
	var count int64
	year := time.Now().Year()
	r.db.Model(&ProcurementRequest{}).Count(&count)
	number := fmt.Sprintf("%04d/UPM/600/UPMT/%d", count+1, year)
	return number, nil
}

func (r *procurementRequestRepository) ReplaceItems(requestID uuid.UUID, items []RequestItem) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("request_id = ?", requestID).Delete(&RequestItem{}).Error; err != nil {
			return err
		}
		if len(items) > 0 {
			for i := range items {
				items[i].RequestID = requestID
				if items[i].ID == uuid.Nil {
					items[i].ID = uuid.New()
				}
			}
			if err := tx.Create(&items).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
