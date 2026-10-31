import apiClient from "@/services/api";
import toast from "react-hot-toast";

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".jpg",
  ".jpeg",
  ".png",
];

export const FORBIDDEN_EXTENSIONS = [
  ".php",
  ".phtml",
  ".phar",
  ".exe",
  ".bat",
  ".cmd",
  ".sh",
  ".bash",
  ".bin",
  ".js",
  ".mjs",
  ".ts",
  ".vbs",
  ".jsp",
  ".asp",
  ".aspx",
  ".py",
  ".pl",
  ".cgi",
  ".html",
  ".htm",
  ".xhtml",
  ".svg",
  ".jar",
  ".dll",
  ".ps1",
];

export type UploadSuccessResult = {
  success: true;
  fileName: string;
  fileUrl: string;
  originalName: string;
  fileSize: number;
  error?: undefined;
};

export type UploadErrorResult = {
  success: false;
  error: string;
  fileName?: undefined;
  fileUrl?: undefined;
  originalName?: undefined;
  fileSize?: undefined;
};

export type UploadResult = UploadSuccessResult | UploadErrorResult;

/**
 * Validates file security on the client side before sending across network
 */
export async function validateClientFile(file: File): Promise<{ valid: boolean; error?: string }> {
  if (!file) {
    return { valid: false, error: "File tidak boleh kosong" };
  }

  // 1. File size verification
  if (file.size <= 0) {
    return { valid: false, error: "Ukuran file 0 byte (file kosong)" };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Ukuran file ${(file.size / (1024 * 1024)).toFixed(1)} MB melebihi batas maksimal 25 MB`,
    };
  }

  // 2. Filename traversal & null byte check
  const rawName = file.name;
  if (rawName.includes("..") || rawName.includes("/") || rawName.includes("\\")) {
    return { valid: false, error: "Nama file tidak boleh mengandung path traversal (.. atau /)" };
  }
  if (rawName.includes("\0")) {
    return { valid: false, error: "Nama file mengandung karakter ilegal (Null byte detected)" };
  }

  // 3. Extension Whitelist Check
  const dotIdx = rawName.lastIndexOf(".");
  if (dotIdx === -1) {
    return { valid: false, error: "File harus memiliki ekstensi yang valid (.pdf, .doc, .xlsx, dsb)" };
  }
  const ext = rawName.slice(dotIdx).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Ekstensi '${ext}' dilarang! Hanya dokumen resmi (.pdf, .doc, .docx, .xls, .xlsx, .jpg, .png) yang diizinkan`,
    };
  }

  // 4. Double Extension & Embedded Script Extension Check
  const lowerName = rawName.toLowerCase();
  for (const badExt of FORBIDDEN_EXTENSIONS) {
    if (lowerName.includes(badExt)) {
      return {
        valid: false,
        error: `File diblokir: Terdeteksi ekstensi berbahaya '${badExt}' di dalam nama file!`,
      };
    }
  }

  // 5. Binary Magic Bytes & Deep Script Inspection
  try {
    const sliceBuffer = await readFileSlice(file, 0, Math.min(file.size, 1024 * 1024)); // Inspect up to 1MB
    const uint8 = new Uint8Array(sliceBuffer);

    // Verify Magic Bytes
    if (ext === ".pdf") {
      const header = new TextDecoder("ascii").decode(uint8.slice(0, 5));
      if (!header.startsWith("%PDF-")) {
        return { valid: false, error: "File bukan merupakan dokumen PDF asli (Header %PDF- tidak ditemukan)" };
      }

      // Deep scan PDF for script execution directives
      const textChunk = new TextDecoder("latin1").decode(uint8);
      const scriptTokens = [
        "/JavaScript",
        "/JS",
        "/Launch",
        "/EmbeddedFiles",
        "/RichMedia",
        "<script",
        "javascript:",
        "<?php",
        "eval(",
        "onload=",
        "onerror=",
      ];

      for (const token of scriptTokens) {
        if (textChunk.toLowerCase().includes(token.toLowerCase())) {
          return {
            valid: false,
            error: `File PDF diblokir: Terdeteksi kode script berbahaya (${token}) di dalam berkas!`,
          };
        }
      }
    } else if (ext === ".png") {
      // PNG: 89 50 4E 47 0D 0A 1A 0A
      if (
        uint8[0] !== 0x89 ||
        uint8[1] !== 0x50 ||
        uint8[2] !== 0x4e ||
        uint8[3] !== 0x47
      ) {
        return { valid: false, error: "File gambar PNG tidak valid (Header signature mismatch)" };
      }
    } else if (ext === ".jpg" || ext === ".jpeg") {
      // JPG: FF D8 FF
      if (uint8[0] !== 0xff || uint8[1] !== 0xd8 || uint8[2] !== 0xff) {
        return { valid: false, error: "File gambar JPEG/JPG tidak valid (Header signature mismatch)" };
      }
    }

    // Check generic script injection in any file
    const textSample = new TextDecoder("latin1").decode(uint8.slice(0, 2048));
    if (
      textSample.includes("<?php") ||
      textSample.includes("<?=") ||
      textSample.startsWith("#!/bin/") ||
      textSample.toLowerCase().includes("<script")
    ) {
      return { valid: false, error: "File diblokir: Mengandung script atau executable tersembunyi!" };
    }
  } catch (err: any) {
    return { valid: false, error: `Gagal membaca isi file: ${err.message || err}` };
  }

  return { valid: true };
}

/**
 * Uploads a file with two-way security validation (Client inspection + Server-side validation)
 */
export async function uploadSecureFile(file: File): Promise<UploadResult> {
  // Step 1: Client-side validation
  const validation = await validateClientFile(file);
  if (!validation.valid) {
    const errorMsg = validation.error || "Validasi file gagal";
    toast.error(errorMsg);
    return { success: false, error: errorMsg };
  }

  // Step 2: Send to backend for server-side verification and storage
  const formData = new FormData();
  formData.append("file", file);

  try {
    const toastId = toast.loading("Memverifikasi dan mengunggah berkas...");

    const response: any = await apiClient.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    toast.dismiss(toastId);

    if (response?.success && response?.data) {
      toast.success(`Berkas ${file.name} lolos verifikasi keamanan & tersimpan`);
      return {
        success: true,
        fileName: response.data.stored_name,
        fileUrl: response.data.file_url,
        originalName: response.data.original_name,
        fileSize: response.data.file_size,
      };
    } else {
      const errMsg = response?.message || "Gagal mengunggah berkas ke server";
      toast.error(errMsg);
      return { success: false, error: errMsg };
    }
  } catch (err: any) {
    const errMsg = err?.response?.data?.message || err.message || "Gagal mengunggah berkas";
    toast.error(errMsg);
    return { success: false, error: errMsg };
  }
}

function readFileSlice(file: File, start: number, end: number): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const slice = file.slice(start, end);
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(slice);
  });
}
