package executive_docket

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"template/modules/procurement_request"
	"template/modules/purchase_order"
	"template/modules/user"

	"github.com/google/uuid"
)

type ExecutiveDocketService interface {
	FindAll(search string) ([]ExecutiveDocket, error)
	GetByID(id uuid.UUID) (*ExecutiveDocket, error)
	GetByRequestID(requestID uuid.UUID) (*ExecutiveDocket, error)
	Compile(requestID uuid.UUID, userID *uuid.UUID) (*ExecutiveDocket, error)
	SignBSRE(signerID uuid.UUID, req SignBSRERequest) (*BSREDigitalSignature, error)
	Delete(id uuid.UUID, deletedBy *uuid.UUID) error
}

type executiveDocketService struct {
	repo        ExecutiveDocketRepository
	procReqRepo procurement_request.ProcurementRequestRepository
	poRepo      purchase_order.PurchaseOrderRepository
	userRepo    user.UserRepository
}

func NewExecutiveDocketService(
	repo ExecutiveDocketRepository,
	procReqRepo procurement_request.ProcurementRequestRepository,
	poRepo purchase_order.PurchaseOrderRepository,
	userRepo user.UserRepository,
) ExecutiveDocketService {
	return &executiveDocketService{
		repo:        repo,
		procReqRepo: procReqRepo,
		poRepo:      poRepo,
		userRepo:    userRepo,
	}
}

func (s *executiveDocketService) FindAll(search string) ([]ExecutiveDocket, error) {
	return s.repo.FindAll(search)
}

func (s *executiveDocketService) GetByID(id uuid.UUID) (*ExecutiveDocket, error) {
	return s.repo.GetByID(id)
}

func (s *executiveDocketService) GetByRequestID(requestID uuid.UUID) (*ExecutiveDocket, error) {
	return s.repo.GetByRequestID(requestID)
}

func (s *executiveDocketService) Compile(requestID uuid.UUID, userID *uuid.UUID) (*ExecutiveDocket, error) {
	// Ambil data procurement request
	procReq, err := s.procReqRepo.GetByID(requestID)
	if err != nil {
		return nil, errors.New("procurement request not found")
	}

	// Cek apakah PO sudah dibuat
	var poID *uuid.UUID
	var poNumber string
	if po, err := s.poRepo.GetPOByRequestID(requestID); err == nil && po != nil {
		poID = &po.ID
		poNumber = po.PONumber
	}

	// Buat ringkasan JSON dokumen snapshot
	summaryMap := map[string]interface{}{
		"request_id":     procReq.ID,
		"request_number": procReq.RequestNumber,
		"wo_number":      procReq.WONumber,
		"prk_number":     procReq.PRKNumber,
		"po_number":      poNumber,
		"rab_amount":     procReq.RABAmount,
		"contract_type":  procReq.ContractType,
		"compiled_at":    time.Now().Format(time.RFC3339),
	}

	summaryBytes, _ := json.Marshal(summaryMap)

	// Hitung SHA-256 hash
	hasher := sha256.New()
	hasher.Write(summaryBytes)
	docHash := hex.EncodeToString(hasher.Sum(nil))

	docketNum, _ := s.repo.GenerateDocketNumber()

	existing, _ := s.repo.GetByRequestID(requestID)
	if existing != nil {
		existing.CompiledSummary = string(summaryBytes)
		existing.DocumentHash = docHash
		existing.POID = poID
		existing.UpdatedByID = userID
		_ = s.repo.Update(existing)
		return s.repo.GetByID(existing.ID)
	}

	docket := ExecutiveDocket{
		RequestID:       requestID,
		POID:            poID,
		DocketNumber:    docketNum,
		CompiledSummary: string(summaryBytes),
		PDFFilePath:     fmt.Sprintf("/storage/dockets/%s.pdf", docketNum),
		DocumentHash:    docHash,
		IsSigned:        false,
		CreatedByID:     userID,
		UpdatedByID:     userID,
	}

	if err := s.repo.Create(&docket); err != nil {
		return nil, err
	}
	return s.repo.GetByID(docket.ID)
}

func (s *executiveDocketService) SignBSRE(signerID uuid.UUID, req SignBSRERequest) (*BSREDigitalSignature, error) {
	docket, err := s.repo.GetByID(req.DocketID)
	if err != nil {
		return nil, errors.New("docket not found")
	}

	signer, err := s.userRepo.GetByID(signerID)
	if err != nil {
		return nil, errors.New("signer user not found")
	}

	if signer.NIK == "" {
		return nil, errors.New("signer must have valid NIK registered for BSrE certificate")
	}

	// Simulasi integrasi TTE BSrE (BSSN)
	// Memvalidasi NIK + Passphrase dan menghasilkan QR verifikasi
	now := time.Now()
	qrData := fmt.Sprintf("https://tte.bssn.go.id/verify?hash=%s&nik=%s&docket=%s", docket.DocumentHash, signer.NIK, docket.DocketNumber)

	sig := BSREDigitalSignature{
		DocketID:        docket.ID,
		SignerID:        signer.ID,
		SignerNIK:       signer.NIK,
		SignRequestID:   uuid.New().String(),
		BSREStatus:      "SUCCESS",
		SignedPDFURL:    fmt.Sprintf("/storage/dockets/signed_%s.pdf", docket.DocketNumber),
		SignatureQRData: qrData,
		SignedAt:        &now,
		CreatedByID:     &signerID,
		UpdatedByID:     &signerID,
	}

	if err := s.repo.CreateSignature(&sig); err != nil {
		return nil, err
	}

	docket.IsSigned = true
	docket.UpdatedByID = &signerID
	_ = s.repo.Update(docket)

	return &sig, nil
}

func (s *executiveDocketService) Delete(id uuid.UUID, deletedBy *uuid.UUID) error {
	return s.repo.Delete(id, deletedBy)
}

