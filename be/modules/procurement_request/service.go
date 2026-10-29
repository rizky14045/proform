package procurement_request

import (
	"errors"
	"template/modules/approval"

	"github.com/google/uuid"
)

type ProcurementRequestService interface {
	FindAll(step string, status string, search string, creatorID *uuid.UUID, assignedToID *uuid.UUID, page int, limit int) ([]ProcurementRequest, int64, error)
	GetByID(id uuid.UUID) (*ProcurementRequest, error)
	Create(creatorID uuid.UUID, req ProcurementRequestCreate) (*ProcurementRequest, error)
	Update(id uuid.UUID, updaterID *uuid.UUID, req ProcurementRequestUpdate) (*ProcurementRequest, error)
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
	Distribute(id uuid.UUID, updaterID *uuid.UUID, req DistributeRequest) (*ProcurementRequest, error)
	SubmitForApproval(id uuid.UUID, approverID uuid.UUID, approverRole string, notes string) (*ProcurementRequest, error)
	Approve(id uuid.UUID, approverID uuid.UUID, approverRole string, notes string) (*ProcurementRequest, error)
	Revise(id uuid.UUID, approverID uuid.UUID, approverRole string, notes string) (*ProcurementRequest, error)
	Reject(id uuid.UUID, approverID uuid.UUID, approverRole string, notes string) (*ProcurementRequest, error)

	// Sub-modules
	FindDistributions(search string, page int, limit int) ([]RequestDistribution, int64, error)
	CreateDistribution(dist *RequestDistribution) error
	FindAddendums(search string, page int, limit int) ([]RequestAddendum, int64, error)
	CreateAddendum(add *RequestAddendum) error
	FindEvaluations(search string, page int, limit int) ([]TechnicalEvaluation, int64, error)
	CreateEvaluation(eval *TechnicalEvaluation) error
}

type procurementRequestService struct {
	repo         ProcurementRequestRepository
	approvalRepo approval.ApprovalRepository
}

func NewProcurementRequestService(repo ProcurementRequestRepository, approvalRepo approval.ApprovalRepository) ProcurementRequestService {
	return &procurementRequestService{
		repo:         repo,
		approvalRepo: approvalRepo,
	}
}

func (s *procurementRequestService) FindAll(step string, status string, search string, creatorID *uuid.UUID, assignedToID *uuid.UUID, page int, limit int) ([]ProcurementRequest, int64, error) {
	return s.repo.FindAll(step, status, search, creatorID, assignedToID, page, limit)
}

func (s *procurementRequestService) GetByID(id uuid.UUID) (*ProcurementRequest, error) {
	return s.repo.GetByID(id)
}

func (s *procurementRequestService) Create(creatorID uuid.UUID, req ProcurementRequestCreate) (*ProcurementRequest, error) {
	reqNum := req.RequestNumber
	if reqNum == "" {
		generated, err := s.repo.GenerateRequestNumber()
		if err != nil {
			return nil, err
		}
		reqNum = generated
	}

	model := ProcurementRequest{
		RequestNumber:        reqNum,
		CreatorID:            creatorID,
		StructureID:          req.StructureID,
		RequestType:          req.RequestType,
		ContractType:         req.ContractType,
		ContractDuration:     req.ContractDuration,
		ParentContractNumber: req.ParentContractNumber,
		Priority:             req.Priority,
		WONumber:             req.WONumber,
		WODescription:        req.WODescription,
		PRKNumber:            req.PRKNumber,
		RABAmount:            req.RABAmount,
		SupportingFile:       req.SupportingFile,
		Notes:                req.Notes,
		PICResolutionID:      req.PICResolutionID,
		CurrentStep:          "USULAN_PERMINTAAN_I",
		CurrentStatus:        "DRAFT",
		CreatedByID:          &creatorID,
		UpdatedByID:          &creatorID,
	}

	if err := s.repo.Create(&model); err != nil {
		return nil, err
	}

	var items []RequestItem
	for _, itemReq := range req.Items {
		items = append(items, RequestItem{
			RequestID:      model.ID,
			StockCodeID:    itemReq.StockCodeID,
			ItemType:       itemReq.ItemType,
			ItemName:       itemReq.ItemName,
			Specification:  itemReq.Specification,
			Quantity:       itemReq.Quantity,
			Unit:           itemReq.Unit,
			EstimatedPrice: itemReq.EstimatedPrice,
			RequiredDate:   itemReq.RequiredDate,
			Purpose:        itemReq.Purpose,
			Notes:          itemReq.Notes,
			CreatedByID:    &creatorID,
			UpdatedByID:    &creatorID,
		})
	}
	if len(items) > 0 {
		_ = s.repo.ReplaceItems(model.ID, items)
	}

	return s.repo.GetByID(model.ID)
}

