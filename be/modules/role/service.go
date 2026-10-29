package role

import (
	"errors"

	"github.com/google/uuid"
)

type RoleService interface {
	FindAll(search string, status string, page int, limit int) ([]Role, int64, error)
	GetByID(id uuid.UUID) (*Role, error)
	Create(creatorID *uuid.UUID, req RoleRequest) (*Role, error)
	Update(id uuid.UUID, updaterID *uuid.UUID, req RoleRequest) (*Role, error)
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error

	// UserRole methods
	FindUserRoles(search string, page int, limit int) ([]UserRole, int64, error)
	GetUserRoleByID(id uuid.UUID) (*UserRole, error)
	CreateUserRole(ur *UserRole) error
	UpdateUserRole(id uuid.UUID, ur *UserRole) error
	DeleteUserRole(id uuid.UUID) error
}

type roleService struct {
	repo RoleRepository
}

func NewRoleService(repo RoleRepository) RoleService {
	return &roleService{repo: repo}
}

func (s *roleService) FindAll(search string, status string, page int, limit int) ([]Role, int64, error) {
	return s.repo.FindAll(search, status, page, limit)
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

func (s *roleService) FindUserRoles(search string, page int, limit int) ([]UserRole, int64, error) {
	return s.repo.FindUserRoles(search, page, limit)
}

func (s *roleService) GetUserRoleByID(id uuid.UUID) (*UserRole, error) {
	return s.repo.GetUserRoleByID(id)
}

func (s *roleService) CreateUserRole(ur *UserRole) error {
	return s.repo.CreateUserRole(ur)
}

func (s *roleService) UpdateUserRole(id uuid.UUID, ur *UserRole) error {
	existing, err := s.repo.GetUserRoleByID(id)
	if err != nil {
		return err
	}
	existing.RoleID = ur.RoleID
	existing.SpecialAccess = ur.SpecialAccess
	existing.Status = ur.Status
	return s.repo.UpdateUserRole(existing)
}

func (s *roleService) DeleteUserRole(id uuid.UUID) error {
	return s.repo.DeleteUserRole(id)
}

