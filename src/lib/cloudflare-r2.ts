import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3'
import type { GetObjectCommandInput } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { logger } from './logger'

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || ''
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || ''
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || ''
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'skillplace-videos'

const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

export function getR2Key(lessonId: string, filename: string): string {
  const ext = filename.split('.').pop() || 'mp4'
  return `lessons/${lessonId}/${Date.now()}.${ext}`
}

export function getR2Url(key: string): string {
  return `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`
}

export async function ensureBucket(): Promise<void> {
  try {
    await r2Client.send(new HeadBucketCommand({ Bucket: R2_BUCKET_NAME }))
  } catch {
    try {
      await r2Client.send(new CreateBucketCommand({ Bucket: R2_BUCKET_NAME }))
    } catch (err) {
      logger.error('Failed to create R2 bucket', err)
    }
  }
}

export async function configureBucketCors(allowedOrigins: string[] = []): Promise<void> {
  const origins = allowedOrigins.length > 0
    ? allowedOrigins
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        ...(process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL] : []),
      ].filter(Boolean)

  const corsRules = [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'PUT', 'HEAD'],
      AllowedOrigins: origins,
      ExposeHeaders: ['ETag', 'Content-Length'],
      MaxAgeSeconds: 3600,
    },
  ]

  await r2Client.send(
    new PutBucketCorsCommand({
      Bucket: R2_BUCKET_NAME,
      CORSConfiguration: { CORSRules: corsRules },
    })
  )
}

export async function generateUploadUrl(
  key: string,
  contentType: string = 'video/mp4',
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(r2Client, command, { expiresIn })
}

export async function generatePlaybackUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const cmdParams: GetObjectCommandInput = { Bucket: R2_BUCKET_NAME, Key: key }
  const command = new GetObjectCommand(cmdParams)
  return getSignedUrl(r2Client, command, { expiresIn })
}

const CHUNK_SIZE = 100 * 1024 * 1024

export interface MultipartUploadInit {
  uploadId: string
  key: string
}

export async function initiateMultipartUpload(
  key: string,
  contentType: string = 'video/mp4'
): Promise<MultipartUploadInit> {
  const command = new CreateMultipartUploadCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })
  const result = await r2Client.send(command)
  return {
    uploadId: result.UploadId!,
    key,
  }
}

export async function getPartUploadUrl(
  key: string,
  uploadId: string,
  partNumber: number,
  expiresIn: number = 3600
): Promise<string> {
  const command = new UploadPartCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  })
  return getSignedUrl(r2Client, command, { expiresIn })
}

export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: { PartNumber: number; ETag: string }[]
): Promise<{ key: string }> {
  const command = new CompleteMultipartUploadCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber),
    },
  })
  await r2Client.send(command)
  return { key }
}

export async function abortMultipartUpload(
  key: string,
  uploadId: string
): Promise<void> {
  await r2Client.send(
    new AbortMultipartUploadCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
    })
  )
}

export function getPartCount(fileSize: number): number {
  return Math.ceil(fileSize / CHUNK_SIZE)
}

export function getPartRange(partNumber: number, fileSize: number): { start: number; end: number } {
  const start = (partNumber - 1) * CHUNK_SIZE
  const end = Math.min(start + CHUNK_SIZE, fileSize)
  return { start, end }
}

export { R2_BUCKET_NAME, CHUNK_SIZE }
