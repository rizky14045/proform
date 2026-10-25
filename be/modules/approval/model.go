package approval

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"template/modules/structure"
	"template/modules/user"
)

type ApprovalStructure struct {
	ID                  uuid.UUID            `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RequestStructureID  uuid.UUID            `json:"request_structure_id" gorm:"type:uuid;not null"`
	RequestStructure    structure.Structure  `json:"request_structure" gorm:"foreignKey:RequestStructureID"`
	ApprovalStructureID uuid.UUID            `json:"approval_structure_id" gorm:"type:uuid;not null"`
	ApprovalStructure   structure.Structure  `json:"approval_structure" gorm:"foreignKey:ApprovalStructureID"`
	Menu                string               `json:"menu" gorm:"type:varchar(100);not null"`
	ApprovalFinal       bool                 `json:"approval_final" gorm:"default:false"`
	Status              string               `json:"status" gorm:"type:varchar(20);default:'ACTIVE'"`
	CreatedByID         *uuid.UUID           `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID         *uuid.UUID           `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID         *uuid.UUID           `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	CreatedAt           time.Time            `json:"created_at"`
	UpdatedAt           time.Time            `json:"updated_at"`
	DeletedAt           gorm.DeletedAt       `json:"deleted_at,omitempty" gorm:"index"`
}

func (a *ApprovalStructure) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	if a.Status == "" {
		a.Status = "ACTIVE"
	}
	return nil
}

type ApprovalHistory struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RequestID       uuid.UUID      `json:"request_id" gorm:"type:uuid;not null;index"`
	ApproverID      uuid.UUID      `json:"approver_id" gorm:"type:uuid;not null"`
	Approver        user.User      `json:"approver" gorm:"foreignKey:ApproverID"`
	ApproverRole    string         `json:"approver_role" gorm:"type:varchar(100);not null"`
	StageName       string         `json:"stage_name" gorm:"type:varchar(100);not null"`
	Action          string         `json:"action" gorm:"type:varchar(30);not null"` // SUBMIT, APPROVE, REVISE, REJECT
	EvaluationNotes string         `json:"evaluation_notes" gorm:"type:text"`
	SequenceOrder   int            `json:"sequence_order" gorm:"type:int;not null;default:1"`
	ActionTimestamp time.Time      `json:"action_timestamp" gorm:"default:CURRENT_TIMESTAMP"`
	CreatedByID     *uuid.UUID     `json:"created_by" gorm:"column:created_by;type:uuid"`
	UpdatedByID     *uuid.UUID     `json:"updated_by" gorm:"column:updated_by;type:uuid"`
	DeletedByID     *uuid.UUID     `json:"deleted_by" gorm:"column:deleted_by;type:uuid"`
	DeletedAt       gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (h *ApprovalHistory) BeforeCreate(tx *gorm.DB) error {
	if h.ID == uuid.Nil {
		h.ID = uuid.New()
	}
	if h.ActionTimestamp.IsZero() {
		h.ActionTimestamp = time.Now()
	}
	return nil
}

func MigrateApproval(db *gorm.DB) error {
	if err := db.AutoMigrate(&ApprovalStructure{}); err != nil {
		return err
	}
	return db.AutoMigrate(&ApprovalHistory{})
}
