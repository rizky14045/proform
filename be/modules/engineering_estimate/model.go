package engineering_estimate

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"template/modules/procurement_request"
	"template/modules/supplier"
	"template/modules/user"
)

type EngineeringEstimate struct {
	ID                uuid.UUID                             `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RequestID         uuid.UUID                             `json:"request_id" gorm:"type:uuid;not null;index"`
	Request           procurement_request.ProcurementRequest `json:"request" gorm:"foreignKey:RequestID"`
	HPENumber         string                                `json:"hpe_number" gorm:"column:hpe_number;type:varchar(100);unique;not null"`
	EENumber          string                                `json:"ee_number" gorm:"column:ee_number;type:varchar(100)"`
	ProcurementMethod string                                `json:"procurement_method" gorm:"type:varchar(50);not null"` // PENGADAAN_LANGSUNG, PENUNJUKAN_LANGSUNG, LELANG
	ReferenceVendor1  *uuid.UUID                            `json:"reference_vendor_1" gorm:"type:uuid"`
	Vendor1           *supplier.Supplier                    `json:"vendor_1,omitempty" gorm:"foreignKey:ReferenceVendor1"`
	ReferenceVendor2  *uuid.UUID                            `json:"reference_vendor_2" gorm:"type:uuid"`
	Vendor2           *supplier.Supplier                    `json:"vendor_2,omitempty" gorm:"foreignKey:ReferenceVendor2"`
	ReferenceVendor3  *uuid.UUID                            `json:"reference_vendor_3" gorm:"type:uuid"`
	Vendor3           *supplier.Supplier                    `json:"vendor_3,omitempty" gorm:"foreignKey:ReferenceVendor3"`
	ReferenceVendor4  *uuid.UUID                            `json:"reference_vendor_4" gorm:"type:uuid"`
	Vendor4           *supplier.Supplier                    `json:"vendor_4,omitempty" gorm:"foreignKey:ReferenceVendor4"`
	TotalHPE          float64                               `json:"total_hpe" gorm:"column:total_hpe;type:numeric(18,2);not null"`
	TotalEstimate     float64                               `json:"total_estimate" gorm:"column:total_estimate;type:numeric(18,2)"`
	TaxIncluded       bool                                  `json:"tax_included" gorm:"default:true"`
	Status            string                                `json:"status" gorm:"type:varchar(50);not null;default:'DRAFT'"` // DRAFT, IN_APPROVAL, APPROVED, REVISED, REJECTED
	Notes             string                                `json:"notes" gorm:"type:text"`
	SupportingFile    string                                `json:"supporting_file" gorm:"type:varchar(255)"`
	CreatedByID       *uuid.UUID                            `json:"created_by" gorm:"column:created_by;type:uuid"`
	Creator           *user.User                            `json:"creator,omitempty" gorm:"foreignKey:CreatedByID"`
	UpdatedByID       *uuid.UUID                            `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID       *uuid.UUID                            `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt         time.Time                             `json:"created_at"`
	UpdatedAt         time.Time                             `json:"updated_at"`
	DeletedAt         gorm.DeletedAt                        `json:"deleted_at,omitempty" gorm:"index"`
}

func (e *EngineeringEstimate) BeforeCreate(tx *gorm.DB) error {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}
	if e.Status == "" {
		e.Status = "DRAFT"
	}
	return nil
}

type RKSDocument struct {
	ID           uuid.UUID           `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	HPEID        uuid.UUID           `json:"hpe_id" gorm:"type:uuid;not null;index"`
	HPE          EngineeringEstimate `json:"hpe" gorm:"foreignKey:HPEID"`
	RKSNumber    string              `json:"rks_number" gorm:"column:rks_number;type:varchar(100);unique;not null"`
	Title        string              `json:"title" gorm:"type:varchar(255);not null"`
	GeneralTerms string              `json:"general_terms" gorm:"type:text"`
	SpecialTerms string              `json:"special_terms" gorm:"type:text"`
	IsAddendum   bool                `json:"is_addendum" gorm:"default:false"`
	AddendumTo   *uuid.UUID          `json:"addendum_to" gorm:"type:uuid"`
	Status       string              `json:"status" gorm:"type:varchar(50);not null;default:'DRAFT'"`
	CreatedByID  *uuid.UUID          `json:"created_by" gorm:"column:created_by;type:uuid"`
	Creator      *user.User          `json:"creator,omitempty" gorm:"foreignKey:CreatedByID"`
	UpdatedByID  *uuid.UUID          `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID  *uuid.UUID          `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt    time.Time           `json:"created_at"`
	UpdatedAt    time.Time           `json:"updated_at"`
	DeletedAt    gorm.DeletedAt      `json:"deleted_at,omitempty" gorm:"index"`
}

