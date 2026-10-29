package warehouse

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"template/modules/purchase_order"
	"template/modules/user"
)

type GoodsReceipt struct {
	ID                 uuid.UUID                    `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	POID               uuid.UUID                    `json:"po_id" gorm:"type:uuid;not null;index"`
	PO                 purchase_order.PurchaseOrder `json:"po" gorm:"foreignKey:POID"`
	ReceiptNumber      string                       `json:"receipt_number" gorm:"column:receipt_number;type:varchar(100);unique;not null"`
	DeliveryNoteNumber string                       `json:"delivery_note_number" gorm:"column:delivery_note_number;type:varchar(100);not null"`
	DeliveryDate       time.Time                    `json:"delivery_date" gorm:"column:delivery_date;not null"`
	PackageCount       int                          `json:"package_count" gorm:"column:package_count;default:1"`
	IsGoodCondition    bool                         `json:"is_good_condition" gorm:"column:is_good_condition;default:true"`
	DelayDays          int                          `json:"delay_days" gorm:"column:delay_days;default:0"`
	PenaltyAmount      float64                      `json:"penalty_amount" gorm:"column:penalty_amount;type:numeric(18,2);default:0.00"`
	Status             string                       `json:"status" gorm:"type:varchar(50);not null;default:'DRAFT'"`
	Notes              string                       `json:"notes" gorm:"type:text"`
	InspectedByID      uuid.UUID                    `json:"inspected_by" gorm:"column:inspected_by;type:uuid;not null"`
	InspectedBy        user.User                    `json:"inspector" gorm:"foreignKey:InspectedByID"`
	CreatedByID        *uuid.UUID                   `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID        *uuid.UUID                   `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID        *uuid.UUID                   `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt          time.Time                    `json:"created_at"`
	UpdatedAt          time.Time                    `json:"updated_at"`
	DeletedAt          gorm.DeletedAt               `json:"deleted_at,omitempty" gorm:"index"`
}

func (g *GoodsReceipt) BeforeCreate(tx *gorm.DB) error {
	if g.ID == uuid.Nil {
		g.ID = uuid.New()
	}
	if g.Status == "" {
		g.Status = "DRAFT"
	}
	return nil
}

type InspectionAcceptanceAct struct {
	ID                   uuid.UUID                     `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	POID                 uuid.UUID                     `json:"po_id" gorm:"type:uuid;not null;index"`
	PO                   purchase_order.PurchaseOrder  `json:"po" gorm:"foreignKey:POID"`
	ReceiptID            *uuid.UUID                    `json:"receipt_id" gorm:"type:uuid"`
	Receipt              *GoodsReceipt                 `json:"receipt,omitempty" gorm:"foreignKey:ReceiptID"`
	ActNumber            string                        `json:"act_number" gorm:"column:act_number;type:varchar(100);unique;not null"`
	ActType              string                        `json:"act_type" gorm:"column:act_type;type:varchar(30);not null"` // BAPHB_BARANG, BAST_JASA
	LeadInspectorID      uuid.UUID                     `json:"lead_inspector_id" gorm:"type:uuid;not null"`
	LeadInspector        user.User                     `json:"lead_inspector" gorm:"foreignKey:LeadInspectorID"`
	SecretaryID          uuid.UUID                     `json:"secretary_id" gorm:"type:uuid;not null"`
	Secretary            user.User                     `json:"secretary" gorm:"foreignKey:SecretaryID"`
	Member1ID            uuid.UUID                     `json:"member1_id" gorm:"type:uuid;not null"`
	Member1              user.User                     `json:"member1" gorm:"foreignKey:Member1ID"`
	Member2ID            *uuid.UUID                    `json:"member2_id" gorm:"type:uuid"`
	Member2              *user.User                    `json:"member2,omitempty" gorm:"foreignKey:Member2ID"`
	Member3ID            *uuid.UUID                    `json:"member3_id" gorm:"type:uuid"`
	Member3              *user.User                    `json:"member3,omitempty" gorm:"foreignKey:Member3ID"`
	CompletionPercentage float64                       `json:"completion_percentage" gorm:"type:numeric(5,2);default:100.00"`
	Conclusion           string                        `json:"conclusion" gorm:"type:varchar(50);not null"` // DITERIMA_PENUH, DITERIMA_BERSYARAT, DITOLAK
	Status               string                        `json:"status" gorm:"type:varchar(50);not null;default:'DRAFT'"`
	Notes                string                        `json:"notes" gorm:"type:text"`
	CreatedByID          *uuid.UUID                    `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID          *uuid.UUID                    `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID          *uuid.UUID                    `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt            time.Time                     `json:"created_at"`
	UpdatedAt            time.Time                     `json:"updated_at"`
	DeletedAt            gorm.DeletedAt                `json:"deleted_at,omitempty" gorm:"index"`
}

