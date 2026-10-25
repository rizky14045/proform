package task_delegation

import "github.com/google/uuid"

type TaskDelegationRequest struct {
	TaskType          string     `json:"task_type" binding:"required"`
	OriginalUserID    uuid.UUID  `json:"original_user_id" binding:"required"`
	ReplacementUserID uuid.UUID  `json:"replacement_user_id" binding:"required"`
	RequestID         *uuid.UUID `json:"request_id"`
	Notes             string     `json:"notes"`
}

