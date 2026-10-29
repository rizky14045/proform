package report

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// 5.2 Laporan Revisi
type RevisionLog struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FormType    string         `json:"form_type" gorm:"type:varchar(100);not null"` // Module name
	FormNumber  string         `json:"form_number" gorm:"type:varchar(100);not null"`
	DraftNumber string         `json:"draft_number" gorm:"type:varchar(100)"`
	RevisionDate time.Time     `json:"revision_date" gorm:"not null"`
	StaffName   string         `json:"staff_name" gorm:"type:varchar(150);not null"`
	Notes       string         `json:"notes" gorm:"type:text;not null"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (r *RevisionLog) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	if r.RevisionDate.IsZero() {
		r.RevisionDate = time.Now()
	}
	return nil
}

// 5.5 Arsip Dokumen Pengadaan
type ArchiveDocument struct {
	ID             uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RequestNumber  string         `json:"request_number" gorm:"type:varchar(100);not null;index"`
	FormName       string         `json:"form_name" gorm:"type:varchar(100);not null"` // e.g. Usulan Permintaan I, Usulan Pengadaan (RO), HPE
	FileName       string         `json:"file_name" gorm:"type:varchar(255);not null"`
	FilePath       string         `json:"file_path" gorm:"type:varchar(255);not null"`
	FileSize       int64          `json:"file_size" gorm:"default:0"`
	FileType       string         `json:"file_type" gorm:"type:varchar(50)"`
	UploadedByID   *uuid.UUID     `json:"uploaded_by_id" gorm:"type:uuid"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (a *ArchiveDocument) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}

func MigrateReport(db *gorm.DB) error {
	if err := db.AutoMigrate(&RevisionLog{}); err != nil {
		return err
	}
	return db.AutoMigrate(&ArchiveDocument{})
}

