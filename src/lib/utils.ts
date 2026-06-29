import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the program/course image URL for a given branch slug.
 * Falls back to the civil engineering image for unknown branches.
 */
export function getProgramImage(branchSlug: string): string {
  switch (branchSlug) {
    case 'civil':
      return 'https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/course-civil-engineering.jpg'
    case 'mechanical':
      return 'https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/course-mechanical-engineering.jpg'
    case 'electronics':
      return 'https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/course-electronics-automation.jpg'
    case 'electrical':
      return 'https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/course-civil-fallback.jpg'
    default:
      return 'https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/course-civil-engineering.jpg'
  }
}
