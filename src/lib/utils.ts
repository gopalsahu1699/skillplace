import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { getSupabaseUrl } from "./supabase/config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SUPABASE_STORAGE_BASE = `${getSupabaseUrl()}/storage/v1/object/public/skillplaceacademy/images`

export function getSupabaseImageUrl(filename: string): string {
  return `${SUPABASE_STORAGE_BASE}/${filename}`
}

/**
 * Returns the program/course image URL for a given branch slug.
 * Falls back to the civil engineering image for unknown branches.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getProgramImage(branchSlug: string): string {
  switch (branchSlug) {
    case 'civil':
      return getSupabaseImageUrl('course-civil-engineering.jpg')
    case 'mechanical':
      return getSupabaseImageUrl('course-mechanical-engineering.jpg')
    case 'electronics':
      return getSupabaseImageUrl('course-electronics-automation.jpg')
    case 'electrical':
      return getSupabaseImageUrl('course-civil-fallback.jpg')
    default:
      return getSupabaseImageUrl('course-civil-engineering.jpg')
  }
}
