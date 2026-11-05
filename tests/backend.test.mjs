import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  isValidIndianMobile,
  cleanIndianMobile,
  isValidEmail,
  isValidPincode,
  isValidAge,
  validateApplicationSubmission,
} from '../src/lib/validation.ts';
import {
  saveApplicationRecord,
  getApplicationDetailById,
  updateApplicationStatus,
  updateKotakAccountStatus,
  addAdminNote,
  listApplications,
  checkDuplicateSubmission,
} from '../src/lib/db.ts';
import { getKotakAccountOpeningUrl } from '../src/lib/kotak.ts';
import { validateDocumentFile } from '../src/lib/storage.ts';

describe('Validation Tests', () => {
  it('validates Indian mobile numbers correctly', () => {
    assert.strictEqual(isValidIndianMobile('9876543210'), true);
    assert.strictEqual(isValidIndianMobile('+91 9876543210'), true);
    assert.strictEqual(isValidIndianMobile('09876543210'), true);
    assert.strictEqual(isValidIndianMobile('8123456789'), true);
    assert.strictEqual(isValidIndianMobile('7000000000'), true);
    assert.strictEqual(isValidIndianMobile('6300000000'), true);

    // Invalid numbers
    assert.strictEqual(isValidIndianMobile('1234567890'), false);
    assert.strictEqual(isValidIndianMobile('5234567890'), false);
    assert.strictEqual(isValidIndianMobile('98765'), false);
    assert.strictEqual(isValidIndianMobile('abcdefghij'), false);
  });

  it('cleans Indian mobile numbers to 10 digits', () => {
    assert.strictEqual(cleanIndianMobile('+91 98765 43210'), '9876543210');
    assert.strictEqual(cleanIndianMobile('09876543210'), '9876543210');
  });

  it('validates emails properly', () => {
    assert.strictEqual(isValidEmail('rider@dropyhub.com'), true);
    assert.strictEqual(isValidEmail('test.candidate+delivery@gmail.com'), true);
    assert.strictEqual(isValidEmail('invalid-email'), false);
    assert.strictEqual(isValidEmail('@dropyhub.com'), false);
  });

  it('validates PIN codes properly', () => {
    assert.strictEqual(isValidPincode('500081'), true);
    assert.strictEqual(isValidPincode('110001'), true);
    assert.strictEqual(isValidPincode('012345'), false);
    assert.strictEqual(isValidPincode('50008'), false);
    assert.strictEqual(isValidPincode('5000811'), false);
  });

  it('validates candidate age (at least 18 years)', () => {
    assert.strictEqual(isValidAge('2000-01-01'), true);
    assert.strictEqual(isValidAge('2005-01-01'), true);
    // Someone born yesterday
    const today = new Date().toISOString().slice(0, 10);
    assert.strictEqual(isValidAge(today), false);
    assert.strictEqual(isValidAge('2020-01-01'), false);
  });

  it('rejects incomplete application submission payload', () => {
    const res = validateApplicationSubmission({});
    assert.strictEqual(res.isValid, false);
    assert.ok(res.errors.personalInfo || res.errors.fullName);
  });

  it('validates document files properly', () => {
    const validPdf = validateDocumentFile({ name: 'aadhaar.pdf', size: 1024 * 500, type: 'application/pdf' });
    assert.strictEqual(validPdf.isValid, true);

    const validJpg = validateDocumentFile({ name: 'pan.jpg', size: 1024 * 1024, type: 'image/jpeg' });
    assert.strictEqual(validJpg.isValid, true);

    const oversized = validateDocumentFile({ name: 'aadhaar.pdf', size: 6 * 1024 * 1024, type: 'application/pdf' });
    assert.strictEqual(oversized.isValid, false);

    const disallowedType = validateDocumentFile({ name: 'script.exe', size: 1024, type: 'application/x-msdownload' });
    assert.strictEqual(disallowedType.isValid, false);
  });
});

describe('Kotak URL Safety Tests', () => {
  it('generates Kotak URL without leaking Aadhaar or PAN in query parameters', () => {
    const ref = 'DH-DP-20261105-TEST';
    const url = getKotakAccountOpeningUrl(ref);
    assert.ok(url);
    assert.strictEqual(url.includes('bit.ly/4i35J6m'), true);
    assert.strictEqual(url.includes('aadhaar'), false);
    assert.strictEqual(url.includes('pan'), false);
  });
});

describe('Database Persistence & Lifecycle Tests', () => {
  it('creates an application, updates status, and logs audit history', () => {
    const testMobile = '9988776655';
    const app = saveApplicationRecord(
      {
        full_name: 'Rajesh Kumar',
        date_of_birth: '1996-05-15',
        gender: 'Male',
        mobile_number: testMobile,
        alternate_mobile_number: '9988776656',
        email: 'rajesh.kumar@example.com',
        address: 'Flat 402, Green Meadows',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        delivery_categories: ['food_quick_commerce', 'logistics_ecommerce'],
        work_type: 'Full-time',
        preferred_working_hours: 'Morning',
        preferred_delivery_location: 'Hitec City',
        preferred_service_area: 'Madhapur & Kondapur',
        employment_status: 'Self-employed',
        owns_two_wheeler: true,
        has_driving_license: true,
        has_vehicle_registration: true,
        has_smartphone: true,
        kotak_account_status: 'Pending',
        application_status: 'Pending Review',
        privacy_consent: true,
        kotak_acknowledgement: true,
        document_processing_status: 'Uploaded',
        internal_notes: '',
        rejection_reason: '',
      },
      'doc_aadhaar_test_1',
      'doc_pan_test_1'
    );

    assert.ok(app.id);
    assert.ok(app.application_reference.startsWith('DH-DP-'));
    assert.strictEqual(app.application_status, 'Pending Review');
    assert.strictEqual(app.kotak_account_status, 'Pending');

    // Check duplicate detection
    const dup = checkDuplicateSubmission(testMobile);
    assert.ok(dup);
    assert.strictEqual(dup.mobile_number, testMobile);

    // Retrieve details
    const detail = getApplicationDetailById(app.id);
    assert.ok(detail);
    assert.strictEqual(detail.full_name, 'Rajesh Kumar');
    assert.ok(detail.history.length >= 1);

    // Update status to Under Review
    const updated = updateApplicationStatus(app.id, 'Under Review', 'Admin User', 'Documents in order');
    assert.strictEqual(updated.application_status, 'Under Review');

    // Update Kotak status
    const kotakUpdated = updateKotakAccountStatus(app.id, 'Completed', 'Admin User', 'Kotak 811 account verified via portal');
    assert.strictEqual(kotakUpdated.kotak_account_status, 'Completed');

    // Add administrative note
    const noted = addAdminNote(app.id, 'Candidate verified driving license physically.', 'Admin User');
    assert.ok(noted.internal_notes.includes('Candidate verified driving license physically.'));

    // Check history audit entries
    const historyDetail = getApplicationDetailById(app.id);
    assert.ok(historyDetail.history.length >= 4);

    // List and filter
    const listRes = listApplications({ search: 'Rajesh', status: 'Under Review' });
    assert.ok(listRes.total >= 1);
    assert.ok(listRes.applications.some((a) => a.id === app.id));
  });
});
