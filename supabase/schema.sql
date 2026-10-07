-- Denop Hostel Wifi - Supabase Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Routers
create table if not exists public.routers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  identity text not null default 'Denop-Hotspot',
  hotspot_interface text not null default 'bridge-hotspot',
  wan_interface text not null default 'ether1',
  dns_name text default '',
  status text not null default 'pending' check (status in ('active', 'inactive', 'pending')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Packages
create table if not exists public.packages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric(12,0) not null check (price >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  data_mb integer, -- null = unlimited
  download_speed text not null default '5M',
  upload_speed text not null default '2M',
  shared_users integer not null default 1,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Vouchers
create table if not exists public.vouchers (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  package_id uuid not null references public.packages(id) on delete cascade,
  status text not null default 'unused' check (status in ('unused', 'used', 'expired', 'disabled')),
  used_at timestamptz,
  used_by_mac text,
  expires_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_vouchers_code on public.vouchers(code);
create index if not exists idx_vouchers_status on public.vouchers(status);

-- Transactions
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  phone text not null,
  amount numeric(12,0) not null,
  package_id uuid not null references public.packages(id),
  status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'cancelled')),
  provider_ref text,
  voucher_id uuid references public.vouchers(id),
  router_id uuid references public.routers(id),
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_transactions_phone on public.transactions(phone);
create index if not exists idx_transactions_status on public.transactions(status);

-- Hotspot users (optional tracking)
create table if not exists public.hotspot_users (
  id uuid primary key default uuid_generate_v4(),
  username text not null,
  password text not null,
  package_id uuid references public.packages(id),
  mac_address text,
  status text not null default 'active' check (status in ('active', 'expired', 'disabled')),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger routers_updated_at
  before update on public.routers
  for each row execute procedure public.handle_updated_at();

create trigger transactions_updated_at
  before update on public.transactions
  for each row execute procedure public.handle_updated_at();

-- RLS (Row Level Security)
alter table public.routers enable row level security;
alter table public.packages enable row level security;
alter table public.vouchers enable row level security;
alter table public.transactions enable row level security;
alter table public.hotspot_users enable row level security;

-- Policies: authenticated users (admins) can do everything
create policy "Admins full access routers" on public.routers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admins full access packages" on public.packages
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admins full access vouchers" on public.vouchers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admins full access transactions" on public.transactions
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admins full access hotspot_users" on public.hotspot_users
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Public read for active packages (portal)
create policy "Public read active packages" on public.packages
  for select using (is_active = true);

-- Public insert/select limited for transactions & vouchers (portal)
create policy "Public insert transactions" on public.transactions
  for insert with check (true);

create policy "Public read own pending transactions" on public.transactions
  for select using (true); -- tighten later with phone match if needed

create policy "Public read unused vouchers by code" on public.vouchers
  for select using (status = 'unused');

-- Seed default packages for Denop Hostel Wifi
insert into public.packages (name, description, price, duration_minutes, data_mb, download_speed, upload_speed, shared_users, sort_order) values
  ('1 Hour', 'Quick browse - 1 hour access', 500, 60, 500, '3M', '1M', 1, 1),
  ('3 Hours', 'Half day - 3 hours access', 1000, 180, 1500, '5M', '2M', 1, 2),
  ('12 Hours', 'Day pass - 12 hours access', 2000, 720, 5000, '8M', '3M', 1, 3),
  ('24 Hours', 'Full day unlimited', 3000, 1440, null, '10M', '5M', 1, 4),
  ('7 Days', 'Weekly package', 15000, 10080, null, '15M', '5M', 2, 5)
on conflict do nothing;
