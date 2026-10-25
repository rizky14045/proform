package helper

import (
	"math"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Pagination struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	TotalItems int64 `json:"total_items"`
	TotalPages int   `json:"total_pages"`
}

type PaginatedResponse struct {
	Status     bool        `json:"status"`
	Success    bool        `json:"success"`
	Message    string      `json:"message"`
	Data       interface{} `json:"data"`
	Pagination Pagination  `json:"pagination"`
	Error      interface{} `json:"error"`
}

func GetPaginationParams(c *gin.Context) (page int, limit int, offset int) {
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err = strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	} else if limit > 100 {
		limit = 100
	}

	offset = (page - 1) * limit
	return page, limit, offset
}

func BuildPagination(page int, limit int, totalItems int64) Pagination {
	totalPages := 1
	if limit > 0 {
		totalPages = int(math.Ceil(float64(totalItems) / float64(limit)))
	}
	if totalPages < 1 {
		totalPages = 1
	}

	return Pagination{
		Page:       page,
		Limit:      limit,
		TotalItems: totalItems,
		TotalPages: totalPages,
	}
}

func JsonPaginatedResponse(c *gin.Context, status bool, message string, data interface{}, pagination Pagination, err interface{}, httpStatus int) {
	response := PaginatedResponse{
		Status:     status,
		Success:    status,
		Message:    message,
		Data:       data,
		Pagination: pagination,
		Error:      err,
	}

	c.JSON(httpStatus, response)
}

