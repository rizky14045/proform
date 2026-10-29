package master_document

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MasterDocument struct {
	ID           uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	DocumentName string         `json:"document_name" gorm:"column:document_name;type:varchar(200);not null"`
	FileTemplate string         `json:"file_template" gorm:"column:file_template;type:varchar(255);not null"`
	Description  string         `json:"description" gorm:"type:text"`
	Status       string         `json:"status" gorm:"type:varchar(20);default:'ACTIVE'"`
	CreatedByID  *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID  *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID  *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (m *MasterDocument) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	if m.Status == "" {
		m.Status = "ACTIVE"
	}
	return nil
}

func MigrateMasterDocument(db *gorm.DB) error {
	return db.AutoMigrate(&MasterDocument{})
}

