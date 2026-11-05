import { DatabaseSync } from 'node:sqlite';
import { neon } from '@neondatabase/serverless';

async function cleanData() {
  console.log('--- Cleaning Mock Data from Local SQLite ---');
  const sqlite = new DatabaseSync('./data/onboarding.db');
  
  // 1. Delete mock applications
  const deleteApps = sqlite.prepare(`
    DELETE FROM delivery_partner_applications 
    WHERE full_name IN ('Rajesh Kumar', 'Ananya Sharma') 
       OR full_name LIKE '%test%'
       OR mobile_number = '9988776655'
  `);
  const appResult = deleteApps.run();
  console.log('SQLite mock applications deleted:', appResult);

  // 2. Delete orphaned docs
  const deleteDocs = sqlite.prepare(`
    DELETE FROM delivery_partner_documents 
    WHERE application_id IS NULL 
       OR application_id NOT IN (SELECT id FROM delivery_partner_applications)
  `);
  const docResult = deleteDocs.run();
  console.log('SQLite orphaned documents deleted:', docResult);

  // 3. Delete orphaned history
  const deleteHist = sqlite.prepare(`
    DELETE FROM delivery_partner_status_history 
    WHERE application_id NOT IN (SELECT id FROM delivery_partner_applications)
  `);
  const histResult = deleteHist.run();
  console.log('SQLite orphaned history deleted:', histResult);

  const remaining = sqlite.prepare('SELECT id, full_name, mobile_number, submitted_at FROM delivery_partner_applications').all();
  console.log('Remaining real applicants in SQLite:', remaining);

  const remainingDocs = sqlite.prepare('SELECT id, application_id, original_file_name FROM delivery_partner_documents').all();
  console.log('Remaining documents in SQLite:', remainingDocs);

  // Clean Neon Postgres if DATABASE_URL is set
  if (process.env.DATABASE_URL) {
    console.log('--- Cleaning Mock Data from Neon Postgres ---');
    try {
      const sql = neon(process.env.DATABASE_URL);
      await sql`
        DELETE FROM delivery_partner_applications 
        WHERE full_name IN ('Rajesh Kumar', 'Ananya Sharma') 
           OR full_name LIKE '%test%'
           OR mobile_number = '9988776655'
      `;
      await sql`
        DELETE FROM delivery_partner_documents 
        WHERE application_id IS NULL 
           OR application_id NOT IN (SELECT id FROM delivery_partner_applications)
      `;
      await sql`
        DELETE FROM delivery_partner_status_history 
        WHERE application_id NOT IN (SELECT id FROM delivery_partner_applications)
      `;
      const neonRemaining = await sql`SELECT id, full_name, mobile_number FROM delivery_partner_applications`;
      console.log('Remaining real applicants in Neon Postgres:', neonRemaining);
    } catch (neonErr) {
      console.warn('Neon cleaning notice:', neonErr.message || neonErr);
    }
  }

  console.log('Clean complete.');
}

cleanData().catch(console.error);
