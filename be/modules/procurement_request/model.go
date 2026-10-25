package procurement_request

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"template/modules/stock_code"
	"template/modules/structure"
	"template/modules/user"
)

type ProcurementRequest struct {
	ID                   uuid.UUID              `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RequestNumber        string                 `json:"request_number" gorm:"type:varchar(100);unique;not null;index"`
	CreatorID            uuid.UUID              `json:"creator_id" gorm:"type:uuid;not null"`
	Creator              user.User              `json:"creator" gorm:"foreignKey:CreatorID"`
	StructureID          uuid.UUID              `json:"structure_id" gorm:"type:uuid;not null"`
	Structure            structure.Structure    `json:"structure" gorm:"foreignKey:StructureID"`
	AssignedToID         *uuid.UUID             `json:"assigned_to_id" gorm:"type:uuid"`
	AssignedTo           *user.User             `json:"assigned_to,omitempty" gorm:"foreignKey:AssignedToID"`
	RequestType          string                 `json:"request_type" gorm:"type:varchar(30);not null"` // BARANG / JASA
	ContractType         string                 `json:"contract_type" gorm:"type:varchar(50);not null"` // SPOT, PAYUNG, RUTIN, DELIVERY_ORDER
	ContractDuration     string                 `json:"contract_duration" gorm:"type:varchar(50)"`
	ParentContractNumber string                 `json:"parent_contract_number" gorm:"type:varchar(100)"`
	Priority             string                 `json:"priority" gorm:"type:varchar(30);default:'NORMAL'"` // NORMAL, URGENT, EMERGENCY
	WONumber             string                 `json:"wo_number" gorm:"column:wo_number;type:varchar(100)"`
	WODescription        string                 `json:"wo_description" gorm:"type:text"`
	PRKNumber            string                 `json:"prk_number" gorm:"column:prk_number;type:varchar(100)"`
	RABAmount            float64                `json:"rab_amount" gorm:"column:rab_amount;type:numeric(18,2);default:0.00"`
	SupportingFile       string                 `json:"supporting_file" gorm:"type:varchar(255)"`
	Notes                string                 `json:"notes" gorm:"type:text"`
	PICResolutionID      *uuid.UUID             `json:"pic_resolution_id" gorm:"type:uuid"`
	PICResolution        *user.User             `json:"pic_resolution,omitempty" gorm:"foreignKey:PICResolutionID"`
	CurrentStep          string                 `json:"current_step" gorm:"type:varchar(100);not null;index"`
	CurrentStatus        string                 `json:"current_status" gorm:"type:varchar(50);not null;index"`
	Items                []RequestItem          `json:"items,omitempty" gorm:"foreignKey:RequestID;constraint:OnDelete:CASCADE"`
	CreatedByID          *uuid.UUID             `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID          *uuid.UUID             `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID          *uuid.UUID             `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt            time.Time              `json:"created_at"`
	UpdatedAt            time.Time              `json:"updated_at"`
	DeletedAt            gorm.DeletedAt         `json:"deleted_at,omitempty" gorm:"index"`
}

func (p *ProcurementRequest) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	if p.Priority == "" {
		p.Priority = "NORMAL"
	}
	if p.CurrentStep == "" {
		p.CurrentStep = "USULAN_PERMINTAAN_I"
	}
	if p.CurrentStatus == "" {
		p.CurrentStatus = "DRAFT"
	}
	return nil
}

type RequestItem struct {
	ID             uuid.UUID             `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RequestID      uuid.UUID             `json:"request_id" gorm:"type:uuid;not null;index"`
	StockCodeID    *uuid.UUID            `json:"stock_code_id" gorm:"type:uuid"`
	StockCode      *stock_code.StockCode `json:"stock_code,omitempty" gorm:"foreignKey:StockCodeID"`
	ItemType       string                `json:"item_type" gorm:"type:varchar(20);not null;default:'BARANG'"` // BARANG / JASA
	ItemName       string                `json:"item_name" gorm:"type:varchar(255);not null"`
	Specification  string                `json:"specification" gorm:"type:text;not null"`
	Quantity       float64               `json:"quantity" gorm:"type:numeric(14,4);not null"`
	Unit           string                `json:"unit" gorm:"type:varchar(50);not null"`
	EstimatedPrice float64               `json:"estimated_price" gorm:"type:numeric(18,2);default:0.00"`
	RequiredDate   *time.Time            `json:"required_date"`
	Purpose        string                `json:"purpose" gorm:"type:text"`
	Notes          string                `json:"notes" gorm:"type:text"`
	CreatedByID    *uuid.UUID            `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID    *uuid.UUID            `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID    *uuid.UUID            `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt      time.Time             `json:"created_at"`
	UpdatedAt      time.Time             `json:"updated_at"`
	DeletedAt      gorm.DeletedAt        `json:"deleted_at,omitempty" gorm:"index"`
}

func (i *RequestItem) BeforeCreate(tx *gorm.DB) error {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return nil
}

func MigrateProcurementRequest(db *gorm.DB) error {
	if err := db.AutoMigrate(&ProcurementRequest{}); err != nil {
		return err
	}
	return db.AutoMigrate(&RequestItem{})
}
