package task_delegation

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"template/modules/procurement_request"
	"template/modules/user"
)

type TaskDelegation struct {
	ID                uuid.UUID                              `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	TaskType          string                                 `json:"task_type" gorm:"type:varchar(100);not null"` // e.g. 'USULAN_PERMINTAAN_I', 'DISTRIBUSI_PENGADAAN'
	OriginalUserID    uuid.UUID                              `json:"original_user_id" gorm:"type:uuid;not null"`
	OriginalUser      user.User                              `json:"original_user" gorm:"foreignKey:OriginalUserID"`
	ReplacementUserID uuid.UUID                              `json:"replacement_user_id" gorm:"type:uuid;not null"`
	ReplacementUser   user.User                              `json:"replacement_user" gorm:"foreignKey:ReplacementUserID"`
	RequestID         *uuid.UUID                             `json:"request_id" gorm:"type:uuid"`
	Request           *procurement_request.ProcurementRequest `json:"request,omitempty" gorm:"foreignKey:RequestID"`
	AssignedByID      uuid.UUID                              `json:"assigned_by_id" gorm:"type:uuid;not null"`
	AssignedBy        user.User                              `json:"assigned_by" gorm:"foreignKey:AssignedByID"`
	Notes             string                                 `json:"notes" gorm:"type:text"`
	Status            string                                 `json:"status" gorm:"type:varchar(50);default:'POSTED'"`
	CreatedByID       *uuid.UUID                             `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID       *uuid.UUID                             `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID       *uuid.UUID                             `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt         time.Time                              `json:"created_at"`
	UpdatedAt         time.Time                              `json:"updated_at"`
	DeletedAt         gorm.DeletedAt                         `json:"deleted_at,omitempty" gorm:"index"`
}

func (d *TaskDelegation) BeforeCreate(tx *gorm.DB) error {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}
	if d.Status == "" {
		d.Status = "POSTED"
	}
	return nil
}

func MigrateTaskDelegation(db *gorm.DB) error {
	return db.AutoMigrate(&TaskDelegation{})
}
