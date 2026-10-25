package owner_estimate

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"template/modules/engineering_estimate"
	"template/modules/procurement_request"
	"template/modules/supplier"
	"template/modules/user"
)

type OwnerEstimate struct {
	ID          uuid.UUID                                `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	HPEID       uuid.UUID                                `json:"hpe_id" gorm:"type:uuid;not null;index"`
	HPE         engineering_estimate.EngineeringEstimate `json:"hpe" gorm:"foreignKey:HPEID"`
	HPSNumber   string                                   `json:"hps_number" gorm:"column:hps_number;type:varchar(100);unique;not null"`
	TotalHPS    float64                                  `json:"total_hps" gorm:"column:total_hps;type:numeric(18,2);not null"`
	Status      string                                   `json:"status" gorm:"type:varchar(50);not null;default:'DRAFT'"`
	Notes       string                                   `json:"notes" gorm:"type:text"`
	CreatedByID *uuid.UUID                               `json:"created_by" gorm:"column:created_by;type:uuid"`
	Creator     *user.User                               `json:"creator,omitempty" gorm:"foreignKey:CreatedByID"`
	UpdatedByID *uuid.UUID                               `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID *uuid.UUID                               `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt   time.Time                                `json:"created_at"`
	UpdatedAt   time.Time                                `json:"updated_at"`
	DeletedAt   gorm.DeletedAt                           `json:"deleted_at,omitempty" gorm:"index"`
}

func (o *OwnerEstimate) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	if o.Status == "" {
		o.Status = "DRAFT"
	}
	return nil
}

type ProcurementTenderEvent struct {
	ID             uuid.UUID                             `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RequestID      uuid.UUID                             `json:"request_id" gorm:"type:uuid;not null;index"`
	Request        procurement_request.ProcurementRequest `json:"request" gorm:"foreignKey:RequestID"`
	EventType      string                                `json:"event_type" gorm:"type:varchar(50);not null"` // AANWIJZING, BAPP_1, BAEP_1, BAPP_2, BAEP_2, BANH, BAHP
	DocumentNumber string                                `json:"document_number" gorm:"type:varchar(100);unique;not null"`
	EventDate      time.Time                             `json:"event_date" gorm:"not null"`
	MeetingNotes   string                                `json:"meeting_notes" gorm:"type:text"`
	Status         string                                `json:"status" gorm:"type:varchar(50);not null;default:'DRAFT'"`
	CreatedByID    *uuid.UUID                            `json:"created_by" gorm:"column:created_by;type:uuid"`
	Creator        *user.User                            `json:"creator,omitempty" gorm:"foreignKey:CreatedByID"`
	UpdatedByID    *uuid.UUID                            `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID    *uuid.UUID                            `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	Quotations     []TenderVendorQuotation               `json:"quotations,omitempty" gorm:"foreignKey:TenderEventID;constraint:OnDelete:CASCADE"`
	CreatedAt      time.Time                             `json:"created_at"`
	UpdatedAt      time.Time                             `json:"updated_at"`
	DeletedAt      gorm.DeletedAt                        `json:"deleted_at,omitempty" gorm:"index"`
}

func (e *ProcurementTenderEvent) BeforeCreate(tx *gorm.DB) error {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}
	if e.Status == "" {
		e.Status = "DRAFT"
	}
	return nil
}

type TenderVendorQuotation struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	TenderEventID   uuid.UUID      `json:"tender_event_id" gorm:"type:uuid;not null;index"`
	SupplierID      uuid.UUID      `json:"supplier_id" gorm:"type:uuid;not null"`
	Supplier        supplier.Supplier `json:"supplier" gorm:"foreignKey:SupplierID"`
	QuotedPrice     float64        `json:"quoted_price" gorm:"type:numeric(18,2);not null"`
	NegotiatedPrice float64        `json:"negotiated_price" gorm:"type:numeric(18,2)"`
	AdminPassed     bool           `json:"admin_passed" gorm:"default:false"`
	TechPassed      bool           `json:"tech_passed" gorm:"default:false"`
	IsWinner        bool           `json:"is_winner" gorm:"default:false"`
	Notes           string         `json:"notes" gorm:"type:text"`
	CreatedByID     *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID     *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID     *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (q *TenderVendorQuotation) BeforeCreate(tx *gorm.DB) error {
	if q.ID == uuid.Nil {
		q.ID = uuid.New()
	}
	return nil
}

func MigrateOwnerEstimate(db *gorm.DB) error {
	if err := db.AutoMigrate(&OwnerEstimate{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&ProcurementTenderEvent{}); err != nil {
		return err
	}
	return db.AutoMigrate(&TenderVendorQuotation{})
}
