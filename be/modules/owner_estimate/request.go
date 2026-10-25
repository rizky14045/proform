package owner_estimate

import (
	"time"

	"github.com/google/uuid"
)

type OwnerEstimateRequest struct {
	HPEID     uuid.UUID `json:"hpe_id" binding:"required"`
	HPSNumber string    `json:"hps_number"`
	TotalHPS  float64   `json:"total_hps" binding:"required"`
	Notes     string    `json:"notes"`
}

type TenderEventRequest struct {
	RequestID      uuid.UUID      `json:"request_id" binding:"required"`
	EventType      string         `json:"event_type" binding:"required"` // AANWIJZING, BAPP_1, BAEP_1, BAPP_2, BAEP_2, BANH, BAHP
	DocumentNumber string         `json:"document_number"`
	EventDate      time.Time      `json:"event_date" binding:"required"`
	MeetingNotes   string         `json:"meeting_notes"`
	Quotations     []QuotationDTO `json:"quotations"`
}

type QuotationDTO struct {
	SupplierID      uuid.UUID `json:"supplier_id" binding:"required"`
	QuotedPrice     float64   `json:"quoted_price" binding:"required"`
	NegotiatedPrice float64   `json:"negotiated_price"`
	AdminPassed     bool      `json:"admin_passed"`
	TechPassed      bool      `json:"tech_passed"`
	IsWinner        bool      `json:"is_winner"`
	Notes           string    `json:"notes"`
}

