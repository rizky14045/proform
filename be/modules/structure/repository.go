package structure

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type StructureRepository interface {
	FindAll(search string, status string) ([]Structure, error)
	GetByID(id uuid.UUID) (*Structure, error)
	GetByCode(code string) (*Structure, error)
	Create(structure *Structure) error
	Update(structure *Structure) error
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
}

type structureRepository struct {
	db *gorm.DB
}

func NewStructureRepository(db *gorm.DB) StructureRepository {
	return &structureRepository{db: db}
}

func (r *structureRepository) FindAll(search string, status string) ([]Structure, error) {
	var structures []Structure
	query := r.db.Preload("Parent").Order("name asc")

	if search != "" {
		query = query.Where("name ILIKE ? OR code ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	if status != "" && status != "ALL" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&structures).Error; err != nil {
		return nil, err
	}
	return structures, nil
}

func (r *structureRepository) GetByID(id uuid.UUID) (*Structure, error) {
	var structure Structure
	if err := r.db.Preload("Parent").First(&structure, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &structure, nil
}

func (r *structureRepository) GetByCode(code string) (*Structure, error) {
	var structure Structure
	if err := r.db.Where("code = ?", code).First(&structure).Error; err != nil {
		return nil, err
	}
	return &structure, nil
}

func (r *structureRepository) Create(structure *Structure) error {
	return r.db.Create(structure).Error
}

func (r *structureRepository) Update(structure *Structure) error {
	return r.db.Save(structure).Error
}

func (r *structureRepository) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	if deletedBy != nil {
		_ = r.db.Model(&Structure{}).Where("id = ?", id).Update("deleted_by", *deletedBy).Error
	}
	return r.db.Delete(&Structure{}, "id = ?", id).Error
}
