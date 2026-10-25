package warehouse

import (
	"time"

	"github.com/google/uuid"
)

type GoodsReceiptRequest struct {
	POID               uuid.UUID `json:"po_id" binding:"required"`
	ReceiptNumber      string    `json:"receipt_number"`
	DeliveryNoteNumber string    `json:"delivery_note_number" binding:"required"`
	DeliveryDate       time.Time `json:"delivery_date" binding:"required"`
	PackageCount       int       `json:"package_count"`
	IsGoodCondition    *bool     `json:"is_good_condition"`
	DelayDays          int       `json:"delay_days"`
	PenaltyAmount      float64   `json:"penalty_amount"`
	Notes              string    `json:"notes"`
}

type InspectionActRequest struct {
	POID                 uuid.UUID  `json:"po_id" binding:"required"`
	ReceiptID            *uuid.UUID `json:"receipt_id"`
	ActNumber            string     `json:"act_number"`
	ActType              string     `json:"act_type" binding:"required"` // BAPHB_BARANG, BAST_JASA
	LeadInspectorID      uuid.UUID  `json:"lead_inspector_id" binding:"required"`
	SecretaryID          uuid.UUID  `json:"secretary_id" binding:"required"`
	Member1ID            uuid.UUID  `json:"member1_id" binding:"required"`
	Member2ID            *uuid.UUID `json:"member2_id"`
	Member3ID            *uuid.UUID `json:"member3_id"`
	CompletionPercentage float64    `json:"completion_percentage"`
	Conclusion           string     `json:"conclusion" binding:"required"` // DITERIMA_PENUH, DITERIMA_BERSYARAT, DITOLAK
	Notes                string     `json:"notes"`
}

