package stock_code

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type StockCodeRepository interface {
	FindAll(search string, status string, page int, limit int) ([]StockCode, int64, error)
	GetByID(id uuid.UUID) (*StockCode, error)
	GetByCode(code string) (*StockCode, error)
	Create(stockCode *StockCode) error
	Update(stockCode *StockCode) error
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
}

type stockCodeRepository struct {
	db *gorm.DB
}

func NewStockCodeRepository(db *gorm.DB) StockCodeRepository {
	return &stockCodeRepository{db: db}
}

func (r *stockCodeRepository) FindAll(search string, status string, page int, limit int) ([]StockCode, int64, error) {
	var list []StockCode
	var total int64

	query := r.db.Model(&StockCode{})

	if search != "" {
		query = query.Where("name ILIKE ? OR code ILIKE ? OR description ILIKE ? OR part_number ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	if status == "ACTIVE" {
		query = query.Where("is_active = ?", true)
	} else if status == "INACTIVE" {
		query = query.Where("is_active = ?", false)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if limit > 0 {
		query = query.Limit(limit).Offset(offset)
	}

	if err := query.Order("code asc").Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

func (r *stockCodeRepository) GetByID(id uuid.UUID) (*StockCode, error) {
	var item StockCode
	if err := r.db.First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *stockCodeRepository) GetByCode(code string) (*StockCode, error) {
	var item StockCode
	if err := r.db.Where("code = ?", code).First(&item).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *stockCodeRepository) Create(stockCode *StockCode) error {
	return r.db.Create(stockCode).Error
}

func (r *stockCodeRepository) Update(stockCode *StockCode) error {
	return r.db.Save(stockCode).Error
}

func (r *stockCodeRepository) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	if deletedBy != nil {
		_ = r.db.Model(&StockCode{}).Where("id = ?", id).Update("deleted_by", *deletedBy).Error
	}
	return r.db.Delete(&StockCode{}, "id = ?", id).Error
}
