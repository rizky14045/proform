package upload

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"template/helper"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UploadHandler struct {
	db        *gorm.DB
	uploadDir string
}

func NewUploadHandler(db *gorm.DB, uploadDir string) *UploadHandler {
	// Ensure directory exists with 0755
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		fmt.Printf("[Upload] Warning creating upload dir: %v\n", err)
	}
	return &UploadHandler{db: db, uploadDir: uploadDir}
}

// Upload handles secure 2-way verified file uploads
func (h *UploadHandler) Upload(c *gin.Context) {
	// 1. Check Content-Type
	if !strings.HasPrefix(c.GetHeader("Content-Type"), "multipart/form-data") {
		helper.JsonResponse(c, false, "Content-Type harus multipart/form-data", nil, "Invalid Content-Type", http.StatusBadRequest)
		return
	}

	// 2. Parse file from form
	fileHeader, err := c.FormFile("file")
	if err != nil {
		helper.JsonResponse(c, false, "File tidak ditemukan dalam request (Gunakan field 'file')", nil, err.Error(), http.StatusBadRequest)
		return
	}

	// 3. Open file stream
	fileStream, err := fileHeader.Open()
	if err != nil {
		helper.JsonResponse(c, false, "Gagal membaca stream file", nil, err.Error(), http.StatusBadRequest)
		return
	}
	defer fileStream.Close()

	// 4. Read file bytes up to MaxFileSize + 1 to detect overflow
	content, err := io.ReadAll(io.LimitReader(fileStream, MaxFileSize+1024))
	if err != nil {
		helper.JsonResponse(c, false, "Gagal membaca data file", nil, err.Error(), http.StatusBadRequest)
		return
	}

	// 5. Run Security Validations (Size, Whitelist, Blacklist, Double Ext, Magic Bytes, Script Injections)
	if err := ValidateFileSecurity(fileHeader.Filename, fileHeader.Size, content); err != nil {
		helper.JsonResponse(c, false, fmt.Sprintf("Validasi Keamanan File Gagal: %s", err.Error()), nil, err.Error(), http.StatusUnprocessableEntity)
		return
	}

	// 6. Compute SHA-256 Checksum
	hasher := sha256.New()
	hasher.Write(content)
	checksum := hex.EncodeToString(hasher.Sum(nil))

	// 7. Generate safe random filename
	cleanOriginalName := SanitizeFilename(fileHeader.Filename)
	ext := strings.ToLower(filepath.Ext(cleanOriginalName))
	fileUUID := uuid.New().String()
	storedFilename := fmt.Sprintf("%s_%s", fileUUID, cleanOriginalName)
	fullPath := filepath.Join(h.uploadDir, storedFilename)

	// 8. Write to disk securely (0644 - non-executable)
	if err := os.WriteFile(fullPath, content, 0644); err != nil {
		helper.JsonResponse(c, false, "Gagal menyimpan file ke penyimpanan server", nil, err.Error(), http.StatusInternalServerError)
		return
	}

	// 9. Extract User ID if authenticated
	var uploadedByID *uuid.UUID
	if rawID, exists := c.Get("user_id"); exists {
		if uid, ok := rawID.(uuid.UUID); ok {
			uploadedByID = &uid
		}
	}

	// 10. Record metadata in DB
	record := UploadedFile{
		OriginalName:   cleanOriginalName,
		StoredName:     storedFilename,
		FilePath:       fullPath,
		FileSize:       int64(len(content)),
		FileType:       AllowedExtensions[ext],
		FileExtension:  ext,
		FileHashSHA256: checksum,
		UploadedByID:   uploadedByID,
	}

	if err := h.db.Create(&record).Error; err != nil {
		// Log error but proceed since file is saved
		fmt.Printf("[Upload] DB record creation warning: %v\n", err)
	}

	fileURL := fmt.Sprintf("/api/v1/uploads/%s", storedFilename)

	helper.JsonResponse(c, true, "File berhasil divalidasi dan diunggah dengan aman", gin.H{
		"id":               record.ID,
		"original_name":    cleanOriginalName,
		"stored_name":      storedFilename,
		"file_url":         fileURL,
		"file_size":        record.FileSize,
		"file_type":        record.FileType,
		"file_extension":   record.FileExtension,
		"file_hash_sha256": checksum,
	}, nil, http.StatusOK)
}

// ServeFile safely serves uploaded documents with strict security headers
func (h *UploadHandler) ServeFile(c *gin.Context) {
	filename := c.Param("filename")

	// Prevent path traversal
	if strings.Contains(filename, "..") || strings.Contains(filename, "/") || strings.Contains(filename, "\\") {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Access denied: Path traversal detected"})
		return
	}

	cleanFilename := filepath.Base(filename)
	fullPath := filepath.Join(h.uploadDir, cleanFilename)

	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": "File tidak ditemukan"})
		return
	}

	ext := strings.ToLower(filepath.Ext(cleanFilename))
	mimeType, exists := AllowedExtensions[ext]
	if !exists {
		mimeType = "application/octet-stream"
	}

	// Hardened Security Headers to prevent MIME-confusion and XSS
	c.Header("X-Content-Type-Options", "nosniff")
	c.Header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox")
	c.Header("X-Frame-Options", "SAMEORIGIN")
	c.Header("Content-Type", mimeType)
	c.Header("Content-Disposition", fmt.Sprintf("inline; filename=\"%s\"", cleanFilename))

	c.File(fullPath)
}

