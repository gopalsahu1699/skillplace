-- Add is_featured column to faqs table for controlling home page display
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS is_featured boolean not null default false;

-- Mark first 5 FAQs as featured by default
UPDATE public.faqs SET is_featured = true WHERE display_order <= 5;
