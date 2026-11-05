import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import type {
  DeliveryPartnerApplication,
  ApplicationDocument,
  StatusHistoryEntry,
  AdminApplicationDetail,
  ApplicationStatus,
  KotakAccountStatus,
} from '@/types';
import {
  syncApplicationToNeon,
  syncDocumentToNeon,
  getDocumentByIdFromNeon,
  listApplicationsFromNeon,
  getApplicationDetailFromNeon,
  updateApplicationStatusInNeon,
  updateKotakStatusInNeon,
  deleteApplicationInNeon,
} from './neon';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(DB_DIR, 'onboarding.db');

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync | null {
  if (!dbInstance) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      dbInstance = new DatabaseSync(DB_PATH);
      initializeSchema(dbInstance);
    } catch (err) {
      // Graceful fallback to Neon in serverless / read-only disk
      return null;
    }
  }
  return dbInstance;
}

function initializeSchema(db: DatabaseSync) {
  // Execute PRAGMAs for performance and integrity
  db.exec('PRAGMA foreign_keys = ON;');

  // Table: delivery_partner_applications
  db.exec(`
    CREATE TABLE IF NOT EXISTS delivery_partner_applications (
      id TEXT PRIMARY KEY,
      application_reference TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      gender TEXT DEFAULT '',
      mobile_number TEXT NOT NULL,
      alternate_mobile_number TEXT DEFAULT '',
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      aadhaar_number TEXT DEFAULT '',
      pan_number TEXT DEFAULT '',
      delivery_categories TEXT NOT NULL,
      work_type TEXT NOT NULL,
      preferred_working_hours TEXT NOT NULL,
      preferred_delivery_location TEXT NOT NULL,
      preferred_service_area TEXT NOT NULL,
      employment_status TEXT DEFAULT '',
      owns_two_wheeler INTEGER NOT NULL DEFAULT 0,
      has_driving_license INTEGER NOT NULL DEFAULT 0,
      has_vehicle_registration INTEGER NOT NULL DEFAULT 0,
      has_smartphone INTEGER NOT NULL DEFAULT 1,
      kotak_account_status TEXT NOT NULL DEFAULT 'Pending',
      application_status TEXT NOT NULL DEFAULT 'Pending Review',
      privacy_consent INTEGER NOT NULL DEFAULT 1,
      kotak_acknowledgement INTEGER NOT NULL DEFAULT 1,
      document_processing_status TEXT NOT NULL DEFAULT 'Uploaded',
      internal_notes TEXT DEFAULT '',
      rejection_reason TEXT DEFAULT '',
      submitted_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  try {
    db.exec(`ALTER TABLE delivery_partner_applications ADD COLUMN aadhaar_number TEXT DEFAULT '';`);
  } catch (e) {
    // Column already exists
  }
  try {
    db.exec(`ALTER TABLE delivery_partner_applications ADD COLUMN pan_number TEXT DEFAULT '';`);
  } catch (e) {
    // Column already exists
  }

  // Table: delivery_partner_documents
  db.exec(`
    CREATE TABLE IF NOT EXISTS delivery_partner_documents (
      id TEXT PRIMARY KEY,
      application_id TEXT,
      document_type TEXT NOT NULL,
      original_file_name TEXT NOT NULL,
      stored_file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      verification_status TEXT NOT NULL DEFAULT 'Unverified',
      uploaded_at TEXT NOT NULL,
      FOREIGN KEY (application_id) REFERENCES delivery_partner_applications(id) ON DELETE CASCADE
    );
  `);

  // Table: delivery_partner_status_history
  db.exec(`
    CREATE TABLE IF NOT EXISTS delivery_partner_status_history (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      change_type TEXT NOT NULL,
      previous_status TEXT DEFAULT '',
      new_status TEXT DEFAULT '',
      changed_by TEXT NOT NULL,
      reason_or_note TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY (application_id) REFERENCES delivery_partner_applications(id) ON DELETE CASCADE
    );
  `);

  // Create Indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_apps_ref ON delivery_partner_applications(application_reference);
    CREATE INDEX IF NOT EXISTS idx_apps_mobile ON delivery_partner_applications(mobile_number);
    CREATE INDEX IF NOT EXISTS idx_apps_status ON delivery_partner_applications(application_status);
    CREATE INDEX IF NOT EXISTS idx_apps_kotak ON delivery_partner_applications(kotak_account_status);
    CREATE INDEX IF NOT EXISTS idx_apps_city ON delivery_partner_applications(city);
    CREATE INDEX IF NOT EXISTS idx_apps_submitted ON delivery_partner_applications(submitted_at DESC);
    CREATE INDEX IF NOT EXISTS idx_docs_app ON delivery_partner_documents(application_id);
    CREATE INDEX IF NOT EXISTS idx_history_app ON delivery_partner_status_history(application_id);
  `);
}

