package general

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type GeneralRepository interface {
	FindAll(group string, search string, status string) ([]General, error)
	GetByID(id uuid.UUID) (*General, error)
	Create(general *General) error
	Update(general *General) error
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
}

type generalRepository struct {
	db *gorm.DB
}

func NewGeneralRepository(db *gorm.DB) GeneralRepository {
	return &generalRepository{db: db}
}

func (r *generalRepository) FindAll(group string, search string, status string) ([]General, error) {
	var items []General
	query := r.db.Order("\"group\" asc, description asc")

	if group != "" && group != "ALL" {
		query = query.Where("LOWER(\"group\") = LOWER(?)", group)
	}
	if search != "" {
		query = query.Where("description ILIKE ? OR \"group\" ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if status != "" && status != "ALL" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *generalRepository) GetByID(id uuid.UUID) (*General, error) {
	var item General
	if err := r.db.First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *generalRepository) Create(general *General) error {
	return r.db.Create(general).Error
}

func (r *generalRepository) Update(general *General) error {
	return r.db.Save(general).Error
}

func (r *generalRepository) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	if deletedBy != nil {
		_ = r.db.Model(&General{}).Where("id = ?", id).Update("deleted_by", *deletedBy).Error
	}
	return r.db.Delete(&General{}, "id = ?", id).Error
}
