package supplier_evaluation

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"template/modules/purchase_order"
	"template/modules/user"
)

type SupplierPerformanceEvaluation struct {
	ID               uuid.UUID                    `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	POID             uuid.UUID                    `json:"po_id" gorm:"type:uuid;not null;index"`
	PO               purchase_order.PurchaseOrder `json:"po" gorm:"foreignKey:POID"`
	EvaluatorID      uuid.UUID                    `json:"evaluator_id" gorm:"type:uuid;not null"`
	Evaluator        user.User                    `json:"evaluator" gorm:"foreignKey:EvaluatorID"`
	Category         string                       `json:"category" gorm:"type:varchar(50);not null"` // K3, LINGKUNGAN, MUTU_WAKTU, INTEGRITAS_HARGA
	WeightPercentage float64                      `json:"weight_percentage" gorm:"type:numeric(5,2);not null"`
	Score            float64                      `json:"score" gorm:"type:numeric(3,2);not null"` // 0.00 to 5.00
	Grade            string                       `json:"grade" gorm:"type:varchar(5)"` // A, B, C, D
	Notes            string                       `json:"notes" gorm:"type:text"`
	CreatedByID      *uuid.UUID                   `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID      *uuid.UUID                   `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID      *uuid.UUID                   `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt        time.Time                    `json:"created_at"`
	UpdatedAt        time.Time                    `json:"updated_at"`
	DeletedAt        gorm.DeletedAt               `json:"deleted_at,omitempty" gorm:"index"`
}

func (e *SupplierPerformanceEvaluation) BeforeCreate(tx *gorm.DB) error {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}
	if e.Score > 4.0 {
		e.Grade = "A"
	} else if e.Score > 3.0 {
		e.Grade = "B"
	} else if e.Score > 2.5 {
		e.Grade = "C"
	} else {
		e.Grade = "D"
	}
	return nil
}

func MigrateSupplierEvaluation(db *gorm.DB) error {
	return db.AutoMigrate(&SupplierPerformanceEvaluation{})
}
