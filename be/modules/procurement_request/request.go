package procurement_request

import (
	"time"

	"github.com/google/uuid"
)

type RequestItemDTO struct {
	StockCodeID    *uuid.UUID `json:"stock_code_id"`
	ItemType       string     `json:"item_type"`
	ItemName       string     `json:"item_name" binding:"required"`
	Specification  string     `json:"specification" binding:"required"`
	Quantity       float64    `json:"quantity" binding:"required"`
	Unit           string     `json:"unit" binding:"required"`
	EstimatedPrice float64    `json:"estimated_price"`
	RequiredDate   *time.Time `json:"required_date"`
	Purpose        string     `json:"purpose"`
	Notes          string     `json:"notes"`
}

type ProcurementRequestCreate struct {
	RequestNumber        string           `json:"request_number"` // Optional: auto generated if empty
	StructureID          uuid.UUID        `json:"structure_id" binding:"required"`
	RequestType          string           `json:"request_type" binding:"required"`   // BARANG / JASA
	ContractType         string           `json:"contract_type" binding:"required"`  // SPOT, PAYUNG, RUTIN, DELIVERY_ORDER
	ContractDuration     string           `json:"contract_duration"`
	ParentContractNumber string           `json:"parent_contract_number"`
	Priority             string           `json:"priority"`                          // NORMAL, URGENT, EMERGENCY
	WONumber             string           `json:"wo_number"`
	WODescription        string           `json:"wo_description"`
	PRKNumber            string           `json:"prk_number"`
	RABAmount            float64          `json:"rab_amount"`
	SupportingFile       string           `json:"supporting_file"`
	Notes                string           `json:"notes"`
	PICResolutionID      *uuid.UUID       `json:"pic_resolution_id"`
	Items                []RequestItemDTO `json:"items"`
}

type ProcurementRequestUpdate struct {
	ContractType         string           `json:"contract_type"`
	ContractDuration     string           `json:"contract_duration"`
	ParentContractNumber string           `json:"parent_contract_number"`
	Priority             string           `json:"priority"`
	WONumber             string           `json:"wo_number"`
	WODescription        string           `json:"wo_description"`
	PRKNumber            string           `json:"prk_number"`
	RABAmount            *float64         `json:"rab_amount"`
	SupportingFile       string           `json:"supporting_file"`
	Notes                string           `json:"notes"`
	PICResolutionID      *uuid.UUID       `json:"pic_resolution_id"`
	Items                []RequestItemDTO `json:"items"`
}

type DistributeRequest struct {
	AssignedToID uuid.UUID `json:"assigned_to_id" binding:"required"`
	Notes        string    `json:"notes"`
}

type StatusUpdateRequest struct {
	Step   string `json:"step" binding:"required"`
	Status string `json:"status" binding:"required"`
	Notes  string `json:"notes"`
}

