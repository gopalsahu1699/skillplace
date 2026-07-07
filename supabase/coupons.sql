create table public.coupons (
  id uuid not null default gen_random_uuid (),
  code text not null,
  discount_type text not null,
  discount_rate numeric not null,
  min_order_amount numeric null default 0,
  max_uses integer null,
  used_count integer null default 0,
  valid_from timestamp with time zone null default now(),
  valid_until timestamp with time zone null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  max_discount_amount numeric null,
  constraint coupons_pkey primary key (id),
  constraint coupons_code_unique unique (code),
  constraint coupons_discount_type_check check (
    (
      discount_type = any (array['percent'::text, 'amount'::text])
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_coupons_code on public.coupons using btree (code) TABLESPACE pg_default;

create index IF not exists idx_coupons_max_discount on public.coupons using btree (max_discount_amount) TABLESPACE pg_default
where
  (max_discount_amount is not null);