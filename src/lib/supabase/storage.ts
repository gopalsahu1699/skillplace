import { getSupabaseUrl } from './config'

export type ImageFolder = 'courses' | 'mentors' | 'partners' | 'programs' | 'testimonials' | 'employees' | 'common'

const BUCKET = 'skillplaceacademy'
const BASE = 'images'

export function getFolderPath(folder: ImageFolder): string {
  return `${BASE}/${folder}`
}

export function getImageUrl(folder: ImageFolder, filename: string): string {
  return `${getSupabaseUrl()}/storage/v1/object/public/${BUCKET}/${getFolderPath(folder)}/${filename}`
}
