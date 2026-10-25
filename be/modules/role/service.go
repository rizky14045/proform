package role

import (
	"errors"

	"github.com/google/uuid"
)

type RoleService interface {
	FindAll(search string, status string) ([]Role, error)
	GetByID(id uuid.UUID) (*Role, error)
	Create(creatorID *uuid.UUID, req RoleRequest) (*Role, error)
	Update(id uuid.UUID, updaterID *uuid.UUID, req RoleRequest) (*Role, error)
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
}

type roleService struct {
	repo RoleRepository
}

func NewRoleService(repo RoleRepository) RoleService {
	return &roleService{repo: repo}
}

func (s *roleService) FindAll(search string, status string) ([]Role, error) {
	return s.repo.FindAll(search, status)
}

func (s *roleService) GetByID(id uuid.UUID) (*Role, error) {
	return s.repo.GetByID(id)
}

func (s *roleService) Create(creatorID *uuid.UUID, req RoleRequest) (*Role, error) {
	existing, _ := s.repo.GetByCode(req.Code)
	if existing != nil {
		return nil, errors.New("role code already exists")
	}

	role := Role{
		Code:        req.Code,
		Name:        req.Name,
		Description: req.Description,
		Status:      req.Status,
		CreatedByID: creatorID,
		UpdatedByID: creatorID,
	}

	if err := s.repo.Create(&role); err != nil {
		return nil, err
	}
	return &role, nil
}

func (s *roleService) Update(id uuid.UUID, updaterID *uuid.UUID, req RoleRequest) (*Role, error) {
	role, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if req.Code != "" && req.Code != role.Code {
		existing, _ := s.repo.GetByCode(req.Code)
		if existing != nil {
			return nil, errors.New("role code already in use")
		}
		role.Code = req.Code
	}

	if req.Name != "" {
		role.Name = req.Name
	}
	role.Description = req.Description
	if req.Status != "" {
		role.Status = req.Status
	}
	role.UpdatedByID = updaterID

	if err := s.repo.Update(role); err != nil {
		return nil, err
	}
	return role, nil
}

func (s *roleService) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	return s.repo.Delete(id, deletedBy)
}
