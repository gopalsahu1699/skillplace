-- ============================================================================
-- Migration: Add course_id to enrollments table
-- Description: Enables individual course enrollment (separate from programs)
-- ============================================================================

-- Add the column (nullable - enrollment can be for a program OR a course)
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS course_id UUID NULL DEFAULT NULL REFERENCES public.courses(id) ON DELETE CASCADE;

-- Add index for course lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id) WHERE course_id IS NOT NULL;

-- Add a check constraint: enrollment must have either program_id or course_id (not both null)
-- Note: We add this as a separate constraint to avoid conflicts with existing data
DO $$ BEGIN
  ALTER TABLE public.enrollments ADD CONSTRAINT chk_enrollment_target CHECK (
    course_id IS NOT NULL OR program_id IS NOT NULL
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Add comment
COMMENT ON COLUMN public.enrollments.course_id IS 'The course the student is enrolled in. NULL if this is a program enrollment. An enrollment must have either course_id or program_id set.';

-- ============================================================================
-- USAGE:
-- Course enrollment:  course_id = <uuid>, program_id = NULL
-- Program enrollment: program_id = <uuid>, course_id = NULL
-- ============================================================================
