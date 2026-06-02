-- =============================================================
-- LAVENIR — Complete Database Migration
-- Safe to run multiple times (idempotent)
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Add any missing columns
alter table profiles add column if not exists full_name text;
alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists created_at timestamptz default now();

-- ============================================================
-- 2. ASSETS
-- ============================================================
create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null,
  name text not null,
  symbol text,
  quantity numeric not null default 0,
  avg_price numeric not null default 0,
  currency text not null default 'IDR',
  expected_return numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add any missing columns
alter table assets add column if not exists symbol text;
alter table assets add column if not exists quantity numeric not null default 0;
alter table assets add column if not exists avg_price numeric not null default 0;
alter table assets add column if not exists currency text not null default 'IDR';
alter table assets add column if not exists expected_return numeric;
alter table assets add column if not exists created_at timestamptz default now();
alter table assets add column if not exists updated_at timestamptz default now();

-- Fix type check constraint — drop old one first, then recreate
alter table assets drop constraint if exists assets_type_check;
alter table assets drop constraint if exists assets_currency_check;

alter table assets
  add constraint assets_type_check
  check (type in ('saham_id','saham_us','crypto','reksa_dana','cash'));

alter table assets
  add constraint assets_currency_check
  check (currency in ('IDR','USD'));

-- ============================================================
-- 3. SNAPSHOTS
-- ============================================================
create table if not exists snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  month text not null,
  total_value_idr bigint not null default 0,
  total_cost_idr bigint not null default 0,
  created_at timestamptz default now()
);

-- Add any missing columns
alter table snapshots add column if not exists month text;
alter table snapshots add column if not exists total_value_idr bigint not null default 0;
alter table snapshots add column if not exists total_cost_idr bigint not null default 0;
alter table snapshots add column if not exists created_at timestamptz default now();

-- Unique constraint on (user_id, month)
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'snapshots_user_id_month_key'
  ) then
    alter table snapshots add constraint snapshots_user_id_month_key unique (user_id, month);
  end if;
end $$;

-- ============================================================
-- 4. MILESTONES
-- ============================================================
create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount bigint not null,
  achieved_at timestamptz not null default now(),
  snapshot_month text not null default '',
  created_at timestamptz default now()
);

-- Add any missing columns
alter table milestones add column if not exists amount bigint;
alter table milestones add column if not exists achieved_at timestamptz not null default now();
alter table milestones add column if not exists snapshot_month text not null default '';
alter table milestones add column if not exists created_at timestamptz default now();

-- Unique constraint on (user_id, amount)
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'milestones_user_id_amount_key'
  ) then
    alter table milestones add constraint milestones_user_id_amount_key unique (user_id, amount);
  end if;
end $$;

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table assets enable row level security;
alter table snapshots enable row level security;
alter table milestones enable row level security;

-- Drop existing policies first (prevents "already exists" errors)
drop policy if exists "own profiles" on profiles;
drop policy if exists "own assets" on assets;
drop policy if exists "own snapshots" on snapshots;
drop policy if exists "own milestones" on milestones;

-- Also drop any other policy names that might exist from tutorials
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can view own assets" on assets;
drop policy if exists "Users can insert own assets" on assets;
drop policy if exists "Users can update own assets" on assets;
drop policy if exists "Users can delete own assets" on assets;
drop policy if exists "Users can view own snapshots" on snapshots;
drop policy if exists "Users can insert own snapshots" on snapshots;
drop policy if exists "Users can view own milestones" on milestones;
drop policy if exists "Users can insert own milestones" on milestones;

-- Create unified policies
create policy "own profiles"   on profiles   for all using (auth.uid() = id);
create policy "own assets"     on assets     for all using (auth.uid() = user_id);
create policy "own snapshots"  on snapshots  for all using (auth.uid() = user_id);
create policy "own milestones" on milestones for all using (auth.uid() = user_id);

-- ============================================================
-- 6. AUTO-CREATE PROFILE ON GOOGLE LOGIN
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  ) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- 7. VERIFICATION — check columns exist
-- ============================================================
do $$
declare
  missing text[] := '{}';
begin
  -- assets
  if not exists (select 1 from information_schema.columns where table_name='assets' and column_name='expected_return') then
    missing := array_append(missing, 'assets.expected_return');
  end if;
  if not exists (select 1 from information_schema.columns where table_name='assets' and column_name='currency') then
    missing := array_append(missing, 'assets.currency');
  end if;
  -- snapshots
  if not exists (select 1 from information_schema.columns where table_name='snapshots' and column_name='total_cost_idr') then
    missing := array_append(missing, 'snapshots.total_cost_idr');
  end if;
  if not exists (select 1 from information_schema.columns where table_name='snapshots' and column_name='month') then
    missing := array_append(missing, 'snapshots.month');
  end if;
  -- milestones
  if not exists (select 1 from information_schema.columns where table_name='milestones' and column_name='snapshot_month') then
    missing := array_append(missing, 'milestones.snapshot_month');
  end if;
  if not exists (select 1 from information_schema.columns where table_name='milestones' and column_name='achieved_at') then
    missing := array_append(missing, 'milestones.achieved_at');
  end if;

  if array_length(missing, 1) > 0 then
    raise exception 'MIGRATION INCOMPLETE — missing columns: %', array_to_string(missing, ', ');
  else
    raise notice 'MIGRATION OK — all columns verified';
  end if;
end $$;
