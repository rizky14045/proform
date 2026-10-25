package stock_code

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type StockCode struct {
	ID            uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Code          string         `json:"code" gorm:"type:varchar(50);unique;not null"`
	Name          string         `json:"name" gorm:"type:varchar(255);not null"`
	Description   string         `json:"description" gorm:"type:text"`
	UOI           string         `json:"uoi" gorm:"column:uoi;type:varchar(30)"`             // Unit of Issue (PCS, EA, SET)
	SOH           float64        `json:"soh" gorm:"column:soh;type:numeric(14,2);default:0"` // Stock on Hand
	WarehouseCode string         `json:"warehouse_code" gorm:"type:varchar(50)"`
	BinLocation   string         `json:"bin_location" gorm:"type:varchar(50)"`
	Mnemonic      string         `json:"mnemonic" gorm:"type:varchar(100)"`
	PartNumber    string         `json:"part_number" gorm:"type:varchar(100)"`
	IsActive      bool           `json:"is_active" gorm:"default:true"`
	CreatedByID   *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID   *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID   *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (s *StockCode) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

func MigrateStockCode(db *gorm.DB) error {
	return db.AutoMigrate(&StockCode{})
}
