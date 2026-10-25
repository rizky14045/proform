package approval

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ApprovalRepository interface {
	// Approval Structure
	FindStructures(menu string, status string) ([]ApprovalStructure, error)
	GetStructureByID(id uuid.UUID) (*ApprovalStructure, error)
	CreateStructure(item *ApprovalStructure) error
	UpdateStructure(item *ApprovalStructure) error
	DeleteStructure(id uuid.UUID, deletedBy *uuid.UUID) error

	// Approval History
	FindHistoriesByRequestID(requestID uuid.UUID) ([]ApprovalHistory, error)
	CreateHistory(history *ApprovalHistory) error
	GetNextSequenceOrder(requestID uuid.UUID) (int, error)
}

type approvalRepository struct {
	db *gorm.DB
}

func NewApprovalRepository(db *gorm.DB) ApprovalRepository {
	return &approvalRepository{db: db}
}

func (r *approvalRepository) FindStructures(menu string, status string) ([]ApprovalStructure, error) {
	var list []ApprovalStructure
	query := r.db.Preload("RequestStructure").Preload("ApprovalStructure").Order("created_at desc")

	if menu != "" && menu != "ALL" {
		query = query.Where("menu ILIKE ?", "%"+menu+"%")
	}
	if status != "" && status != "ALL" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *approvalRepository) GetStructureByID(id uuid.UUID) (*ApprovalStructure, error) {
	var item ApprovalStructure
	if err := r.db.Preload("RequestStructure").Preload("ApprovalStructure").First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *approvalRepository) CreateStructure(item *ApprovalStructure) error {
	return r.db.Create(item).Error
}

func (r *approvalRepository) UpdateStructure(item *ApprovalStructure) error {
	return r.db.Save(item).Error
}

func (r *approvalRepository) DeleteStructure(id uuid.UUID, deletedBy *uuid.UUID) error {
	if deletedBy != nil {
		_ = r.db.Model(&ApprovalStructure{}).Where("id = ?", id).Update("deleted_by", *deletedBy).Error
	}
	return r.db.Delete(&ApprovalStructure{}, "id = ?", id).Error
}

func (r *approvalRepository) FindHistoriesByRequestID(requestID uuid.UUID) ([]ApprovalHistory, error) {
	var list []ApprovalHistory
	if err := r.db.Preload("Approver").Preload("Approver.Role").
		Where("request_id = ?", requestID).
		Order("sequence_order asc, action_timestamp asc").
		Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *approvalRepository) CreateHistory(history *ApprovalHistory) error {
	return r.db.Create(history).Error
}

func (r *approvalRepository) GetNextSequenceOrder(requestID uuid.UUID) (int, error) {
	var count int64
	r.db.Model(&ApprovalHistory{}).Where("request_id = ?", requestID).Count(&count)
	return int(count) + 1, nil
}
