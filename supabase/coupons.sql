-- ============================================
-- Table: coupons
-- Promo codes for discounts
-- Rows: 1
-- ============================================

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('amount', 'percent')),
  discount_rate INTEGER NOT NULL DEFAULT 0,
  min_order_amount INTEGER DEFAULT 0,
  max_discount_amount NUMERIC NULL DEFAULT NULL,
  max_uses INTEGER DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_max_discount ON public.coupons(max_discount_amount) WHERE max_discount_amount IS NOT NULL;

-- Documentation for max_discount_amount:
-- NULL = no cap (percentage discount applies fully)
-- NUMERIC value = maximum discount cap for percentage coupons
--   Example: discount_rate=20, max_discount_amount=4000 → 20% off upto Rs. 4,000
-- Ignored when discount_type = 'amount'
