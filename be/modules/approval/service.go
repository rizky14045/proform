package approval

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type ApprovalService interface {
	FindStructures(menu string, status string) ([]ApprovalStructure, error)
	GetStructureByID(id uuid.UUID) (*ApprovalStructure, error)
	CreateStructure(creatorID *uuid.UUID, req ApprovalStructureRequest) (*ApprovalStructure, error)
	UpdateStructure(id uuid.UUID, updaterID *uuid.UUID, req ApprovalStructureRequest) (*ApprovalStructure, error)
	DeleteStructure(id uuid.UUID, deletedBy *uuid.UUID) error

	GetHistories(requestID uuid.UUID) ([]ApprovalHistory, error)
	RecordAction(approverID uuid.UUID, approverRole string, req ApprovalActionRequest) (*ApprovalHistory, error)
}

type approvalService struct {
	repo ApprovalRepository
}

func NewApprovalService(repo ApprovalRepository) ApprovalService {
	return &approvalService{repo: repo}
}

func (s *approvalService) FindStructures(menu string, status string) ([]ApprovalStructure, error) {
	return s.repo.FindStructures(menu, status)
}

func (s *approvalService) GetStructureByID(id uuid.UUID) (*ApprovalStructure, error) {
	return s.repo.GetStructureByID(id)
}

func (s *approvalService) CreateStructure(creatorID *uuid.UUID, req ApprovalStructureRequest) (*ApprovalStructure, error) {
	isFinal := false
	if req.ApprovalFinal != nil {
		isFinal = *req.ApprovalFinal
	}

	item := ApprovalStructure{
		RequestStructureID:  req.RequestStructureID,
		ApprovalStructureID: req.ApprovalStructureID,
		Menu:                req.Menu,
		ApprovalFinal:       isFinal,
		Status:              req.Status,
		CreatedByID:         creatorID,
		UpdatedByID:         creatorID,
	}

	if err := s.repo.CreateStructure(&item); err != nil {
		return nil, err
	}
	return s.repo.GetStructureByID(item.ID)
}

func (s *approvalService) UpdateStructure(id uuid.UUID, updaterID *uuid.UUID, req ApprovalStructureRequest) (*ApprovalStructure, error) {
	item, err := s.repo.GetStructureByID(id)
	if err != nil {
		return nil, err
	}

	item.RequestStructureID = req.RequestStructureID
	item.ApprovalStructureID = req.ApprovalStructureID
	item.Menu = req.Menu
	if req.ApprovalFinal != nil {
		item.ApprovalFinal = *req.ApprovalFinal
	}
	if req.Status != "" {
		item.Status = req.Status
	}
	item.UpdatedByID = updaterID

	if err := s.repo.UpdateStructure(item); err != nil {
		return nil, err
	}
	return s.repo.GetStructureByID(item.ID)
}

func (s *approvalService) DeleteStructure(id uuid.UUID, deletedBy *uuid.UUID) error {
	return s.repo.DeleteStructure(id, deletedBy)
}

func (s *approvalService) GetHistories(requestID uuid.UUID) ([]ApprovalHistory, error) {
	return s.repo.FindHistoriesByRequestID(requestID)
}

func (s *approvalService) RecordAction(approverID uuid.UUID, approverRole string, req ApprovalActionRequest) (*ApprovalHistory, error) {
	if req.Action != "SUBMIT" && req.Action != "APPROVE" && req.Action != "REVISE" && req.Action != "REJECT" {
		return nil, errors.New("invalid approval action. Allowed: SUBMIT, APPROVE, REVISE, REJECT")
	}

	seq, _ := s.repo.GetNextSequenceOrder(req.RequestID)

	history := ApprovalHistory{
		RequestID:       req.RequestID,
		ApproverID:      approverID,
		ApproverRole:    approverRole,
		StageName:       req.StageName,
		Action:          req.Action,
		EvaluationNotes: req.EvaluationNotes,
		SequenceOrder:   seq,
		ActionTimestamp: time.Now(),
		CreatedByID:     &approverID,
		UpdatedByID:     &approverID,
	}

	if err := s.repo.CreateHistory(&history); err != nil {
		return nil, err
	}
	return &history, nil
}
