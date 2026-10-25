package supplier

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SupplierRepository interface {
	FindAll(search string, status string, page int, limit int) ([]Supplier, int64, error)
	GetByID(id uuid.UUID) (*Supplier, error)
	GetByCode(code string) (*Supplier, error)
	Create(supplier *Supplier) error
	Update(supplier *Supplier) error
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
}

type supplierRepository struct {
	db *gorm.DB
}

func NewSupplierRepository(db *gorm.DB) SupplierRepository {
	return &supplierRepository{db: db}
}

func (r *supplierRepository) FindAll(search string, status string, page int, limit int) ([]Supplier, int64, error) {
	var suppliers []Supplier
	var total int64

	query := r.db.Model(&Supplier{})

	if search != "" {
		query = query.Where("name ILIKE ? OR code ILIKE ? OR pic_name ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
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

	if err := query.Order("name asc").Find(&suppliers).Error; err != nil {
		return nil, 0, err
	}
	return suppliers, total, nil
}

func (r *supplierRepository) GetByID(id uuid.UUID) (*Supplier, error) {
	var supplier Supplier
	if err := r.db.First(&supplier, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &supplier, nil
}

func (r *supplierRepository) GetByCode(code string) (*Supplier, error) {
	var supplier Supplier
	if err := r.db.Where("code = ?", code).First(&supplier).Error; err != nil {
		return nil, err
	}
	return &supplier, nil
}

func (r *supplierRepository) Create(supplier *Supplier) error {
	return r.db.Create(supplier).Error
}

func (r *supplierRepository) Update(supplier *Supplier) error {
	return r.db.Save(supplier).Error
}

func (r *supplierRepository) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	if deletedBy != nil {
		_ = r.db.Model(&Supplier{}).Where("id = ?", id).Update("deleted_by", *deletedBy).Error
	}
	return r.db.Delete(&Supplier{}, "id = ?", id).Error
}
