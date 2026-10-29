package role

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Role struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Code        string         `json:"code" gorm:"type:varchar(50);unique;not null"`
	Name        string         `json:"name" gorm:"type:varchar(100);not null"`
	Description string         `json:"description" gorm:"type:text"`
	Status      string         `json:"status" gorm:"type:varchar(20);default:'ACTIVE'"`
	Details     []RoleDetail   `json:"details,omitempty" gorm:"foreignKey:RoleID;constraint:OnDelete:CASCADE"`
	CreatedByID *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (r *Role) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	if r.Status == "" {
		r.Status = "ACTIVE"
	}
	return nil
}

type RoleDetail struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RoleID    uuid.UUID      `json:"role_id" gorm:"type:uuid;not null;index"`
	MenuType  string         `json:"menu_type" gorm:"type:varchar(50);not null"` // Master, Transaksi, Report
	SubMenu   string         `json:"sub_menu" gorm:"type:varchar(100)"`
	MenuName  string         `json:"menu_name" gorm:"type:varchar(100);not null"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (rd *RoleDetail) BeforeCreate(tx *gorm.DB) error {
	if rd.ID == uuid.Nil {
		rd.ID = uuid.New()
	}
	return nil
}

type UserRole struct {
	ID            uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID        uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;index"`
	RoleID        uuid.UUID      `json:"role_id" gorm:"type:uuid;not null;index"`
	Role          *Role          `json:"role,omitempty" gorm:"foreignKey:RoleID"`
	SpecialAccess bool           `json:"special_access" gorm:"default:false"` // Akses Spesial: melihat data user lain dalam role yang sama
	Status        string         `json:"status" gorm:"type:varchar(20);default:'ACTIVE'"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (ur *UserRole) BeforeCreate(tx *gorm.DB) error {
	if ur.ID == uuid.Nil {
		ur.ID = uuid.New()
	}
	if ur.Status == "" {
		ur.Status = "ACTIVE"
	}
	return nil
}

func MigrateRole(db *gorm.DB) error {
	if err := db.AutoMigrate(&Role{}); err != nil {
		return err
	}
	if err := db.AutoMigrate(&RoleDetail{}); err != nil {
		return err
	}
	return db.AutoMigrate(&UserRole{})
}
