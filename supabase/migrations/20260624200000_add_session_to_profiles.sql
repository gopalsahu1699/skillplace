-- Add session columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON public.profiles(last_login_at);

-- Update existing admin user with session info
UPDATE public.profiles 
SET last_login_at = NOW(), login_count = 1 
WHERE email = 'admin@skillplace.com';
