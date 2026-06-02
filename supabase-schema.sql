-- Run this in Supabase SQL Editor if tables don't exist yet

-- Profiles (auto-created on Google OAuth)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Assets
create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('saham_id','saham_us','crypto','reksa_dana','cash')),
  name text not null,
  symbol text,
  quantity numeric not null default 0,
  avg_price numeric not null default 0,
  currency text not null default 'IDR' check (currency in ('IDR','USD')),
  expected_return numeric,  -- for reksa_dana
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Snapshots (one per month per user)
create table if not exists snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  month text not null,             -- format: "YYYY-MM"
  total_value_idr bigint not null,
  total_cost_idr bigint not null,
  created_at timestamptz default now(),
  unique(user_id, month)
);

-- Milestones
create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount bigint not null,           -- e.g. 100000000 = 100M
  achieved_at timestamptz not null,
  snapshot_month text not null,
  unique(user_id, amount)
);

-- RLS: users can only see their own data
alter table profiles enable row level security;
alter table assets enable row level security;
alter table snapshots enable row level security;
alter table milestones enable row level security;

create policy "own profiles" on profiles for all using (auth.uid() = id);
create policy "own assets" on assets for all using (auth.uid() = user_id);
create policy "own snapshots" on snapshots for all using (auth.uid() = user_id);
create policy "own milestones" on milestones for all using (auth.uid() = user_id);

-- Auto-create profile on signup
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