func (s *procurementRequestService) Update(id uuid.UUID, updaterID *uuid.UUID, req ProcurementRequestUpdate) (*ProcurementRequest, error) {
	model, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if model.CurrentStatus != "DRAFT" && model.CurrentStatus != "REVISED" {
		return nil, errors.New("cannot update request that is already submitted or approved")
	}

	if req.ContractType != "" {
		model.ContractType = req.ContractType
	}
	model.ContractDuration = req.ContractDuration
	model.ParentContractNumber = req.ParentContractNumber
	if req.Priority != "" {
		model.Priority = req.Priority
	}
	model.WONumber = req.WONumber
	model.WODescription = req.WODescription
	model.PRKNumber = req.PRKNumber
	if req.RABAmount != nil {
		model.RABAmount = *req.RABAmount
	}
	if req.SupportingFile != "" {
		model.SupportingFile = req.SupportingFile
	}
	model.Notes = req.Notes
	if req.PICResolutionID != nil {
		model.PICResolutionID = req.PICResolutionID
	}
	model.UpdatedByID = updaterID

	if err := s.repo.Update(model); err != nil {
		return nil, err
	}

	if req.Items != nil {
		var items []RequestItem
		for _, itemReq := range req.Items {
			items = append(items, RequestItem{
				RequestID:      model.ID,
				StockCodeID:    itemReq.StockCodeID,
				ItemType:       itemReq.ItemType,
				ItemName:       itemReq.ItemName,
				Specification:  itemReq.Specification,
				Quantity:       itemReq.Quantity,
				Unit:           itemReq.Unit,
				EstimatedPrice: itemReq.EstimatedPrice,
				RequiredDate:   itemReq.RequiredDate,
				Purpose:        itemReq.Purpose,
				Notes:          itemReq.Notes,
				UpdatedByID:    updaterID,
			})
		}
		_ = s.repo.ReplaceItems(model.ID, items)
	}

	return s.repo.GetByID(model.ID)
}

func (s *procurementRequestService) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	model, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	if model.CurrentStatus != "DRAFT" && model.CurrentStatus != "REVISED" {
		return errors.New("cannot delete request that is already in approval or approved")
	}
	return s.repo.Delete(id, deletedBy)
}

func (s *procurementRequestService) Distribute(id uuid.UUID, updaterID *uuid.UUID, req DistributeRequest) (*ProcurementRequest, error) {
	model, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	model.AssignedToID = &req.AssignedToID
	if model.CurrentStep == "USULAN_PERMINTAAN_I" {
		model.CurrentStep = "DISTRIBUSI_PERMINTAAN"
		model.CurrentStatus = "POSTED"
	}
	if req.Notes != "" {
		model.Notes = req.Notes
	}
	model.UpdatedByID = updaterID

	if err := s.repo.Update(model); err != nil {
		return nil, err
	}
	return s.repo.GetByID(model.ID)
}

func (s *procurementRequestService) SubmitForApproval(id uuid.UUID, approverID uuid.UUID, approverRole string, notes string) (*ProcurementRequest, error) {
	model, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	model.CurrentStatus = "IN_APPROVAL"
	model.UpdatedByID = &approverID
	if err := s.repo.Update(model); err != nil {
		return nil, err
	}

	seq, _ := s.approvalRepo.GetNextSequenceOrder(id)
	_ = s.approvalRepo.CreateHistory(&approval.ApprovalHistory{
		RequestID:       id,
		ApproverID:      approverID,
		ApproverRole:    approverRole,
		StageName:       model.CurrentStep,
		Action:          "SUBMIT",
		EvaluationNotes: notes,
		SequenceOrder:   seq,
		CreatedByID:     &approverID,
		UpdatedByID:     &approverID,
	})

	return s.repo.GetByID(model.ID)
}