func (r *RKSDocument) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	if r.Status == "" {
		r.Status = "DRAFT"
	}
	return nil
}

type ValueForMoneyReview struct {
	ID                 uuid.UUID                             `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RequestID          uuid.UUID                             `json:"request_id" gorm:"type:uuid;not null;index"`
	Request            procurement_request.ProcurementRequest `json:"request" gorm:"foreignKey:RequestID"`
	Stage              string                                `json:"stage" gorm:"type:varchar(30);not null"` // PERENCANAAN / PENGADAAN
	ReviewNumber       string                                `json:"review_number" gorm:"type:varchar(100);unique;not null"`
	EfficiencyAnalysis string                                `json:"efficiency_analysis" gorm:"type:text"`
	Status             string                                `json:"status" gorm:"type:varchar(50);not null;default:'DRAFT'"`
	ReviewedByID       *uuid.UUID                            `json:"reviewed_by" gorm:"column:reviewed_by;type:uuid"`
	Reviewer           *user.User                            `json:"reviewer,omitempty" gorm:"foreignKey:ReviewedByID"`
	CreatedByID        *uuid.UUID                            `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID        *uuid.UUID                            `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID        *uuid.UUID                            `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt          time.Time                             `json:"created_at"`
	UpdatedAt          time.Time                             `json:"updated_at"`
	DeletedAt          gorm.DeletedAt                        `json:"deleted_at,omitempty" gorm:"index"`
}

func (v *ValueForMoneyReview) BeforeCreate(tx *gorm.DB) error {
	if v.ID == uuid.Nil {
		v.ID = uuid.New()
	}
	if v.Status == "" {
		v.Status = "DRAFT"
	}
	return nil
}

// 4.7.1 Distribusi Perencana Pengadaan
type InventoryDistribution struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FormNumber      string         `json:"form_number" gorm:"column:form_number;type:varchar(100);unique;not null"`
	FormDate        time.Time      `json:"form_date" gorm:"not null"`
	RequestNumber   string         `json:"request_number" gorm:"type:varchar(100);not null"`
	DistributedToID uuid.UUID      `json:"distributed_to_id" gorm:"type:uuid;not null"`
	DistributedTo   *user.User     `json:"distributed_to,omitempty" gorm:"foreignKey:DistributedToID"`
	SupportingFile  string         `json:"supporting_file" gorm:"type:varchar(255)"`
	Notes           string         `json:"notes" gorm:"type:text"`
	Status          string         `json:"status" gorm:"type:varchar(50);default:'POST'"` // IN_PROCESS, POST
	CreatedByID     *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID     *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID     *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (d *InventoryDistribution) BeforeCreate(tx *gorm.DB) error {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}
	if d.Status == "" {
		d.Status = "POST"
	}
	return nil
}

