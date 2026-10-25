package user

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"template/modules/role"
	"template/modules/structure"
)

type User struct {
	ID           uuid.UUID            `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	NID          string               `json:"nid" gorm:"column:nid;type:varchar(50);unique;not null"`
	Name         string               `json:"name" gorm:"type:varchar(150);not null"`
	Email        string               `json:"email" gorm:"type:varchar(150);unique;not null"`
	NIK          string               `json:"nik" gorm:"column:nik;type:varchar(16)"`
	Password     string               `json:"-" gorm:"type:varchar(255);not null"`
	RoleID       uuid.UUID            `json:"role_id" gorm:"type:uuid;not null"`
	Role         role.Role            `json:"role" gorm:"foreignKey:RoleID"`
	StructureID  *uuid.UUID           `json:"structure_id" gorm:"type:uuid"`
	Structure    *structure.Structure `json:"structure,omitempty" gorm:"foreignKey:StructureID"`
	Phone        string               `json:"phone" gorm:"type:varchar(30)"`
	Address      string               `json:"address" gorm:"type:text"`
	SignatureURL string               `json:"signature_url" gorm:"type:varchar(255)"`
	UserImage    string               `json:"user_image" gorm:"type:varchar(255)"`
	UserType     string               `json:"user_type" gorm:"type:varchar(20);default:'USER'"`
	IsActive     bool                 `json:"is_active" gorm:"default:true"`
	CreatedByID  *uuid.UUID           `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID  *uuid.UUID           `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID  *uuid.UUID           `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt    time.Time            `json:"created_at"`
	UpdatedAt    time.Time            `json:"updated_at"`
	DeletedAt    gorm.DeletedAt       `json:"deleted_at,omitempty" gorm:"index"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	if u.UserType == "" {
		u.UserType = "USER"
	}
	return nil
}

func MigrateUser(db *gorm.DB) error {
	return db.AutoMigrate(&User{})
}
