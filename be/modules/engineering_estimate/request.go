package engineering_estimate

import "github.com/google/uuid"

type EngineeringEstimateRequest struct {
	RequestID         uuid.UUID  `json:"request_id" binding:"required"`
	HPENumber         string     `json:"hpe_number"`
	ProcurementMethod string     `json:"procurement_method" binding:"required"` // PENGADAAN_LANGSUNG, PENUNJUKAN_LANGSUNG, LELANG
	ReferenceVendor1  *uuid.UUID `json:"reference_vendor_1"`
	ReferenceVendor2  *uuid.UUID `json:"reference_vendor_2"`
	ReferenceVendor3  *uuid.UUID `json:"reference_vendor_3"`
	ReferenceVendor4  *uuid.UUID `json:"reference_vendor_4"`
	TotalHPE          float64    `json:"total_hpe" binding:"required"`
	TaxIncluded       *bool      `json:"tax_included"`
	Notes             string     `json:"notes"`
	SupportingFile    string     `json:"supporting_file"`
}

type RKSRequest struct {
	HPEID        uuid.UUID  `json:"hpe_id" binding:"required"`
	RKSNumber    string     `json:"rks_number"`
	Title        string     `json:"title" binding:"required"`
	GeneralTerms string     `json:"general_terms"`
	SpecialTerms string     `json:"special_terms"`
	IsAddendum   bool       `json:"is_addendum"`
	AddendumTo   *uuid.UUID `json:"addendum_to"`
}

type VFMReviewRequest struct {
	RequestID          uuid.UUID `json:"request_id" binding:"required"`
	Stage              string    `json:"stage" binding:"required"` // PERENCANAAN / PENGADAAN
	ReviewNumber       string    `json:"review_number"`
	EfficiencyAnalysis string    `json:"efficiency_analysis" binding:"required"`
}

