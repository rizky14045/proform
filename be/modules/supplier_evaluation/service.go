package supplier_evaluation

import (
	"errors"

	"github.com/google/uuid"
)

type EvaluationSummary struct {
	POID        uuid.UUID                       `json:"po_id"`
	FinalScore  float64                         `json:"final_score"`
	FinalGrade  string                          `json:"final_grade"`
	Evaluations []SupplierPerformanceEvaluation `json:"evaluations"`
}

type SupplierEvaluationService interface {
	GetByPOID(poID uuid.UUID) (*EvaluationSummary, error)
	Submit(evaluatorID uuid.UUID, creatorID *uuid.UUID, req SubmitEvaluationRequest) (*EvaluationSummary, error)
}

type supplierEvaluationService struct {
	repo SupplierEvaluationRepository
}

func NewSupplierEvaluationService(repo SupplierEvaluationRepository) SupplierEvaluationService {
	return &supplierEvaluationService{repo: repo}
}

func (s *supplierEvaluationService) GetByPOID(poID uuid.UUID) (*EvaluationSummary, error) {
	list, err := s.repo.FindByPOID(poID)
	if err != nil {
		return nil, err
	}

	var totalScore float64
	var totalWeight float64

	for _, item := range list {
		totalScore += item.Score * (item.WeightPercentage / 100.0)
		totalWeight += item.WeightPercentage
	}

	finalGrade := "D"
	if totalScore > 4.0 {
		finalGrade = "A"
	} else if totalScore > 3.0 {
		finalGrade = "B"
	} else if totalScore > 2.5 {
		finalGrade = "C"
	}

	return &EvaluationSummary{
		POID:        poID,
		FinalScore:  totalScore,
		FinalGrade:  finalGrade,
		Evaluations: list,
	}, nil
}

func (s *supplierEvaluationService) Submit(evaluatorID uuid.UUID, creatorID *uuid.UUID, req SubmitEvaluationRequest) (*EvaluationSummary, error) {
	if len(req.Evaluations) == 0 {
		return nil, errors.New("no evaluation items provided")
	}

	var items []SupplierPerformanceEvaluation
	for _, e := range req.Evaluations {
		if e.Score < 0 || e.Score > 5.0 {
			return nil, errors.New("score must be between 0.00 and 5.00")
		}
		items = append(items, SupplierPerformanceEvaluation{
			POID:             req.POID,
			EvaluatorID:      evaluatorID,
			Category:         e.Category,
			WeightPercentage: e.WeightPercentage,
			Score:            e.Score,
			Notes:            e.Notes,
			CreatedByID:      creatorID,
			UpdatedByID:      creatorID,
		})
	}

	if err := s.repo.CreateBatch(items); err != nil {
		return nil, err
	}

	return s.GetByPOID(req.POID)
}
