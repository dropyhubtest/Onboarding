import { describe, it } from 'node:test';
import assert from 'node:assert';
import { NextRequest } from 'next/server.js';
import { POST as uploadHandler } from '../src/app/api/upload/route.ts';
import { POST as submitHandler } from '../src/app/api/applications/route.ts';
import { GET as statusHandler } from '../src/app/api/applications/status/route.ts';
import { GET as adminListHandler } from '../src/app/api/admin/applications/route.ts';
import { GET as adminDetailHandler } from '../src/app/api/admin/applications/[id]/route.ts';
import { PATCH as adminStatusHandler } from '../src/app/api/admin/applications/[id]/status/route.ts';
import { PATCH as adminKotakHandler } from '../src/app/api/admin/applications/[id]/kotak-status/route.ts';
import { POST as adminNotesHandler } from '../src/app/api/admin/applications/[id]/notes/route.ts';
import { GET as adminDocHandler } from '../src/app/api/admin/documents/[id]/route.ts';

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'dropyhub_admin_secure_key_2026';

describe('API Routes Integration Tests', () => {
  let createdAadhaarId = '';
  let createdPanId = '';
  let createdAppRef = '';
  let createdAppId = '';
  const testMobile = '9876543210';

  it('uploads an Aadhaar card document securely', async () => {
    const formData = new FormData();
    const fakeFile = new File(['Fake Aadhaar Card PDF Content For Test'], 'aadhaar_sample.pdf', {
      type: 'application/pdf',
    });
    formData.append('file', fakeFile);
    formData.append('documentType', 'aadhaar');

    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await uploadHandler(req);
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.ok(json.documentId);
    assert.strictEqual(json.documentType, 'aadhaar');
    createdAadhaarId = json.documentId;
  });

  it('uploads a PAN card document securely', async () => {
    const formData = new FormData();
    const fakeFile = new File(['Fake PAN Card Image Content For Test'], 'pan_sample.png', {
      type: 'image/png',
    });
    formData.append('file', fakeFile);
    formData.append('documentType', 'pan');

    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await uploadHandler(req);
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.ok(json.documentId);
    assert.strictEqual(json.documentType, 'pan');
    createdPanId = json.documentId;
  });

  it('submits a complete delivery partner application with Kotak acknowledgement', async () => {
    const payload = {
      personalInfo: {
        fullName: 'Vikram Singh',
        dateOfBirth: '1998-07-24',
        gender: 'Male',
        mobileNumber: testMobile,
        alternateMobileNumber: '9123456780',
        email: 'vikram.singh@example.com',
        address: 'House 12, Phase 3, Gachibowli',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500032',
      },
      deliveryPreference: {
        categories: ['food_quick_commerce', 'logistics_ecommerce'],
      },
      workPreferences: {
        workType: 'Full-time',
        workingHours: 'Morning',
        deliveryLocation: 'Gachibowli',
        serviceArea: 'West Zone',
        ownsTwoWheeler: true,
        hasDrivingLicense: true,
        hasVehicleRegistration: true,
        hasSmartphone: true,
      },
      documents: {
        aadhaarDocumentId: createdAadhaarId,
        panDocumentId: createdPanId,
      },
      kotakAcknowledgement: true,
      privacyConsent: true,
    };

    const req = new NextRequest('http://localhost:3000/api/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await submitHandler(req);
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.ok(json.applicationReference);
    assert.strictEqual(json.applicationStatus, 'Pending Review');
    assert.strictEqual(json.kotakStatus, 'Pending');
    assert.ok(json.kotakUrl);
    assert.ok(json.kotakUrl.includes(encodeURIComponent(json.applicationReference)));

    createdAppRef = json.applicationReference;
  });

  it('retrieves candidate application status by reference and mobile', async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/applications/status?reference=${createdAppRef}&mobile=${testMobile}`
    );

    const res = await statusHandler(req);
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.application.reference, createdAppRef);
    assert.strictEqual(json.application.fullName, 'Vikram Singh');
  });

  it('rejects unauthorized access to admin applications endpoint', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/applications');
    const res = await adminListHandler(req);
    assert.strictEqual(res.status, 401);
  });

  it('allows authorized admin access and returns application list', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/applications?search=Vikram', {
      headers: { 'x-admin-key': ADMIN_SECRET },
    });

    const res = await adminListHandler(req);
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.ok(json.applications.length >= 1);
    const app = json.applications.find((a) => a.application_reference === createdAppRef);
    assert.ok(app);
    createdAppId = app.id;
  });

  it('retrieves full application details in admin API', async () => {
    const req = new NextRequest(`http://localhost:3000/api/admin/applications/${createdAppId}`, {
      headers: { 'x-admin-key': ADMIN_SECRET },
    });

    const res = await adminDetailHandler(req, { params: Promise.resolve({ id: createdAppId }) });
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.application.full_name, 'Vikram Singh');
    assert.strictEqual(json.application.documents.length, 2);
  });

  it('updates application status to Under Review with audit logging', async () => {
    const req = new NextRequest(`http://localhost:3000/api/admin/applications/${createdAppId}/status`, {
      method: 'PATCH',
      headers: {
        'x-admin-key': ADMIN_SECRET,
        'x-admin-name': 'Operations Lead',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'Under Review',
        reason: 'Initial background review passed',
      }),
    });

    const res = await adminStatusHandler(req, { params: Promise.resolve({ id: createdAppId }) });
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.application.application_status, 'Under Review');
  });

  it('updates Kotak account status to Completed with audit logging', async () => {
    const req = new NextRequest(`http://localhost:3000/api/admin/applications/${createdAppId}/kotak-status`, {
      method: 'PATCH',
      headers: {
        'x-admin-key': ADMIN_SECRET,
        'x-admin-name': 'Banking Verification Officer',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'Completed',
        note: 'Confirmed Kotak 811 account opening via batch report.',
      }),
    });

    const res = await adminKotakHandler(req, { params: Promise.resolve({ id: createdAppId }) });
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.application.kotak_account_status, 'Completed');
  });

  it('adds internal administrative notes', async () => {
    const req = new NextRequest(`http://localhost:3000/api/admin/applications/${createdAppId}/notes`, {
      method: 'POST',
      headers: {
        'x-admin-key': ADMIN_SECRET,
        'x-admin-name': 'HR Manager',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        note: 'Onboarding slot booked for Tuesday 10:00 AM.',
      }),
    });

    const res = await adminNotesHandler(req, { params: Promise.resolve({ id: createdAppId }) });
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.ok(json.application.internal_notes.includes('Onboarding slot booked for Tuesday 10:00 AM.'));
  });

  it('rejects unauthorized access to stream sensitive identity documents', async () => {
    const req = new NextRequest(`http://localhost:3000/api/admin/documents/${createdAadhaarId}`);
    const res = await adminDocHandler(req, { params: Promise.resolve({ id: createdAadhaarId }) });
    assert.strictEqual(res.status, 401);
  });

  it('allows authorized admin to stream identity document', async () => {
    const req = new NextRequest(`http://localhost:3000/api/admin/documents/${createdAadhaarId}`, {
      headers: { 'x-admin-key': ADMIN_SECRET },
    });
    const res = await adminDocHandler(req, { params: Promise.resolve({ id: createdAadhaarId }) });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('Content-Type'), 'application/pdf');
    const arrayBuf = await res.arrayBuffer();
    assert.ok(arrayBuf.byteLength > 0);
  });
});
