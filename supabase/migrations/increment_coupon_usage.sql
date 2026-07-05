-- Run this in Supabase SQL Editor to create the atomic increment function
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_coupon_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = used_count + 1,
      updated_at = NOW()
  WHERE id = p_coupon_id;
END;
$$;
