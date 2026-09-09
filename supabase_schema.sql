-- PSME-VSUSC Merchandise Website
-- Supabase database setup (safe to run again)
-- This version removes existing policies before recreating them.

-- =========================================================
-- 1. EXTENSIONS
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- 2. ORDERS TABLE
-- =========================================================

create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    order_number text unique not null,
    full_name text not null,
    student_id text not null,
    course_year text,
    contact_number text not null,
    payment_method text not null,
    proof_of_payment text,
    pickup_delivery text not null,
    delivery_address text,
    total_amount numeric(10,2) not null default 0,
    payment_status text not null default 'Pending',
    order_status text not null default 'Pending',
    created_at timestamptz not null default now()
);

-- =========================================================
-- 3. ORDER ITEMS TABLE
-- =========================================================

create table if not exists public.order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    product_name text not null,
    size text,
    quantity integer not null check (quantity > 0),
    unit_price numeric(10,2) not null default 0,
    subtotal numeric(10,2) not null default 0,
    created_at timestamptz not null default now()
);

-- =========================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =========================================================

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- =========================================================
-- 5. REMOVE OLD POLICIES
--    This prevents:
--    ERROR 42710: policy already exists
-- =========================================================

drop policy if exists "public can create orders" on public.orders;
drop policy if exists "public can create order items" on public.order_items;

drop policy if exists "public can upload payment proofs" on storage.objects;

-- =========================================================
-- 6. CUSTOMER INSERT POLICIES
-- =========================================================

create policy "public can create orders"
on public.orders
for insert
to anon
with check (true);

create policy "public can create order items"
on public.order_items
for insert
to anon
with check (true);

-- =========================================================
-- 7. STORAGE BUCKET
-- =========================================================

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do update
set public = false;

-- =========================================================
-- 8. PAYMENT PROOF UPLOAD POLICY
-- =========================================================

create policy "public can upload payment proofs"
on storage.objects
for insert
to anon
with check (
    bucket_id = 'payment-proofs'
);

-- =========================================================
-- 9. OPTIONAL: INDEXES
-- =========================================================

create index if not exists orders_created_at_idx
on public.orders (created_at desc);

create index if not exists orders_student_id_idx
on public.orders (student_id);

create index if not exists orders_payment_status_idx
on public.orders (payment_status);

create index if not exists orders_order_status_idx
on public.orders (order_status);

create index if not exists order_items_order_id_idx
on public.order_items (order_id);

-- =========================================================
-- DONE
-- =========================================================
-- Tables:
--   public.orders
--   public.order_items
--
-- Storage bucket:
--   payment-proofs
--
-- Customers can:
--   - create orders
--   - create order items
--   - upload payment proofs
--
-- Treasurer/admin permissions will be added in Phase 3.
