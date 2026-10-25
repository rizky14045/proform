package supplier_evaluation

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SupplierEvaluationRepository interface {
	FindByPOID(poID uuid.UUID) ([]SupplierPerformanceEvaluation, error)
	CreateBatch(items []SupplierPerformanceEvaluation) error
	GetByID(id uuid.UUID) (*SupplierPerformanceEvaluation, error)
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
}

type supplierEvaluationRepository struct {
	db *gorm.DB
}

func NewSupplierEvaluationRepository(db *gorm.DB) SupplierEvaluationRepository {
	return &supplierEvaluationRepository{db: db}
}

func (r *supplierEvaluationRepository) FindByPOID(poID uuid.UUID) ([]SupplierPerformanceEvaluation, error) {
	var list []SupplierPerformanceEvaluation
	if err := r.db.Preload("PO.Supplier").Preload("Evaluator").
		Where("po_id = ?", poID).
		Order("category asc").
		Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *supplierEvaluationRepository) CreateBatch(items []SupplierPerformanceEvaluation) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for i := range items {
			if items[i].ID == uuid.Nil {
				items[i].ID = uuid.New()
			}
			if items[i].Score > 4.0 {
				items[i].Grade = "A"
			} else if items[i].Score > 3.0 {
				items[i].Grade = "B"
			} else if items[i].Score > 2.5 {
				items[i].Grade = "C"
			} else {
				items[i].Grade = "D"
			}
			if err := tx.Create(&items[i]).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *supplierEvaluationRepository) GetByID(id uuid.UUID) (*SupplierPerformanceEvaluation, error) {
	var item SupplierPerformanceEvaluation
	if err := r.db.Preload("PO.Supplier").Preload("Evaluator").First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *supplierEvaluationRepository) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	if deletedBy != nil {
		_ = r.db.Model(&SupplierPerformanceEvaluation{}).Where("id = ?", id).Update("deleted_by", *deletedBy).Error
	}
	return r.db.Delete(&SupplierPerformanceEvaluation{}, "id = ?", id).Error
}
