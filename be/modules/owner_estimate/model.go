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

// 4.8.1 Distribusi Pengadaan
type ProcurementAssignment struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FormNumber      string         `json:"form_number" gorm:"column:form_number;type:varchar(100);unique;not null"`
	FormDate        time.Time      `json:"form_date" gorm:"not null"`
	HPENumber       string         `json:"hpe_number" gorm:"type:varchar(100);not null"`
	DistributedToID uuid.UUID      `json:"distributed_to_id" gorm:"type:uuid;not null"`
	DistributedTo   *user.User     `json:"distributed_to,omitempty" gorm:"foreignKey:DistributedToID"`
	SupportingFile  string         `json:"supporting_file" gorm:"type:varchar(255)"`
	Notes           string         `json:"notes" gorm:"type:text"`
	Status          string         `json:"status" gorm:"type:varchar(50);default:'POST'"`
	CreatedByID     *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID     *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID     *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (pa *ProcurementAssignment) BeforeCreate(tx *gorm.DB) error {
	if pa.ID == uuid.Nil {
		pa.ID = uuid.New()
	}
	if pa.Status == "" {
		pa.Status = "POST"
	}
	return nil
}

// 4.8.2 SP Mulai Kerja (SPMK)
type SPMK struct {
	ID                uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FormNumber        string         `json:"form_number" gorm:"column:form_number;type:varchar(100);unique;not null"`
	FormDate          time.Time      `json:"form_date" gorm:"not null"`
	RequestNumber     string         `json:"request_number" gorm:"type:varchar(100);not null"`
	JobName           string         `json:"job_name" gorm:"type:varchar(255);not null"`
	CompanyName       string         `json:"company_name" gorm:"type:varchar(200);not null"`
	CompanyAddress    string         `json:"company_address" gorm:"type:text"`
	OfficialMemoNo    string         `json:"official_memo_no" gorm:"type:varchar(100)"`
	OfficialMemoTitle string         `json:"official_memo_title" gorm:"type:varchar(255)"`
	OfficialMemoDate  *time.Time     `json:"official_memo_date"`
	SupportingFile    string         `json:"supporting_file" gorm:"type:varchar(255)"`
	Notes             string         `json:"notes" gorm:"type:text"`
	Status            string         `json:"status" gorm:"type:varchar(50);default:'IN_PROCESS'"`
	CreatedByID       *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID       *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID       *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (s *SPMK) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	if s.Status == "" {
		s.Status = "IN_PROCESS"
	}
	return nil
}

