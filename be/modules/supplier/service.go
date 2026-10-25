package supplier

import (
	"errors"

	"github.com/google/uuid"
)

type SupplierService interface {
	FindAll(search string, status string, page int, limit int) ([]Supplier, int64, error)
	GetByID(id uuid.UUID) (*Supplier, error)
	Create(creatorID *uuid.UUID, req SupplierRequest) (*Supplier, error)
	Update(id uuid.UUID, updaterID *uuid.UUID, req SupplierRequest) (*Supplier, error)
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
}

type supplierService struct {
	repo SupplierRepository
}

func NewSupplierService(repo SupplierRepository) SupplierService {
	return &supplierService{repo: repo}
}

func (s *supplierService) FindAll(search string, status string, page int, limit int) ([]Supplier, int64, error) {
	return s.repo.FindAll(search, status, page, limit)
}

func (s *supplierService) GetByID(id uuid.UUID) (*Supplier, error) {
	return s.repo.GetByID(id)
}

func (s *supplierService) Create(creatorID *uuid.UUID, req SupplierRequest) (*Supplier, error) {
	existing, _ := s.repo.GetByCode(req.Code)
	if existing != nil {
		return nil, errors.New("supplier code already exists")
	}

	supplier := Supplier{
		Code:            req.Code,
		Name:            req.Name,
		PICName:         req.PICName,
		Phone:           req.Phone,
		Email:           req.Email,
		Address:         req.Address,
		Fax:             req.Fax,
		Status:          req.Status,
		OrderPICName:    req.OrderPICName,
		OrderPICEmail:   req.OrderPICEmail,
		OrderPICAddress: req.OrderPICAddress,
		OrderPICPhone:   req.OrderPICPhone,
		CreatedByID:     creatorID,
		UpdatedByID:     creatorID,
	}

	if err := s.repo.Create(&supplier); err != nil {
		return nil, err
	}
	return &supplier, nil
}

func (s *supplierService) Update(id uuid.UUID, updaterID *uuid.UUID, req SupplierRequest) (*Supplier, error) {
	supplier, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if req.Code != "" && req.Code != supplier.Code {
		existing, _ := s.repo.GetByCode(req.Code)
		if existing != nil {
			return nil, errors.New("supplier code already in use")
		}
		supplier.Code = req.Code
	}

	if req.Name != "" {
		supplier.Name = req.Name
	}
	supplier.PICName = req.PICName
	supplier.Phone = req.Phone
	supplier.Email = req.Email
	supplier.Address = req.Address
	supplier.Fax = req.Fax
	if req.Status != "" {
		supplier.Status = req.Status
	}
	supplier.OrderPICName = req.OrderPICName
	supplier.OrderPICEmail = req.OrderPICEmail
	supplier.OrderPICAddress = req.OrderPICAddress
	supplier.OrderPICPhone = req.OrderPICPhone
	supplier.UpdatedByID = updaterID

	if err := s.repo.Update(supplier); err != nil {
		return nil, err
	}
	return supplier, nil
}

func (s *supplierService) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	return s.repo.Delete(id, deletedBy)
}
