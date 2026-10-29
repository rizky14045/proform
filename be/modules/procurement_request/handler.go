package procurement_request

import (
	"net/http"
	"template/helper"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type ProcurementRequestHandler struct {
	service ProcurementRequestService
}

func NewProcurementRequestHandler(service ProcurementRequestService) *ProcurementRequestHandler {
	return &ProcurementRequestHandler{service: service}
}

func (h *ProcurementRequestHandler) Index(c *gin.Context) {
	step := c.Query("step")
	status := c.Query("status")
	search := c.Query("search")

	var creatorID *uuid.UUID
	if cid := c.Query("creator_id"); cid != "" {
		if parsed, err := uuid.Parse(cid); err == nil {
			creatorID = &parsed
		}
	}

	var assignedToID *uuid.UUID
	if aid := c.Query("assigned_to_id"); aid != "" {
		if parsed, err := uuid.Parse(aid); err == nil {
			assignedToID = &parsed
		}
	}

	page, limit, _ := helper.GetPaginationParams(c)
	list, total, err := h.service.FindAll(step, status, search, creatorID, assignedToID, page, limit)
	if err != nil {
		helper.JsonResponse(c, false, "Failed to retrieve procurement requests", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	pagination := helper.BuildPagination(page, limit, total)
	helper.JsonPaginatedResponse(c, true, "Procurement requests retrieved successfully", list, pagination, nil, http.StatusOK)
}

func (h *ProcurementRequestHandler) Show(c *gin.Context) {
	paramID := c.Param("id")
	if paramID == "technical-evaluations" || paramID == "evaluations" {
		h.Evaluations(c)
		return
	}
	if paramID == "distributions" {
		h.Distributions(c)
		return
	}
	if paramID == "addendums" {
		h.Addendums(c)
		return
	}

	id, err := uuid.Parse(paramID)
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	item, err := h.service.GetByID(id)
	if err != nil {
		helper.JsonResponse(c, false, "Procurement request not found", nil, err.Error(), http.StatusNotFound)
		return
	}
	helper.JsonResponse(c, true, "Procurement request retrieved successfully", item, nil, http.StatusOK)
}

func (h *ProcurementRequestHandler) Create(c *gin.Context) {
	rawUserID, exists := c.Get("user_id")
	if !exists {
		helper.JsonResponse(c, false, "Unauthorized", nil, "User ID not found in context", http.StatusUnauthorized)
		return
	}
	creatorID := rawUserID.(uuid.UUID)

	var req ProcurementRequestCreate
	if err := c.ShouldBindJSON(&req); err != nil {
		var errMsgs []helper.Error
		if valErrs, ok := err.(validator.ValidationErrors); ok {
			for _, e := range valErrs {
				errMsgs = append(errMsgs, helper.Error{Field: e.Field(), Message: helper.ValidationMessage(e)})
			}
		} else {
			errMsgs = append(errMsgs, helper.Error{Field: "", Message: err.Error()})
		}
		helper.JsonResponse(c, false, "Validation failed", nil, errMsgs, http.StatusBadRequest)
		return
	}

	created, err := h.service.Create(creatorID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Procurement request created successfully", created, nil, http.StatusCreated)
}

func (h *ProcurementRequestHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	var req ProcurementRequestUpdate
	if err := c.ShouldBindJSON(&req); err != nil {
		var errMsgs []helper.Error
		if valErrs, ok := err.(validator.ValidationErrors); ok {
			for _, e := range valErrs {
				errMsgs = append(errMsgs, helper.Error{Field: e.Field(), Message: helper.ValidationMessage(e)})
			}
		} else {
			errMsgs = append(errMsgs, helper.Error{Field: "", Message: err.Error()})
		}
		helper.JsonResponse(c, false, "Validation failed", nil, errMsgs, http.StatusBadRequest)
		return
	}

	updated, err := h.service.Update(id, userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Procurement request updated successfully", updated, nil, http.StatusOK)
}

func (h *ProcurementRequestHandler) Destroy(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	if err := h.service.Delete(id, userID); err != nil {
		helper.JsonResponse(c, false, "Failed to delete request", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Procurement request deleted successfully", nil, nil, http.StatusOK)
}

func (h *ProcurementRequestHandler) Distribute(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	var req DistributeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	res, err := h.service.Distribute(id, userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Procurement request distributed successfully", res, nil, http.StatusOK)
}

func (h *ProcurementRequestHandler) Submit(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	rawUserID, _ := c.Get("user_id")
	userID := rawUserID.(uuid.UUID)
	roleCode, _ := c.Get("role_code")

	var body struct {
		Notes string `json:"notes"`
	}
	_ = c.ShouldBindJSON(&body)

	res, err := h.service.SubmitForApproval(id, userID, roleCode.(string), body.Notes)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Submitted for approval", res, nil, http.StatusOK)
}

func (h *ProcurementRequestHandler) Approve(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	rawUserID, _ := c.Get("user_id")
	userID := rawUserID.(uuid.UUID)
	roleCode, _ := c.Get("role_code")

	var body struct {
		Notes string `json:"notes"`
	}
	_ = c.ShouldBindJSON(&body)

	res, err := h.service.Approve(id, userID, roleCode.(string), body.Notes)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Procurement request approved", res, nil, http.StatusOK)
}

func (h *ProcurementRequestHandler) Revise(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	rawUserID, _ := c.Get("user_id")
	userID := rawUserID.(uuid.UUID)
	roleCode, _ := c.Get("role_code")

	var body struct {
		Notes string `json:"notes"`
	}
	_ = c.ShouldBindJSON(&body)

	res, err := h.service.Revise(id, userID, roleCode.(string), body.Notes)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Procurement request sent for revision", res, nil, http.StatusOK)
}

func (h *ProcurementRequestHandler) Reject(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	rawUserID, _ := c.Get("user_id")
	userID := rawUserID.(uuid.UUID)
	roleCode, _ := c.Get("role_code")

	var body struct {
		Notes string `json:"notes"`
	}
	_ = c.ShouldBindJSON(&body)

	res, err := h.service.Reject(id, userID, roleCode.(string), body.Notes)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Procurement request rejected", res, nil, http.StatusOK)
}

// Sub-modules: Distributions
func (h *ProcurementRequestHandler) Distributions(c *gin.Context) {
	search := c.Query("search")
	page, limit, _ := helper.GetPaginationParams(c)
	list, total, err := h.service.FindDistributions(search, page, limit)
	if err != nil {
		helper.JsonResponse(c, false, "Gagal mengambil data distribusi permintaan", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	pagination := helper.BuildPagination(page, limit, total)
	helper.JsonPaginatedResponse(c, true, "Data distribusi permintaan berhasil diambil", list, pagination, nil, http.StatusOK)
}

func (h *ProcurementRequestHandler) CreateDistribution(c *gin.Context) {
	var req RequestDistribution
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Input tidak valid", nil, err.Error(), http.StatusBadRequest)
		return
	}
	if err := h.service.CreateDistribution(&req); err != nil {
		helper.JsonResponse(c, false, "Gagal menyimpan distribusi permintaan", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Distribusi permintaan berhasil disimpan", req, nil, http.StatusCreated)
}

// Sub-modules: Addendums
func (h *ProcurementRequestHandler) Addendums(c *gin.Context) {
	search := c.Query("search")
	page, limit, _ := helper.GetPaginationParams(c)
	list, total, err := h.service.FindAddendums(search, page, limit)
	if err != nil {
		helper.JsonResponse(c, false, "Gagal mengambil data addendum permintaan", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	pagination := helper.BuildPagination(page, limit, total)
	helper.JsonPaginatedResponse(c, true, "Data addendum permintaan berhasil diambil", list, pagination, nil, http.StatusOK)
}

func (h *ProcurementRequestHandler) CreateAddendum(c *gin.Context) {
	var req RequestAddendum
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Input tidak valid", nil, err.Error(), http.StatusBadRequest)
		return
	}
	if err := h.service.CreateAddendum(&req); err != nil {
		helper.JsonResponse(c, false, "Gagal menyimpan addendum permintaan", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Addendum permintaan berhasil disimpan", req, nil, http.StatusCreated)
}

// Sub-modules: Evaluations
func (h *ProcurementRequestHandler) Evaluations(c *gin.Context) {
	search := c.Query("search")
	page, limit, _ := helper.GetPaginationParams(c)
	list, total, err := h.service.FindEvaluations(search, page, limit)
	if err != nil {
		helper.JsonResponse(c, false, "Gagal mengambil data evaluasi teknis", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	pagination := helper.BuildPagination(page, limit, total)
	helper.JsonPaginatedResponse(c, true, "Data evaluasi teknis berhasil diambil", list, pagination, nil, http.StatusOK)
}

func (h *ProcurementRequestHandler) CreateEvaluation(c *gin.Context) {
	var req TechnicalEvaluation
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Input tidak valid", nil, err.Error(), http.StatusBadRequest)
		return
	}
	if err := h.service.CreateEvaluation(&req); err != nil {
		helper.JsonResponse(c, false, "Gagal menyimpan evaluasi teknis", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Evaluasi teknis berhasil disimpan", req, nil, http.StatusCreated)
}

