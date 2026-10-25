package middleware

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type IdempotencyKey struct {
	ID              uuid.UUID `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	IdempotencyKey  uuid.UUID `json:"idempotency_key" gorm:"type:uuid;uniqueIndex;not null"`
	UserID          uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	Endpoint        string    `json:"endpoint" gorm:"type:varchar(255);not null"`
	RequestBodyHash string    `json:"request_body_hash" gorm:"type:varchar(64);not null"`
	ResponseCode    int       `json:"response_code"`
	ResponseBody    string    `json:"response_body" gorm:"type:text"`
	Status          string    `json:"status" gorm:"type:varchar(30);default:'IN_PROGRESS'"`
	CreatedAt       time.Time `json:"created_at"`
	ExpiresAt       time.Time `json:"expires_at"`
}

type bodyLogWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w bodyLogWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

func IdempotencyMiddleware(db *gorm.DB) gin.HandlerFunc {
	// Auto migrate idempotency_keys
	_ = db.AutoMigrate(&IdempotencyKey{})

	return func(c *gin.Context) {
		if c.Request.Method != http.MethodPost && c.Request.Method != http.MethodPut && c.Request.Method != http.MethodPatch {
			c.Next()
			return
		}

		keyHeader := c.GetHeader("X-Idempotency-Key")
		if keyHeader == "" {
			c.Next()
			return
		}

		key, err := uuid.Parse(keyHeader)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"status":  false,
				"message": "Format X-Idempotency-Key harus berupa UUID v4",
				"error":   "Invalid UUID",
			})
			return
		}

		rawUserID, exists := c.Get("user_id")
		var userID uuid.UUID
		if exists {
			if uid, ok := rawUserID.(uuid.UUID); ok {
				userID = uid
			}
		}

		bodyBytes, _ := io.ReadAll(c.Request.Body)
		c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

		hasher := sha256.New()
		hasher.Write(bodyBytes)
		bodyHash := hex.EncodeToString(hasher.Sum(nil))

		var existing IdempotencyKey
		if err := db.Where("idempotency_key = ?", key).First(&existing).Error; err == nil {
			if existing.Status == "IN_PROGRESS" {
				c.AbortWithStatusJSON(http.StatusConflict, gin.H{
					"status":  false,
					"message": "Permintaan yang sama sedang diproses, mohon tunggu.",
					"error":   "Request in progress",
				})
				return
			}
			if existing.Status == "COMPLETED" {
				var cachedJSON interface{}
				_ = json.Unmarshal([]byte(existing.ResponseBody), &cachedJSON)
				c.JSON(existing.ResponseCode, cachedJSON)
				c.Abort()
				return
			}
		}

		record := IdempotencyKey{
			ID:              uuid.New(),
			IdempotencyKey:  key,
			UserID:          userID,
			Endpoint:        c.Request.URL.Path,
			RequestBodyHash: bodyHash,
			Status:          "IN_PROGRESS",
			ExpiresAt:       time.Now().Add(24 * time.Hour),
		}
		_ = db.Create(&record)

		blw := &bodyLogWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
		c.Writer = blw

		c.Next()

		_ = db.Model(&IdempotencyKey{}).
			Where("idempotency_key = ?", key).
			Updates(map[string]interface{}{
				"response_code": c.Writer.Status(),
				"response_body": blw.body.String(),
				"status":        "COMPLETED",
			})
	}
}

