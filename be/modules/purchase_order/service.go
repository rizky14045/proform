package purchase_order

import (
	"template/modules/procurement_request"

	"github.com/google/uuid"
)

type PurchaseOrderService interface {
	FindAllPO(search string, status string, page int, limit int) ([]PurchaseOrder, int64, error)
	GetPOByID(id uuid.UUID) (*PurchaseOrder, error)
	GetPOByRequestID(requestID uuid.UUID) (*PurchaseOrder, error)
	CreatePO(creatorID *uuid.UUID, req PurchaseOrderRequest) (*PurchaseOrder, error)
	UpdatePO(id uuid.UUID, updaterID *uuid.UUID, req PurchaseOrderRequest) (*PurchaseOrder, error)
	DeletePO(id uuid.UUID, deletedBy *uuid.UUID) error

	FindAllBG(search string, status string) ([]BankGuarantee, error)
	GetBGByID(id uuid.UUID) (*BankGuarantee, error)
	CreateBG(creatorID *uuid.UUID, req BankGuaranteeRequest) (*BankGuarantee, error)
	UpdateBG(id uuid.UUID, updaterID *uuid.UUID, req BankGuaranteeRequest) (*BankGuarantee, error)
	DeleteBG(id uuid.UUID, deletedBy *uuid.UUID) error
}

type purchaseOrderService struct {
	repo        PurchaseOrderRepository
	procReqRepo procurement_request.ProcurementRequestRepository
}

func NewPurchaseOrderService(repo PurchaseOrderRepository, procReqRepo procurement_request.ProcurementRequestRepository) PurchaseOrderService {
	return &purchaseOrderService{
		repo:        repo,
		procReqRepo: procReqRepo,
	}
}

func (s *purchaseOrderService) FindAllPO(search string, status string, page int, limit int) ([]PurchaseOrder, int64, error) {
	return s.repo.FindAllPO(search, status, page, limit)
}

func (s *purchaseOrderService) GetPOByID(id uuid.UUID) (*PurchaseOrder, error) {
	return s.repo.GetPOByID(id)
}

func (s *purchaseOrderService) GetPOByRequestID(requestID uuid.UUID) (*PurchaseOrder, error) {
	return s.repo.GetPOByRequestID(requestID)
}

func (s *purchaseOrderService) CreatePO(creatorID *uuid.UUID, req PurchaseOrderRequest) (*PurchaseOrder, error) {
	num := req.PONumber
	if num == "" {
		generated, err := s.repo.GeneratePONumber()
		if err != nil {
			return nil, err
		}
		num = generated
	}

	po := PurchaseOrder{
		RequestID:        req.RequestID,
		SupplierID:       req.SupplierID,
		PONumber:         num,
		PODate:           req.PODate,
		TotalAmount:      req.TotalAmount,
		DeliveryDeadline: req.DeliveryDeadline,
		Status:           "ISSUED",
		ContractType:     req.ContractType,
		IsAddendum:       req.IsAddendum,
		AddendumNumber:   req.AddendumNumber,
		PICResolutionID:  req.PICResolutionID,
		Notes:            req.Notes,
		CreatedByID:      creatorID,
		UpdatedByID:      creatorID,
	}

	if err := s.repo.CreatePO(&po); err != nil {
		return nil, err
	}

	// Update procurement request step
	if procReq, err := s.procReqRepo.GetByID(req.RequestID); err == nil {
		procReq.CurrentStep = "PO_ISSUED"
		procReq.UpdatedByID = creatorID
		_ = s.procReqRepo.Update(procReq)
	}

	return s.repo.GetPOByID(po.ID)
}

func (s *purchaseOrderService) UpdatePO(id uuid.UUID, updaterID *uuid.UUID, req PurchaseOrderRequest) (*PurchaseOrder, error) {
	po, err := s.repo.GetPOByID(id)
	if err != nil {
		return nil, err
	}

	po.SupplierID = req.SupplierID
	po.PODate = req.PODate
	po.TotalAmount = req.TotalAmount
	po.DeliveryDeadline = req.DeliveryDeadline
	po.ContractType = req.ContractType
	po.IsAddendum = req.IsAddendum
	po.AddendumNumber = req.AddendumNumber
	po.PICResolutionID = req.PICResolutionID
	po.Notes = req.Notes
	po.UpdatedByID = updaterID

	if err := s.repo.UpdatePO(po); err != nil {
		return nil, err
	}
	return s.repo.GetPOByID(po.ID)
}

func (s *purchaseOrderService) DeletePO(id uuid.UUID, deletedBy *uuid.UUID) error {
	return s.repo.DeletePO(id, deletedBy)
}

func (s *purchaseOrderService) FindAllBG(search string, status string) ([]BankGuarantee, error) {
	return s.repo.FindAllBG(search, status)
}

func (s *purchaseOrderService) GetBGByID(id uuid.UUID) (*BankGuarantee, error) {
	return s.repo.GetBGByID(id)
}

func (s *purchaseOrderService) CreateBG(creatorID *uuid.UUID, req BankGuaranteeRequest) (*BankGuarantee, error) {
	bg := BankGuarantee{
		RequestID:          req.RequestID,
		SupplierID:         req.SupplierID,
		GuaranteeType:      req.GuaranteeType,
		SerialNumber:       req.SerialNumber,
		IssuingBank:        req.IssuingBank,
		Branch:             req.Branch,
		Amount:             req.Amount,
		ValidFrom:          req.ValidFrom,
		ValidUntil:         req.ValidUntil,
		ClaimDeadline:      req.ClaimDeadline,
		ConfirmationStatus: req.ConfirmationStatus,
		Notes:              req.Notes,
		CreatedByID:        creatorID,
		UpdatedByID:        creatorID,
	}

	if err := s.repo.CreateBG(&bg); err != nil {
		return nil, err
	}
	return s.repo.GetBGByID(bg.ID)
}

func (s *purchaseOrderService) UpdateBG(id uuid.UUID, updaterID *uuid.UUID, req BankGuaranteeRequest) (*BankGuarantee, error) {
	bg, err := s.repo.GetBGByID(id)
	if err != nil {
		return nil, err
	}

	bg.SupplierID = req.SupplierID
	bg.GuaranteeType = req.GuaranteeType
	bg.SerialNumber = req.SerialNumber
	bg.IssuingBank = req.IssuingBank
	bg.Branch = req.Branch
	bg.Amount = req.Amount
	bg.ValidFrom = req.ValidFrom
	bg.ValidUntil = req.ValidUntil
	bg.ClaimDeadline = req.ClaimDeadline
	if req.ConfirmationStatus != "" {
		bg.ConfirmationStatus = req.ConfirmationStatus
	}
	bg.Notes = req.Notes
	bg.UpdatedByID = updaterID

	if err := s.repo.UpdateBG(bg); err != nil {
		return nil, err
	}
	return s.repo.GetBGByID(bg.ID)
}

func (s *purchaseOrderService) DeleteBG(id uuid.UUID, deletedBy *uuid.UUID) error {
	return s.repo.DeleteBG(id, deletedBy)
}
