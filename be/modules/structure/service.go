package structure

import (
	"errors"

	"github.com/google/uuid"
)

type StructureService interface {
	FindAll(search string, status string) ([]Structure, error)
	GetByID(id uuid.UUID) (*Structure, error)
	Create(creatorID *uuid.UUID, req StructureRequest) (*Structure, error)
	Update(id uuid.UUID, updaterID *uuid.UUID, req StructureRequest) (*Structure, error)
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
}

type structureService struct {
	repo StructureRepository
}

func NewStructureService(repo StructureRepository) StructureService {
	return &structureService{repo: repo}
}

func (s *structureService) FindAll(search string, status string) ([]Structure, error) {
	return s.repo.FindAll(search, status)
}

func (s *structureService) GetByID(id uuid.UUID) (*Structure, error) {
	return s.repo.GetByID(id)
}

func (s *structureService) Create(creatorID *uuid.UUID, req StructureRequest) (*Structure, error) {
	existing, _ := s.repo.GetByCode(req.Code)
	if existing != nil {
		return nil, errors.New("structure code already exists")
	}

	structure := Structure{
		Code:        req.Code,
		Name:        req.Name,
		Description: req.Description,
		ParentID:    req.ParentID,
		Status:      req.Status,
		CreatedByID: creatorID,
		UpdatedByID: creatorID,
	}

	if err := s.repo.Create(&structure); err != nil {
		return nil, err
	}
	return &structure, nil
}

func (s *structureService) Update(id uuid.UUID, updaterID *uuid.UUID, req StructureRequest) (*Structure, error) {
	item, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if req.Code != "" && req.Code != item.Code {
		existing, _ := s.repo.GetByCode(req.Code)
		if existing != nil {
			return nil, errors.New("structure code already in use")
		}
		item.Code = req.Code
	}

	if req.Name != "" {
		item.Name = req.Name
	}
	item.Description = req.Description
	item.ParentID = req.ParentID
	if req.Status != "" {
		item.Status = req.Status
	}
	item.UpdatedByID = updaterID

	if err := s.repo.Update(item); err != nil {
		return nil, err
	}
	return item, nil
}

func (s *structureService) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	return s.repo.Delete(id, deletedBy)
}
