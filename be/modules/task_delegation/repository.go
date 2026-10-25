package task_delegation

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TaskDelegationRepository interface {
	FindAll(search string) ([]TaskDelegation, error)
	GetByID(id uuid.UUID) (*TaskDelegation, error)
	Create(d *TaskDelegation) error
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
}

type taskDelegationRepository struct {
	db *gorm.DB
}

func NewTaskDelegationRepository(db *gorm.DB) TaskDelegationRepository {
	return &taskDelegationRepository{db: db}
}

func (r *taskDelegationRepository) FindAll(search string) ([]TaskDelegation, error) {
	var list []TaskDelegation
	query := r.db.Preload("OriginalUser").Preload("ReplacementUser").Preload("AssignedBy").Preload("Request").
		Order("created_at desc")

	if search != "" {
		query = query.Where("task_type ILIKE ? OR notes ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *taskDelegationRepository) GetByID(id uuid.UUID) (*TaskDelegation, error) {
	var item TaskDelegation
	if err := r.db.Preload("OriginalUser").Preload("ReplacementUser").Preload("AssignedBy").Preload("Request").
		First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *taskDelegationRepository) Create(d *TaskDelegation) error {
	return r.db.Create(d).Error
}

func (r *taskDelegationRepository) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	if deletedBy != nil {
		_ = r.db.Model(&TaskDelegation{}).Where("id = ?", id).Update("deleted_by", *deletedBy).Error
	}
	return r.db.Delete(&TaskDelegation{}, "id = ?", id).Error
}
