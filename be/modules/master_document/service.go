package master_document

import (
	"errors"
	"github.com/google/uuid"
)

type MasterDocumentService interface {
	GetAll(search string, status string) ([]MasterDocument, error)
	GetAllPaginated(search string, status string, page int, limit int) ([]MasterDocument, int64, error)
	GetByID(id uuid.UUID) (*MasterDocument, error)
	Create(input *MasterDocument, userID *uuid.UUID) (*MasterDocument, error)
	Update(id uuid.UUID, input *MasterDocument, userID *uuid.UUID) (*MasterDocument, error)
	Delete(id uuid.UUID, userID *uuid.UUID) error
}

type masterDocumentService struct {
	repo MasterDocumentRepository
}

func NewMasterDocumentService(repo MasterDocumentRepository) MasterDocumentService {
	return &masterDocumentService{repo: repo}
}

func (s *masterDocumentService) GetAll(search string, status string) ([]MasterDocument, error) {
	return s.repo.FindAll(search, status)
}

func (s *masterDocumentService) GetAllPaginated(search string, status string, page int, limit int) ([]MasterDocument, int64, error) {
	return s.repo.FindAllPaginated(search, status, page, limit)
}

func (s *masterDocumentService) GetByID(id uuid.UUID) (*MasterDocument, error) {
	return s.repo.GetByID(id)
}

func (s *masterDocumentService) Create(input *MasterDocument, userID *uuid.UUID) (*MasterDocument, error) {
	if input.DocumentName == "" {
		return nil, errors.New("nama dokumen wajib diisi")
	}
	input.CreatedByID = userID
	input.UpdatedByID = userID
	if err := s.repo.Create(input); err != nil {
		return nil, err
	}
	return input, nil
}

func (s *masterDocumentService) Update(id uuid.UUID, input *MasterDocument, userID *uuid.UUID) (*MasterDocument, error) {
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	existing.DocumentName = input.DocumentName
	if input.FileTemplate != "" {
		existing.FileTemplate = input.FileTemplate
	}
	existing.Description = input.Description
	existing.Status = input.Status
	existing.UpdatedByID = userID

	if err := s.repo.Update(existing); err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *masterDocumentService) Delete(id uuid.UUID, userID *uuid.UUID) error {
	return s.repo.Delete(id, userID)
}

