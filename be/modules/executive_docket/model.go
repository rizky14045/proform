package executive_docket

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"template/modules/procurement_request"
	"template/modules/purchase_order"
	"template/modules/user"
)

type ExecutiveDocket struct {
	ID              uuid.UUID                              `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RequestID       uuid.UUID                              `json:"request_id" gorm:"type:uuid;unique;not null"`
	Request         procurement_request.ProcurementRequest `json:"request" gorm:"foreignKey:RequestID"`
	POID            *uuid.UUID                             `json:"po_id" gorm:"type:uuid"`
	PO              *purchase_order.PurchaseOrder          `json:"po,omitempty" gorm:"foreignKey:POID"`
	DocketNumber    string                                 `json:"docket_number" gorm:"type:varchar(100);unique;not null"`
	CompiledSummary string                                 `json:"compiled_summary" gorm:"type:text;not null"` // JSON snapshot
	PDFFilePath     string                                 `json:"pdf_file_path" gorm:"type:varchar(255)"`
	DocumentHash    string                                 `json:"document_hash" gorm:"type:varchar(64);not null"`
	IsSigned        bool                                   `json:"is_signed" gorm:"default:false"`
	CreatedByID     *uuid.UUID                             `json:"created_by" gorm:"type:uuid;column:created_by"`
	UpdatedByID     *uuid.UUID                             `json:"updated_by" gorm:"type:uuid;column:updated_by"`
	DeletedByID     *uuid.UUID                             `json:"deleted_by" gorm:"type:uuid;column:deleted_by"`
	CreatedAt       time.Time                              `json:"created_at"`
	UpdatedAt       time.Time                              `json:"updated_at"`
	DeletedAt       gorm.DeletedAt                         `json:"deleted_at" gorm:"index;column:deleted_at"`
}

func (d *ExecutiveDocket) BeforeCreate(tx *gorm.DB) error {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}
	return nil
}

type BSREDigitalSignature struct {
	ID              uuid.UUID       `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	DocketID        uuid.UUID       `json:"docket_id" gorm:"type:uuid;not null;index"`
	Docket          ExecutiveDocket `json:"docket" gorm:"foreignKey:DocketID"`
	SignerID        uuid.UUID       `json:"signer_id" gorm:"type:uuid;not null"`
	Signer          user.User       `json:"signer" gorm:"foreignKey:SignerID"`
	SignerNIK       string          `json:"signer_nik" gorm:"type:varchar(16);not null"`
	SignRequestID   string          `json:"sign_request_id" gorm:"type:varchar(100)"`
	BSREStatus      string          `json:"bsre_status" gorm:"type:varchar(50);not null"` // PENDING, SUCCESS, FAILED
	SignedPDFURL    string          `json:"signed_pdf_url" gorm:"type:varchar(255)"`
	SignatureQRData string          `json:"signature_qr_data" gorm:"type:text"`
	ErrorMessage    string          `json:"error_message" gorm:"type:text"`
	SignedAt        *time.Time      `json:"signed_at"`
	CreatedByID     *uuid.UUID      `json:"created_by" gorm:"type:uuid;column:created_by"`
	UpdatedByID     *uuid.UUID      `json:"updated_by" gorm:"type:uuid;column:updated_by"`
	DeletedByID     *uuid.UUID      `json:"deleted_by" gorm:"type:uuid;column:deleted_by"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
	DeletedAt       gorm.DeletedAt  `json:"deleted_at" gorm:"index;column:deleted_at"`
}

func (s *BSREDigitalSignature) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

func MigrateExecutiveDocket(db *gorm.DB) error {
	if err := db.AutoMigrate(&ExecutiveDocket{}); err != nil {
		return err
	}
	return db.AutoMigrate(&BSREDigitalSignature{})
}