func (a *InspectionAcceptanceAct) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	if a.Status == "" {
		a.Status = "DRAFT"
	}
	return nil
}

// 4.9.1 Distribusi Penerimaan
type WarehouseDistribution struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FormNumber      string         `json:"form_number" gorm:"column:form_number;type:varchar(100);unique;not null"`
	FormDate        time.Time      `json:"form_date" gorm:"not null"`
	PONumber        string         `json:"po_number" gorm:"type:varchar(100);not null"`
	JobName         string         `json:"job_name" gorm:"type:varchar(255)"`
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

func (wd *WarehouseDistribution) BeforeCreate(tx *gorm.DB) error {
	if wd.ID == uuid.Nil {
		wd.ID = uuid.New()
	}
	if wd.Status == "" {
		wd.Status = "POST"
	}
	return nil
}

// 4.9.2 Pemeriksaan Penerimaan Barang
type GoodsReceiptInspection struct {
	ID                 uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FormNumber         string         `json:"form_number" gorm:"column:form_number;type:varchar(100);unique;not null"`
	FormDate           time.Time      `json:"form_date" gorm:"not null"`
	PONumber           string         `json:"po_number" gorm:"type:varchar(100);not null"`
	SupplierName       string         `json:"supplier_name" gorm:"type:varchar(200);not null"`
	JobName            string         `json:"job_name" gorm:"type:varchar(255)"`
	ReceivedItemCount  float64        `json:"received_item_count" gorm:"type:numeric(14,4);default:0.00"`
	PackagingCount     int            `json:"packaging_count" gorm:"default:1"`
	ConditionGood      bool           `json:"condition_good" gorm:"default:true"`
	DeliveryNoteNo     string         `json:"delivery_note_no" gorm:"type:varchar(100)"`
	DeliveryNoteDate   *time.Time     `json:"delivery_note_date"`
	SupportingFile     string         `json:"supporting_file" gorm:"type:varchar(255)"`
	Notes              string         `json:"notes" gorm:"type:text"`
	Status             string         `json:"status" gorm:"type:varchar(50);default:'POST'"`
	CreatedByID        *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID        *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID        *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (gri *GoodsReceiptInspection) BeforeCreate(tx *gorm.DB) error {
	if gri.ID == uuid.Nil {
		gri.ID = uuid.New()
	}
	if gri.Status == "" {
		gri.Status = "POST"
	}
	return nil
}

// 4.9.5 Penyelesaian Pekerjaan (Jasa)
type JobCompletion struct {
	ID                   uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FormNumber           string         `json:"form_number" gorm:"column:form_number;type:varchar(100);unique;not null"`
	FormDate             time.Time      `json:"form_date" gorm:"not null"`
	PONumber             string         `json:"po_number" gorm:"type:varchar(100);not null"`
	SupplierName         string         `json:"supplier_name" gorm:"type:varchar(200);not null"`
	JobName              string         `json:"job_name" gorm:"type:varchar(255)"`
	CompletionPercentage float64        `json:"completion_percentage" gorm:"type:numeric(5,2);default:100.00"`
	StartDate            *time.Time     `json:"start_date"`
	CompletionDate       *time.Time     `json:"completion_date"`
	SupportingFile       string         `json:"supporting_file" gorm:"type:varchar(255)"`
	Notes                string         `json:"notes" gorm:"type:text"`
	Status               string         `json:"status" gorm:"type:varchar(50);default:'IN_PROCESS'"`
	CreatedByID          *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID          *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID          *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt            time.Time      `json:"created_at"`
	UpdatedAt            time.Time      `json:"updated_at"`
	DeletedAt            gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (jc *JobCompletion) BeforeCreate(tx *gorm.DB) error {
	if jc.ID == uuid.Nil {
		jc.ID = uuid.New()
	}
	if jc.Status == "" {
		jc.Status = "IN_PROCESS"
	}
	return nil
}

func MigrateWarehouse(db *gorm.DB) error {
	if err := db.AutoMigrate(&GoodsReceipt{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&InspectionAcceptanceAct{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&WarehouseDistribution{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&GoodsReceiptInspection{}); err != nil {
		return err
	}
	return db.AutoMigrate(&JobCompletion{})
}
