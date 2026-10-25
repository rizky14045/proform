package middleware

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ulule/limiter/v3"
)

func RateLimiter(l *limiter.Limiter) gin.HandlerFunc {
	return func(context *gin.Context) {
		ctx := context.Request.Context()
		ip := context.ClientIP()

		limitCtx, err := l.Get(ctx, ip)
		if err != nil {
			context.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"status":  false,
				"message": "Internal rate limiter error",
				"data":    nil,
				"error":   "Internal rate limiter error",
			})
			return
		}

		if limitCtx.Reached {
			resetTime := time.Unix(limitCtx.Reset, 0)
			retryAfter := time.Until(resetTime)

			context.Header("Retry-After", retryAfter.String())

			context.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"status":  false,
				"message": "Too many requests. Please try again later.",
				"data": map[string]interface{}{
					"retry_in_seconds": int(retryAfter.Seconds()),
				},
				"error": "Too many requests. Please try again later.",
			})
			return
		}
		context.Next()
	}
}
