package master_document

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MasterDocumentRepository interface {
	FindAll(search string, status string) ([]MasterDocument, error)
	FindAllPaginated(search string, status string, page int, limit int) ([]MasterDocument, int64, error)
	GetByID(id uuid.UUID) (*MasterDocument, error)
	Create(doc *MasterDocument) error
	Update(doc *MasterDocument) error
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
}

type masterDocumentRepository struct {
	db *gorm.DB
}

func NewMasterDocumentRepository(db *gorm.DB) MasterDocumentRepository {
	return &masterDocumentRepository{db: db}
}

func (r *masterDocumentRepository) FindAll(search string, status string) ([]MasterDocument, error) {
	var items []MasterDocument
	query := r.db.Order("document_name asc")

	if search != "" {
		query = query.Where("document_name ILIKE ?", "%"+search+"%")
	}
	if status != "" && status != "ALL" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *masterDocumentRepository) FindAllPaginated(search string, status string, page int, limit int) ([]MasterDocument, int64, error) {
	var items []MasterDocument
	var total int64
	query := r.db.Model(&MasterDocument{})

	if search != "" {
		query = query.Where("document_name ILIKE ?", "%"+search+"%")
	}
	if status != "" && status != "ALL" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.Order("document_name asc").Limit(limit).Offset(offset).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	return items, total, nil
}

func (r *masterDocumentRepository) GetByID(id uuid.UUID) (*MasterDocument, error) {
	var item MasterDocument
	if err := r.db.First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *masterDocumentRepository) Create(doc *MasterDocument) error {
	return r.db.Create(doc).Error
}

func (r *masterDocumentRepository) Update(doc *MasterDocument) error {
	return r.db.Save(doc).Error
}

func (r *masterDocumentRepository) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	return r.db.Model(&MasterDocument{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"deleted_by": deletedBy,
			"deleted_at": time.Now(),
		}).Error
}

