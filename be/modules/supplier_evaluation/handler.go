package supplier_evaluation

import (
	"net/http"
	"template/helper"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type SupplierEvaluationHandler struct {
	service SupplierEvaluationService
}

func NewSupplierEvaluationHandler(service SupplierEvaluationService) *SupplierEvaluationHandler {
	return &SupplierEvaluationHandler{service: service}
}

func (h *SupplierEvaluationHandler) ShowByPO(c *gin.Context) {
	poID, err := uuid.Parse(c.Param("po_id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid PO ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	summary, err := h.service.GetByPOID(poID)
	if err != nil {
		helper.JsonResponse(c, false, "Failed to retrieve supplier evaluation", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Supplier evaluation retrieved successfully", summary, nil, http.StatusOK)
}

func (h *SupplierEvaluationHandler) Submit(c *gin.Context) {
	rawUserID, exists := c.Get("user_id")
	if !exists {
		helper.JsonResponse(c, false, "Unauthorized", nil, "User ID not found in context", http.StatusUnauthorized)
		return
	}
	evaluatorID := rawUserID.(uuid.UUID)

	var req SubmitEvaluationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	summary, err := h.service.Submit(evaluatorID, &evaluatorID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Supplier evaluation submitted successfully", summary, nil, http.StatusCreated)
}
