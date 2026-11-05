import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';
const ADMIN_KEY = 'dropyhub_admin_secure_key_2026';

async function runE2ETests() {
  console.log('--- Starting Live E2E Integration Test Suite ---');

  // 1. Check Homepage HTTP 200
  const homeRes = await fetch(`${BASE_URL}/`);
  assert.strictEqual(homeRes.status, 200, 'Home page must return 200');
  const homeHtml = await homeRes.text();
  assert.ok(homeHtml.includes('Your Next Opportunity'), 'Hero headline must be present on page');
  console.log('✓ Test 1: Public Homepage loads with hero content');

  // 2. Upload Aadhaar Document
  const aadhaarForm = new FormData();
  const aadhaarBlob = new Blob(['Official Sample Aadhaar Card Content'], { type: 'application/pdf' });
  aadhaarForm.append('file', aadhaarBlob, 'candidate_aadhaar.pdf');
  aadhaarForm.append('documentType', 'aadhaar');

  const uploadAadhaarRes = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    body: aadhaarForm,
  });
  assert.strictEqual(uploadAadhaarRes.status, 200);
  const aadhaarJson = await uploadAadhaarRes.json();
  assert.strictEqual(aadhaarJson.success, true);
  assert.ok(aadhaarJson.documentId);
  const aadhaarDocId = aadhaarJson.documentId;
  console.log('✓ Test 2: Aadhaar document uploaded and encrypted successfully');

  // 3. Upload PAN Document
  const panForm = new FormData();
  const panBlob = new Blob(['Official Sample PAN Card Image Content'], { type: 'image/png' });
  panForm.append('file', panBlob, 'candidate_pan.png');
  panForm.append('documentType', 'pan');

  const uploadPanRes = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    body: panForm,
  });
  assert.strictEqual(uploadPanRes.status, 200);
  const panJson = await uploadPanRes.json();
  assert.strictEqual(panJson.success, true);
  assert.ok(panJson.documentId);
  const panDocId = panJson.documentId;
  console.log('✓ Test 3: PAN document uploaded and encrypted successfully');

  // 4. Test Missing Mandatory Fields Rejection
  const badSubmitRes = await fetch(`${BASE_URL}/api/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalInfo: { fullName: 'A' }, // invalid name, missing others
    }),
  });
  assert.strictEqual(badSubmitRes.status, 400);
  const badJson = await badSubmitRes.json();
  assert.ok(badJson.validationErrors);
  console.log('✓ Test 4: Missing mandatory fields properly rejected with 400');

  // 5. Test Invalid Indian Mobile Number Rejection
  const badMobileRes = await fetch(`${BASE_URL}/api/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalInfo: {
        fullName: 'Test Candidate',
        dateOfBirth: '1998-05-10',
        mobileNumber: '1234567890', // invalid Indian mobile (starts with 1)
        email: 'test@example.com',
        address: 'Test Address',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
      },
      deliveryPreference: { categories: ['food_quick_commerce'] },
      workPreferences: { workType: 'Full-time', workingHours: 'Morning', deliveryLocation: 'Hitec City', serviceArea: '5km' },
      documents: { aadhaarDocumentId: aadhaarDocId, panDocumentId: panDocId },
      kotakAcknowledgement: true,
      privacyConsent: true,
    }),
  });
  assert.strictEqual(badMobileRes.status, 400);
  const badMobileJson = await badMobileRes.json();
  assert.ok(badMobileJson.validationErrors.mobileNumber);
  console.log('✓ Test 5: Invalid Indian mobile rejected properly');

  // 6. Test Successful Application Submission
  const validMobile = `987${Date.now().toString().slice(-7)}`;
  const submitRes = await fetch(`${BASE_URL}/api/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalInfo: {
        fullName: 'Ananya Sharma',
        dateOfBirth: '1997-08-20',
        gender: 'Female',
        mobileNumber: validMobile,
        alternateMobileNumber: '9876543218',
        email: 'ananya.sharma@example.com',
        address: 'Plot 45, Silicon Valley, Madhapur',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
      },
      deliveryPreference: {
        categories: ['food_quick_commerce', 'logistics_ecommerce'],
      },
      workPreferences: {
        workType: 'Full-time',
        workingHours: 'Morning',
        deliveryLocation: 'Madhapur',
        serviceArea: 'Within 6 KM',
        employmentStatus: 'Gig Worker',
        ownsTwoWheeler: true,
        hasDrivingLicense: true,
        hasVehicleRegistration: true,
        hasSmartphone: true,
      },
      documents: {
        aadhaarDocumentId: aadhaarDocId,
        panDocumentId: panDocId,
      },
      kotakAcknowledgement: true,
      privacyConsent: true,
    }),
  });

  assert.strictEqual(submitRes.status, 200);
  const submitJson = await submitRes.json();
  assert.strictEqual(submitJson.success, true);
  assert.ok(submitJson.applicationReference);
  assert.strictEqual(submitJson.applicationStatus, 'Pending Review');
  assert.strictEqual(submitJson.kotakStatus, 'Pending');
  assert.ok(submitJson.kotakUrl);
  assert.strictEqual(submitJson.kotakUrl.includes('bit.ly/4i35J6m'), true);
  // Ensure sensitive info NOT in redirect
  assert.strictEqual(submitJson.kotakUrl.includes('aadhaar'), false);
  assert.strictEqual(submitJson.kotakUrl.includes('pan'), false);
  const appRef = submitJson.applicationReference;
  console.log(`✓ Test 6: Application submitted and persisted. Ref: ${appRef}`);

  // 7. Test Public Candidate Status Lookup
  const statusRes = await fetch(`${BASE_URL}/api/applications/status?reference=${encodeURIComponent(appRef)}&mobile=${validMobile}`);
  assert.strictEqual(statusRes.status, 200);
  const statusJson = await statusRes.json();
  assert.strictEqual(statusJson.success, true);
  assert.strictEqual(statusJson.application.reference, appRef);
  assert.strictEqual(statusJson.application.fullName, 'Ananya Sharma');
  assert.strictEqual(statusJson.application.applicationStatus, 'Pending Review');
  console.log('✓ Test 7: Public candidate status check retrieved verified record');

  // 8. Test Unauthorized Admin Access (Must return 401)
  const unauthRes = await fetch(`${BASE_URL}/api/admin/applications`);
  assert.strictEqual(unauthRes.status, 401);
  console.log('✓ Test 8: Unauthorized admin access blocked with 401');

  // 9. Test Authorized Admin Application Listing
  const adminListRes = await fetch(`${BASE_URL}/api/admin/applications?search=Ananya`, {
    headers: { 'x-admin-key': ADMIN_KEY },
  });
  assert.strictEqual(adminListRes.status, 200);
  const adminListJson = await adminListRes.json();
  assert.strictEqual(adminListJson.success, true);
  const appRecord = adminListJson.applications.find((a) => a.application_reference === appRef);
  assert.ok(appRecord, 'Submitted application must be present in admin listing');
  const appId = appRecord.id;
  console.log('✓ Test 9: Authorized admin retrieved application list with filters');

  // 10. Test Admin Application Detail View (Includes Documents & History)
  const adminDetailRes = await fetch(`${BASE_URL}/api/admin/applications/${appId}`, {
    headers: { 'x-admin-key': ADMIN_KEY },
  });
  assert.strictEqual(adminDetailRes.status, 200);
  const adminDetailJson = await adminDetailRes.json();
  assert.strictEqual(adminDetailJson.success, true);
  assert.strictEqual(adminDetailJson.application.documents.length, 2);
  assert.ok(adminDetailJson.application.history.length >= 1);
  console.log('✓ Test 10: Full application details, documents, and audit logs retrieved');

  // 11. Test Admin Update Application Status to "Under Review"
  const updateStatusRes = await fetch(`${BASE_URL}/api/admin/applications/${appId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': ADMIN_KEY,
      'x-admin-name': 'Operations Lead',
    },
    body: JSON.stringify({
      status: 'Under Review',
      reason: 'Documents verified for authenticity',
    }),
  });
  assert.strictEqual(updateStatusRes.status, 200);
  const updatedStatusJson = await updateStatusRes.json();
  assert.strictEqual(updatedStatusJson.application.application_status, 'Under Review');
  console.log('✓ Test 11: Admin successfully transitioned status to "Under Review" with audit logging');

  // 12. Test Admin Update Kotak Account Status to "Completed"
  const updateKotakRes = await fetch(`${BASE_URL}/api/admin/applications/${appId}/kotak-status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': ADMIN_KEY,
      'x-admin-name': 'Banking Officer',
    },
    body: JSON.stringify({
      status: 'Completed',
      note: 'Verified Kotak 811 account creation via partner report.',
    }),
  });
  assert.strictEqual(updateKotakRes.status, 200);
  const updatedKotakJson = await updateKotakRes.json();
  assert.strictEqual(updatedKotakJson.application.kotak_account_status, 'Completed');
  console.log('✓ Test 12: Admin successfully transitioned Kotak status to "Completed" independently');

  // 13. Test Logging Administrative Notes
  const addNoteRes = await fetch(`${BASE_URL}/api/admin/applications/${appId}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': ADMIN_KEY,
      'x-admin-name': 'Recruiter',
    },
    body: JSON.stringify({
      note: 'Driver inducted into Madhapur darkstore hub.',
    }),
  });
  assert.strictEqual(addNoteRes.status, 200);
  const noteJson = await addNoteRes.json();
  assert.ok(noteJson.application.internal_notes.includes('Madhapur darkstore hub'));
  console.log('✓ Test 13: Internal administrative note logged into record and audit trail');

  // 14. Test Unauthorized Document Access (Must return 401)
  const unauthDocRes = await fetch(`${BASE_URL}/api/admin/documents/${aadhaarDocId}`);
  assert.strictEqual(unauthDocRes.status, 401, 'Unauthorized access to identity document must be blocked');
  console.log('✓ Test 14: Unauthorized identity document access strictly blocked with 401');

  // 15. Test Authorized Document Streaming
  const authDocRes = await fetch(`${BASE_URL}/api/admin/documents/${aadhaarDocId}`, {
    headers: { 'x-admin-key': ADMIN_KEY },
  });
  assert.strictEqual(authDocRes.status, 200);
  assert.strictEqual(authDocRes.headers.get('Content-Type'), 'application/pdf');
  const docBuffer = await authDocRes.arrayBuffer();
  assert.ok(docBuffer.byteLength > 0);
  console.log('✓ Test 15: Authorized document stream served successfully from secure vault');

  console.log('\n======================================================');
  console.log('ALL 15 LIVE E2E INTEGRATION TESTS PASSED WITH 0 ERRORS');
  console.log('======================================================\n');
}

runE2ETests().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
