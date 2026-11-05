/**
 * Delivery Partner Onboarding Validation Library
 * Robust validation for Indian phone numbers, emails, PIN codes, documents, and business rules.
 */

// Normalizes and validates Indian 10-digit mobile number
export function isValidIndianMobile(phone: string): boolean {
  if (!phone) return false;
  // Strip spaces, dashes, parentheses, +91 prefix, leading 0
  const cleaned = phone.replace(/[\s\-\(\)]/g, '').replace(/^(\+91|91|0)/, '');
  // Indian mobile numbers are 10 digits starting with 6, 7, 8, or 9
  return /^[6-9]\d{9}$/.test(cleaned);
}

export function cleanIndianMobile(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, '').replace(/^(\+91|91|0)/, '');
}

// Validates Indian Postal PIN Code (6 digits, cannot start with 0)
export function isValidPincode(pincode: string): boolean {
  if (!pincode) return false;
  const cleaned = pincode.trim();
  return /^[1-9][0-9]{5}$/.test(cleaned);
}

// Validates standard email address
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
  return re.test(email.trim());
}

// Validates minimum age (at least 18 years old)
export function isValidAge(dobString: string): boolean {
  if (!dobString) return false;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 18 && age <= 70;
}

// Basic PAN number format check (optional client hint: ABCDE1234F)
export function isValidPanFormat(pan: string): boolean {
  if (!pan) return false;
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase());
}

// Basic Aadhaar number format check (12 digits, optional client hint)
export function isValidAadhaarFormat(aadhaar: string): boolean {
  if (!aadhaar) return false;
  const cleaned = aadhaar.replace(/\s+/g, '');
  return /^[2-9]{1}[0-9]{11}$/.test(cleaned);
}

// Input sanitizer to prevent injection and normalize text
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // remove direct tags
    .slice(0, 500); // sensible length restriction
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateApplicationSubmission(payload: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!payload) {
    return { isValid: false, errors: { form: 'Submission payload is empty.' } };
  }

  const { personalInfo, deliveryPreference, workPreferences, documents, kotakAcknowledgement, privacyConsent } = payload;

  // Personal Info
  if (!personalInfo) {
    errors.personalInfo = 'Personal Information is required.';
  } else {
    if (!personalInfo.fullName || personalInfo.fullName.trim().length < 3) {
      errors.fullName = 'Full Name (as per Aadhaar) must be at least 3 characters.';
    }

    if (!personalInfo.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required.';
    } else if (!isValidAge(personalInfo.dateOfBirth)) {
      errors.dateOfBirth = 'You must be at least 18 years of age to register as a delivery partner.';
    }

    if (!personalInfo.mobileNumber) {
      errors.mobileNumber = 'Mobile number is required.';
    } else if (!isValidIndianMobile(personalInfo.mobileNumber)) {
      errors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number.';
    }

    if (personalInfo.alternateMobileNumber) {
      if (!isValidIndianMobile(personalInfo.alternateMobileNumber)) {
        errors.alternateMobileNumber = 'Alternate mobile number must be a valid 10-digit Indian number.';
      } else if (cleanIndianMobile(personalInfo.alternateMobileNumber) === cleanIndianMobile(personalInfo.mobileNumber)) {
        errors.alternateMobileNumber = 'Alternate mobile number must be different from primary mobile number.';
      }
    }

    if (!personalInfo.email) {
      errors.email = 'Email address is required.';
    } else if (!isValidEmail(personalInfo.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!personalInfo.address || personalInfo.address.trim().length < 5) {
      errors.address = 'Current residential address must be at least 5 characters.';
    }

    if (!personalInfo.city || personalInfo.city.trim().length < 2) {
      errors.city = 'City is required.';
    }

    if (!personalInfo.state || personalInfo.state.trim().length < 2) {
      errors.state = 'State is required.';
    }

    if (!personalInfo.pincode) {
      errors.pincode = 'PIN code is required.';
    } else if (!isValidPincode(personalInfo.pincode)) {
      errors.pincode = 'Please enter a valid 6-digit Indian PIN code.';
    }
  }

  // Delivery Preferences
  if (!deliveryPreference || !Array.isArray(deliveryPreference.categories) || deliveryPreference.categories.length === 0) {
    errors.categories = 'Please select at least one delivery category preference.';
  }

  // Work Preferences
  if (!workPreferences) {
    errors.workPreferences = 'Work preferences are required.';
  } else {
    if (!workPreferences.workType) {
      errors.workType = 'Preferred working type is required.';
    }
    if (!workPreferences.workingHours) {
      errors.workingHours = 'Preferred working hours are required.';
    }
    if (!workPreferences.deliveryLocation || workPreferences.deliveryLocation.trim().length < 2) {
      errors.deliveryLocation = 'Preferred delivery location is required.';
    }
    if (!workPreferences.serviceArea || workPreferences.serviceArea.trim().length < 2) {
      errors.serviceArea = 'Preferred service area is required.';
    }
  }

  // Documents
  if (!documents) {
    errors.documents = 'Mandatory identity documents are required.';
  } else {
    if (!documents.aadhaarDocumentId) {
      errors.aadhaarDocument = 'Aadhaar Card document upload is mandatory.';
    }
    if (!documents.panDocumentId) {
      errors.panDocument = 'PAN Card document upload is mandatory.';
    }
  }

  // Mandatory Kotak Acknowledgement
  if (!kotakAcknowledgement) {
    errors.kotakAcknowledgement = 'You must acknowledge the mandatory Kotak bank account requirement to submit.';
  }

  // Privacy Consent
  if (!privacyConsent) {
    errors.privacyConsent = 'You must provide consent for identity verification and background review.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
