package purchase_order

import (
	"time"

	"github.com/google/uuid"
)

type PurchaseOrderRequest struct {
	RequestID        uuid.UUID  `json:"request_id" binding:"required"`
	SupplierID       uuid.UUID  `json:"supplier_id" binding:"required"`
	PONumber         string     `json:"po_number"`
	PODate           time.Time  `json:"po_date" binding:"required"`
	POAmount         float64    `json:"po_amount"`
	PPNAmount        float64    `json:"ppn_amount"`
	ContractAmount   float64    `json:"contract_amount"`
	TotalAmount      float64    `json:"total_amount" binding:"required"`
	DeliveryLocation string     `json:"delivery_location"`
	PaymentTerms     string     `json:"payment_terms"`
	DeliveryDeadline time.Time  `json:"delivery_deadline" binding:"required"`
	ContractType     string     `json:"contract_type"`
	IsAddendum       bool       `json:"is_addendum"`
	AddendumNumber   string     `json:"addendum_number"`
	PICResolutionID  *uuid.UUID `json:"pic_resolution_id"`
	Notes            string     `json:"notes"`
}

type BankGuaranteeRequest struct {
	RequestID          *uuid.UUID `json:"request_id"`
	SupplierID         uuid.UUID  `json:"supplier_id" binding:"required"`
	GuaranteeType      string     `json:"guarantee_type" binding:"required"` // PENAWARAN, PELAKSANAAN, PEMELIHARAAN
	SerialNumber       string     `json:"serial_number" binding:"required"`
	IssuingBank        string     `json:"issuing_bank" binding:"required"`
	Branch             string     `json:"branch"`
	Amount             float64    `json:"amount" binding:"required"`
	ValidFrom          time.Time  `json:"valid_from" binding:"required"`
	ValidUntil         time.Time  `json:"valid_until" binding:"required"`
	ClaimDeadline      time.Time  `json:"claim_deadline" binding:"required"`
	ConfirmationStatus string     `json:"confirmation_status"`
	Notes              string     `json:"notes"`
}

