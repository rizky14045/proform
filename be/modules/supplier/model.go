package supplier

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Supplier struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Code            string         `json:"code" gorm:"type:varchar(50);unique;not null"`
	Name            string         `json:"name" gorm:"type:varchar(200);not null"`
	PICName         string         `json:"pic_name" gorm:"type:varchar(100)"`
	Phone           string         `json:"phone" gorm:"type:varchar(50)"`
	Email           string         `json:"email" gorm:"type:varchar(150)"`
	Address         string         `json:"address" gorm:"type:text"`
	Fax             string         `json:"fax" gorm:"type:varchar(50)"`
	Status          string         `json:"status" gorm:"type:varchar(30);default:'ACTIVE'"`
	OrderPICName    string         `json:"order_pic_name" gorm:"type:varchar(100)"`
	OrderPICEmail   string         `json:"order_pic_email" gorm:"type:varchar(150)"`
	OrderPICAddress string         `json:"order_pic_address" gorm:"type:text"`
	OrderPICPhone   string         `json:"order_pic_phone" gorm:"type:varchar(50)"`
	CreatedByID     *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID     *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID     *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (s *Supplier) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	if s.Status == "" {
		s.Status = "ACTIVE"
	}
	return nil
}

func MigrateSupplier(db *gorm.DB) error {
	return db.AutoMigrate(&Supplier{})
}
