package task_delegation

import (
	"net/http"
	"template/helper"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type TaskDelegationHandler struct {
	service TaskDelegationService
}

func NewTaskDelegationHandler(service TaskDelegationService) *TaskDelegationHandler {
	return &TaskDelegationHandler{service: service}
}

func (h *TaskDelegationHandler) Index(c *gin.Context) {
	search := c.Query("search")

	list, err := h.service.FindAll(search)
	if err != nil {
		helper.JsonResponse(c, false, "Failed to retrieve task delegations", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Task delegations retrieved successfully", list, nil, http.StatusOK)
}

func (h *TaskDelegationHandler) Show(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		helper.JsonResponse(c, false, "Invalid ID", nil, err.Error(), http.StatusBadRequest)
		return
	}

	item, err := h.service.GetByID(id)
	if err != nil {
		helper.JsonResponse(c, false, "Task delegation not found", nil, err.Error(), http.StatusNotFound)
		return
	}
	helper.JsonResponse(c, true, "Task delegation retrieved successfully", item, nil, http.StatusOK)
}

func (h *TaskDelegationHandler) Create(c *gin.Context) {
	rawUserID, exists := c.Get("user_id")
	if !exists {
		helper.JsonResponse(c, false, "Unauthorized", nil, "User ID not found in context", http.StatusUnauthorized)
		return
	}
	assignedByID := rawUserID.(uuid.UUID)

	var req TaskDelegationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.JsonResponse(c, false, "Validation failed", nil, err.Error(), http.StatusBadRequest)
		return
	}

	created, err := h.service.Create(assignedByID, &assignedByID, req)
	if err != nil {
		helper.JsonResponse(c, false, err.Error(), nil, err.Error(), http.StatusBadRequest)
		return
	}
	helper.JsonResponse(c, true, "Task delegation created successfully", created, nil, http.StatusCreated)
}

func (h *TaskDelegationHandler) Destroy(c *gin.Context) {
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
		helper.JsonResponse(c, false, "Failed to delete task delegation", nil, err.Error(), http.StatusInternalServerError)
		return
	}
	helper.JsonResponse(c, true, "Task delegation deleted successfully", nil, nil, http.StatusOK)
}

