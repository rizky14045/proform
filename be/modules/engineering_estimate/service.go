package engineering_estimate

import (
	"errors"
	"template/modules/approval"
	"template/modules/procurement_request"

	"github.com/google/uuid"
)

type EngineeringEstimateService interface {
	// HPE
	FindAllHPE(search string, status string) ([]EngineeringEstimate, error)
	GetHPEByID(id uuid.UUID) (*EngineeringEstimate, error)
	CreateHPE(creatorID *uuid.UUID, req EngineeringEstimateRequest) (*EngineeringEstimate, error)
	UpdateHPE(id uuid.UUID, updaterID *uuid.UUID, req EngineeringEstimateRequest) (*EngineeringEstimate, error)
	DeleteHPE(id uuid.UUID, deletedBy *uuid.UUID) error
	SubmitHPE(id uuid.UUID, approverID uuid.UUID, role string, notes string) (*EngineeringEstimate, error)
	ApproveHPE(id uuid.UUID, approverID uuid.UUID, role string, notes string) (*EngineeringEstimate, error)

	// RKS
	FindAllRKS(search string, status string) ([]RKSDocument, error)
	GetRKSByID(id uuid.UUID) (*RKSDocument, error)
	CreateRKS(creatorID *uuid.UUID, req RKSRequest) (*RKSDocument, error)
	UpdateRKS(id uuid.UUID, updaterID *uuid.UUID, req RKSRequest) (*RKSDocument, error)
	DeleteRKS(id uuid.UUID, deletedBy *uuid.UUID) error

	// VFM
	FindAllVFM(requestID *uuid.UUID, stage string) ([]ValueForMoneyReview, error)
	GetVFMByID(id uuid.UUID) (*ValueForMoneyReview, error)
	CreateVFM(reviewerID *uuid.UUID, req VFMReviewRequest) (*ValueForMoneyReview, error)
}

type engineeringEstimateService struct {
	repo         EngineeringEstimateRepository
	procReqRepo  procurement_request.ProcurementRequestRepository
	approvalRepo approval.ApprovalRepository
}

func NewEngineeringEstimateService(repo EngineeringEstimateRepository, procReqRepo procurement_request.ProcurementRequestRepository, approvalRepo approval.ApprovalRepository) EngineeringEstimateService {
	return &engineeringEstimateService{
		repo:         repo,
		procReqRepo:  procReqRepo,
		approvalRepo: approvalRepo,
	}
}

func (s *engineeringEstimateService) FindAllHPE(search string, status string) ([]EngineeringEstimate, error) {
	return s.repo.FindAllHPE(search, status)
}

func (s *engineeringEstimateService) GetHPEByID(id uuid.UUID) (*EngineeringEstimate, error) {
	return s.repo.GetHPEByID(id)
}

func (s *engineeringEstimateService) CreateHPE(creatorID *uuid.UUID, req EngineeringEstimateRequest) (*EngineeringEstimate, error) {
	num := req.HPENumber
	if num == "" {
		generated, err := s.repo.GenerateHPENumber()
		if err != nil {
			return nil, err
		}
		num = generated
	}

	taxIncluded := true
	if req.TaxIncluded != nil {
		taxIncluded = *req.TaxIncluded
	}

	hpe := EngineeringEstimate{
		RequestID:         req.RequestID,
		HPENumber:         num,
		ProcurementMethod: req.ProcurementMethod,
		ReferenceVendor1:  req.ReferenceVendor1,
		ReferenceVendor2:  req.ReferenceVendor2,
		ReferenceVendor3:  req.ReferenceVendor3,
		ReferenceVendor4:  req.ReferenceVendor4,
		TotalHPE:          req.TotalHPE,
		TaxIncluded:       taxIncluded,
		Status:            "DRAFT",
		Notes:             req.Notes,
		SupportingFile:    req.SupportingFile,
		CreatedByID:       creatorID,
		UpdatedByID:       creatorID,
	}

	if err := s.repo.CreateHPE(&hpe); err != nil {
		return nil, err
	}
	return s.repo.GetHPEByID(hpe.ID)
}

func (s *engineeringEstimateService) UpdateHPE(id uuid.UUID, updaterID *uuid.UUID, req EngineeringEstimateRequest) (*EngineeringEstimate, error) {
	hpe, err := s.repo.GetHPEByID(id)
	if err != nil {
		return nil, err
	}

	if hpe.Status != "DRAFT" && hpe.Status != "REVISED" {
		return nil, errors.New("cannot update HPE that is already submitted or approved")
	}

	hpe.ProcurementMethod = req.ProcurementMethod
	hpe.ReferenceVendor1 = req.ReferenceVendor1
	hpe.ReferenceVendor2 = req.ReferenceVendor2
	hpe.ReferenceVendor3 = req.ReferenceVendor3
	hpe.ReferenceVendor4 = req.ReferenceVendor4
	hpe.TotalHPE = req.TotalHPE
	if req.TaxIncluded != nil {
		hpe.TaxIncluded = *req.TaxIncluded
	}
	hpe.Notes = req.Notes
	if req.SupportingFile != "" {
		hpe.SupportingFile = req.SupportingFile
	}
	hpe.UpdatedByID = updaterID

	if err := s.repo.UpdateHPE(hpe); err != nil {
		return nil, err
	}
	return s.repo.GetHPEByID(hpe.ID)
}

func (s *engineeringEstimateService) DeleteHPE(id uuid.UUID, deletedBy *uuid.UUID) error {
	hpe, err := s.repo.GetHPEByID(id)
	if err != nil {
		return err
	}
	if hpe.Status != "DRAFT" && hpe.Status != "REVISED" {
		return errors.New("cannot delete HPE that is already submitted or approved")
	}
	return s.repo.DeleteHPE(id, deletedBy)
}

