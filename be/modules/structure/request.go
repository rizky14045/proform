package structure

import "github.com/google/uuid"

type StructureRequest struct {
	Code        string     `json:"code" binding:"required"`
	Name        string     `json:"name" binding:"required"`
	Description string     `json:"description"`
	ParentID    *uuid.UUID `json:"parent_id"`
	Status      string     `json:"status"`
}