// 4.7.2 Usulan Pengadaan (RO)
type PurchaseRequisitionRO struct {
	ID                   uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FormNumber           string         `json:"form_number" gorm:"column:form_number;type:varchar(100);unique;not null"`
	FormDate             time.Time      `json:"form_date" gorm:"not null"`
	FundingSource        string         `json:"funding_source" gorm:"type:varchar(50);not null"` // AI, AO, dll
	Entity               string         `json:"entity" gorm:"type:varchar(50);not null"`         // ET, dll
	RunNumberAMP         string         `json:"run_number_amp" gorm:"type:varchar(100)"`
	Division             string         `json:"division" gorm:"type:varchar(100)"`
	JobName              string         `json:"job_name" gorm:"type:varchar(255);not null"`
	JobType              string         `json:"job_type" gorm:"type:varchar(100);not null"`
	JobPriority          string         `json:"job_priority" gorm:"type:varchar(50);default:'NORMAL'"`
	ContractType         string         `json:"contract_type" gorm:"type:varchar(50);not null"`
	ContractDuration     string         `json:"contract_duration" gorm:"type:varchar(50)"`
	ParentContractNumber string         `json:"parent_contract_number" gorm:"type:varchar(100)"`
	SupportingFile       string         `json:"supporting_file" gorm:"type:varchar(255)"`
	Notes                string         `json:"notes" gorm:"type:text"`
	Status               string         `json:"status" gorm:"type:varchar(50);default:'IN_PROCESS'"`
	Items                []ROItem       `json:"items,omitempty" gorm:"foreignKey:ROID;constraint:OnDelete:CASCADE"`
	CreatedByID          *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID          *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID          *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt            time.Time      `json:"created_at"`
	UpdatedAt            time.Time      `json:"updated_at"`
	DeletedAt            gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (ro *PurchaseRequisitionRO) BeforeCreate(tx *gorm.DB) error {
	if ro.ID == uuid.Nil {
		ro.ID = uuid.New()
	}
	if ro.Status == "" {
		ro.Status = "IN_PROCESS"
	}
	return nil
}

type ROItem struct {
	ID            uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ROID          uuid.UUID      `json:"ro_id" gorm:"type:uuid;not null;index"`
	RequestNumber string         `json:"request_number" gorm:"type:varchar(100)"`
	ItemType      string         `json:"item_type" gorm:"type:varchar(20);default:'BARANG'"`
	ItemCode      string         `json:"item_code" gorm:"type:varchar(100)"`
	ItemName      string         `json:"item_name" gorm:"type:varchar(255);not null"`
	Specification string         `json:"specification" gorm:"type:text"`
	Quantity      float64        `json:"quantity" gorm:"type:numeric(14,4);not null"`
	Unit          string         `json:"unit" gorm:"type:varchar(50);not null"`
	RequiredDate  *time.Time     `json:"required_date"`
	Notes         string         `json:"notes" gorm:"type:text"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (roi *ROItem) BeforeCreate(tx *gorm.DB) error {
	if roi.ID == uuid.Nil {
		roi.ID = uuid.New()
	}
	return nil
}

// 4.7.5 Adendum RKS
type RKSAddendum struct {
	ID             uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FormNumber     string         `json:"form_number" gorm:"column:form_number;type:varchar(100);unique;not null"`
	FormDate       time.Time      `json:"form_date" gorm:"not null"`
	RKSNumber      string         `json:"rks_number" gorm:"type:varchar(100);not null"`
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

func (ra *RKSAddendum) BeforeCreate(tx *gorm.DB) error {
	if ra.ID == uuid.Nil {
		ra.ID = uuid.New()
	}
	if ra.Status == "" {
		ra.Status = "IN_PROCESS"
	}
	return nil
}

// 4.7.6 Review VFM Perencanaan Pengadaan
type VFMReviewInventory struct {
	ID                uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FormNumber        string         `json:"form_number" gorm:"column:form_number;type:varchar(100);unique;not null"`
	FormDate          time.Time      `json:"form_date" gorm:"not null"`
	HPENumber         string         `json:"hpe_number" gorm:"type:varchar(100);not null"`
	Priority          string         `json:"priority" gorm:"type:varchar(50);default:'NORMAL'"`
	BudgetSource      string         `json:"budget_source" gorm:"type:varchar(100)"`
	BudgetAmount      float64        `json:"budget_amount" gorm:"type:numeric(18,2);default:0.00"`
	InstalledLocation string         `json:"installed_location" gorm:"type:varchar(200)"`
	Disburse          string         `json:"disburse" gorm:"type:varchar(100)"`
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

func (vf *VFMReviewInventory) BeforeCreate(tx *gorm.DB) error {
	if vf.ID == uuid.Nil {
		vf.ID = uuid.New()
	}
	if vf.Status == "" {
		vf.Status = "IN_PROCESS"
	}
	return nil
}

// 4.7.7 Izin Penunjukan Langsung
type DirectAppointmentPermit struct {
	ID             uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FormNumber     string         `json:"form_number" gorm:"column:form_number;type:varchar(100);unique;not null"`
	FormDate       time.Time      `json:"form_date" gorm:"not null"`
	HPENumber      string         `json:"hpe_number" gorm:"type:varchar(100);not null"`
	CompanyName    string         `json:"company_name" gorm:"type:varchar(200);not null"`
	TotalHPE       float64        `json:"total_hpe" gorm:"type:numeric(18,2);not null"`
	Reason         string         `json:"reason" gorm:"type:text;not null"`
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

func (dp *DirectAppointmentPermit) BeforeCreate(tx *gorm.DB) error {
	if dp.ID == uuid.Nil {
		dp.ID = uuid.New()
	}
	if dp.Status == "" {
		dp.Status = "IN_PROCESS"
	}
	return nil
}

func MigrateEngineeringEstimate(db *gorm.DB) error {
	if err := db.AutoMigrate(&EngineeringEstimate{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&RKSDocument{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&ValueForMoneyReview{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&InventoryDistribution{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&PurchaseRequisitionRO{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&ROItem{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&RKSAddendum{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&VFMReviewInventory{}); err != nil {
		return err
	}
	return db.AutoMigrate(&DirectAppointmentPermit{})
}
