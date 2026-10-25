package helper

import "github.com/gin-gonic/gin"

type Response struct {
	Status  bool        `json:"status"`
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
	Error   interface{} `json:"error"`
}

func JsonResponse(c *gin.Context, status bool, message string, data interface{}, err interface{}, httpStatus int) {
	response := Response{
		Status:  status,
		Success: status,
		Message: message,
		Data:    data,
		Error:   err,
	}

	c.JSON(httpStatus, response)
}
