-- =============================================================================
-- EvoLoop — Sprint 1 schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- The script is idempotent: it is safe to run more than once.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles: one row per authenticated user
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text check (char_length(full_name) <= 120),
  email       text check (char_length(email) <= 254),
  headline    text check (char_length(headline) <= 160),
  bio         text check (char_length(bio) <= 2000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Public profile information for each EvoLoop user.';

-- -----------------------------------------------------------------------------
-- Row Level Security: users can only see and modify their own profile
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No delete policy: profiles are removed automatically when the auth user is deleted.

-- Explicit privileges (RLS still applies on top of these).
revoke all on public.profiles from anon;
grant select, insert, update on public.profiles to authenticated;

-- -----------------------------------------------------------------------------
-- Keep updated_at current on every update
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Create a profile automatically when a user signs up
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
