package engineering_estimate

import (
	"net/http"
	"template/helper"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type EngineeringEstimateHandler struct {
	service EngineeringEstimateService
}

func NewEngineeringEstimateHandler(service EngineeringEstimateService) *EngineeringEstimateHandler {
	return &EngineeringEstimateHandler{service: service}
}

// HPE Handlers
func (h *EngineeringEstimateHandler) IndexHPE(c *gin.Context) {
	search := c.Query("search")
	status := c.Query("status")

	list, err := h.service.FindAllHPE(search, status)
	if err != nil {
		helper.JsonResponse(c, false, "Failed to retrieve HPE records", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "HPE records retrieved successfully", list, nil, http.StatusOK)
}

func (h *EngineeringEstimateHandler) ShowHPE(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	item, err := h.service.GetHPEByID(id)
	if err != nil {
		helper.JsonResponse(c, false, "HPE record not found", nil, err.Error(), http.StatusNotFound)
		return
	}
	helper.JsonResponse(c, true, "HPE record retrieved successfully", item, nil, http.StatusOK)
}

func (h *EngineeringEstimateHandler) CreateHPE(c *gin.Context) {
	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	var req EngineeringEstimateRequest
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

	created, err := h.service.CreateHPE(userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "HPE created successfully", created, nil, http.StatusCreated)
}

func (h *EngineeringEstimateHandler) UpdateHPE(c *gin.Context) {
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

	var req EngineeringEstimateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	updated, err := h.service.UpdateHPE(id, userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "HPE updated successfully", updated, nil, http.StatusOK)
}

func (h *EngineeringEstimateHandler) DestroyHPE(c *gin.Context) {
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

	if err := h.service.DeleteHPE(id, userID); err != nil {
		helper.JsonResponse(c, false, "Failed to delete HPE", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "HPE deleted successfully", nil, nil, http.StatusOK)
}

func (h *EngineeringEstimateHandler) SubmitHPE(c *gin.Context) {
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

	res, err := h.service.SubmitHPE(id, userID, roleCode.(string), body.Notes)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "HPE submitted for approval", res, nil, http.StatusOK)
}

func (h *EngineeringEstimateHandler) ApproveHPE(c *gin.Context) {
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

	res, err := h.service.ApproveHPE(id, userID, roleCode.(string), body.Notes)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "HPE approved", res, nil, http.StatusOK)
}

// RKS Handlers
func (h *EngineeringEstimateHandler) IndexRKS(c *gin.Context) {
	search := c.Query("search")
	status := c.Query("status")

	list, err := h.service.FindAllRKS(search, status)
	if err != nil {
		helper.JsonResponse(c, false, "Failed to retrieve RKS list", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "RKS list retrieved successfully", list, nil, http.StatusOK)
}

func (h *EngineeringEstimateHandler) CreateRKS(c *gin.Context) {
	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	var req RKSRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	created, err := h.service.CreateRKS(userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "RKS created successfully", created, nil, http.StatusCreated)
}

// VFM Handlers
func (h *EngineeringEstimateHandler) IndexVFM(c *gin.Context) {
	stage := c.Query("stage")
	var reqID *uuid.UUID
	if r := c.Query("request_id"); r != "" {
		if p, err := uuid.Parse(r); err == nil {
			reqID = &p
		}
	}

	list, err := h.service.FindAllVFM(reqID, stage)
	if err != nil {
		helper.JsonResponse(c, false, "Failed to retrieve VFM reviews", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "VFM reviews retrieved successfully", list, nil, http.StatusOK)
}

func (h *EngineeringEstimateHandler) CreateVFM(c *gin.Context) {
	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	var req VFMReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	created, err := h.service.CreateVFM(userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "VFM review recorded successfully", created, nil, http.StatusCreated)
}
