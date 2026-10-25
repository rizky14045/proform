package general

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type General struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Group       string         `json:"group" gorm:"type:varchar(100);not null;index"`
	Description string         `json:"description" gorm:"type:text;not null"`
	Status      string         `json:"status" gorm:"type:varchar(20);default:'ACTIVE'"`
	CreatedByID *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (g *General) BeforeCreate(tx *gorm.DB) error {
	if g.ID == uuid.Nil {
		g.ID = uuid.New()
	}
	if g.Status == "" {
		g.Status = "ACTIVE"
	}
	return nil
}

func MigrateGeneral(db *gorm.DB) error {
	return db.AutoMigrate(&General{})
}