func (s *procurementRequestService) Approve(id uuid.UUID, approverID uuid.UUID, approverRole string, notes string) (*ProcurementRequest, error) {
	model, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if model.CurrentStep == "USULAN_PERMINTAAN_I" {
		model.CurrentStatus = "APPROVED"
	} else if model.CurrentStep == "USULAN_PERMINTAAN_II" {
		model.CurrentStatus = "APPROVED"
		model.CurrentStep = "INVENTORY" // Siap diproses bagian Inventori (RO/HPE)
	}
	model.UpdatedByID = &approverID

	if err := s.repo.Update(model); err != nil {
		return nil, err
	}

	seq, _ := s.approvalRepo.GetNextSequenceOrder(id)
	_ = s.approvalRepo.CreateHistory(&approval.ApprovalHistory{
		RequestID:       id,
		ApproverID:      approverID,
		ApproverRole:    approverRole,
		StageName:       model.CurrentStep,
		Action:          "APPROVE",
		EvaluationNotes: notes,
		SequenceOrder:   seq,
		CreatedByID:     &approverID,
		UpdatedByID:     &approverID,
	})

	return s.repo.GetByID(model.ID)
}

func (s *procurementRequestService) Revise(id uuid.UUID, approverID uuid.UUID, approverRole string, notes string) (*ProcurementRequest, error) {
	model, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	model.CurrentStatus = "REVISED"
	model.UpdatedByID = &approverID
	if err := s.repo.Update(model); err != nil {
		return nil, err
	}

	seq, _ := s.approvalRepo.GetNextSequenceOrder(id)
	_ = s.approvalRepo.CreateHistory(&approval.ApprovalHistory{
		RequestID:       id,
		ApproverID:      approverID,
		ApproverRole:    approverRole,
		StageName:       model.CurrentStep,
		Action:          "REVISE",
		EvaluationNotes: notes,
		SequenceOrder:   seq,
		CreatedByID:     &approverID,
		UpdatedByID:     &approverID,
	})

	return s.repo.GetByID(model.ID)
}

func (s *procurementRequestService) Reject(id uuid.UUID, approverID uuid.UUID, approverRole string, notes string) (*ProcurementRequest, error) {
	model, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	model.CurrentStatus = "REJECTED"
	model.UpdatedByID = &approverID
	if err := s.repo.Update(model); err != nil {
		return nil, err
	}

	seq, _ := s.approvalRepo.GetNextSequenceOrder(id)
	_ = s.approvalRepo.CreateHistory(&approval.ApprovalHistory{
		RequestID:       id,
		ApproverID:      approverID,
		ApproverRole:    approverRole,
		StageName:       model.CurrentStep,
		Action:          "REJECT",
		EvaluationNotes: notes,
		SequenceOrder:   seq,
		CreatedByID:     &approverID,
		UpdatedByID:     &approverID,
	})

	return s.repo.GetByID(model.ID)
}

func (s *procurementRequestService) FindDistributions(search string, page int, limit int) ([]RequestDistribution, int64, error) {
	return s.repo.FindDistributions(search, page, limit)
}

func (s *procurementRequestService) CreateDistribution(dist *RequestDistribution) error {
	return s.repo.CreateDistribution(dist)
}

func (s *procurementRequestService) FindAddendums(search string, page int, limit int) ([]RequestAddendum, int64, error) {
	return s.repo.FindAddendums(search, page, limit)
}

func (s *procurementRequestService) CreateAddendum(add *RequestAddendum) error {
	return s.repo.CreateAddendum(add)
}

func (s *procurementRequestService) FindEvaluations(search string, page int, limit int) ([]TechnicalEvaluation, int64, error) {
	return s.repo.FindEvaluations(search, page, limit)
}

func (s *procurementRequestService) CreateEvaluation(eval *TechnicalEvaluation) error {
	return s.repo.CreateEvaluation(eval)
}
