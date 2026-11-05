import { neon } from '@neondatabase/serverless';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import assert from 'node:assert';

async function testNeonServices() {
  console.log('--- Testing Neon Cloud Services ---');

  // 1. Test Neon Postgres Database
  const dbUrl = process.env.DATABASE_URL;
  assert.ok(dbUrl, 'DATABASE_URL must be defined');
  const sql = neon(dbUrl);
  const dbResult = await sql.query('SELECT NOW() as current_time, current_database() as db_name, current_user as user_name');
  assert.ok(dbResult && dbResult.length > 0, 'Database query must return result');
  console.log('✓ Neon Postgres Connection Successful:');
  console.log('   Database:', dbResult[0].db_name);
  console.log('   User:', dbResult[0].user_name);
  console.log('   Timestamp:', dbResult[0].current_time);

  // 2. Test Neon Object Storage (Bucket: assets)
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const region = process.env.AWS_REGION || 'us-east-2';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  assert.ok(endpoint, 'AWS_ENDPOINT_URL_S3 must be defined');
  assert.ok(accessKeyId, 'AWS_ACCESS_KEY_ID must be defined');
  assert.ok(secretAccessKey, 'AWS_SECRET_ACCESS_KEY must be defined');

  const s3 = new S3Client({
    endpoint,
    region,
    forcePathStyle: true,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const testKey = `verification/test-${Date.now()}.txt`;
  const testPayload = `Neon Object Storage active and operational at ${new Date().toISOString()}`;

  // Upload object
  const putResult = await s3.send(
    new PutObjectCommand({
      Bucket: 'assets',
      Key: testKey,
      Body: testPayload,
      ContentType: 'text/plain',
    })
  );
  assert.ok(putResult, 'PutObject must succeed');
  console.log('✓ Neon Object Storage Upload (PutObject) Successful to bucket "assets": key:', testKey);

  // Download object
  const getResult = await s3.send(
    new GetObjectCommand({
      Bucket: 'assets',
      Key: testKey,
    })
  );
  assert.ok(getResult.Body, 'GetObject Body must be present');
  const downloadedText = await getResult.Body.transformToString();
  assert.strictEqual(downloadedText, testPayload, 'Downloaded payload must match uploaded payload');
  console.log('✓ Neon Object Storage Download (GetObject) Verified. Content:');
  console.log('   "', downloadedText, '"');

  console.log('==================================================');
  console.log('ALL NEON SERVICES (POSTGRES + OBJECT STORAGE) VERIFIED');
  console.log('==================================================');
}

testNeonServices().catch((err) => {
  console.error('Neon test failed:', err);
  process.exit(1);
});