func (s *engineeringEstimateService) SubmitHPE(id uuid.UUID, approverID uuid.UUID, role string, notes string) (*EngineeringEstimate, error) {
	hpe, err := s.repo.GetHPEByID(id)
	if err != nil {
		return nil, err
	}
	hpe.Status = "IN_APPROVAL"
	hpe.UpdatedByID = &approverID
	if err := s.repo.UpdateHPE(hpe); err != nil {
		return nil, err
	}

	seq, _ := s.approvalRepo.GetNextSequenceOrder(hpe.RequestID)
	_ = s.approvalRepo.CreateHistory(&approval.ApprovalHistory{
		RequestID:       hpe.RequestID,
		ApproverID:      approverID,
		ApproverRole:    role,
		StageName:       "HPE",
		Action:          "SUBMIT",
		EvaluationNotes: notes,
		SequenceOrder:   seq,
		CreatedByID:     &approverID,
		UpdatedByID:     &approverID,
	})

	return s.repo.GetHPEByID(hpe.ID)
}

func (s *engineeringEstimateService) ApproveHPE(id uuid.UUID, approverID uuid.UUID, role string, notes string) (*EngineeringEstimate, error) {
	hpe, err := s.repo.GetHPEByID(id)
	if err != nil {
		return nil, err
	}
	hpe.Status = "APPROVED"
	hpe.UpdatedByID = &approverID
	if err := s.repo.UpdateHPE(hpe); err != nil {
		return nil, err
	}

	// Update procurement request step to next
	if procReq, err := s.procReqRepo.GetByID(hpe.RequestID); err == nil {
		procReq.CurrentStep = "HPE_APPROVED"
		procReq.UpdatedByID = &approverID
		_ = s.procReqRepo.Update(procReq)
	}

	seq, _ := s.approvalRepo.GetNextSequenceOrder(hpe.RequestID)
	_ = s.approvalRepo.CreateHistory(&approval.ApprovalHistory{
		RequestID:       hpe.RequestID,
		ApproverID:      approverID,
		ApproverRole:    role,
		StageName:       "HPE",
		Action:          "APPROVE",
		EvaluationNotes: notes,
		SequenceOrder:   seq,
		CreatedByID:     &approverID,
		UpdatedByID:     &approverID,
	})

	return s.repo.GetHPEByID(hpe.ID)
}

func (s *engineeringEstimateService) FindAllRKS(search string, status string) ([]RKSDocument, error) {
	return s.repo.FindAllRKS(search, status)
}

func (s *engineeringEstimateService) GetRKSByID(id uuid.UUID) (*RKSDocument, error) {
	return s.repo.GetRKSByID(id)
}

func (s *engineeringEstimateService) CreateRKS(creatorID *uuid.UUID, req RKSRequest) (*RKSDocument, error) {
	num := req.RKSNumber
	if num == "" {
		generated, err := s.repo.GenerateRKSNumber()
		if err != nil {
			return nil, err
		}
		num = generated
	}

	rks := RKSDocument{
		HPEID:        req.HPEID,
		RKSNumber:    num,
		Title:        req.Title,
		GeneralTerms: req.GeneralTerms,
		SpecialTerms: req.SpecialTerms,
		IsAddendum:   req.IsAddendum,
		AddendumTo:   req.AddendumTo,
		Status:       "DRAFT",
		CreatedByID:  creatorID,
		UpdatedByID:  creatorID,
	}

	if err := s.repo.CreateRKS(&rks); err != nil {
		return nil, err
	}
	return s.repo.GetRKSByID(rks.ID)
}

func (s *engineeringEstimateService) UpdateRKS(id uuid.UUID, updaterID *uuid.UUID, req RKSRequest) (*RKSDocument, error) {
	rks, err := s.repo.GetRKSByID(id)
	if err != nil {
		return nil, err
	}

	rks.Title = req.Title
	rks.GeneralTerms = req.GeneralTerms
	rks.SpecialTerms = req.SpecialTerms
	rks.IsAddendum = req.IsAddendum
	rks.AddendumTo = req.AddendumTo
	rks.UpdatedByID = updaterID

	if err := s.repo.UpdateRKS(rks); err != nil {
		return nil, err
	}
	return s.repo.GetRKSByID(rks.ID)
}

func (s *engineeringEstimateService) DeleteRKS(id uuid.UUID, deletedBy *uuid.UUID) error {
	return s.repo.DeleteRKS(id, deletedBy)
}

func (s *engineeringEstimateService) FindAllVFM(requestID *uuid.UUID, stage string) ([]ValueForMoneyReview, error) {
	return s.repo.FindAllVFM(requestID, stage)
}

func (s *engineeringEstimateService) GetVFMByID(id uuid.UUID) (*ValueForMoneyReview, error) {
	return s.repo.GetVFMByID(id)
}

func (s *engineeringEstimateService) CreateVFM(reviewerID *uuid.UUID, req VFMReviewRequest) (*ValueForMoneyReview, error) {
	num := req.ReviewNumber
	if num == "" {
		generated, err := s.repo.GenerateVFMNumber(req.Stage)
		if err != nil {
			return nil, err
		}
		num = generated
	}

	vfm := ValueForMoneyReview{
		RequestID:          req.RequestID,
		Stage:              req.Stage,
		ReviewNumber:       num,
		EfficiencyAnalysis: req.EfficiencyAnalysis,
		Status:             "APPROVED",
		ReviewedByID:       reviewerID,
		CreatedByID:        reviewerID,
		UpdatedByID:        reviewerID,
	}

	if err := s.repo.CreateVFM(&vfm); err != nil {
		return nil, err
	}
	return s.repo.GetVFMByID(vfm.ID)
}
