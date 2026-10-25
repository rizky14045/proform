package supplier_evaluation

import "github.com/google/uuid"

type EvaluationItemDTO struct {
	Category         string  `json:"category" binding:"required"` // K3, LINGKUNGAN, MUTU_WAKTU, INTEGRITAS_HARGA
	WeightPercentage float64 `json:"weight_percentage" binding:"required"`
	Score            float64 `json:"score" binding:"required"`
	Notes            string  `json:"notes"`
}

type SubmitEvaluationRequest struct {
	POID        uuid.UUID           `json:"po_id" binding:"required"`
	Evaluations []EvaluationItemDTO `json:"evaluations" binding:"required"`
}

