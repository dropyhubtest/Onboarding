'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './RegistrationWizard.module.css';
import {
  isValidIndianMobile,
  cleanIndianMobile,
  isValidEmail,
  isValidPincode,
  isValidAge,
  isValidAadhaarFormat,
  isValidPanFormat,
} from '@/lib/validation';
import { DeliveryCategory, WorkType, WorkingHours } from '@/types';

interface FormDataState {
  // Step 1: Personal
  fullName: string;
  dateOfBirth: string;
  gender: string;
  mobileNumber: string;
  alternateMobileNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;

  // Step 2: Delivery Preferences
  categories: DeliveryCategory[];

  // Step 3: Work & Vehicle
  workType: WorkType;
  workingHours: WorkingHours;
  deliveryLocation: string;
  serviceArea: string;
  employmentStatus: string;
  ownsTwoWheeler: boolean;
  hasDrivingLicense: boolean;
  hasVehicleRegistration: boolean;
  hasSmartphone: boolean;

  // Step 4: Documents & Identity Numbers
  aadhaarNumber: string;
  panNumber: string;
  aadhaarDocId: string;
  aadhaarFileName: string;
  aadhaarFileSize: number;
  panDocId: string;
  panFileName: string;
  panFileSize: number;

  // Step 5: Kotak & Privacy
  kotakAcknowledgement: boolean;
  privacyConsent: boolean;
}

const STEPS = [
  { id: 1, label: 'Personal Information' },
  { id: 2, label: 'Delivery Streams' },
  { id: 3, label: 'Work & Vehicle' },
  { id: 4, label: 'Identity Documents' },
  { id: 5, label: 'Mandatory Banking' },
];

