-- RUN THIS IN SUPABASE SQL EDITOR (Dashboard > SQL Editor > New Query)
-- This creates the `payments` table required by the payment API routes

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  program_id UUID REFERENCES public.training_programs(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  order_id TEXT,
  cf_order_id TEXT,
  cf_payment_session_id TEXT,
  cf_payment_id TEXT,
  payment_id TEXT,
  payment_method TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_course ON public.payments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_program ON public.payments(program_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_cf_order ON public.payments(cf_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
