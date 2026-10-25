package executive_docket

import (
	"net/http"
	"template/helper"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ExecutiveDocketHandler struct {
	service ExecutiveDocketService
}

func NewExecutiveDocketHandler(service ExecutiveDocketService) *ExecutiveDocketHandler {
	return &ExecutiveDocketHandler{service: service}
}

func (h *ExecutiveDocketHandler) Index(c *gin.Context) {
	search := c.Query("search")
	list, err := h.service.FindAll(search)
	if err != nil {
		helper.JsonResponse(c, false, "Failed to retrieve executive dockets", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Executive dockets retrieved successfully", list, nil, http.StatusOK)
}

func (h *ExecutiveDocketHandler) Show(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	item, err := h.service.GetByID(id)
	if err != nil {
		helper.JsonResponse(c, false, "Executive docket not found", nil, err.Error(), http.StatusNotFound)
		return
	}
	helper.JsonResponse(c, true, "Executive docket retrieved successfully", item, nil, http.StatusOK)
}

func (h *ExecutiveDocketHandler) Compile(c *gin.Context) {
	var userID *uuid.UUID
	if rawUserID, exists := c.Get("user_id"); exists {
		if uid, ok := rawUserID.(uuid.UUID); ok {
			userID = &uid
		}
	}

	var req CompileDocketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	docket, err := h.service.Compile(req.RequestID, userID)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Executive docket compiled successfully", docket, nil, http.StatusOK)
}

func (h *ExecutiveDocketHandler) Sign(c *gin.Context) {
	rawUserID, exists := c.Get("user_id")
	if !exists {
		helper.JsonResponse(c, false, "Unauthorized", nil, "User ID not found in context", http.StatusUnauthorized)
		return
	}
	signerID := rawUserID.(uuid.UUID)

	var req SignBSRERequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	sig, err := h.service.SignBSRE(signerID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Executive docket successfully signed via BSrE", sig, nil, http.StatusOK)
}

func (h *ExecutiveDocketHandler) Destroy(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	var deletedBy *uuid.UUID
	if rawUserID, exists := c.Get("user_id"); exists {
		if uid, ok := rawUserID.(uuid.UUID); ok {
			deletedBy = &uid
		}
	}

	if err := h.service.Delete(id, deletedBy); err != nil {
		helper.JsonResponse(c, false, "Failed to delete executive docket", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Executive docket deleted successfully", nil, nil, http.StatusOK)
}

