package general

import (
	"github.com/google/uuid"
)

type GeneralService interface {
	FindAll(group string, search string, status string) ([]General, error)
	GetByID(id uuid.UUID) (*General, error)
	Create(creatorID *uuid.UUID, req GeneralRequest) (*General, error)
	Update(id uuid.UUID, updaterID *uuid.UUID, req GeneralRequest) (*General, error)
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
}

type generalService struct {
	repo GeneralRepository
}

func NewGeneralService(repo GeneralRepository) GeneralService {
	return &generalService{repo: repo}
}

func (s *generalService) FindAll(group string, search string, status string) ([]General, error) {
	return s.repo.FindAll(group, search, status)
}

func (s *generalService) GetByID(id uuid.UUID) (*General, error) {
	return s.repo.GetByID(id)
}

func (s *generalService) Create(creatorID *uuid.UUID, req GeneralRequest) (*General, error) {
	general := General{
		Group:       req.Group,
		Description: req.Description,
		Status:      req.Status,
		CreatedByID: creatorID,
		UpdatedByID: creatorID,
	}

	if err := s.repo.Create(&general); err != nil {
		return nil, err
	}
	return &general, nil
}

func (s *generalService) Update(id uuid.UUID, updaterID *uuid.UUID, req GeneralRequest) (*General, error) {
	item, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if req.Group != "" {
		item.Group = req.Group
	}
	if req.Description != "" {
		item.Description = req.Description
	}
	if req.Status != "" {
		item.Status = req.Status
	}
	item.UpdatedByID = updaterID

	if err := s.repo.Update(item); err != nil {
		return nil, err
	}
	return item, nil
}

func (s *generalService) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	return s.repo.Delete(id, deletedBy)
}
