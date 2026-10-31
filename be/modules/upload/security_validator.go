package upload

import (
	"bytes"
	"errors"
	"fmt"
	"path/filepath"
	"regexp"
	"strings"
)

const (
	MaxFileSize = 25 * 1024 * 1024 // 25 MB
)

// AllowedExtensions defines permitted file types for INTERLOGS
var AllowedExtensions = map[string]string{
	".pdf":  "application/pdf",
	".doc":  "application/msword",
	".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	".xls":  "application/vnd.ms-excel",
	".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	".jpg":  "image/jpeg",
	".jpeg": "image/jpeg",
	".png":  "image/png",
}

// DangerousExtensions lists forbidden executable and script extensions
var DangerousExtensions = []string{
	".php", ".phtml", ".php3", ".php4", ".php5", ".phps", ".phar", ".pht",
	".exe", ".bat", ".cmd", ".sh", ".bash", ".zsh", ".bin", ".run",
	".js", ".mjs", ".ts", ".jsx", ".tsx", ".vbs", ".vbe", ".wsf", ".wsh",
	".jsp", ".jspx", ".asp", ".aspx", ".ashx", ".asmx",
	".py", ".pyc", ".pyo", ".pyw", ".pl", ".cgi", ".rb",
	".html", ".htm", ".xhtml", ".shtml", ".svg", ".xml",
	".jar", ".class", ".dll", ".so", ".dylib",
	".ps1", ".psm1", ".psd1",
}

// Magic bytes definitions
var (
	magicPDF  = []byte("%PDF-")
	magicPNG  = []byte{0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A}
	magicJPG1 = []byte{0xFF, 0xD8, 0xFF}
	magicOLE  = []byte{0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1} // DOC, XLS
	magicZIP  = []byte{0x50, 0x4B, 0x03, 0x04}                         // DOCX, XLSX
)

// Regex patterns for script injection in PDFs or general files
var (
	pdfScriptPatterns = []*regexp.Regexp{
		regexp.MustCompile(`(?i)/JavaScript\b`),
		regexp.MustCompile(`(?i)/JS\b`),
		regexp.MustCompile(`(?i)/Launch\b`),
		regexp.MustCompile(`(?i)/EmbeddedFiles\b`),
		regexp.MustCompile(`(?i)/RichMedia\b`),
		regexp.MustCompile(`(?i)<script[\s>]`),
		regexp.MustCompile(`(?i)javascript:`),
		regexp.MustCompile(`(?i)eval\s*\(`),
		regexp.MustCompile(`(?i)onload\s*=`),
		regexp.MustCompile(`(?i)onerror\s*=`),
	}

	dangerousScriptPatterns = []*regexp.Regexp{
		regexp.MustCompile(`<\?php`),
		regexp.MustCompile(`<\?=`),
		regexp.MustCompile(`^#!\s*/bin/`),
		regexp.MustCompile(`(?i)<script[\s>]`),
		regexp.MustCompile(`(?i)base64_decode\s*\(`),
		regexp.MustCompile(`(?i)passthru\s*\(`),
		regexp.MustCompile(`(?i)shell_exec\s*\(`),
		regexp.MustCompile(`(?i)system\s*\(`),
	}
)

