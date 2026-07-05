-- Run this migration to add Cashfree columns to existing payments table
-- This preserves existing Razorpay data

ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS order_id TEXT,
  ADD COLUMN IF NOT EXISTS cf_order_id TEXT,
  ADD COLUMN IF NOT EXISTS cf_payment_session_id TEXT,
  ADD COLUMN IF NOT EXISTS cf_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_cf_order ON public.payments(cf_order_id);
