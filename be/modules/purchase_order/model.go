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
	POAmount         float64                               `json:"po_amount" gorm:"column:po_amount;type:numeric(18,2)"`
	PPNAmount        float64                               `json:"ppn_amount" gorm:"column:ppn_amount;type:numeric(18,2)"`
	ContractAmount   float64                               `json:"contract_amount" gorm:"column:contract_amount;type:numeric(18,2)"`
	TotalAmount      float64                               `json:"total_amount" gorm:"column:total_amount;type:numeric(18,2);not null"`
	DeliveryLocation string                                `json:"delivery_location" gorm:"column:delivery_location;type:varchar(255)"`
	PaymentTerms     string                                `json:"payment_terms" gorm:"column:payment_terms;type:varchar(255)"`
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

// 4.8.18 Addendum PO
type POAddendum struct {
	ID             uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	AddendumNumber string         `json:"addendum_number" gorm:"column:addendum_number;type:varchar(100);unique;not null"`
	AddendumDate   time.Time      `json:"addendum_date" gorm:"not null"`
	POID           uuid.UUID      `json:"po_id" gorm:"type:uuid;not null;index"`
	PO             PurchaseOrder  `json:"po" gorm:"foreignKey:POID"`
	JobName        string         `json:"job_name" gorm:"type:varchar(255)"`
	CompanyName    string         `json:"company_name" gorm:"type:varchar(200)"`
	TotalAmount    float64        `json:"total_amount" gorm:"type:numeric(18,2);default:0.00"`
	Reason         string         `json:"reason" gorm:"type:text"`
	SupportingFile string         `json:"supporting_file" gorm:"type:varchar(255)"`
	Notes          string         `json:"notes" gorm:"type:text"`
	Status         string         `json:"status" gorm:"type:varchar(50);default:'IN_PROCESS'"`
	CreatedByID    *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID    *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID    *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (pa *POAddendum) BeforeCreate(tx *gorm.DB) error {
	if pa.ID == uuid.Nil {
		pa.ID = uuid.New()
	}
	if pa.Status == "" {
		pa.Status = "IN_PROCESS"
	}
	return nil
}

// 4.8.19 PO Delivery Order
type PODeliveryOrder struct {
	ID             uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	DONumber       string         `json:"do_number" gorm:"column:do_number;type:varchar(100);unique;not null"`
	DODate         time.Time      `json:"do_date" gorm:"not null"`
	ContractNumber string         `json:"contract_number" gorm:"type:varchar(100);not null"`
	RequestNumber  string         `json:"request_number" gorm:"type:varchar(100)"`
	CompanyName    string         `json:"company_name" gorm:"type:varchar(200);not null"`
	JobName        string         `json:"job_name" gorm:"type:varchar(255)"`
	OrderedQuantity int           `json:"ordered_quantity" gorm:"column:ordered_quantity;default:1"`
	TotalAmount    float64        `json:"total_amount" gorm:"type:numeric(18,2);default:0.00"`
	Reason         string         `json:"reason" gorm:"type:text"`
	SupportingFile string         `json:"supporting_file" gorm:"type:varchar(255)"`
	Notes          string         `json:"notes" gorm:"type:text"`
	Status         string         `json:"status" gorm:"type:varchar(50);default:'IN_PROCESS'"`
	CreatedByID    *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID    *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID    *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (pdo *PODeliveryOrder) BeforeCreate(tx *gorm.DB) error {
	if pdo.ID == uuid.Nil {
		pdo.ID = uuid.New()
	}
	if pdo.Status == "" {
		pdo.Status = "IN_PROCESS"
	}
	return nil
}

// 4.5 Checklist Dokumen Supplier
type ChecklistSupplier struct {
	ID          uuid.UUID               `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FormNumber  string                  `json:"form_number" gorm:"column:form_number;type:varchar(100);unique;not null"`
	FormDate    time.Time               `json:"form_date" gorm:"not null"`
	PONumber    string                  `json:"po_number" gorm:"type:varchar(100);not null"`
	CompanyName string                  `json:"company_name" gorm:"type:varchar(200);not null"`
	JobName     string                  `json:"job_name" gorm:"type:varchar(255)"`
	Notes       string                  `json:"notes" gorm:"type:text"`
	Status      string                  `json:"status" gorm:"type:varchar(50);default:'POST'"` // IN_PROCESS, POST
	Items       []ChecklistSupplierItem `json:"items,omitempty" gorm:"foreignKey:ChecklistID;constraint:OnDelete:CASCADE"`
	CreatedByID *uuid.UUID              `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID *uuid.UUID              `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID *uuid.UUID              `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt   time.Time               `json:"created_at"`
	UpdatedAt   time.Time               `json:"updated_at"`
	DeletedAt   gorm.DeletedAt          `json:"deleted_at,omitempty" gorm:"index"`
}

func (cs *ChecklistSupplier) BeforeCreate(tx *gorm.DB) error {
	if cs.ID == uuid.Nil {
		cs.ID = uuid.New()
	}
	if cs.Status == "" {
		cs.Status = "POST"
	}
	return nil
}

type ChecklistSupplierItem struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ChecklistID uuid.UUID      `json:"checklist_id" gorm:"type:uuid;not null;index"`
	Requirement string         `json:"requirement" gorm:"type:varchar(200);not null"` // e.g. SURAT GARANSI BARANG, SURAT GARANSI JASA, SURAT KEASLIAN BARANG, SURAT JALAN
	IsAvailable bool           `json:"is_available" gorm:"default:true"`
	Notes       string         `json:"notes" gorm:"type:varchar(255)"` // e.g. "3 rangkap"
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (csi *ChecklistSupplierItem) BeforeCreate(tx *gorm.DB) error {
	if csi.ID == uuid.Nil {
		csi.ID = uuid.New()
	}
	return nil
}

func MigratePurchaseOrder(db *gorm.DB) error {
	if err := db.AutoMigrate(&PurchaseOrder{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&BankGuarantee{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&POAddendum{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&PODeliveryOrder{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&ChecklistSupplier{}); err != nil {
		return err
	}
	return db.AutoMigrate(&ChecklistSupplierItem{})
}
