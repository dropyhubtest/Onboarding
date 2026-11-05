import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import type { DeliveryPartnerApplication, ApplicationDocument, StatusHistoryEntry, AdminApplicationDetail, ApplicationStatus, KotakAccountStatus } from '@/types';

let sqlClient: NeonQueryFunction<false, false> | null = null;

export function getNeonSql(): NeonQueryFunction<false, false> | null {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;

  if (!sqlClient) {
    sqlClient = neon(dbUrl);
  }
  return sqlClient;
}

export async function initNeonPostgresSchema(): Promise<void> {
  const sql = getNeonSql();
  if (!sql) return;

  try {
    await sql.query(`
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

    await sql.query(`
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
        uploaded_at TEXT NOT NULL
      );
    `);

    await sql.query(`
      CREATE TABLE IF NOT EXISTS delivery_partner_status_history (
        id TEXT PRIMARY KEY,
        application_id TEXT NOT NULL,
        change_type TEXT NOT NULL,
        previous_status TEXT DEFAULT '',
        new_status TEXT DEFAULT '',
        changed_by TEXT NOT NULL,
        reason_or_note TEXT DEFAULT '',
        created_at TEXT NOT NULL
      );
    `);
  } catch (err) {
    console.warn('Neon Postgres schema initialization notice:', err);
  }
}

export function formatNeonApplicationRow(row: any): DeliveryPartnerApplication {
  let categories: string[] = [];
  try {
    categories = typeof row.delivery_categories === 'string' 
      ? JSON.parse(row.delivery_categories) 
      : (row.delivery_categories || []);
  } catch (e) {
    categories = [];
  }

  return {
    id: row.id,
    application_reference: row.application_reference,
    full_name: row.full_name,
    date_of_birth: row.date_of_birth,
    gender: row.gender || '',
    mobile_number: row.mobile_number,
    alternate_mobile_number: row.alternate_mobile_number || '',
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
    employment_status: row.employment_status || '',
    owns_two_wheeler: Boolean(row.owns_two_wheeler),
    has_driving_license: Boolean(row.has_driving_license),
    has_vehicle_registration: Boolean(row.has_vehicle_registration),
    has_smartphone: Boolean(row.has_smartphone),
    kotak_account_status: row.kotak_account_status,
    application_status: row.application_status,
    privacy_consent: Boolean(row.privacy_consent),
    kotak_acknowledgement: Boolean(row.kotak_acknowledgement),
    document_processing_status: row.document_processing_status,
    internal_notes: row.internal_notes || '',
    rejection_reason: row.rejection_reason || '',
    submitted_at: row.submitted_at,
    updated_at: row.updated_at,
  };
}

export async function syncApplicationToNeon(
  app: DeliveryPartnerApplication,
  aadhaarDocId?: string,
  panDocId?: string
): Promise<void> {
  const sql = getNeonSql();
  if (!sql) return;

  try {
    await initNeonPostgresSchema();
    await sql.query(
      `INSERT INTO delivery_partner_applications (
        id, application_reference, full_name, date_of_birth, gender,
        mobile_number, alternate_mobile_number, email, address, city,
        state, pincode, aadhaar_number, pan_number, delivery_categories,
        work_type, preferred_working_hours, preferred_delivery_location, preferred_service_area,
        employment_status, owns_two_wheeler, has_driving_license, has_vehicle_registration, has_smartphone,
        kotak_account_status, application_status, privacy_consent, kotak_acknowledgement,
        document_processing_status, internal_notes, rejection_reason, submitted_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19,
        $20, $21, $22, $23, $24,
        $25, $26, $27, $28,
        $29, $30, $31, $32, $33
      )
      ON CONFLICT (id) DO UPDATE SET
        application_status = EXCLUDED.application_status,
        kotak_account_status = EXCLUDED.kotak_account_status,
        internal_notes = EXCLUDED.internal_notes,
        rejection_reason = EXCLUDED.rejection_reason,
        updated_at = EXCLUDED.updated_at
      `,
      [
        app.id,
        app.application_reference,
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
        app.submitted_at,
        app.updated_at,
      ]
    );

    // Link uploaded documents in Neon Postgres
    if (aadhaarDocId) {
      await sql.query(
        'UPDATE delivery_partner_documents SET application_id = $1 WHERE id = $2',
        [app.id, aadhaarDocId]
      );
    }
    if (panDocId) {
      await sql.query(
        'UPDATE delivery_partner_documents SET application_id = $1 WHERE id = $2',
        [app.id, panDocId]
      );
    }
  } catch (err) {
    console.warn('Neon Postgres sync error:', err);
  }
}

export async function syncDocumentToNeon(doc: ApplicationDocument): Promise<void> {
  const sql = getNeonSql();
  if (!sql) return;

  try {
    await initNeonPostgresSchema();
    await sql.query(
      `INSERT INTO delivery_partner_documents (
        id, application_id, document_type, original_file_name, stored_file_name,
        file_path, file_size, mime_type, verification_status, uploaded_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        application_id = EXCLUDED.application_id,
        verification_status = EXCLUDED.verification_status
      `,
      [
        doc.id,
        doc.application_id || '',
        doc.document_type,
        doc.original_file_name,
        doc.stored_file_name,
        doc.file_path,
        doc.file_size,
        doc.mime_type,
        doc.verification_status || 'Unverified',
        doc.uploaded_at,
      ]
    );
  } catch (err) {
    console.warn('Neon Postgres document sync error:', err);
  }
}

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

export async function listApplicationsFromNeon(params: ApplicationFilterParams) {
  const sql = getNeonSql();
  if (!sql) throw new Error('Neon database is not configured.');

  await initNeonPostgresSchema();

  const {
    search,
    status,
    category,
    city,
    kotakStatus,
    sortBy = 'submitted_at',
    sortOrder = 'DESC',
    page = 1,
    limit = 15,
  } = params;

  const whereClauses: string[] = [];
  const args: any[] = [];

  if (search) {
    const idx1 = args.length + 1;
    const idx2 = args.length + 2;
    const idx3 = args.length + 3;
    const idx4 = args.length + 4;
    whereClauses.push(`(full_name ILIKE $${idx1} OR mobile_number ILIKE $${idx2} OR application_reference ILIKE $${idx3} OR email ILIKE $${idx4})`);
    const term = `%${search.trim()}%`;
    args.push(term, term, term, term);
  }

  if (status && status !== 'ALL') {
    const idx = args.length + 1;
    whereClauses.push(`application_status = $${idx}`);
    args.push(status);
  }

  if (kotakStatus && kotakStatus !== 'ALL') {
    const idx = args.length + 1;
    whereClauses.push(`kotak_account_status = $${idx}`);
    args.push(kotakStatus);
  }

  if (city && city !== 'ALL') {
    const idx = args.length + 1;
    whereClauses.push(`city ILIKE $${idx}`);
    args.push(`%${city.trim()}%`);
  }

  if (category && category !== 'ALL') {
    const idx = args.length + 1;
    whereClauses.push(`delivery_categories ILIKE $${idx}`);
    args.push(`%${category}%`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countResult = await sql.query(`SELECT COUNT(*) as total FROM delivery_partner_applications ${whereSql}`, args);
  const total = parseInt(countResult[0]?.total || '0', 10);

  const allowedSortCols = ['submitted_at', 'full_name', 'city'];
  const safeSortCol = allowedSortCols.includes(sortBy) ? sortBy : 'submitted_at';
  const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  const safeLimit = Math.max(1, Math.min(100, limit));
  const safePage = Math.max(1, page);
  const safeOffset = (safePage - 1) * safeLimit;

  const querySql = `
    SELECT * FROM delivery_partner_applications
    ${whereSql}
    ORDER BY ${safeSortCol} ${safeSortOrder}
    LIMIT ${safeLimit} OFFSET ${safeOffset}
  `;

  const rows = await sql.query(querySql, args);
  const appIds = rows.map((r: any) => r.id);

  const docsMap: Record<string, ApplicationDocument[]> = {};
  if (appIds.length > 0) {
    try {
      const docRows = await sql.query(
        'SELECT * FROM delivery_partner_documents WHERE application_id = ANY($1)',
        [appIds]
      );
      for (const d of docRows) {
        if (!docsMap[d.application_id]) docsMap[d.application_id] = [];
        docsMap[d.application_id].push({
          id: d.id,
          application_id: d.application_id,
          document_type: d.document_type,
          original_file_name: d.original_file_name,
          stored_file_name: d.stored_file_name,
          file_path: d.file_path,
          file_size: Number(d.file_size),
          mime_type: d.mime_type,
          verification_status: d.verification_status,
          uploaded_at: d.uploaded_at,
        });
      }
    } catch (docErr) {
      console.warn('Neon list documents fetch notice:', docErr);
    }
  }

  const applications = rows.map((r: any) => {
    const formatted = formatNeonApplicationRow(r);
    formatted.documents = docsMap[formatted.id] || [];
    return formatted;
  });

  return {
    applications,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1,
  };
}

export async function getApplicationDetailFromNeon(id: string): Promise<AdminApplicationDetail | null> {
  const sql = getNeonSql();
  if (!sql) return null;

  await initNeonPostgresSchema();
  const appRows = await sql.query('SELECT * FROM delivery_partner_applications WHERE id = $1 LIMIT 1', [id]);
  if (!appRows || appRows.length === 0) return null;

  const app = formatNeonApplicationRow(appRows[0]);
  const docRows = await sql.query('SELECT * FROM delivery_partner_documents WHERE application_id = $1', [id]);
  const historyRows = await sql.query('SELECT * FROM delivery_partner_status_history WHERE application_id = $1 ORDER BY created_at DESC', [id]);

  return {
    ...app,
    documents: docRows.map((doc: any) => ({
      id: doc.id,
      application_id: doc.application_id,
      document_type: doc.document_type,
      original_file_name: doc.original_file_name,
      stored_file_name: doc.stored_file_name,
      file_path: doc.file_path,
      file_size: Number(doc.file_size),
      mime_type: doc.mime_type,
      verification_status: doc.verification_status,
      uploaded_at: doc.uploaded_at,
    })),
    history: historyRows.map((h: any) => ({
      id: h.id,
      application_id: h.application_id,
      change_type: h.change_type,
      previous_status: h.previous_status,
      new_status: h.new_status,
      changed_by: h.changed_by,
      reason_or_note: h.reason_or_note,
      created_at: h.created_at,
    })),
  };
}

export async function updateApplicationStatusInNeon(
  id: string,
  newStatus: ApplicationStatus,
  adminName: string,
  reasonOrNote?: string
): Promise<AdminApplicationDetail | null> {
  const sql = getNeonSql();
  if (!sql) return null;

  await initNeonPostgresSchema();
  const currentRows = await sql.query('SELECT application_status FROM delivery_partner_applications WHERE id = $1', [id]);
  const currentStatus = currentRows[0]?.application_status || '';

  const now = new Date().toISOString();
  await sql.query(
    'UPDATE delivery_partner_applications SET application_status = $1, rejection_reason = $2, updated_at = $3 WHERE id = $4',
    [newStatus, newStatus === 'Rejected' ? (reasonOrNote || '') : '', now, id]
  );

  const histId = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await sql.query(
    'INSERT INTO delivery_partner_status_history (id, application_id, change_type, previous_status, new_status, changed_by, reason_or_note, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [histId, id, 'APPLICATION_STATUS', currentStatus, newStatus, adminName, reasonOrNote || '', now]
  );

  return getApplicationDetailFromNeon(id);
}

export async function updateKotakStatusInNeon(
  id: string,
  newStatus: KotakAccountStatus,
  adminName: string
): Promise<AdminApplicationDetail | null> {
  const sql = getNeonSql();
  if (!sql) return null;

  await initNeonPostgresSchema();
  const currentRows = await sql.query('SELECT kotak_account_status FROM delivery_partner_applications WHERE id = $1', [id]);
  const currentStatus = currentRows[0]?.kotak_account_status || '';

  const now = new Date().toISOString();
  await sql.query(
    'UPDATE delivery_partner_applications SET kotak_account_status = $1, updated_at = $2 WHERE id = $3',
    [newStatus, now, id]
  );

  const histId = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await sql.query(
    'INSERT INTO delivery_partner_status_history (id, application_id, change_type, previous_status, new_status, changed_by, reason_or_note, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [histId, id, 'KOTAK_STATUS', currentStatus, newStatus, adminName, '', now]
  );

  return getApplicationDetailFromNeon(id);
}