// 4.8.4 Permintaan Penawaran (RFQ)
type QuotationRequest struct {
	ID                 uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FormNumber         string         `json:"form_number" gorm:"column:form_number;type:varchar(100);unique;not null"`
	FormDate           time.Time      `json:"form_date" gorm:"not null"`
	HPSNumber          string         `json:"hps_number" gorm:"type:varchar(100);not null"`
	JobName            string         `json:"job_name" gorm:"type:varchar(255);not null"`
	DeliveryLocation   string         `json:"delivery_location" gorm:"type:varchar(200)"`
	DocPickupDateStart *time.Time     `json:"doc_pickup_date_start"`
	DocPickupDateEnd   *time.Time     `json:"doc_pickup_date_end"`
	DocPickupTime      string         `json:"doc_pickup_time" gorm:"type:varchar(50)"`
	DocSubmitDateStart *time.Time     `json:"doc_submit_date_start"`
	DocSubmitDateEnd   *time.Time     `json:"doc_submit_date_end"`
	DocSubmitTime      string         `json:"doc_submit_time" gorm:"type:varchar(50)"`
	NeedAanwijzing     bool           `json:"need_aanwijzing" gorm:"default:false"`
	SupportingFile     string         `json:"supporting_file" gorm:"type:varchar(255)"`
	Notes              string         `json:"notes" gorm:"type:text"`
	Status             string         `json:"status" gorm:"type:varchar(50);default:'IN_PROCESS'"`
	CreatedByID        *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID        *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID        *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (q *QuotationRequest) BeforeCreate(tx *gorm.DB) error {
	if q.ID == uuid.Nil {
		q.ID = uuid.New()
	}
	if q.Status == "" {
		q.Status = "IN_PROCESS"
	}
	return nil
}

// 4.8.5 Pengumuman & Permintaan Penawaran
type ProcurementAnnouncement struct {
	ID                uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FormNumber        string         `json:"form_number" gorm:"column:form_number;type:varchar(100);unique;not null"`
	FormDate          time.Time      `json:"form_date" gorm:"not null"`
	HPSNumber         string         `json:"hps_number" gorm:"type:varchar(100);not null"`
	JobName           string         `json:"job_name" gorm:"type:varchar(255);not null"`
	Competency        string         `json:"competency" gorm:"type:varchar(200)"`
	RegistrationEmail string         `json:"registration_email" gorm:"type:varchar(150)"`
	PhoneExt          string         `json:"phone_ext" gorm:"type:varchar(50)"`
	RegDateStart      *time.Time     `json:"reg_date_start"`
	RegDateEnd        *time.Time     `json:"reg_date_end"`
	RegTime           string         `json:"reg_time" gorm:"type:varchar(50)"`
	AanwijzingDate    *time.Time     `json:"aanwijzing_date"`
	DocSubmitDate     *time.Time     `json:"doc_submit_date"`
	DeliveryLocation  string         `json:"delivery_location" gorm:"type:varchar(200)"`
	SupportingFile    string         `json:"supporting_file" gorm:"type:varchar(255)"`
	Notes             string         `json:"notes" gorm:"type:text"`
	Status            string         `json:"status" gorm:"type:varchar(50);default:'IN_PROCESS'"`
	CreatedByID       *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID       *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID       *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (pa *ProcurementAnnouncement) BeforeCreate(tx *gorm.DB) error {
	if pa.ID == uuid.Nil {
		pa.ID = uuid.New()
	}
	if pa.Status == "" {
		pa.Status = "IN_PROCESS"
	}
	return nil
}

// 4.8.16 Kontrak Payung
type UmbrellaContract struct {
	ID                 uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ContractNumber     string         `json:"contract_number" gorm:"column:contract_number;type:varchar(100);unique;not null"`
	ContractDate       time.Time      `json:"contract_date" gorm:"not null"`
	BANHNumber         string         `json:"banh_number" gorm:"type:varchar(100)"`
	RFQNumber          string         `json:"rfq_number" gorm:"type:varchar(100)"`
	SupplierID         uuid.UUID      `json:"supplier_id" gorm:"type:uuid;not null"`
	Supplier           supplier.Supplier `json:"supplier" gorm:"foreignKey:SupplierID"`
	ContractType       string         `json:"contract_type" gorm:"type:varchar(50);default:'KONTRAK_PAYUNG'"`
	DeliveryTerms      string         `json:"delivery_terms" gorm:"type:varchar(100)"`
	ContractTemplateID *uuid.UUID     `json:"contract_template_id" gorm:"type:uuid"`
	TotalAmount        float64        `json:"total_amount" gorm:"type:numeric(18,2);default:0.00"`
	SupportingFile     string         `json:"supporting_file" gorm:"type:varchar(255)"`
	Notes              string         `json:"notes" gorm:"type:text"`
	Status             string         `json:"status" gorm:"type:varchar(50);default:'IN_PROCESS'"`
	CreatedByID        *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID        *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID        *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (uc *UmbrellaContract) BeforeCreate(tx *gorm.DB) error {
	if uc.ID == uuid.Nil {
		uc.ID = uuid.New()
	}
	if uc.Status == "" {
		uc.Status = "IN_PROCESS"
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
	if err := db.AutoMigrate(&TenderVendorQuotation{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&ProcurementAssignment{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&SPMK{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&QuotationRequest{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&ProcurementAnnouncement{}); err != nil {
		return err
	}
	return db.AutoMigrate(&UmbrellaContract{})
}
