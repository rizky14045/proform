package approval

import "github.com/google/uuid"

type ApprovalStructureRequest struct {
	RequestStructureID  uuid.UUID `json:"request_structure_id" binding:"required"`
	ApprovalStructureID uuid.UUID `json:"approval_structure_id" binding:"required"`
	Menu                string    `json:"menu" binding:"required"`
	ApprovalFinal       *bool     `json:"approval_final"`
	Status              string    `json:"status"`
}

type ApprovalActionRequest struct {
	RequestID       uuid.UUID `json:"request_id" binding:"required"`
	Action          string    `json:"action" binding:"required"` // APPROVE, REVISE, REJECT
	EvaluationNotes string    `json:"evaluation_notes"`
	StageName       string    `json:"stage_name"`
}

