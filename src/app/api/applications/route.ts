import { NextRequest, NextResponse } from 'next/server';
import { validateApplicationSubmission, sanitizeInput, cleanIndianMobile } from '@/lib/validation';
import { saveApplicationRecord, checkDuplicateSubmission } from '@/lib/db';
import { getKotakAccountOpeningUrl } from '@/lib/kotak';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Strict validation
    const validation = validateApplicationSubmission(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Application validation failed. Please check the marked fields.',
          validationErrors: validation.errors,
        },
        { status: 400 }
      );
    }

    const { personalInfo, deliveryPreference, workPreferences, documents, kotakAcknowledgement, privacyConsent } = body;
    const cleanedMobile = cleanIndianMobile(personalInfo.mobileNumber);

    // 2. Prevent rapid duplicate submission
    const existing = checkDuplicateSubmission(cleanedMobile);
    if (existing) {
      const submittedTime = new Date(existing.submitted_at).getTime();
      const hoursSince = (Date.now() - submittedTime) / (1000 * 60 * 60);

      // If submitted within last 12 hours with pending status, return existing reference
      if (hoursSince < 12 && ['Pending Review', 'Under Review'].includes(existing.application_status)) {
        const kotakUrl = getKotakAccountOpeningUrl(existing.application_reference);
        return NextResponse.json({
          success: true,
          isDuplicate: true,
          message: 'An application with this mobile number was recently submitted and is currently being processed.',
          applicationReference: existing.application_reference,
          kotakUrl,
          submittedAt: existing.submitted_at,
          applicationStatus: existing.application_status,
          kotakStatus: existing.kotak_account_status,
        });
      }
    }

    // 3. Persist application
    const appRecord = saveApplicationRecord(
      {
        full_name: sanitizeInput(personalInfo.fullName),
        date_of_birth: sanitizeInput(personalInfo.dateOfBirth),
        gender: sanitizeInput(personalInfo.gender || ''),
        mobile_number: cleanedMobile,
        alternate_mobile_number: personalInfo.alternateMobileNumber
          ? cleanIndianMobile(personalInfo.alternateMobileNumber)
          : '',
        email: sanitizeInput(personalInfo.email).toLowerCase(),
        address: sanitizeInput(personalInfo.address),
        city: sanitizeInput(personalInfo.city),
        state: sanitizeInput(personalInfo.state),
        pincode: sanitizeInput(personalInfo.pincode),
        aadhaar_number: sanitizeInput(documents?.aadhaarNumber || ''),
        pan_number: sanitizeInput(documents?.panNumber || '').toUpperCase(),
        delivery_categories: deliveryPreference.categories,
        work_type: workPreferences.workType,
        preferred_working_hours: workPreferences.workingHours,
        preferred_delivery_location: sanitizeInput(workPreferences.deliveryLocation),
        preferred_service_area: sanitizeInput(workPreferences.serviceArea),
        employment_status: sanitizeInput(workPreferences.employmentStatus || ''),
        owns_two_wheeler: Boolean(workPreferences.ownsTwoWheeler),
        has_driving_license: Boolean(workPreferences.hasDrivingLicense),
        has_vehicle_registration: Boolean(workPreferences.hasVehicleRegistration),
        has_smartphone: Boolean(workPreferences.hasSmartphone),
        kotak_account_status: 'Pending',
        application_status: 'Pending Review',
        privacy_consent: Boolean(privacyConsent),
        kotak_acknowledgement: Boolean(kotakAcknowledgement),
        document_processing_status: 'Uploaded',
        internal_notes: '',
        rejection_reason: '',
      },
      documents.aadhaarDocumentId,
      documents.panDocumentId
    );

    // 4. Generate safe Kotak redirect URL
    const kotakUrl = getKotakAccountOpeningUrl(appRecord.application_reference);

    return NextResponse.json({
      success: true,
      applicationReference: appRecord.application_reference,
      submittedAt: appRecord.submitted_at,
      applicationStatus: appRecord.application_status,
      kotakStatus: appRecord.kotak_account_status,
      kotakUrl,
    });
  } catch (error: any) {
    console.error('Application submission error:', error?.message || error);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred while saving your application. Please try again.' },
      { status: 500 }
    );
  }
}
