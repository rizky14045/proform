package helper

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

func LogInfo(message string) {
	log.Printf("[INFO] %s", message)
}

func LogError(message string, err error) {
	log.Printf("[ERROR] %s: %v", message, err)
}

func LogRequest(context *gin.Context, status int) {
	log.Printf("[REQ] %s | %s %s | IP: %s | Status: %d",
		time.Now().Format(time.RFC3339),
		context.Request.Method,
		context.Request.URL.Path,
		context.ClientIP(),
		status,
	)
}