// Generate human-friendly reference ID: DH-DP-YYYYMMDD-XXXX
export function generateApplicationReference(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DH-DP-${dateStr}-${randomChars}`;
}

export function saveApplicationRecord(
  app: Omit<DeliveryPartnerApplication, 'id' | 'application_reference' | 'submitted_at' | 'updated_at'>,
  aadhaarDocId: string,
  panDocId: string
): DeliveryPartnerApplication {
  const db = getDb();
  const id = `app_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const reference = generateApplicationReference();
  const now = new Date().toISOString();

  if (db) {
    try {
      // Insert application
      const stmt = db.prepare(`
        INSERT INTO delivery_partner_applications (
          id, application_reference, full_name, date_of_birth, gender,
          mobile_number, alternate_mobile_number, email, address, city,
          state, pincode, aadhaar_number, pan_number, delivery_categories, work_type, preferred_working_hours,
          preferred_delivery_location, preferred_service_area, employment_status,
          owns_two_wheeler, has_driving_license, has_vehicle_registration, has_smartphone,
          kotak_account_status, application_status, privacy_consent, kotak_acknowledgement,
          document_processing_status, internal_notes, rejection_reason, submitted_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?
        )
      `);

      stmt.run(
        id,
        reference,
        app.full_name,
        app.date_of_birth,
        app.gender || '',
        app.mobile_number,
        app.alternate_mobile_number || '',
        app.email,
        app.address,
        app.city,
        app.state,
        app.pincode,
        app.aadhaar_number || '',
        app.pan_number || '',
        JSON.stringify(app.delivery_categories),
        app.work_type,
        app.preferred_working_hours,
        app.preferred_delivery_location,
        app.preferred_service_area,
        app.employment_status || '',
        app.owns_two_wheeler ? 1 : 0,
        app.has_driving_license ? 1 : 0,
        app.has_vehicle_registration ? 1 : 0,
        app.has_smartphone ? 1 : 0,
        app.kotak_account_status || 'Pending',
        app.application_status || 'Pending Review',
        app.privacy_consent ? 1 : 0,
        app.kotak_acknowledgement ? 1 : 0,
        app.document_processing_status || 'Uploaded',
        app.internal_notes || '',
        app.rejection_reason || '',
        now,
        now
      );

      // Link uploaded documents
      const linkDocStmt = db.prepare(`
        UPDATE delivery_partner_documents
        SET application_id = ?
        WHERE id = ?
      `);

      if (aadhaarDocId) linkDocStmt.run(id, aadhaarDocId);
      if (panDocId) linkDocStmt.run(id, panDocId);

      // Add initial history entry
      const historyStmt = db.prepare(`
        INSERT INTO delivery_partner_status_history (
          id, application_id, change_type, previous_status, new_status, changed_by, reason_or_note, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      historyStmt.run(
        `hist_${Date.now()}_1`,
        id,
        'APPLICATION_STATUS',
        '',
        'Pending Review',
        'System (Application Submission)',
        'Application submitted by candidate with mandatory documents and Kotak acknowledgement.',
        now
      );
    } catch (sqliteErr) {
      console.warn('Local SQLite write error (persisting to Neon):', sqliteErr);
    }
  }

  const createdApp: DeliveryPartnerApplication = {
    ...app,
    id,
    application_reference: reference,
    submitted_at: now,
    updated_at: now,
  };

  syncApplicationToNeon(createdApp, aadhaarDocId, panDocId).catch((err) => {
    console.warn('Neon syncApplication notice:', err);
  });

  return createdApp;
}

// Check for recent duplicate submission by mobile within last 24h
export function checkDuplicateSubmission(mobileNumber: string): DeliveryPartnerApplication | null {
  const db = getDb();
  if (!db) return null;
  try {
    const row = db
      .prepare('SELECT * FROM delivery_partner_applications WHERE mobile_number = ? ORDER BY submitted_at DESC LIMIT 1')
      .get(mobileNumber) as any;

    if (!row) return null;
    return formatApplicationRow(row);
  } catch (e) {
    return null;
  }
}

// Retrieve single application by ID
export function getApplicationDetailById(id: string): AdminApplicationDetail | null {
  const db = getDb();
  if (!db) return null;
  const row = db.prepare('SELECT * FROM delivery_partner_applications WHERE id = ?').get(id) as any;
  if (!row) return null;

  const app = formatApplicationRow(row);
  const docs = db
    .prepare('SELECT * FROM delivery_partner_documents WHERE application_id = ?')
    .all(id) as any[];

  const history = db
    .prepare('SELECT * FROM delivery_partner_status_history WHERE application_id = ? ORDER BY created_at DESC')
    .all(id) as any[];

  return {
    ...app,
    documents: docs.map(formatDocumentRow),
    history: history.map(formatHistoryRow),
  };
}

// Retrieve status for candidate lookup (by Reference ID + Mobile Number)
export function getApplicationForCandidate(reference: string, mobile: string): {
  reference: string;
  fullName: string;
  applicationStatus: ApplicationStatus;
  kotakStatus: KotakAccountStatus;
  submittedAt: string;
  updatedAt: string;
} | null {
  const db = getDb();
  if (!db) return null;
  const row = db
    .prepare(
      'SELECT application_reference, full_name, application_status, kotak_account_status, submitted_at, updated_at FROM delivery_partner_applications WHERE application_reference = ? AND mobile_number = ?'
    )
    .get(reference.trim(), mobile.trim()) as any;

  if (!row) return null;

  return {
    reference: row.application_reference,
    fullName: row.full_name,
    applicationStatus: row.application_status,
    kotakStatus: row.kotak_account_status,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
  };
}

// List applications with filtering, search, and pagination
export interface ApplicationFilterParams {
  search?: string;
  status?: string;
  category?: string;
  city?: string;
  kotakStatus?: string;
  sortBy?: 'submitted_at' | 'full_name' | 'city';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export function listApplications(params: ApplicationFilterParams) {
  const {
    search,
    status,
    category,
    city,
    kotakStatus,
    sortBy = 'submitted_at',
    sortOrder = 'DESC',
    page = 1,
    limit = 10,
  } = params;

  const db = getDb();
  if (!db) {
    return {
      applications: [],
      total: 0,
      page,
      limit,
      totalPages: 1,
    };
  }

  const whereClauses: string[] = [];
  const args: any[] = [];

  if (search) {
    whereClauses.push('(full_name LIKE ? OR mobile_number LIKE ? OR application_reference LIKE ? OR email LIKE ?)');
    const searchTerm = `%${search.trim()}%`;
    args.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (status && status !== 'ALL') {
    whereClauses.push('application_status = ?');
    args.push(status);
  }

  if (kotakStatus && kotakStatus !== 'ALL') {
    whereClauses.push('kotak_account_status = ?');
    args.push(kotakStatus);
  }

  if (city && city !== 'ALL') {
    whereClauses.push('city LIKE ?');
    args.push(`%${city.trim()}%`);
  }

  if (category && category !== 'ALL') {
    whereClauses.push('delivery_categories LIKE ?');
    args.push(`%${category}%`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Get total count
  const countRow = db.prepare(`SELECT COUNT(*) as total FROM delivery_partner_applications ${whereSql}`).get(...args) as any;
  const total = countRow ? countRow.total : 0;

  // Safe sort column
  const allowedSortCols = ['submitted_at', 'full_name', 'city'];
  const safeSortCol = allowedSortCols.includes(sortBy) ? sortBy : 'submitted_at';
  const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  const offset = (Math.max(1, page) - 1) * limit;

  const querySql = `
    SELECT * FROM delivery_partner_applications
    ${whereSql}
    ORDER BY ${safeSortCol} ${safeSortOrder}
    LIMIT ? OFFSET ?
  `;

  const rows = db.prepare(querySql).all(...args, limit, offset) as any[];

  return {
    applications: rows.map(formatApplicationRow),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function listApplicationsAsync(params: ApplicationFilterParams) {
  if (process.env.DATABASE_URL) {
    try {
      const neonRes = await listApplicationsFromNeon(params);
      return neonRes;
    } catch (neonErr: any) {
      console.warn('Neon listApplications notice, attempting SQLite fallback:', neonErr?.message || neonErr);
    }
  }

  const db = getDb();
  if (db) {
    try {
      return listApplications(params);
    } catch (e) {
      console.warn('SQLite listApplications error:', e);
    }
  }

  return { applications: [], total: 0, page: 1, limit: params.limit || 15, totalPages: 1 };
}

export async function getApplicationDetailByIdAsync(id: string): Promise<AdminApplicationDetail | null> {
  if (process.env.DATABASE_URL) {
    try {
      const detail = await getApplicationDetailFromNeon(id);
      if (detail) return detail;
    } catch (neonErr: any) {
      console.warn('Neon getApplicationDetail notice:', neonErr?.message || neonErr);
    }
  }

  const db = getDb();
  if (db) {
    try {
      return getApplicationDetailById(id);
    } catch (e) {}
  }
  return null;
}

export async function updateApplicationStatusAsync(
  id: string,
  newStatus: ApplicationStatus,
  adminName: string,
  reasonOrNote?: string
): Promise<AdminApplicationDetail | null> {
  if (process.env.DATABASE_URL) {
    try {
      const updated = await updateApplicationStatusInNeon(id, newStatus, adminName, reasonOrNote);
      if (updated) return updated;
    } catch (e) {
      console.warn('Neon updateApplicationStatus notice:', e);
    }
  }

  const db = getDb();
  if (db) {
    try {
      return updateApplicationStatus(id, newStatus, adminName, reasonOrNote);
    } catch (e) {}
  }
  return null;
}

export async function updateKotakAccountStatusAsync(
  id: string,
  newStatus: KotakAccountStatus,
  adminName: string
): Promise<AdminApplicationDetail | null> {
  if (process.env.DATABASE_URL) {
    try {
      const updated = await updateKotakStatusInNeon(id, newStatus, adminName);
      if (updated) return updated;
    } catch (e) {
      console.warn('Neon updateKotakStatus notice:', e);
    }
  }

  const db = getDb();
  if (db) {
    try {
      return updateKotakAccountStatus(id, newStatus, adminName);
    } catch (e) {}
  }
  return null;
}

export function deleteApplication(id: string): boolean {
  const db = getDb();
  if (db) {
    try {
      db.prepare('DELETE FROM delivery_partner_status_history WHERE application_id = ?').run(id);
      db.prepare('DELETE FROM delivery_partner_documents WHERE application_id = ?').run(id);
      db.prepare('DELETE FROM delivery_partner_applications WHERE id = ?').run(id);
      return true;
    } catch (e) {
      console.warn('SQLite deleteApplication notice:', e);
    }
  }
  return false;
}

export async function deleteApplicationAsync(id: string): Promise<boolean> {
  let neonSuccess = false;
  if (process.env.DATABASE_URL) {
    try {
      neonSuccess = await deleteApplicationInNeon(id);
    } catch (e) {
      console.warn('Neon deleteApplication notice:', e);
    }
  }

  const sqliteSuccess = deleteApplication(id);
  return neonSuccess || sqliteSuccess;
}

// Update Application Status (e.g. Under Review, Approved, Rejected)
export function updateApplicationStatus(
  id: string,
  newStatus: ApplicationStatus,
  adminName: string,
  reasonOrNote?: string
) {
  const db = getDb();
  if (!db) throw new Error('Database unavailable');
  const current = db.prepare('SELECT application_status FROM delivery_partner_applications WHERE id = ?').get(id) as any;
  if (!current) throw new Error('Application not found');

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE delivery_partner_applications
    SET application_status = ?, rejection_reason = ?, updated_at = ?
    WHERE id = ?
  `).run(
    newStatus,
    newStatus === 'Rejected' ? (reasonOrNote || '') : '',
    now,
    id
  );

  // Add to status audit log
  db.prepare(`
    INSERT INTO delivery_partner_status_history (
      id, application_id, change_type, previous_status, new_status, changed_by, reason_or_note, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    id,
    'APPLICATION_STATUS',
    current.application_status,
    newStatus,
    adminName,
    reasonOrNote || '',
    now
  );

  return getApplicationDetailById(id);
}

// Update Kotak Account Status (e.g. Completion Awaited, Completed, Failed)
export function updateKotakAccountStatus(
  id: string,
  newStatus: KotakAccountStatus,
  adminName: string,
  note?: string
) {
  const db = getDb();
  if (!db) throw new Error('Database unavailable');
  const current = db.prepare('SELECT kotak_account_status FROM delivery_partner_applications WHERE id = ?').get(id) as any;
  if (!current) throw new Error('Application not found');

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE delivery_partner_applications
    SET kotak_account_status = ?, updated_at = ?
    WHERE id = ?
  `).run(newStatus, now, id);

  db.prepare(`
    INSERT INTO delivery_partner_status_history (
      id, application_id, change_type, previous_status, new_status, changed_by, reason_or_note, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    id,
    'KOTAK_STATUS',
    current.kotak_account_status,
    newStatus,
    adminName,
    note || '',
    now
  );

  return getApplicationDetailById(id);
}

// Add Internal Administrative Note
export function addAdminNote(id: string, note: string, adminName: string) {
  const db = getDb();
  if (!db) throw new Error('Database unavailable');
  const current = db.prepare('SELECT internal_notes FROM delivery_partner_applications WHERE id = ?').get(id) as any;
  if (!current) throw new Error('Application not found');

  const now = new Date().toISOString();
  const updatedNotes = current.internal_notes
    ? `${current.internal_notes}\n[${now} - ${adminName}]: ${note}`
    : `[${now} - ${adminName}]: ${note}`;

  db.prepare(`
    UPDATE delivery_partner_applications
    SET internal_notes = ?, updated_at = ?
    WHERE id = ?
  `).run(updatedNotes, now, id);

  db.prepare(`
    INSERT INTO delivery_partner_status_history (
      id, application_id, change_type, previous_status, new_status, changed_by, reason_or_note, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    id,
    'NOTE_ADDED',
    '',
    '',
    adminName,
    note,
    now
  );

  return getApplicationDetailById(id);
}

// Document Management
export function saveDocumentRecord(doc: Omit<ApplicationDocument, 'application_id'> & { application_id?: string }): ApplicationDocument {
  const createdDoc: ApplicationDocument = {
    ...doc,
    application_id: doc.application_id || '',
  };

  const db = getDb();
  if (db) {
    try {
      db.prepare(`
        INSERT INTO delivery_partner_documents (
          id, application_id, document_type, original_file_name, stored_file_name, file_path, file_size, mime_type, file_content, verification_status, uploaded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        createdDoc.id,
        createdDoc.application_id || null,
        createdDoc.document_type,
        createdDoc.original_file_name,
        createdDoc.stored_file_name,
        createdDoc.file_path,
        createdDoc.file_size,
        createdDoc.mime_type,
        createdDoc.file_content || '',
        createdDoc.verification_status || 'Unverified',
        createdDoc.uploaded_at
      );
    } catch (e) {
      console.warn('SQLite saveDocumentRecord notice:', e);
    }
  }

  syncDocumentToNeon(createdDoc).catch(() => {});

  return createdDoc;
}

export async function saveDocumentRecordAsync(
  doc: Omit<ApplicationDocument, 'application_id'> & { application_id?: string }
): Promise<ApplicationDocument> {
  const createdDoc: ApplicationDocument = {
    ...doc,
    application_id: doc.application_id || '',
  };

  // 1. Direct Cloud Persistence to Neon Postgres (Primary, 100% durable on serverless)
  if (process.env.DATABASE_URL) {
    try {
      await syncDocumentToNeon(createdDoc);
    } catch (neonErr) {
      console.warn('Neon syncDocument notice:', neonErr);
    }
  }

  // 2. Local SQLite Persistence if available
  const db = getDb();
  if (db) {
    try {
      db.prepare(`
        INSERT INTO delivery_partner_documents (
          id, application_id, document_type, original_file_name, stored_file_name, file_path, file_size, mime_type, file_content, verification_status, uploaded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        createdDoc.id,
        createdDoc.application_id || null,
        createdDoc.document_type,
        createdDoc.original_file_name,
        createdDoc.stored_file_name,
        createdDoc.file_path,
        createdDoc.file_size,
        createdDoc.mime_type,
        createdDoc.file_content || '',
        createdDoc.verification_status || 'Unverified',
        createdDoc.uploaded_at
      );
    } catch (e) {
      // Safe fallback on read-only environments
    }
  }

  return createdDoc;
}

export function getDocumentById(id: string): ApplicationDocument | null {
  const db = getDb();
  if (!db) return null;
  try {
    const row = db.prepare('SELECT * FROM delivery_partner_documents WHERE id = ?').get(id) as any;
    if (!row) return null;
    return formatDocumentRow(row);
  } catch (e) {
    return null;
  }
}

export async function getDocumentByIdAsync(id: string): Promise<ApplicationDocument | null> {
  if (process.env.DATABASE_URL) {
    try {
      const neonDoc = await getDocumentByIdFromNeon(id);
      if (neonDoc) return neonDoc;
    } catch (e) {
      console.warn('Neon getDocumentByIdAsync notice:', e);
    }
  }

  const localDoc = getDocumentById(id);
  if (localDoc) return localDoc;

  return null;
}

// Helper formatters
function formatApplicationRow(row: any): DeliveryPartnerApplication {
  let categories: string[] = [];
  try {
    categories = JSON.parse(row.delivery_categories || '[]');
  } catch (e) {
    categories = [];
  }

  return {
    id: row.id,
    application_reference: row.application_reference,
    full_name: row.full_name,
    date_of_birth: row.date_of_birth,
    gender: row.gender,
    mobile_number: row.mobile_number,
    alternate_mobile_number: row.alternate_mobile_number,
    email: row.email,
    address: row.address,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    aadhaar_number: row.aadhaar_number || '',
    pan_number: row.pan_number || '',
    delivery_categories: categories,
    work_type: row.work_type,
    preferred_working_hours: row.preferred_working_hours,
    preferred_delivery_location: row.preferred_delivery_location,
    preferred_service_area: row.preferred_service_area,
    employment_status: row.employment_status,
    owns_two_wheeler: Boolean(row.owns_two_wheeler),
    has_driving_license: Boolean(row.has_driving_license),
    has_vehicle_registration: Boolean(row.has_vehicle_registration),
    has_smartphone: Boolean(row.has_smartphone),
    kotak_account_status: row.kotak_account_status,
    application_status: row.application_status,
    privacy_consent: Boolean(row.privacy_consent),
    kotak_acknowledgement: Boolean(row.kotak_acknowledgement),
    document_processing_status: row.document_processing_status,
    internal_notes: row.internal_notes,
    rejection_reason: row.rejection_reason,
    submitted_at: row.submitted_at,
    updated_at: row.updated_at,
  };
}

function formatDocumentRow(row: any): ApplicationDocument {
  return {
    id: row.id,
    application_id: row.application_id || '',
    document_type: row.document_type,
    original_file_name: row.original_file_name,
    stored_file_name: row.stored_file_name,
    file_path: row.file_path,
    file_size: Number(row.file_size),
    mime_type: row.mime_type,
    file_content: row.file_content || '',
    verification_status: row.verification_status,
    uploaded_at: row.uploaded_at,
  };
}

function formatHistoryRow(row: any): StatusHistoryEntry {
  return {
    id: row.id,
    application_id: row.application_id,
    change_type: row.change_type,
    previous_status: row.previous_status,
    new_status: row.new_status,
    changed_by: row.changed_by,
    reason_or_note: row.reason_or_note,
    created_at: row.created_at,
  };
}
