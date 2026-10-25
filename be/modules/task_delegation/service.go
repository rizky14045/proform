package task_delegation

import (
	"template/modules/procurement_request"

	"github.com/google/uuid"
)

type TaskDelegationService interface {
	FindAll(search string) ([]TaskDelegation, error)
	GetByID(id uuid.UUID) (*TaskDelegation, error)
	Create(assignedByID uuid.UUID, creatorID *uuid.UUID, req TaskDelegationRequest) (*TaskDelegation, error)
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
}

type taskDelegationService struct {
	repo        TaskDelegationRepository
	procReqRepo procurement_request.ProcurementRequestRepository
}

func NewTaskDelegationService(repo TaskDelegationRepository, procReqRepo procurement_request.ProcurementRequestRepository) TaskDelegationService {
	return &taskDelegationService{
		repo:        repo,
		procReqRepo: procReqRepo,
	}
}

func (s *taskDelegationService) FindAll(search string) ([]TaskDelegation, error) {
	return s.repo.FindAll(search)
}

func (s *taskDelegationService) GetByID(id uuid.UUID) (*TaskDelegation, error) {
	return s.repo.GetByID(id)
}

func (s *taskDelegationService) Create(assignedByID uuid.UUID, creatorID *uuid.UUID, req TaskDelegationRequest) (*TaskDelegation, error) {
	delegation := TaskDelegation{
		TaskType:          req.TaskType,
		OriginalUserID:    req.OriginalUserID,
		ReplacementUserID: req.ReplacementUserID,
		RequestID:         req.RequestID,
		AssignedByID:      assignedByID,
		Notes:             req.Notes,
		Status:            "POSTED",
		CreatedByID:       creatorID,
		UpdatedByID:       creatorID,
	}

	if err := s.repo.Create(&delegation); err != nil {
		return nil, err
	}

	// Alihkan tugas pada procurement request jika disertakan
	if req.RequestID != nil {
		if procReq, err := s.procReqRepo.GetByID(*req.RequestID); err == nil && procReq != nil {
			procReq.AssignedToID = &req.ReplacementUserID
			procReq.UpdatedByID = creatorID
			_ = s.procReqRepo.Update(procReq)
		}
	}

	return s.repo.GetByID(delegation.ID)
}

func (s *taskDelegationService) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	return s.repo.Delete(id, deletedBy)
}
