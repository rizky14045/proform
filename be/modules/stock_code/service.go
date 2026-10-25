package stock_code

import (
	"errors"

	"github.com/google/uuid"
)

type StockCodeService interface {
	FindAll(search string, status string, page int, limit int) ([]StockCode, int64, error)
	GetByID(id uuid.UUID) (*StockCode, error)
	Create(creatorID *uuid.UUID, req StockCodeRequest) (*StockCode, error)
	Update(id uuid.UUID, updaterID *uuid.UUID, req StockCodeRequest) (*StockCode, error)
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
}

type stockCodeService struct {
	repo StockCodeRepository
}

func NewStockCodeService(repo StockCodeRepository) StockCodeService {
	return &stockCodeService{repo: repo}
}

func (s *stockCodeService) FindAll(search string, status string, page int, limit int) ([]StockCode, int64, error) {
	return s.repo.FindAll(search, status, page, limit)
}

func (s *stockCodeService) GetByID(id uuid.UUID) (*StockCode, error) {
	return s.repo.GetByID(id)
}

func (s *stockCodeService) Create(creatorID *uuid.UUID, req StockCodeRequest) (*StockCode, error) {
	existing, _ := s.repo.GetByCode(req.Code)
	if existing != nil {
		return nil, errors.New("stock code already exists")
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	item := StockCode{
		Code:          req.Code,
		Name:          req.Name,
		Description:   req.Description,
		UOI:           req.UOI,
		SOH:           req.SOH,
		WarehouseCode: req.WarehouseCode,
		BinLocation:   req.BinLocation,
		Mnemonic:      req.Mnemonic,
		PartNumber:    req.PartNumber,
		IsActive:      isActive,
		CreatedByID:   creatorID,
		UpdatedByID:   creatorID,
	}

	if err := s.repo.Create(&item); err != nil {
		return nil, err
	}
	return &item, nil
}

func (s *stockCodeService) Update(id uuid.UUID, updaterID *uuid.UUID, req StockCodeRequest) (*StockCode, error) {
	item, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if req.Code != "" && req.Code != item.Code {
		existing, _ := s.repo.GetByCode(req.Code)
		if existing != nil {
			return nil, errors.New("stock code already in use")
		}
		item.Code = req.Code
	}

	if req.Name != "" {
		item.Name = req.Name
	}
	item.Description = req.Description
	item.UOI = req.UOI
	item.SOH = req.SOH
	item.WarehouseCode = req.WarehouseCode
	item.BinLocation = req.BinLocation
	item.Mnemonic = req.Mnemonic
	item.PartNumber = req.PartNumber
	if req.IsActive != nil {
		item.IsActive = *req.IsActive
	}
	item.UpdatedByID = updaterID

	if err := s.repo.Update(item); err != nil {
		return nil, err
	}
	return item, nil
}

func (s *stockCodeService) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	return s.repo.Delete(id, deletedBy)
}
