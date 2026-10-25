package owner_estimate

import (
	"template/modules/procurement_request"

	"github.com/google/uuid"
)

type OwnerEstimateService interface {
	FindAllHPS(search string, status string) ([]OwnerEstimate, error)
	GetHPSByID(id uuid.UUID) (*OwnerEstimate, error)
	CreateHPS(creatorID *uuid.UUID, req OwnerEstimateRequest) (*OwnerEstimate, error)
	UpdateHPS(id uuid.UUID, updaterID *uuid.UUID, req OwnerEstimateRequest) (*OwnerEstimate, error)
	DeleteHPS(id uuid.UUID, deletedBy *uuid.UUID) error

	FindAllTenderEvents(requestID *uuid.UUID, eventType string) ([]ProcurementTenderEvent, error)
	GetTenderEventByID(id uuid.UUID) (*ProcurementTenderEvent, error)
	CreateTenderEvent(creatorID *uuid.UUID, req TenderEventRequest) (*ProcurementTenderEvent, error)
	UpdateTenderEvent(id uuid.UUID, updaterID *uuid.UUID, req TenderEventRequest) (*ProcurementTenderEvent, error)
	DeleteTenderEvent(id uuid.UUID, deletedBy *uuid.UUID) error
}

type ownerEstimateService struct {
	repo        OwnerEstimateRepository
	procReqRepo procurement_request.ProcurementRequestRepository
}

func NewOwnerEstimateService(repo OwnerEstimateRepository, procReqRepo procurement_request.ProcurementRequestRepository) OwnerEstimateService {
	return &ownerEstimateService{
		repo:        repo,
		procReqRepo: procReqRepo,
	}
}

func (s *ownerEstimateService) FindAllHPS(search string, status string) ([]OwnerEstimate, error) {
	return s.repo.FindAllHPS(search, status)
}

func (s *ownerEstimateService) GetHPSByID(id uuid.UUID) (*OwnerEstimate, error) {
	return s.repo.GetHPSByID(id)
}

func (s *ownerEstimateService) CreateHPS(creatorID *uuid.UUID, req OwnerEstimateRequest) (*OwnerEstimate, error) {
	num := req.HPSNumber
	if num == "" {
		generated, err := s.repo.GenerateHPSNumber()
		if err != nil {
			return nil, err
		}
		num = generated
	}

	hps := OwnerEstimate{
		HPEID:       req.HPEID,
		HPSNumber:   num,
		TotalHPS:    req.TotalHPS,
		Status:      "APPROVED",
		Notes:       req.Notes,
		CreatedByID: creatorID,
		UpdatedByID: creatorID,
	}

	if err := s.repo.CreateHPS(&hps); err != nil {
		return nil, err
	}
	return s.repo.GetHPSByID(hps.ID)
}

func (s *ownerEstimateService) UpdateHPS(id uuid.UUID, updaterID *uuid.UUID, req OwnerEstimateRequest) (*OwnerEstimate, error) {
	hps, err := s.repo.GetHPSByID(id)
	if err != nil {
		return nil, err
	}

	hps.TotalHPS = req.TotalHPS
	hps.Notes = req.Notes
	hps.UpdatedByID = updaterID

	if err := s.repo.UpdateHPS(hps); err != nil {
		return nil, err
	}
	return s.repo.GetHPSByID(hps.ID)
}

func (s *ownerEstimateService) DeleteHPS(id uuid.UUID, deletedBy *uuid.UUID) error {
	return s.repo.DeleteHPS(id, deletedBy)
}

func (s *ownerEstimateService) FindAllTenderEvents(requestID *uuid.UUID, eventType string) ([]ProcurementTenderEvent, error) {
	return s.repo.FindAllTenderEvents(requestID, eventType)
}

func (s *ownerEstimateService) GetTenderEventByID(id uuid.UUID) (*ProcurementTenderEvent, error) {
	return s.repo.GetTenderEventByID(id)
}

func (s *ownerEstimateService) CreateTenderEvent(creatorID *uuid.UUID, req TenderEventRequest) (*ProcurementTenderEvent, error) {
	num := req.DocumentNumber
	if num == "" {
		generated, err := s.repo.GenerateEventDocNumber(req.EventType)
		if err != nil {
			return nil, err
		}
		num = generated
	}

	event := ProcurementTenderEvent{
		RequestID:      req.RequestID,
		EventType:      req.EventType,
		DocumentNumber: num,
		EventDate:      req.EventDate,
		MeetingNotes:   req.MeetingNotes,
		Status:         "POSTED",
		CreatedByID:    creatorID,
		UpdatedByID:    creatorID,
	}

	if err := s.repo.CreateTenderEvent(&event); err != nil {
		return nil, err
	}

	var quotations []TenderVendorQuotation
	for _, q := range req.Quotations {
		quotations = append(quotations, TenderVendorQuotation{
			TenderEventID:   event.ID,
			SupplierID:      q.SupplierID,
			QuotedPrice:     q.QuotedPrice,
			NegotiatedPrice: q.NegotiatedPrice,
			AdminPassed:     q.AdminPassed,
			TechPassed:      q.TechPassed,
			IsWinner:        q.IsWinner,
			Notes:           q.Notes,
			CreatedByID:     creatorID,
			UpdatedByID:     creatorID,
		})
	}
	if len(quotations) > 0 {
		_ = s.repo.ReplaceQuotations(event.ID, quotations)
	}

	// Update procurement request step if needed
	if procReq, err := s.procReqRepo.GetByID(req.RequestID); err == nil {
		procReq.CurrentStep = req.EventType
		procReq.UpdatedByID = creatorID
		_ = s.procReqRepo.Update(procReq)
	}

	return s.repo.GetTenderEventByID(event.ID)
}

func (s *ownerEstimateService) UpdateTenderEvent(id uuid.UUID, updaterID *uuid.UUID, req TenderEventRequest) (*ProcurementTenderEvent, error) {
	event, err := s.repo.GetTenderEventByID(id)
	if err != nil {
		return nil, err
	}

	event.EventDate = req.EventDate
	event.MeetingNotes = req.MeetingNotes
	event.UpdatedByID = updaterID

	if err := s.repo.UpdateTenderEvent(event); err != nil {
		return nil, err
	}

	if req.Quotations != nil {
		var quotations []TenderVendorQuotation
		for _, q := range req.Quotations {
			quotations = append(quotations, TenderVendorQuotation{
				TenderEventID:   event.ID,
				SupplierID:      q.SupplierID,
				QuotedPrice:     q.QuotedPrice,
				NegotiatedPrice: q.NegotiatedPrice,
				AdminPassed:     q.AdminPassed,
				TechPassed:      q.TechPassed,
				IsWinner:        q.IsWinner,
				Notes:           q.Notes,
				UpdatedByID:     updaterID,
			})
		}
		_ = s.repo.ReplaceQuotations(event.ID, quotations)
	}

	return s.repo.GetTenderEventByID(event.ID)
}

func (s *ownerEstimateService) DeleteTenderEvent(id uuid.UUID, deletedBy *uuid.UUID) error {
	return s.repo.DeleteTenderEvent(id, deletedBy)
}