export default function RegistrationWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormDataState>({
    fullName: '',
    dateOfBirth: '',
    gender: 'Male',
    mobileNumber: '',
    alternateMobileNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',

    categories: ['food_quick_commerce'],

    workType: 'Full-time',
    workingHours: 'Morning',
    deliveryLocation: '',
    serviceArea: '',
    employmentStatus: 'Gig Worker / Fresher',
    ownsTwoWheeler: true,
    hasDrivingLicense: true,
    hasVehicleRegistration: true,
    hasSmartphone: true,

    aadhaarNumber: '',
    panNumber: '',
    aadhaarDocId: '',
    aadhaarFileName: '',
    aadhaarFileSize: 0,
    panDocId: '',
    panFileName: '',
    panFileSize: 0,

    kotakAcknowledgement: false,
    privacyConsent: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadingDoc, setUploadingDoc] = useState<'aadhaar' | 'pan' | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [generalError, setGeneralError] = useState<string>('');

  const aadhaarInputRef = useRef<HTMLInputElement>(null);
  const panInputRef = useRef<HTMLInputElement>(null);

  // Field change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  // Toggle delivery category
  const toggleCategory = (cat: DeliveryCategory) => {
    setFormData((prev) => {
      const exists = prev.categories.includes(cat);
      let updated: DeliveryCategory[];
      if (exists) {
        updated = prev.categories.filter((c) => c !== cat);
      } else {
        updated = [...prev.categories, cat];
      }
      return { ...prev, categories: updated };
    });
    if (errors.categories) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.categories;
        return copy;
      });
    }
  };

  // Upload document file to backend API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'aadhaar' | 'pan') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadingDoc(type);

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('documentType', type);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to upload document.');
      }

      if (type === 'aadhaar') {
        setFormData((prev) => ({
          ...prev,
          aadhaarDocId: json.documentId,
          aadhaarFileName: json.originalFileName,
          aadhaarFileSize: json.fileSize,
        }));
        setErrors((prev) => {
          const c = { ...prev };
          delete c.aadhaarDoc;
          return c;
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          panDocId: json.documentId,
          panFileName: json.originalFileName,
          panFileSize: json.fileSize,
        }));
        setErrors((prev) => {
          const c = { ...prev };
          delete c.panDoc;
          return c;
        });
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading file.');
    } finally {
      setUploadingDoc(null);
    }
  };

  // Validate current step before proceeding
  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
        stepErrors.fullName = 'Full Name (as per Aadhaar) must be at least 3 characters.';
      }

      if (!formData.dateOfBirth) {
        stepErrors.dateOfBirth = 'Date of birth is required.';
      } else if (!isValidAge(formData.dateOfBirth)) {
        stepErrors.dateOfBirth = 'You must be at least 18 years old to join as a partner.';
      }

      if (!formData.mobileNumber) {
        stepErrors.mobileNumber = 'Mobile number is required.';
      } else if (!isValidIndianMobile(formData.mobileNumber)) {
        stepErrors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number.';
      }

      if (formData.alternateMobileNumber) {
        if (!isValidIndianMobile(formData.alternateMobileNumber)) {
          stepErrors.alternateMobileNumber = 'Alternate mobile number must be a valid 10-digit number.';
        } else if (cleanIndianMobile(formData.alternateMobileNumber) === cleanIndianMobile(formData.mobileNumber)) {
          stepErrors.alternateMobileNumber = 'Alternate mobile number must be different from primary mobile number.';
        }
      }

      if (!formData.email) {
        stepErrors.email = 'Email address is required.';
      } else if (!isValidEmail(formData.email)) {
        stepErrors.email = 'Please enter a valid email address.';
      }

      if (!formData.aadhaarNumber.trim()) {
        stepErrors.aadhaarNumber = 'Aadhaar Card number is required.';
      } else if (!isValidAadhaarFormat(formData.aadhaarNumber)) {
        stepErrors.aadhaarNumber = 'Please enter a valid 12-digit Aadhaar number.';
      }

      if (!formData.panNumber.trim()) {
        stepErrors.panNumber = 'PAN Card number is required.';
      } else if (!isValidPanFormat(formData.panNumber)) {
        stepErrors.panNumber = 'Please enter a valid 10-character PAN number (e.g. ABCDE1234F).';
      }

      if (!formData.address.trim() || formData.address.trim().length < 5) {
        stepErrors.address = 'Current address is required (min 5 characters).';
      }

      if (!formData.city.trim()) {
        stepErrors.city = 'City is required.';
      }

      if (!formData.state.trim()) {
        stepErrors.state = 'State is required.';
      }

      if (!formData.pincode) {
        stepErrors.pincode = 'PIN code is required.';
      } else if (!isValidPincode(formData.pincode)) {
        stepErrors.pincode = 'Please enter a valid 6-digit Indian PIN code.';
      }
    }

    if (step === 2) {
      if (formData.categories.length === 0) {
        stepErrors.categories = 'Please select at least one delivery category preference.';
      }
    }

    if (step === 3) {
      if (!formData.deliveryLocation.trim()) {
        stepErrors.deliveryLocation = 'Preferred delivery location is required.';
      }
      if (!formData.serviceArea.trim()) {
        stepErrors.serviceArea = 'Preferred service area is required.';
      }
    }

    if (step === 4) {
      if (!formData.aadhaarNumber.trim()) {
        stepErrors.aadhaarNumber = 'Aadhaar Card number is required.';
      } else if (!isValidAadhaarFormat(formData.aadhaarNumber)) {
        stepErrors.aadhaarNumber = 'Please enter a valid 12-digit Aadhaar number.';
      }

      if (!formData.panNumber.trim()) {
        stepErrors.panNumber = 'PAN Card number is required.';
      } else if (!isValidPanFormat(formData.panNumber)) {
        stepErrors.panNumber = 'Please enter a valid 10-character PAN number (e.g. ABCDE1234F).';
      }

      if (!formData.aadhaarDocId) {
        stepErrors.aadhaarDoc = 'Aadhaar Card document upload is mandatory.';
      }
      if (!formData.panDocId) {
        stepErrors.panDoc = 'PAN Card document upload is mandatory.';
      }
    }

    if (step === 5) {
      if (!formData.kotakAcknowledgement) {
        stepErrors.kotakAcknowledgement = 'You must acknowledge and accept the mandatory Kotak bank account requirement.';
      }
      if (!formData.privacyConsent) {
        stepErrors.privacyConsent = 'You must provide consent for background review and document verification.';
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: document.getElementById('apply-now')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Final Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    setGeneralError('');

    try {
      const payload = {
        personalInfo: {
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          mobileNumber: formData.mobileNumber,
          alternateMobileNumber: formData.alternateMobileNumber,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        deliveryPreference: {
          categories: formData.categories,
        },
        workPreferences: {
          workType: formData.workType,
          workingHours: formData.workingHours,
          deliveryLocation: formData.deliveryLocation,
          serviceArea: formData.serviceArea,
          employmentStatus: formData.employmentStatus,
          ownsTwoWheeler: formData.ownsTwoWheeler,
          hasDrivingLicense: formData.hasDrivingLicense,
          hasVehicleRegistration: formData.hasVehicleRegistration,
          hasSmartphone: formData.hasSmartphone,
        },
        documents: {
          aadhaarNumber: formData.aadhaarNumber.replace(/\s+/g, ''),
          panNumber: formData.panNumber.trim().toUpperCase(),
          aadhaarDocumentId: formData.aadhaarDocId,
          panDocumentId: formData.panDocId,
        },
        kotakAcknowledgement: formData.kotakAcknowledgement,
        privacyConsent: formData.privacyConsent,
      };

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.validationErrors) {
          setErrors(json.validationErrors);
        }
        throw new Error(json.error || 'Failed to submit application.');
      }

      // Preserve application reference
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('last_app_ref', json.applicationReference);
        sessionStorage.setItem('last_app_date', json.submittedAt);
        if (json.kotakUrl) {
          sessionStorage.setItem('last_kotak_url', json.kotakUrl);
        }
      }

      // Navigate to confirmation page
      const queryParams = new URLSearchParams({
        ref: json.applicationReference,
        date: json.submittedAt,
        status: json.applicationStatus || 'Pending Review',
        kotakStatus: json.kotakStatus || 'Pending',
      });

      if (json.kotakUrl) {
        queryParams.set('kotakUrl', json.kotakUrl);
      }

      const targetKotakUrl = json.kotakUrl || 'https://bit.ly/4i35J6m';

      // Open official Kotak onboarding link in new window/tab
      try {
        window.open(targetKotakUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {
        // Fallback gracefully if blocked by browser popup protection
      }

      router.push(`/confirmation?${queryParams.toString()}`);
    } catch (err: any) {
      setGeneralError(err.message || 'An error occurred while submitting your application.');
      setIsSubmitting(false);
    }
  };

  return (
    <section id="apply-now" className={styles.section} aria-label="Delivery Partner Application Form">
      <div className={styles.wrapper}>
        {/* Wizard Header */}
        <div className={styles.wizardHeader}>
          <h2 className={styles.headerTitle}>Delivery Partner Onboarding Application</h2>
          <p className={styles.headerSubtitle}>
            Complete the 5 guided sections below to register and commence your onboarding verification.
          </p>

          {/* Stepper Progress */}
          <div className={styles.stepper}>
            {STEPS.map((s) => {
              const isActive = s.id === currentStep;
              const isCompleted = s.id < currentStep;
              return (
                <div
                  key={s.id}
                  className={styles.stepItem}
                  onClick={() => {
                    if (s.id < currentStep) setCurrentStep(s.id);
                  }}
                >
                  <div
                    className={`${styles.stepCircle} ${
                      isActive ? styles.stepCircleActive : ''
                    } ${isCompleted ? styles.stepCircleCompleted : ''}`}
                  >
                    {isCompleted ? '✓' : s.id}
                  </div>
                  <span className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ''}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {generalError && (
          <div style={{ padding: '0 48px', paddingTop: 24 }}>
            <div className={styles.errorBanner}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{generalError}</span>
            </div>
          </div>
        )}

        {/* Wizard Body */}
        <form onSubmit={handleSubmit}>
          <div className={styles.formBody}>
            {/* ================= STEP 1: PERSONAL INFORMATION ================= */}
            {currentStep === 1 && (
              <div className={`${styles.formGrid} animate-fade-in`}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="fullName">
                    <span>
                      Full Name (as per Aadhaar)<span className={styles.requiredMark}>*</span>
                    </span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul Sharma"
                    className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
                  />
                  {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="dateOfBirth">
                    <span>
                      Date of Birth<span className={styles.requiredMark}>*</span>
                    </span>
                    <span className={styles.hint}>Min. 18 years</span>
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.dateOfBirth ? styles.inputError : ''}`}
                  />
                  {errors.dateOfBirth && <span className={styles.errorText}>{errors.dateOfBirth}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="gender">
                    <span>Gender</span>
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="mobileNumber">
                    <span>
                      Mobile Number<span className={styles.requiredMark}>*</span>
                    </span>
                    <span className={styles.hint}>10-digit Indian Number</span>
                  </label>
                  <input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="tel"
                    maxLength={10}
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    className={`${styles.input} ${errors.mobileNumber ? styles.inputError : ''}`}
                  />
                  {errors.mobileNumber && <span className={styles.errorText}>{errors.mobileNumber}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="alternateMobileNumber">
                    <span>Alternate Mobile Number</span>
                    <span className={styles.hint}>Optional</span>
                  </label>
                  <input
                    id="alternateMobileNumber"
                    name="alternateMobileNumber"
                    type="tel"
                    maxLength={10}
                    value={formData.alternateMobileNumber}
                    onChange={handleInputChange}
                    placeholder="9123456780"
                    className={`${styles.input} ${errors.alternateMobileNumber ? styles.inputError : ''}`}
                  />
                  {errors.alternateMobileNumber && (
                    <span className={styles.errorText}>{errors.alternateMobileNumber}</span>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="email">
                    <span>
                      Email Address<span className={styles.requiredMark}>*</span>
                    </span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="candidate@example.com"
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  />
                  {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="aadhaarNumber">
                    <span>
                      Aadhaar Card Number (12 Digits)<span className={styles.requiredMark}>*</span>
                    </span>
                    <span className={styles.hint}>Govt. ID Number</span>
                  </label>
                  <input
                    id="aadhaarNumber"
                    name="aadhaarNumber"
                    type="text"
                    maxLength={14}
                    value={formData.aadhaarNumber}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 12);
                      const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
                      setFormData((p) => ({ ...p, aadhaarNumber: formatted }));
                      if (errors.aadhaarNumber) {
                        setErrors((p) => {
                          const n = { ...p };
                          delete n.aadhaarNumber;
                          return n;
                        });
                      }
                    }}
                    placeholder="5432 1098 7654"
                    className={`${styles.input} ${errors.aadhaarNumber ? styles.inputError : ''}`}
                  />
                  {errors.aadhaarNumber && <span className={styles.errorText}>{errors.aadhaarNumber}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="panNumber">
                    <span>
                      PAN Card Number (10 Chars)<span className={styles.requiredMark}>*</span>
                    </span>
                    <span className={styles.hint}>e.g. ABCDE1234F</span>
                  </label>
                  <input
                    id="panNumber"
                    name="panNumber"
                    type="text"
                    maxLength={10}
                    value={formData.panNumber}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
                      setFormData((p) => ({ ...p, panNumber: val }));
                      if (errors.panNumber) {
                        setErrors((p) => {
                          const n = { ...p };
                          delete n.panNumber;
                          return n;
                        });
                      }
                    }}
                    placeholder="ABCDE1234F"
                    className={`${styles.input} ${errors.panNumber ? styles.inputError : ''}`}
                  />
                  {errors.panNumber && <span className={styles.errorText}>{errors.panNumber}</span>}
                </div>

                <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                  <label className={styles.label} htmlFor="address">
                    <span>
                      Current Residential Address<span className={styles.requiredMark}>*</span>
                    </span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House/Flat No., Street, Landmark, Colony"
                    className={`${styles.textarea} ${errors.address ? styles.inputError : ''}`}
                  />
                  {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="city">
                    <span>
                      City<span className={styles.requiredMark}>*</span>
                    </span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Hyderabad, Bengaluru, Mumbai"
                    className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
                  />
                  {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="state">
                    <span>
                      State<span className={styles.requiredMark}>*</span>
                    </span>
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="e.g. Telangana, Karnataka, Maharashtra"
                    className={`${styles.input} ${errors.state ? styles.inputError : ''}`}
                  />
                  {errors.state && <span className={styles.errorText}>{errors.state}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="pincode">
                    <span>
                      PIN Code<span className={styles.requiredMark}>*</span>
                    </span>
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="e.g. 500081"
                    className={`${styles.input} ${errors.pincode ? styles.inputError : ''}`}
                  />
                  {errors.pincode && <span className={styles.errorText}>{errors.pincode}</span>}
                </div>
              </div>
            )}

            {/* ================= STEP 2: DELIVERY PREFERENCES ================= */}
            {currentStep === 2 && (
              <div className="animate-fade-in">
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 6, fontWeight: 700 }}>
                    What type of delivery opportunities are you interested in?
                  </h3>
                  <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
                    Select one or both streams. Selecting both broadens your dispatch queue and order density across day and night.
                  </p>
                </div>

                {errors.categories && (
                  <div className={styles.errorBanner} style={{ marginBottom: 16 }}>
                    <span>{errors.categories}</span>
                  </div>
                )}

                <div className={styles.selectCardGroup}>
                  {/* CARD A */}
                  <div
                    className={`${styles.selectableCard} ${
                      formData.categories.includes('food_quick_commerce')
                        ? styles.selectableCardSelected
                        : ''
                    }`}
                    onClick={() => toggleCategory('food_quick_commerce')}
                  >
                    <div
                      className={`${styles.cardCheck} ${
                        formData.categories.includes('food_quick_commerce')
                          ? styles.cardCheckSelected
                          : ''
                      }`}
                    >
                      {formData.categories.includes('food_quick_commerce') && '✓'}
                    </div>

                    <div>
                      <h4 className={styles.selectCardTitle}>Food &amp; Quick Commerce Delivery</h4>
                      <p className={styles.selectCardDesc}>
                        Deliver food, groceries, fresh produce, and everyday essentials through established delivery platforms.
                      </p>
                    </div>

                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 700 }}>
                        REPRESENTATIVE NETWORKS:
                      </div>
                      <div className={styles.partnerPills}>
                        <span className={styles.partnerPill}>Swiggy</span>
                        <span className={styles.partnerPill}>Zomato</span>
                        <span className={styles.partnerPill}>BigBasket</span>
                        <span className={styles.partnerPill}>Blinkit</span>
                      </div>
                    </div>
                  </div>

                  {/* CARD B */}
                  <div
                    className={`${styles.selectableCard} ${
                      formData.categories.includes('logistics_ecommerce')
                        ? styles.selectableCardSelected
                        : ''
                    }`}
                    onClick={() => toggleCategory('logistics_ecommerce')}
                  >
                    <div
                      className={`${styles.cardCheck} ${
                        formData.categories.includes('logistics_ecommerce')
                          ? styles.cardCheckSelected
                          : ''
                      }`}
                    >
                      {formData.categories.includes('logistics_ecommerce') && '✓'}
                    </div>

                    <div>
                      <h4 className={styles.selectCardTitle}>Logistics &amp; E-Commerce Delivery</h4>
                      <p className={styles.selectCardDesc}>
                        Deliver packages and products across different industries, including healthcare, pharmaceuticals, fashion, retail and e-commerce.
                      </p>
                    </div>

                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 700 }}>
                        REPRESENTATIVE NETWORKS:
                      </div>
                      <div className={styles.partnerPills}>
                        <span className={styles.partnerPill}>Licious</span>
                        <span className={styles.partnerPill}>Apollo 24|7</span>
                        <span className={styles.partnerPill}>Pharma &amp; Retail</span>
                        <span className={styles.partnerPill}>Express Logistics</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 20 }}>
                  <div className={styles.infoNote}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>
                      <strong>Notice:</strong> Platform allocation depends on city availability, zone demand, and documentation verification. Examples do not represent a guaranteed brand partnership.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 3: WORK & VEHICLE ================= */}
            {currentStep === 3 && (
              <div className={`${styles.formGrid} animate-fade-in`}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="workType">
                    <span>
                      Preferred Working Type<span className={styles.requiredMark}>*</span>
                    </span>
                  </label>
                  <select
                    id="workType"
                    name="workType"
                    value={formData.workType}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="Full-time">Full-time (8-10 hours / day)</option>
                    <option value="Part-time">Part-time (4-5 hours / day)</option>
                    <option value="Flexible">Flexible / On-Demand</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="workingHours">
                    <span>
                      Preferred Working Hours<span className={styles.requiredMark}>*</span>
                    </span>
                  </label>
                  <select
                    id="workingHours"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="Morning">Morning Shift (6:00 AM – 2:00 PM)</option>
                    <option value="Afternoon">Afternoon Shift (12:00 PM – 8:00 PM)</option>
                    <option value="Evening">Evening Peak Shift (4:00 PM – 11:00 PM)</option>
                    <option value="Night">Late Night Shift (10:00 PM – 6:00 AM)</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="deliveryLocation">
                    <span>
                      Preferred Delivery Location / Hub<span className={styles.requiredMark}>*</span>
                    </span>
                  </label>
                  <input
                    id="deliveryLocation"
                    name="deliveryLocation"
                    type="text"
                    value={formData.deliveryLocation}
                    onChange={handleInputChange}
                    placeholder="e.g. Hitec City, Indiranagar, Bandra West"
                    className={`${styles.input} ${errors.deliveryLocation ? styles.inputError : ''}`}
                  />
                  {errors.deliveryLocation && (
                    <span className={styles.errorText}>{errors.deliveryLocation}</span>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="serviceArea">
                    <span>
                      Preferred Service Area Radius<span className={styles.requiredMark}>*</span>
                    </span>
                  </label>
                  <input
                    id="serviceArea"
                    name="serviceArea"
                    type="text"
                    value={formData.serviceArea}
                    onChange={handleInputChange}
                    placeholder="e.g. Within 5-8 KM radius"
                    className={`${styles.input} ${errors.serviceArea ? styles.inputError : ''}`}
                  />
                  {errors.serviceArea && (
                    <span className={styles.errorText}>{errors.serviceArea}</span>
                  )}
                </div>

                <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                  <label className={styles.label} htmlFor="employmentStatus">
                    <span>Current Employment Status</span>
                    <span className={styles.hint}>Optional</span>
                  </label>
                  <input
                    id="employmentStatus"
                    name="employmentStatus"
                    type="text"
                    value={formData.employmentStatus}
                    onChange={handleInputChange}
                    placeholder="e.g. Fresher, Gig Worker, Student, Part-time"
                    className={styles.input}
                  />
                </div>

                {/* Vehicle & Tools Checklist */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <span>Do you own a two-wheeler?</span>
                  </label>
                  <div className={styles.radioOptionsRow}>
                    <button
                      type="button"
                      className={`${styles.radioOption} ${formData.ownsTwoWheeler ? styles.radioOptionSelected : ''}`}
                      onClick={() => setFormData((p) => ({ ...p, ownsTwoWheeler: true }))}
                    >
                      Yes, I own
                    </button>
                    <button
                      type="button"
                      className={`${styles.radioOption} ${!formData.ownsTwoWheeler ? styles.radioOptionSelected : ''}`}
                      onClick={() => setFormData((p) => ({ ...p, ownsTwoWheeler: false }))}
                    >
                      No, need rental
                    </button>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <span>Do you have a valid driving licence?</span>
                  </label>
                  <div className={styles.radioOptionsRow}>
                    <button
                      type="button"
                      className={`${styles.radioOption} ${formData.hasDrivingLicense ? styles.radioOptionSelected : ''}`}
                      onClick={() => setFormData((p) => ({ ...p, hasDrivingLicense: true }))}
                    >
                      Yes, Valid
                    </button>
                    <button
                      type="button"
                      className={`${styles.radioOption} ${!formData.hasDrivingLicense ? styles.radioOptionSelected : ''}`}
                      onClick={() => setFormData((p) => ({ ...p, hasDrivingLicense: false }))}
                    >
                      No / Learning
                    </button>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <span>Vehicle Registration Certificate (RC)?</span>
                  </label>
                  <div className={styles.radioOptionsRow}>
                    <button
                      type="button"
                      className={`${styles.radioOption} ${formData.hasVehicleRegistration ? styles.radioOptionSelected : ''}`}
                      onClick={() => setFormData((p) => ({ ...p, hasVehicleRegistration: true }))}
                    >
                      Yes, Available
                    </button>
                    <button
                      type="button"
                      className={`${styles.radioOption} ${!formData.hasVehicleRegistration ? styles.radioOptionSelected : ''}`}
                      onClick={() => setFormData((p) => ({ ...p, hasVehicleRegistration: false }))}
                    >
                      Not available
                    </button>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <span>Do you have an Android/iOS smartphone?</span>
                  </label>
                  <div className={styles.radioOptionsRow}>
                    <button
                      type="button"
                      className={`${styles.radioOption} ${formData.hasSmartphone ? styles.radioOptionSelected : ''}`}
                      onClick={() => setFormData((p) => ({ ...p, hasSmartphone: true }))}
                    >
                      Yes, 4G/5G Phone
                    </button>
                    <button
                      type="button"
                      className={`${styles.radioOption} ${!formData.hasSmartphone ? styles.radioOptionSelected : ''}`}
                      onClick={() => setFormData((p) => ({ ...p, hasSmartphone: false }))}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                  <div className={styles.infoNote}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>
                      Applicants without a two-wheeler are not automatically rejected. DropyHub partners with EV fleet providers to offer affordable rental bikes in eligible delivery clusters.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 4: IDENTITY DOCUMENTS ================= */}
            {currentStep === 4 && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 6, fontWeight: 700 }}>
                    Mandatory Identity Verification Documents
                  </h3>
                  <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
                    Government-issued identity cards are required to verify your profile and activate your delivery payroll account.
                  </p>
                </div>

                {uploadError && (
                  <div className={styles.errorBanner}>
                    <span>{uploadError}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {/* Aadhaar Card Section */}
                  <div>
                    <div className={styles.fieldGroup} style={{ marginBottom: 14 }}>
                      <label className={styles.label} htmlFor="aadhaarNumber">
                        <span>
                          1. Aadhaar Number (12 Digits)<span className={styles.requiredMark}>*</span>
                        </span>
                        <span className={styles.hint}>Govt. ID Number</span>
                      </label>
                      <input
                        id="aadhaarNumber"
                        name="aadhaarNumber"
                        type="text"
                        maxLength={14}
                        value={formData.aadhaarNumber}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 12);
                          const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
                          setFormData((p) => ({ ...p, aadhaarNumber: formatted }));
                          if (errors.aadhaarNumber) {
                            setErrors((p) => {
                              const n = { ...p };
                              delete n.aadhaarNumber;
                              return n;
                            });
                          }
                        }}
                        placeholder="5432 1098 7654"
                        className={`${styles.input} ${errors.aadhaarNumber ? styles.inputError : ''}`}
                      />
                      {errors.aadhaarNumber && <span className={styles.errorText}>{errors.aadhaarNumber}</span>}
                    </div>

                    <label className={styles.label} style={{ marginBottom: 8 }}>
                      <span>
                        Upload Aadhaar Card (Front/Back or PDF)<span className={styles.requiredMark}>*</span>
                      </span>
                    </label>

                    <input
                      ref={aadhaarInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileUpload(e, 'aadhaar')}
                    />

                    {formData.aadhaarDocId ? (
                      <div className={styles.fileSuccessCard}>
                        <div className={styles.fileInfo}>
                          <svg className={styles.fileSuccessIcon} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <div>
                            <div className={styles.fileName}>{formData.aadhaarFileName}</div>
                            <div className={styles.fileSize}>
                              {(formData.aadhaarFileSize / 1024).toFixed(0)} KB &bull; Encrypted &amp; Stored
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.replaceFileBtn}
                          onClick={() => aadhaarInputRef.current?.click()}
                        >
                          Replace
                        </button>
                      </div>
                    ) : (
                      <div
                        className={styles.uploadZone}
                        onClick={() => aadhaarInputRef.current?.click()}
                      >
                        <div className={styles.uploadIcon}>
                          {uploadingDoc === 'aadhaar' ? (
                            <span>...</span>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                          )}
                        </div>
                        <div className={styles.uploadTitle}>
                          {uploadingDoc === 'aadhaar' ? 'Uploading & Encrypting...' : 'Upload Aadhaar Card'}
                        </div>
                        <div className={styles.uploadMeta}>PDF, JPG, PNG or WEBP (Max 5MB)</div>
                      </div>
                    )}

                    {errors.aadhaarDoc && <span className={styles.errorText} style={{ marginTop: 6 }}>{errors.aadhaarDoc}</span>}
                  </div>

                  {/* PAN Card Section */}
                  <div>
                    <div className={styles.fieldGroup} style={{ marginBottom: 14 }}>
                      <label className={styles.label} htmlFor="panNumber">
                        <span>
                          2. PAN Card Number (10 Chars)<span className={styles.requiredMark}>*</span>
                        </span>
                        <span className={styles.hint}>e.g. ABCDE1234F</span>
                      </label>
                      <input
                        id="panNumber"
                        name="panNumber"
                        type="text"
                        maxLength={10}
                        value={formData.panNumber}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
                          setFormData((p) => ({ ...p, panNumber: val }));
                          if (errors.panNumber) {
                            setErrors((p) => {
                              const n = { ...p };
                              delete n.panNumber;
                              return n;
                            });
                          }
                        }}
                        placeholder="ABCDE1234F"
                        className={`${styles.input} ${errors.panNumber ? styles.inputError : ''}`}
                      />
                      {errors.panNumber && <span className={styles.errorText}>{errors.panNumber}</span>}
                    </div>

                    <label className={styles.label} style={{ marginBottom: 8 }}>
                      <span>
                        Upload PAN Card (Image or PDF)<span className={styles.requiredMark}>*</span>
                      </span>
                    </label>

                    <input
                      ref={panInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileUpload(e, 'pan')}
                    />

                    {formData.panDocId ? (
                      <div className={styles.fileSuccessCard}>
                        <div className={styles.fileInfo}>
                          <svg className={styles.fileSuccessIcon} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <div>
                            <div className={styles.fileName}>{formData.panFileName}</div>
                            <div className={styles.fileSize}>
                              {(formData.panFileSize / 1024).toFixed(0)} KB &bull; Encrypted &amp; Stored
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.replaceFileBtn}
                          onClick={() => panInputRef.current?.click()}
                        >
                          Replace
                        </button>
                      </div>
                    ) : (
                      <div
                        className={styles.uploadZone}
                        onClick={() => panInputRef.current?.click()}
                      >
                        <div className={styles.uploadIcon}>
                          {uploadingDoc === 'pan' ? (
                            <span>...</span>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                          )}
                        </div>
                        <div className={styles.uploadTitle}>
                          {uploadingDoc === 'pan' ? 'Uploading & Encrypting...' : 'Upload PAN Card'}
                        </div>
                        <div className={styles.uploadMeta}>PDF, JPG, PNG or WEBP (Max 5MB)</div>
                      </div>
                    )}

                    {errors.panDoc && <span className={styles.errorText} style={{ marginTop: 6 }}>{errors.panDoc}</span>}
                  </div>
                </div>

                <div className={styles.securityConsentCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: 'var(--text-primary)', fontWeight: 700 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Statutory Data Privacy &amp; Masking Assurance</span>
                  </div>
                  <div>
                    In accordance with Indian Data Protection standards, your uploaded identity documents are stored in private isolated vaults outside the public web root. Access is restricted exclusively to authorized recruitment officers. Document numbers are masked in administrative listings and are never shared or used as authentication credentials.
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 5: MANDATORY KOTAK REQUIREMENT ================= */}
            {currentStep === 5 && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className={styles.kotakContainer}>
                  <div className={styles.kotakHeader}>
                    <div className={styles.kotakBrand}>
                      <span className={styles.kotakPill}>KOTAK 811</span>
                      <h3 className={styles.kotakTitle}>Mandatory Kotak 811 Banking</h3>
                    </div>
                    <span className={styles.mandatoryBadge}>Compulsory For Onboarding</span>
                  </div>

                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    To complete your delivery partner onboarding, you must have an active Kotak 811 zero-balance digital savings bank account. This account is required as part of our automated zero-fee payroll and daily payout settlement infrastructure.
                  </p>

                  <div className={styles.kotakInfoCard}>
                    <div className={styles.kotakRuleItem}>
                      <span className={styles.bulletAlert}>&bull;</span>
                      <span>
                        <strong>Kotak 811 Digital Account:</strong> You can open an instant digital Kotak 811 zero-balance account online in under 5 minutes with zero initial deposit directly via Video KYC.
                      </span>
                    </div>

                    <div className={styles.kotakRuleItem}>
                      <span className={styles.bulletAlert}>&bull;</span>
                      <span>
                        <strong>Mandatory Completion:</strong> Applicants must successfully complete the account-opening process. Failure to meet this requirement will result in your application being rejected, and onboarding will not proceed.
                      </span>
                    </div>

                    <div className={styles.kotakRuleItem}>
                      <span className={styles.bulletAlert}>&bull;</span>
                      <span>
                        <strong>Next Step Flow:</strong> Application submission alone does not guarantee onboarding. After clicking submit below, your application will be securely persisted and you will be directed to the official verified Kotak 811 portal.
                      </span>
                    </div>
                  </div>

                  {/* Compulsory Acknowledgement Checkbox */}
                  <label className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={formData.kotakAcknowledgement}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, kotakAcknowledgement: e.target.checked }));
                        if (errors.kotakAcknowledgement) {
                          setErrors((prev) => {
                            const c = { ...prev };
                            delete c.kotakAcknowledgement;
                            return c;
                          });
                        }
                      }}
                    />
                    <span className={styles.checkboxLabel}>
                      <strong>Mandatory Acknowledgement:</strong> I understand that creating a Kotak 811 digital bank account is compulsory for onboarding. I acknowledge that failure to complete this requirement will result in rejection of my application.
                    </span>
                  </label>
                  {errors.kotakAcknowledgement && (
                    <span className={styles.errorText} style={{ marginTop: -14 }}>
                      {errors.kotakAcknowledgement}
                    </span>
                  )}

                  {/* Privacy & Background Check Consent */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      cursor: 'pointer',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      padding: '4px 0',
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ marginTop: 2, accentColor: 'var(--brand-primary)' }}
                      checked={formData.privacyConsent}
                      onChange={(e) => setFormData((p) => ({ ...p, privacyConsent: e.target.checked }))}
                    />
                    <span>
                      I hereby declare that all details and documents provided are true and accurate. I authorize DropyHub Logistics to verify my identity and background for recruitment purposes.
                    </span>
                  </label>
                  {errors.privacyConsent && (
                    <span className={styles.errorText}>{errors.privacyConsent}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Wizard Footer Navigation */}
          <div className={styles.wizardFooter}>
            {currentStep > 1 ? (
              <button type="button" className={styles.backBtn} onClick={prevStep}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button type="button" className={styles.nextBtn} onClick={nextStep}>
                <span>Continue to {STEPS[currentStep].label}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !formData.kotakAcknowledgement}
                className={styles.submitBtn}
              >
                {isSubmitting ? (
                  <span>Submitting &amp; Generating Reference...</span>
                ) : (
                  <>
                    <span>Submit Application &amp; Proceed to Kotak 811</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