// ValidateFileSecurity executes comprehensive 2-way security checks
func ValidateFileSecurity(filename string, fileSize int64, content []byte) error {
	// 1. Check File Size
	if fileSize <= 0 {
		return errors.New("File tidak boleh kosong (Ukuran 0 byte)")
	}
	if fileSize > MaxFileSize {
		return fmt.Errorf("Ukuran file (%d MB) melebihi batas maksimal 25 MB", fileSize/(1024*1024))
	}
	if int64(len(content)) > MaxFileSize {
		return errors.New("Ukuran konten file melebihi batas maksimal 25 MB")
	}

	// 2. Validate Filename & Path Traversal
	if strings.Contains(filename, "..") || strings.Contains(filename, "/") || strings.Contains(filename, "\\") {
		return errors.New("Nama file mengandung karakter direktori yang dilarang (Path traversal detected)")
	}
	if strings.Contains(filename, "\x00") {
		return errors.New("Nama file mengandung karakter null byte (Poison null byte detected)")
	}

	// 3. Validate Extension & Double Extensions
	ext := strings.ToLower(filepath.Ext(filename))
	if ext == "" {
		return errors.New("File harus memiliki ekstensi yang valid")
	}

	// Check against whitelist
	if _, allowed := AllowedExtensions[ext]; !allowed {
		return fmt.Errorf("Ekstensi file '%s' tidak diizinkan. Hanya file dokumen/gambar (.pdf, .doc, .docx, .xls, .xlsx, .jpg, .png) yang diperbolehkan", ext)
	}

	// Check for dangerous extensions (including double extension trick: document.php.pdf)
	lowerFilename := strings.ToLower(filename)
	for _, badExt := range DangerousExtensions {
		if strings.Contains(lowerFilename, badExt) {
			return fmt.Errorf("File terindikasi berbahaya karena memuat ekstensi '%s' tersembunyi (Executable/Script blocked)", badExt)
		}
	}

	// 4. Validate Magic Bytes (Header Binary Verification)
	if err := validateMagicBytes(ext, content); err != nil {
		return err
	}

	// 5. Deep Content Scanning for Injected Scripts
	if ext == ".pdf" {
		if err := scanPDFContent(content); err != nil {
			return err
		}
	} else {
		if err := scanGenericContent(content); err != nil {
			return err
		}
	}

	return nil
}

// validateMagicBytes verifies that the initial bytes match the expected file signature
func validateMagicBytes(ext string, content []byte) error {
	if len(content) < 8 {
		return errors.New("File rusak atau terlalu kecil untuk diverifikasi integritasnya")
	}

	switch ext {
	case ".pdf":
		if !bytes.HasPrefix(content, magicPDF) {
			return errors.New("File dinyatakan sebagai PDF namun tidak memiliki header valid '%PDF-' (Format mismatch / polyglot)")
		}
	case ".png":
		if !bytes.HasPrefix(content, magicPNG) {
			return errors.New("File dinyatakan sebagai PNG namun tidak memiliki header valid PNG")
		}
	case ".jpg", ".jpeg":
		if !bytes.HasPrefix(content, magicJPG1) {
			return errors.New("File dinyatakan sebagai JPEG/JPG namun tidak memiliki header valid JPEG")
		}
	case ".doc", ".xls":
		if !bytes.HasPrefix(content, magicOLE) {
			return errors.New("File dokumen Office legacy (.doc/.xls) tidak memiliki header valid OLE2")
		}
	case ".docx", ".xlsx":
		if !bytes.HasPrefix(content, magicZIP) {
			return errors.New("File dokumen Office modern (.docx/.xlsx) tidak memiliki header valid ZIP")
		}
	}

	return nil
}

// scanPDFContent verifies that the PDF does not contain embedded active JavaScript or Launch scripts
func scanPDFContent(content []byte) error {
	// First check general script and executable patterns
	for _, pat := range dangerousScriptPatterns {
		if pat.Match(content) {
			return errors.New("File PDF terdeteksi mengandung kode script/executable berbahaya (Embedded script blocked)")
		}
	}

	// Check PDF-specific active action patterns
	for _, pat := range pdfScriptPatterns {
		if pat.Match(content) {
			return errors.New("File PDF ditolak: terdeteksi script aktif (/JavaScript, /Launch, atau Action script) di dalam struktur PDF")
		}
	}

	// Check if PDF starts with PE (Windows exe) or ELF (Linux exe) polyglot
	if bytes.HasPrefix(content, []byte("MZ")) || bytes.HasPrefix(content, []byte("\x7fELF")) {
		return errors.New("File terdeteksi sebagai file executable polyglot (Biner eksekusi bertopeng PDF)")
	}

	return nil
}

// scanGenericContent checks general files (images, docs) for script tags or web shells
func scanGenericContent(content []byte) error {
	for _, pat := range dangerousScriptPatterns {
		if pat.Match(content) {
			return errors.New("File terdeteksi mengandung script berbahaya atau web shell (Script injection blocked)")
		}
	}
	return nil
}

// SanitizeFilename cleans the filename to a safe ASCII-only base name
func SanitizeFilename(name string) string {
	base := filepath.Base(name)
	// Remove non-alphanumeric except dots, dashes, underscores
	reg := regexp.MustCompile(`[^a-zA-Z0-9.\-_]`)
	clean := reg.ReplaceAllString(base, "_")
	if len(clean) > 80 {
		clean = clean[len(clean)-80:]
	}
	return clean
}

