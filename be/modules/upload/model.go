package upload

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UploadedFile struct {
	ID            uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	OriginalName  string         `json:"original_name" gorm:"type:varchar(255);not null"`
	StoredName    string         `json:"stored_name" gorm:"type:varchar(255);unique;not null"`
	FilePath      string         `json:"file_path" gorm:"type:varchar(500);not null"`
	FileSize      int64          `json:"file_size" gorm:"not null"`
	FileType      string         `json:"file_type" gorm:"type:varchar(100);not null"`
	FileExtension string         `json:"file_extension" gorm:"type:varchar(20);not null"`
	FileHashSHA256 string        `json:"file_hash_sha256" gorm:"type:varchar(64);not null"`
	UploadedByID  *uuid.UUID     `json:"uploaded_by_id" gorm:"column:uploaded_by_id;type:uuid"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (u *UploadedFile) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

func MigrateUpload(db *gorm.DB) error {
	return db.AutoMigrate(&UploadedFile{})
}

