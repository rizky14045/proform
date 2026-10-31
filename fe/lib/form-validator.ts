/**
 * Central Form Validation & Sanitization Utility for PT PLN Nusantara Power UP Sembalang
 */

export interface ValidationRule {
  field: string;
  label: string;
  value: any;
  required?: boolean;
  type?: "string" | "number" | "email" | "phone" | "npwp" | "nik" | "percentage" | "date";
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
}

export function validateForm(rules: ValidationRule[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const rule of rules) {
    const val = rule.value;

    // Check Required
    if (rule.required) {
      if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
        errors.push(`${rule.label} wajib diisi`);
        continue;
      }
    }

    // If empty and not required, skip type validation
    if (val === undefined || val === null || val === "") {
      continue;
    }

    // Type Specific Checks
    if (rule.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(val))) {
        errors.push(`Format ${rule.label} tidak valid (contoh: user@plnnusantarapower.co.id)`);
      }
    }

    if (rule.type === "phone") {
      const phoneRegex = /^[0-9+\-\s()]{7,25}$/;
      if (!phoneRegex.test(String(val))) {
        errors.push(`Format ${rule.label} tidak valid (hanya angka dan simbol +, -, ())`);
      }
    }

    if (rule.type === "npwp") {
      // Clean digits only
      const cleanDigits = String(val).replace(/[^0-9]/g, "");
      if (cleanDigits.length !== 15 && cleanDigits.length !== 16) {
        errors.push(`${rule.label} harus terdiri dari 15 atau 16 digit angka`);
      }
    }

    if (rule.type === "nik") {
      const cleanDigits = String(val).replace(/[^0-9]/g, "");
      if (cleanDigits.length !== 16) {
        errors.push(`${rule.label} (NIK) harus terdiri dari 16 digit angka`);
      }
    }

    if (rule.type === "percentage") {
      const num = Number(val);
      if (isNaN(num) || num < 0 || num > 100) {
        errors.push(`${rule.label} harus bernilai antara 0% hingga 100%`);
      }
    }

    if (rule.type === "number") {
      const num = Number(val);
      if (isNaN(num)) {
        errors.push(`${rule.label} harus berupa angka valid`);
      } else {
        if (rule.min !== undefined && num < rule.min) {
          errors.push(`${rule.label} tidak boleh kurang dari ${rule.min}`);
        }
        if (rule.max !== undefined && num > rule.max) {
          errors.push(`${rule.label} tidak boleh melebihi ${rule.max}`);
        }
      }
    }

    // String length limits
    if (typeof val === "string") {
      if (rule.minLength && val.length < rule.minLength) {
        errors.push(`${rule.label} minimal ${rule.minLength} karakter`);
      }
      if (rule.maxLength && val.length > rule.maxLength) {
        errors.push(`${rule.label} maksimal ${rule.maxLength} karakter`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Strips script tags, javascript: protocols, and event handlers from text to prevent stored XSS
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/eval\s*\(/gi, "")
    .trim();
}

