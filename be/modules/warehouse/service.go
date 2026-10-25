package warehouse

import (
	"template/modules/procurement_request"
	"template/modules/purchase_order"

	"github.com/google/uuid"
)

type WarehouseService interface {
	// Receipts
	FindAllReceipts(search string, status string) ([]GoodsReceipt, error)
	GetReceiptByID(id uuid.UUID) (*GoodsReceipt, error)
	CreateReceipt(inspectorID uuid.UUID, creatorID *uuid.UUID, req GoodsReceiptRequest) (*GoodsReceipt, error)
	UpdateReceipt(id uuid.UUID, updaterID *uuid.UUID, req GoodsReceiptRequest) (*GoodsReceipt, error)
	DeleteReceipt(id uuid.UUID, deletedBy *uuid.UUID) error

	// Acts
	FindAllActs(actType string, status string) ([]InspectionAcceptanceAct, error)
	GetActByID(id uuid.UUID) (*InspectionAcceptanceAct, error)
	CreateAct(creatorID *uuid.UUID, req InspectionActRequest) (*InspectionAcceptanceAct, error)
	UpdateAct(id uuid.UUID, updaterID *uuid.UUID, req InspectionActRequest) (*InspectionAcceptanceAct, error)
	DeleteAct(id uuid.UUID, deletedBy *uuid.UUID) error
}

type warehouseService struct {
	repo        WarehouseRepository
	poRepo      purchase_order.PurchaseOrderRepository
	procReqRepo procurement_request.ProcurementRequestRepository
}

func NewWarehouseService(repo WarehouseRepository, poRepo purchase_order.PurchaseOrderRepository, procReqRepo procurement_request.ProcurementRequestRepository) WarehouseService {
	return &warehouseService{
		repo:        repo,
		poRepo:      poRepo,
		procReqRepo: procReqRepo,
	}
}

func (s *warehouseService) FindAllReceipts(search string, status string) ([]GoodsReceipt, error) {
	return s.repo.FindAllReceipts(search, status)
}

func (s *warehouseService) GetReceiptByID(id uuid.UUID) (*GoodsReceipt, error) {
	return s.repo.GetReceiptByID(id)
}

func (s *warehouseService) CreateReceipt(inspectorID uuid.UUID, creatorID *uuid.UUID, req GoodsReceiptRequest) (*GoodsReceipt, error) {
	num := req.ReceiptNumber
	if num == "" {
		generated, err := s.repo.GenerateReceiptNumber()
		if err != nil {
			return nil, err
		}
		num = generated
	}

	isGood := true
	if req.IsGoodCondition != nil {
		isGood = *req.IsGoodCondition
	}

	pkgCount := req.PackageCount
	if pkgCount <= 0 {
		pkgCount = 1
	}

	delayDays := req.DelayDays
	penaltyAmount := req.PenaltyAmount

	if po, err := s.poRepo.GetPOByID(req.POID); err == nil && po != nil {
		if req.DeliveryDate.After(po.DeliveryDeadline) {
			diffDays := int(req.DeliveryDate.Sub(po.DeliveryDeadline).Hours() / 24)
			if diffDays > 0 {
				delayDays = diffDays
				penaltyAmount = po.TotalAmount * 0.001 * float64(diffDays)
			}
		}
	}

	receipt := GoodsReceipt{
		POID:               req.POID,
		ReceiptNumber:      num,
		DeliveryNoteNumber: req.DeliveryNoteNumber,
		DeliveryDate:       req.DeliveryDate,
		PackageCount:       pkgCount,
		IsGoodCondition:    isGood,
		DelayDays:          delayDays,
		PenaltyAmount:      penaltyAmount,
		Status:             "POSTED",
		Notes:              req.Notes,
		InspectedByID:      inspectorID,
		CreatedByID:        creatorID,
		UpdatedByID:        creatorID,
	}

	if err := s.repo.CreateReceipt(&receipt); err != nil {
		return nil, err
	}
	return s.repo.GetReceiptByID(receipt.ID)
}

