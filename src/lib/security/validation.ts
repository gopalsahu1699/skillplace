import { z } from 'zod/v4'

export const emailSchema = z.string().email('Invalid email address').max(255).trim().toLowerCase()

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/, 'Must contain special character')

export const phoneSchema = z.string()
  .regex(/^\d{10}$/, 'Phone must be exactly 10 digits')
  .regex(/^[6-9]/, 'Phone must start with 6-9')

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .trim()
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')

export const uuidSchema = z.string().uuid('Invalid UUID')

export const slugSchema = z.string().max(200).regex(/^[a-z0-9-]+$/, 'Invalid slug format')

export const urlSchema = z.string().url('Invalid URL').max(2048)

export const couponCodeSchema = z.string().min(1).max(50).trim().toUpperCase()

export const positiveIntSchema = z.number().int().positive('Must be a positive integer')

export const nonNegativeIntSchema = z.number().int().min(0, 'Must be non-negative')

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export function validateFileType(mimeType: string): 'image' | 'video' | 'pdf' | 'invalid' {
  const allowedImages = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  const allowedVideos = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
  const allowedPdfs = ['application/pdf']

  if (allowedImages.includes(mimeType)) return 'image'
  if (allowedVideos.includes(mimeType)) return 'video'
  if (allowedPdfs.includes(mimeType)) return 'pdf'
  return 'invalid'
}

const MAGIC_BYTES: Record<string, Uint8Array[]> = {
  jpeg: [new Uint8Array([0xFF, 0xD8, 0xFF])],
  png: [new Uint8Array([0x89, 0x50, 0x4E, 0x47])],
  gif: [new Uint8Array([0x47, 0x49, 0x46])],
  webp: [new Uint8Array([0x52, 0x49, 0x46, 0x46])],
  mp4: [new Uint8Array([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70])],
  pdf: [new Uint8Array([0x25, 0x50, 0x44, 0x46])],
}

export function validateMagicBytes(buffer: Uint8Array, extension: string): boolean {
  const signatures = MAGIC_BYTES[extension]
  if (!signatures) return true
  return signatures.some(sig => {
    if (buffer.length < sig.length) return false
    for (let i = 0; i < sig.length; i++) {
      if (buffer[i] !== sig[i]) return false
    }
    return true
  })
}
