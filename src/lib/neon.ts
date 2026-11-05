import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import type { DeliveryPartnerApplication, ApplicationDocument, StatusHistoryEntry } from '@/types';

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

export async function syncApplicationToNeon(app: DeliveryPartnerApplication): Promise<void> {
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
