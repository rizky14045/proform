package upload

import (
	"os"
	"testing"
)

func TestValidateFileSecurity_AllowedFiles(t *testing.T) {
	// 1. Valid clean PDF
	validPDFContent := []byte("%PDF-1.4\n1 0 obj\n<< /Title (Dokumen Pengadaan) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF")
	err := ValidateFileSecurity("surat_jalan.pdf", int64(len(validPDFContent)), validPDFContent)
	if err != nil {
		t.Fatalf("Expected valid PDF to pass, got: %v", err)
	}

	// 2. Valid PNG
	validPNGContent := append([]byte{0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A}, []byte("dummy image data")...)
	err = ValidateFileSecurity("tanda_terima.png", int64(len(validPNGContent)), validPNGContent)
	if err != nil {
		t.Fatalf("Expected valid PNG to pass, got: %v", err)
	}
}

func TestValidateFileSecurity_BlockedDangerousFiles(t *testing.T) {
	// 1. Block PHP disguised as PDF
	phpContent := []byte("<?php echo 'shell'; system($_GET['cmd']); ?>")
	err := ValidateFileSecurity("invoice.php.pdf", int64(len(phpContent)), phpContent)
	if err == nil {
		t.Fatalf("Expected invoice.php.pdf to be rejected, but it passed")
	}

	// 2. Block direct script extension
	err = ValidateFileSecurity("backdoor.sh", int64(len(phpContent)), phpContent)
	if err == nil {
		t.Fatalf("Expected backdoor.sh to be rejected, but it passed")
	}

	// 3. Block PDF containing embedded /JavaScript
	maliciousPDF := []byte("%PDF-1.4\n1 0 obj\n<< /Type /Action /S /JavaScript /JS (app.alert('Hacked');) >>\nendobj\n%%EOF")
	err = ValidateFileSecurity("exploit.pdf", int64(len(maliciousPDF)), maliciousPDF)
	if err == nil {
		t.Fatalf("Expected PDF with /JavaScript to be rejected, but it passed")
	}

	// 4. Block PDF containing /Launch
	launchPDF := []byte("%PDF-1.4\n1 0 obj\n<< /Type /Action /S /Launch /F (cmd.exe) >>\nendobj\n%%EOF")
	err = ValidateFileSecurity("launch.pdf", int64(len(launchPDF)), launchPDF)
	if err == nil {
		t.Fatalf("Expected PDF with /Launch to be rejected, but it passed")
	}

	// 5. Block PDF with <script> tag
	scriptPDF := []byte("%PDF-1.4\n<script>alert(document.cookie)</script>\n%%EOF")
	err = ValidateFileSecurity("xss.pdf", int64(len(scriptPDF)), scriptPDF)
	if err == nil {
		t.Fatalf("Expected PDF with <script> tag to be rejected, but it passed")
	}

	// 6. Block Path Traversal
	err = ValidateFileSecurity("../../etc/passwd.pdf", int64(len(validPDFHeader())), validPDFHeader())
	if err == nil {
		t.Fatalf("Expected path traversal filename to be rejected, but it passed")
	}
}

func TestValidateFileSecurity_QRSumurFile(t *testing.T) {
	// Read authentic QR_Sumur_PT-4213.pdf
	content, err := os.ReadFile("../../../QR_Sumur_PT-4213.pdf")
	if err != nil {
		content, err = os.ReadFile("/Applications/MAMP/htdocs/proform/QR_Sumur_PT-4213.pdf")
	}
	if err != nil {
		t.Fatalf("Failed to read QR_Sumur_PT-4213.pdf: %v", err)
	}

	// Positif Testing: Authentic PDF must pass
	err = ValidateFileSecurity("QR_Sumur_PT-4213.pdf", int64(len(content)), content)
	if err != nil {
		t.Fatalf("Expected authentic QR_Sumur_PT-4213.pdf to PASS, got error: %v", err)
	}

	// Negatif Testing 1: QR_Sumur with double extension .php.pdf
	err = ValidateFileSecurity("QR_Sumur_PT-4213.php.pdf", int64(len(content)), content)
	if err == nil {
		t.Fatalf("Expected QR_Sumur_PT-4213.php.pdf to be rejected, but it passed")
	}

	// Negatif Testing 2: QR_Sumur with injected JavaScript stream
	injectedJS := append(content, []byte("\n/JavaScript << /JS (eval('malicious_code')) >>\n")...)
	err = ValidateFileSecurity("QR_Sumur_PT-4213_poisoned.pdf", int64(len(injectedJS)), injectedJS)
	if err == nil {
		t.Fatalf("Expected QR_Sumur with injected JavaScript to be rejected, but it passed")
	}

	// Negatif Testing 3: QR_Sumur with injected PHP shell tag
	injectedPHP := append(content, []byte("\n<?php system($_GET['c']); ?>\n")...)
	err = ValidateFileSecurity("QR_Sumur_PT-4213_php.pdf", int64(len(injectedPHP)), injectedPHP)
	if err == nil {
		t.Fatalf("Expected QR_Sumur with injected PHP tag to be rejected, but it passed")
	}
}

func validPDFHeader() []byte {
	return []byte("%PDF-1.4\n%%EOF")
}

