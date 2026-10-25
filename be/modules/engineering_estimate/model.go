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

func MigrateEngineeringEstimate(db *gorm.DB) error {
	if err := db.AutoMigrate(&EngineeringEstimate{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&RKSDocument{}); err != nil {
		return err
	}
	return db.AutoMigrate(&ValueForMoneyReview{})
}
