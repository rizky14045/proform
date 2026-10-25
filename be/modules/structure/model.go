package structure

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Structure struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Code        string         `json:"code" gorm:"type:varchar(50);unique;not null"`
	Name        string         `json:"name" gorm:"type:varchar(150);not null"`
	Description string         `json:"description" gorm:"type:text"`
	ParentID    *uuid.UUID     `json:"parent_id" gorm:"type:uuid"`
	Parent      *Structure     `json:"parent,omitempty" gorm:"foreignKey:ParentID"`
	Status      string         `json:"status" gorm:"type:varchar(20);default:'ACTIVE'"`
	CreatedByID *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (s *Structure) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	if s.Status == "" {
		s.Status = "ACTIVE"
	}
	return nil
}

func MigrateStructure(db *gorm.DB) error {
	return db.AutoMigrate(&Structure{})
}
