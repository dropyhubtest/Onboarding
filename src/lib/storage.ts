import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function getSafeStorageDir(): string {
  if (process.env.DOCUMENTS_STORAGE_PATH) {
    try {
      const p = path.resolve(process.env.DOCUMENTS_STORAGE_PATH);
      if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
      return p;
    } catch {
      // Fallback below
    }
  }

  // Preferred project folder for local development
  const preferred = path.join(process.cwd(), 'data', 'secure_documents');
  try {
    if (!fs.existsSync(preferred)) {
      fs.mkdirSync(preferred, { recursive: true });
    }
    return preferred;
  } catch {
    // In serverless / read-only filesystems (e.g. Vercel), use writable os.tmpdir()
    const tmpDir = path.join(os.tmpdir(), 'dropyhub_documents');
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    } catch {}
    return tmpDir;
  }
}

const NEON_BUCKET = process.env.NEON_OBJECT_STORAGE_BUCKET || 'assets';

function getNeonS3Client(): S3Client | null {
  if (
    process.env.AWS_ENDPOINT_URL_S3 &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  ) {
    return new S3Client({
      endpoint: process.env.AWS_ENDPOINT_URL_S3,
      region: process.env.AWS_REGION || 'us-east-2',
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return null;
}

export interface StoredFileInfo {
  documentId: string;
  originalFileName: string;
  storedFileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  base64Content: string;
}

export function validateDocumentFile(file: { name: string; size: number; type: string }): {
  isValid: boolean;
  error?: string;
} {
  if (!file) {
    return { isValid: false, error: 'No file provided.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size exceeds the 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller file.`,
    };
  }

  // Check extension and MIME type
  const ext = path.extname(file.name).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

  if (!allowedExts.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file format. Only JPG, PNG, WEBP and PDF files are allowed.',
    };
  }

  return { isValid: true };
}

export async function saveDocumentBuffer(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  docType: 'aadhaar' | 'pan'
): Promise<StoredFileInfo> {
  const documentId = `doc_${crypto.randomBytes(12).toString('hex')}`;
  const ext = path.extname(originalName).toLowerCase() || (mimeType === 'application/pdf' ? '.pdf' : '.jpg');
  // Obfuscate disk filename completely to prevent guessing
  const storedFileName = `${docType}_${documentId}${ext}`;
  const storageDir = getSafeStorageDir();
  const filePath = path.join(storageDir, storedFileName);
  const base64Content = buffer.toString('base64');

  // 1. Safe write to disk (never throws on read-only environments)
  try {
    await fs.promises.writeFile(filePath, buffer);
  } catch (diskErr: any) {
    console.warn('Local disk write skipped in serverless environment:', diskErr?.message || diskErr);
  }

  // 2. Upload to Neon Object Storage if S3 credentials are configured
  const s3 = getNeonS3Client();
  if (s3) {
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: NEON_BUCKET,
          Key: `documents/${storedFileName}`,
          Body: buffer,
          ContentType: mimeType,
        })
      );
    } catch (s3Err: any) {
      console.warn('Neon Object Storage upload skipped:', s3Err?.message || s3Err);
    }
  }

  return {
    documentId,
    originalFileName: originalName,
    storedFileName,
    filePath,
    fileSize: buffer.length,
    mimeType,
    base64Content,
  };
}

export async function readDocumentFileAsync(
  filePath: string,
  storedFileName?: string,
  fileContentBase64?: string
): Promise<Buffer> {
  // 1. Primary Cloud Durability: If document is stored in Neon Postgres as base64, decode directly
  if (fileContentBase64 && fileContentBase64.trim().length > 0) {
    return Buffer.from(fileContentBase64, 'base64');
  }

  // 2. Neon Object Storage (S3)
  const s3 = getNeonS3Client();
  if (s3 && storedFileName) {
    try {
      const res = await s3.send(
        new GetObjectCommand({
          Bucket: NEON_BUCKET,
          Key: `documents/${storedFileName}`,
        })
      );
      if (res.Body) {
        const bytes = await res.Body.transformToByteArray();
        return Buffer.from(bytes);
      }
    } catch (err) {
      // Fallback to local disk
    }
  }

  // 3. Local disk cache
  if (fs.existsSync(filePath)) {
    return fs.promises.readFile(filePath);
  }

  throw new Error('Document binary file is not available in cloud database, S3, or local storage.');
}

export function readDocumentFile(filePath: string): Buffer {
  if (!fs.existsSync(filePath)) {
    throw new Error('Document file not found on disk');
  }
  return fs.readFileSync(filePath);
}
