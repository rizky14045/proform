package approval

import (
	"net/http"
	"template/helper"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type ApprovalHandler struct {
	service ApprovalService
}

func NewApprovalHandler(service ApprovalService) *ApprovalHandler {
	return &ApprovalHandler{service: service}
}

func (h *ApprovalHandler) IndexStructures(c *gin.Context) {
	menu := c.Query("menu")
	status := c.Query("status")

	items, err := h.service.FindStructures(menu, status)
	if err != nil {
		helper.JsonResponse(c, false, "Failed to retrieve approval structures", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Approval structures retrieved successfully", items, nil, http.StatusOK)
}

func (h *ApprovalHandler) ShowStructure(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	item, err := h.service.GetStructureByID(id)
	if err != nil {
		helper.JsonResponse(c, false, "Approval structure not found", nil, err.Error(), http.StatusNotFound)
		return
	}
	helper.JsonResponse(c, true, "Approval structure retrieved successfully", item, nil, http.StatusOK)
}

func (h *ApprovalHandler) CreateStructure(c *gin.Context) {
	var userID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	var req ApprovalStructureRequest
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

	created, err := h.service.CreateStructure(userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Approval structure created successfully", created, nil, http.StatusCreated)
}

func (h *ApprovalHandler) UpdateStructure(c *gin.Context) {
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

	var req ApprovalStructureRequest
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

	updated, err := h.service.UpdateStructure(id, userID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Approval structure updated successfully", updated, nil, http.StatusOK)
}

func (h *ApprovalHandler) DestroyStructure(c *gin.Context) {
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

	if err := h.service.DeleteStructure(id, userID); err != nil {
		helper.JsonResponse(c, false, "Failed to delete approval structure", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Approval structure deleted successfully", nil, nil, http.StatusOK)
}

func (h *ApprovalHandler) GetHistories(c *gin.Context) {
	requestID, err := uuid.Parse(c.Param("request_id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid request ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	histories, err := h.service.GetHistories(requestID)
	if err != nil {
		helper.JsonResponse(c, false, "Failed to retrieve approval histories", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Approval histories retrieved successfully", histories, nil, http.StatusOK)
}

func (h *ApprovalHandler) SubmitAction(c *gin.Context) {
	rawUserID, exists := c.Get("user_id")
	if !exists {
		helper.JsonResponse(c, false, "Unauthorized", nil, "User ID not found in context", http.StatusUnauthorized)
		return
	}
	userID := rawUserID.(uuid.UUID)

	userRole := ""
	if r, ok := c.Get("role_code"); ok {
		userRole = r.(string)
	}

	var req ApprovalActionRequest
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

	history, err := h.service.RecordAction(userID, userRole, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Approval action recorded successfully", history, nil, http.StatusCreated)
}
