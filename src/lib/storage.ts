import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const STORAGE_DIR = process.env.DOCUMENTS_STORAGE_PATH
  ? path.resolve(process.env.DOCUMENTS_STORAGE_PATH)
  : path.join(process.cwd(), 'data', 'secure_documents');

// Ensure secure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
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
  const filePath = path.join(STORAGE_DIR, storedFileName);

  // 1. Write to local storage
  await fs.promises.writeFile(filePath, buffer);

  // 2. Upload to Neon Object Storage
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
    } catch (err) {
      console.warn('Neon Object Storage upload fallback to disk:', err);
    }
  }

  return {
    documentId,
    originalFileName: originalName,
    storedFileName,
    filePath,
    fileSize: buffer.length,
    mimeType,
  };
}

export async function readDocumentFileAsync(filePath: string, storedFileName?: string): Promise<Buffer> {
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

  if (!fs.existsSync(filePath)) {
    throw new Error('Document file not found');
  }
  return fs.promises.readFile(filePath);
}

export function readDocumentFile(filePath: string): Buffer {
  if (!fs.existsSync(filePath)) {
    throw new Error('Document file not found on disk');
  }
  return fs.readFileSync(filePath);
}
