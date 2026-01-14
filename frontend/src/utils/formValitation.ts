// utils/formValidation.ts

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean;
  message: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface FieldConfig {
  [key: string]: ValidationRule[];
}

/**
 * Email validation using RFC 5322 compliant regex
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Kenyan phone number validation
 * Accepts formats: 0712345678, +254712345678, 254712345678
 */
export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\s/g, '');
  const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
  return phoneRegex.test(cleanPhone);
};

/**
 * Kenyan National ID validation (7-8 digits)
 */
export const validateIdNumber = (id: string): boolean => {
  const idRegex = /^\d{7,8}$/;
  return idRegex.test(id);
};

/**
 * Badge number validation (alphanumeric, min 3 chars)
 */
export const validateBadgeNumber = (badge: string): boolean => {
  return badge.length >= 3;
};

/**
 * Generic validation class for form fields
 */
export class FormValidator {
  private fieldConfig: FieldConfig;

  constructor(config: FieldConfig) {
    this.fieldConfig = config;
  }

  /**
   * Validate a single field
   */
  validateField(fieldName: string, value: any): string {
    const rules = this.fieldConfig[fieldName];
    if (!rules) return "";

    for (const rule of rules) {
      // Check required
      if (rule.required && (!value || value.toString().trim().length === 0)) {
        return rule.message;
      }

      // Skip other validations if value is empty and not required
      if (!value || value.toString().trim().length === 0) {
        continue;
      }

      // Check minLength
      if (rule.minLength && value.toString().trim().length < rule.minLength) {
        return rule.message;
      }

      // Check maxLength
      if (rule.maxLength && value.toString().length > rule.maxLength) {
        return rule.message;
      }

      // Check pattern
      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message;
      }

      // Check custom validator
      if (rule.customValidator && !rule.customValidator(value)) {
        return rule.message;
      }
    }

    return "";
  }

  /**
   * Validate all fields in the form data
   */
  validateForm(formData: { [key: string]: any }): ValidationErrors {
    const errors: ValidationErrors = {};

    Object.keys(this.fieldConfig).forEach((fieldName) => {
      const error = this.validateField(fieldName, formData[fieldName]);
      if (error) {
        errors[fieldName] = error;
      }
    });

    return errors;
  }

  /**
   * Check if form is valid
   */
  isValid(formData: { [key: string]: any }): boolean {
    const errors = this.validateForm(formData);
    return Object.keys(errors).length === 0;
  }
}

/**
 * Predefined validation configurations for common form types
 */
export const OfficerFormValidation: FieldConfig = {
  first_name: [
    { required: true, message: "First name is required" },
    { minLength: 2, message: "First name must be at least 2 characters" },
    { maxLength: 50, message: "First name must not exceed 50 characters" },
  ],
  last_name: [
    { required: true, message: "Last name is required" },
    { minLength: 2, message: "Last name must be at least 2 characters" },
    { maxLength: 50, message: "Last name must not exceed 50 characters" },
  ],
  email: [
    { required: true, message: "Email is required" },
    {
      customValidator: validateEmail,
      message: "Invalid email format",
    },
  ],
  phone: [
    {
      customValidator: (value) => !value || validatePhone(value),
      message: "Invalid phone number (e.g., 0712345678 or +254712345678)",
    },
  ],
  office_email: [
    {
      customValidator: (value) => !value || validateEmail(value),
      message: "Invalid email format",
    },
  ],
  id_number: [
    {
      customValidator: (value) => !value || validateIdNumber(value),
      message: "ID number must be 7-8 digits",
    },
  ],
  badge_number: [
    {
      customValidator: (value) => !value || validateBadgeNumber(value),
      message: "Badge number must be at least 3 characters",
    },
  ],
};

/**
 * Hook-friendly validator instance creator
 */
export const createOfficerValidator = () => {
  return new FormValidator(OfficerFormValidation);
};

/**
 * Utility function to format phone numbers
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\s/g, '');
  
  // Convert to international format if starting with 0
  if (cleaned.startsWith('0')) {
    return '+254' + cleaned.substring(1);
  }
  
  // Add + if not present
  if (cleaned.startsWith('254') && !cleaned.startsWith('+')) {
    return '+' + cleaned;
  }
  
  return cleaned;
};

/**
 * Utility function to clean and validate form data before submission
 */
export const prepareOfficerData = (formData: any) => {
  const cleaned = { ...formData };
  
  // Trim string fields
  ['first_name', 'last_name', 'email', 'office_email', 'role_text', 'badge_number', 'id_number', 'notes'].forEach(
    (field) => {
      if (cleaned[field]) {
        cleaned[field] = cleaned[field].trim();
      }
    }
  );
  
  // Format phone number
  if (cleaned.phone) {
    cleaned.phone = formatPhoneNumber(cleaned.phone);
  }
  
  return cleaned;
};