export type ApplicationStatus =
  | 'Pending Review'
  | 'Under Review'
  | 'Additional Information Required'
  | 'Approved'
  | 'Rejected';

export type KotakAccountStatus =
  | 'Pending'
  | 'Completion Awaited'
  | 'Completed'
  | 'Verification Required'
  | 'Failed';

export type DeliveryCategory = 'food_quick_commerce' | 'logistics_ecommerce';

export type WorkType = 'Full-time' | 'Part-time' | 'Flexible';

export type WorkingHours =
  | 'Morning'
  | 'Afternoon'
  | 'Evening'
  | 'Night'
  | 'Flexible';

export interface DeliveryPartnerApplication {
  id: string;
  application_reference: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  mobile_number: string;
  alternate_mobile_number?: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  aadhaar_number?: string;
  pan_number?: string;
  delivery_categories: string[]; // JSON array stored in DB
  work_type: WorkType;
  preferred_working_hours: WorkingHours;
  preferred_delivery_location: string;
  preferred_service_area: string;
  employment_status?: string;
  owns_two_wheeler: boolean;
  has_driving_license: boolean;
  has_vehicle_registration: boolean;
  has_smartphone: boolean;
  kotak_account_status: KotakAccountStatus;
  application_status: ApplicationStatus;
  privacy_consent: boolean;
  kotak_acknowledgement: boolean;
  document_processing_status: string;
  internal_notes?: string;
  rejection_reason?: string;
  submitted_at: string;
  updated_at: string;
  documents?: ApplicationDocument[];
}

export interface ApplicationDocument {
  id: string;
  application_id: string;
  document_type: 'aadhaar' | 'pan';
  original_file_name: string;
  stored_file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  verification_status: 'Unverified' | 'Verified' | 'Flagged';
  uploaded_at: string;
}

export interface StatusHistoryEntry {
  id: string;
  application_id: string;
  change_type: 'APPLICATION_STATUS' | 'KOTAK_STATUS' | 'NOTE_ADDED';
  previous_status?: string;
  new_status?: string;
  changed_by: string;
  reason_or_note?: string;
  created_at: string;
}

export interface ApplicationSubmissionPayload {
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    gender?: string;
    mobileNumber: string;
    alternateMobileNumber?: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryPreference: {
    categories: DeliveryCategory[];
  };
  workPreferences: {
    workType: WorkType;
    workingHours: WorkingHours;
    deliveryLocation: string;
    serviceArea: string;
    employmentStatus?: string;
    ownsTwoWheeler: boolean;
    hasDrivingLicense: boolean;
    hasVehicleRegistration: boolean;
    hasSmartphone: boolean;
  };
  documents: {
    aadhaarDocumentId: string;
    panDocumentId: string;
  };
  kotakAcknowledgement: boolean;
  privacyConsent: boolean;
}

export interface AdminApplicationDetail extends DeliveryPartnerApplication {
  documents: ApplicationDocument[];
  history: StatusHistoryEntry[];
}
