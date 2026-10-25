package purchase_order

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"template/modules/procurement_request"
	"template/modules/supplier"
	"template/modules/user"
)

type PurchaseOrder struct {
	ID               uuid.UUID                             `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RequestID        uuid.UUID                             `json:"request_id" gorm:"type:uuid;not null;index"`
	Request          procurement_request.ProcurementRequest `json:"request" gorm:"foreignKey:RequestID"`
	SupplierID       uuid.UUID                             `json:"supplier_id" gorm:"type:uuid;not null"`
	Supplier         supplier.Supplier                     `json:"supplier" gorm:"foreignKey:SupplierID"`
	PONumber         string                                `json:"po_number" gorm:"column:po_number;type:varchar(100);unique;not null;index"`
	PODate           time.Time                             `json:"po_date" gorm:"not null"`
	TotalAmount      float64                               `json:"total_amount" gorm:"column:total_amount;type:numeric(18,2);not null"`
	DeliveryDeadline time.Time                             `json:"delivery_deadline" gorm:"not null"`
	Status           string                                `json:"status" gorm:"type:varchar(50);not null;default:'ISSUED'"` // ISSUED, IN_RECEIVING, COMPLETED
	ContractType     string                                `json:"contract_type" gorm:"type:varchar(50)"`
	IsAddendum       bool                                  `json:"is_addendum" gorm:"default:false"`
	AddendumNumber   string                                `json:"addendum_number" gorm:"type:varchar(100)"`
	PICResolutionID  *uuid.UUID                            `json:"pic_resolution_id" gorm:"type:uuid"`
	PICResolution    *user.User                            `json:"pic_resolution,omitempty" gorm:"foreignKey:PICResolutionID"`
	Notes            string                                `json:"notes" gorm:"type:text"`
	CreatedByID      *uuid.UUID                            `json:"created_by" gorm:"column:created_by;type:uuid"`
	Creator          *user.User                            `json:"creator,omitempty" gorm:"foreignKey:CreatedByID"`
	UpdatedByID      *uuid.UUID                            `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID      *uuid.UUID                            `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt        time.Time                             `json:"created_at"`
	UpdatedAt        time.Time                             `json:"updated_at"`
	DeletedAt        gorm.DeletedAt                        `json:"deleted_at,omitempty" gorm:"index"`
}

func (p *PurchaseOrder) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	if p.Status == "" {
		p.Status = "ISSUED"
	}
	return nil
}

type BankGuarantee struct {
	ID                 uuid.UUID                              `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RequestID          *uuid.UUID                             `json:"request_id" gorm:"type:uuid"`
	Request            *procurement_request.ProcurementRequest `json:"request,omitempty" gorm:"foreignKey:RequestID"`
	SupplierID         uuid.UUID                              `json:"supplier_id" gorm:"type:uuid;not null"`
	Supplier           supplier.Supplier                      `json:"supplier" gorm:"foreignKey:SupplierID"`
	GuaranteeType      string                                 `json:"guarantee_type" gorm:"type:varchar(50);not null"` // PENAWARAN, PELAKSANAAN, PEMELIHARAAN
	SerialNumber       string                                 `json:"serial_number" gorm:"type:varchar(100);not null"`
	IssuingBank        string                                 `json:"issuing_bank" gorm:"type:varchar(150);not null"`
	Branch             string                                 `json:"branch" gorm:"type:varchar(150)"`
	Amount             float64                                `json:"amount" gorm:"type:numeric(18,2);not null"`
	ValidFrom          time.Time                              `json:"valid_from" gorm:"not null"`
	ValidUntil         time.Time                              `json:"valid_until" gorm:"not null"`
	ClaimDeadline      time.Time                              `json:"claim_deadline" gorm:"not null"`
	ConfirmationStatus string                                 `json:"confirmation_status" gorm:"type:varchar(50);default:'BELUM_DIKONFIRMASI'"` // BELUM_DIKONFIRMASI, TERKONFIRMASI_VALID, TIDAK_TERDAFTAR
	Notes              string                                 `json:"notes" gorm:"type:text"`
	CreatedByID        *uuid.UUID                             `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID        *uuid.UUID                             `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID        *uuid.UUID                             `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt          time.Time                              `json:"created_at"`
	UpdatedAt          time.Time                              `json:"updated_at"`
	DeletedAt          gorm.DeletedAt                         `json:"deleted_at,omitempty" gorm:"index"`
}

func (b *BankGuarantee) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	if b.ConfirmationStatus == "" {
		b.ConfirmationStatus = "BELUM_DIKONFIRMASI"
	}
	return nil
}

func MigratePurchaseOrder(db *gorm.DB) error {
	if err := db.AutoMigrate(&PurchaseOrder{}); err != nil {
		return err
	}
	return db.AutoMigrate(&BankGuarantee{})
}
