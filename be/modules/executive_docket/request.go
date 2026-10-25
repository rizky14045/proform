package executive_docket

import "github.com/google/uuid"

type CompileDocketRequest struct {
	RequestID uuid.UUID `json:"request_id" binding:"required"`
}

type SignBSRERequest struct {
	DocketID   uuid.UUID `json:"docket_id" binding:"required"`
	Passphrase string    `json:"passphrase" binding:"required"`
}