func (s *warehouseService) UpdateReceipt(id uuid.UUID, updaterID *uuid.UUID, req GoodsReceiptRequest) (*GoodsReceipt, error) {
	receipt, err := s.repo.GetReceiptByID(id)
	if err != nil {
		return nil, err
	}

	receipt.DeliveryNoteNumber = req.DeliveryNoteNumber
	receipt.DeliveryDate = req.DeliveryDate
	if req.PackageCount > 0 {
		receipt.PackageCount = req.PackageCount
	}
	if req.IsGoodCondition != nil {
		receipt.IsGoodCondition = *req.IsGoodCondition
	}
	receipt.DelayDays = req.DelayDays
	receipt.PenaltyAmount = req.PenaltyAmount
	receipt.Notes = req.Notes
	receipt.UpdatedByID = updaterID

	if err := s.repo.UpdateReceipt(receipt); err != nil {
		return nil, err
	}
	return s.repo.GetReceiptByID(receipt.ID)
}

func (s *warehouseService) DeleteReceipt(id uuid.UUID, deletedBy *uuid.UUID) error {
	return s.repo.DeleteReceipt(id, deletedBy)
}

func (s *warehouseService) FindAllActs(actType string, status string) ([]InspectionAcceptanceAct, error) {
	return s.repo.FindAllActs(actType, status)
}

func (s *warehouseService) GetActByID(id uuid.UUID) (*InspectionAcceptanceAct, error) {
	return s.repo.GetActByID(id)
}

func (s *warehouseService) CreateAct(creatorID *uuid.UUID, req InspectionActRequest) (*InspectionAcceptanceAct, error) {
	num := req.ActNumber
	if num == "" {
		generated, err := s.repo.GenerateActNumber(req.ActType)
		if err != nil {
			return nil, err
		}
		num = generated
	}

	compPct := req.CompletionPercentage
	if compPct <= 0 {
		compPct = 100.00
	}

	act := InspectionAcceptanceAct{
		POID:                 req.POID,
		ReceiptID:            req.ReceiptID,
		ActNumber:            num,
		ActType:              req.ActType,
		LeadInspectorID:      req.LeadInspectorID,
		SecretaryID:          req.SecretaryID,
		Member1ID:            req.Member1ID,
		Member2ID:            req.Member2ID,
		Member3ID:            req.Member3ID,
		CompletionPercentage: compPct,
		Conclusion:           req.Conclusion,
		Status:               "APPROVED",
		Notes:                req.Notes,
		CreatedByID:          creatorID,
		UpdatedByID:          creatorID,
	}

	if err := s.repo.CreateAct(&act); err != nil {
		return nil, err
	}

	// Update PO status to COMPLETED if fully accepted
	if req.Conclusion == "DITERIMA_PENUH" {
		if po, err := s.poRepo.GetPOByID(req.POID); err == nil && po != nil {
			po.Status = "COMPLETED"
			po.UpdatedByID = creatorID
			_ = s.poRepo.UpdatePO(po)

			// Update Procurement Request to CLOSED
			if procReq, err := s.procReqRepo.GetByID(po.RequestID); err == nil && procReq != nil {
				procReq.CurrentStep = "GUDANG_COMPLETED"
				procReq.CurrentStatus = "APPROVED"
				procReq.UpdatedByID = creatorID
				_ = s.procReqRepo.Update(procReq)
			}
		}
	}

	return s.repo.GetActByID(act.ID)
}

func (s *warehouseService) UpdateAct(id uuid.UUID, updaterID *uuid.UUID, req InspectionActRequest) (*InspectionAcceptanceAct, error) {
	act, err := s.repo.GetActByID(id)
	if err != nil {
		return nil, err
	}

	act.LeadInspectorID = req.LeadInspectorID
	act.SecretaryID = req.SecretaryID
	act.Member1ID = req.Member1ID
	act.Member2ID = req.Member2ID
	act.Member3ID = req.Member3ID
	if req.CompletionPercentage > 0 {
		act.CompletionPercentage = req.CompletionPercentage
	}
	act.Conclusion = req.Conclusion
	act.Notes = req.Notes
	act.UpdatedByID = updaterID

	if err := s.repo.UpdateAct(act); err != nil {
		return nil, err
	}
	return s.repo.GetActByID(act.ID)
}

func (s *warehouseService) DeleteAct(id uuid.UUID, deletedBy *uuid.UUID) error {
	return s.repo.DeleteAct(id, deletedBy)
}
