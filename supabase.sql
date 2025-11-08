-- Schema file for the Animal Family Telegram mini‑app.
-- Run this SQL inside your Supabase project (SQL editor) to create
-- the necessary tables, extensions and policies. Adjust as needed
-- for your specific requirements.

-- Enable useful extensions.  pgcrypto is used for generating UUIDs,
-- and postgis adds the Point type for storing geographical
-- coordinates.  If these extensions already exist in your project
-- you can safely skip these statements.
create extension if not exists "pgcrypto";
create extension if not exists "postgis";

-- Users table.  Supabase Auth automatically maintains an
-- auth.users table containing all registered users.  We create a
-- separate public.users table to store additional profile data and
-- link it to the auth.users table via the id.  Each row is
-- identified by the same UUID as the corresponding auth user.
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  full_name text,
  telegram_handle text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Announcements table.  Each announcement belongs to a user and can
-- optionally include a geographic location.  A status field
-- reflects whether the entry has been moderated.  We recommend
-- storing the latitude/longitude coordinates as a PostGIS geography
-- point to enable distance queries.
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  -- user_id references the owner of the announcement.  It is optional
  -- because the web client may insert announcements before the user
  -- has authenticated.  For authenticated users Supabase assigns
  -- auth.uid() automatically via RLS policies.
  user_id uuid references public.users (id) on delete cascade,
  title text not null,
  description text,
  -- Use geography(Point) to represent the announcement's location.
  location geography(Point),
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  created_at timestamp with time zone default now()
);

-- Index to speed up spatial queries on announcements (e.g. find
-- announcements near a given location).
create index if not exists announcements_location_idx
  on public.announcements using gist (location);

-- Badges table defines a set of achievements that users can earn.
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon_url text,
  created_at timestamp with time zone default now()
);

-- Link table assigning badges to users.  Ensures the same badge is
-- not awarded twice to the same user via a unique constraint.
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  awarded_at timestamp with time zone default now(),
  unique (user_id, badge_id)
);

-- Alerts table for global notifications.  You can use this table
-- together with Supabase Realtime broadcasts or a server‑side job to
-- send messages to all subscribed clients.
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  created_at timestamp with time zone default now(),
  sent boolean default false
);

-- Banners table stores the promotional banner displayed on the home
-- page.  The admin panel allows uploading and editing these
-- records; the front‑end always displays the most recent active
-- banner.
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  image_url text,
  link_url text,
  active boolean default true,
  created_at timestamp with time zone default now()
);

-- Row Level Security (RLS) policies.  These are optional but
-- recommended.  They allow you to control who can read and modify
-- data.  Below we enable RLS on our tables and provide minimal
-- policies that let any authenticated user read published
-- announcements and manage their own data.

-- Users table policies
alter table public.users enable row level security;
create policy "Users: Self select" on public.users
  for select using (auth.uid() = id);
create policy "Users: Self insert" on public.users
  for insert with check (auth.uid() = id);
create policy "Users: Self update" on public.users
  for update using (auth.uid() = id);

-- Announcements table policies
alter table public.announcements enable row level security;
-- Everyone can read published announcements
create policy "Announcements: Published read" on public.announcements
  for select using (status = 'published');
-- Owners can read their pending announcements too
create policy "Announcements: Owner read" on public.announcements
  for select using (auth.uid() = user_id);
-- Owners can insert new announcements
create policy "Announcements: Owner insert" on public.announcements
  for insert with check (auth.uid() = user_id);
-- Owners can update their announcements (e.g. edit or delete)
create policy "Announcements: Owner update" on public.announcements
  for update using (auth.uid() = user_id);
create policy "Announcements: Owner delete" on public.announcements
  for delete using (auth.uid() = user_id);

-- Badges and user_badges policies.  Only admins (identified via
-- jwt claims) should create or assign badges.  The policies below
-- restrict read access to all authenticated users and require
-- admin claims for writes.  Adjust the definition of
-- is_admin() according to your Auth configuration.

create function public.is_admin() returns boolean as $$
  select exists (
    select 1 from auth.users u
    where u.id = auth.uid() and (auth.role() = 'service_role' or auth.jwt()->>'role' = 'admin')
  );
$$ language sql stable;

alter table public.badges enable row level security;
create policy "Badges: Public read" on public.badges for select using (true);
create policy "Badges: Admin write" on public.badges for all using (public.is_admin());

alter table public.user_badges enable row level security;
create policy "User badges: Public read" on public.user_badges for select using (auth.uid() = user_id);
create policy "User badges: Admin insert" on public.user_badges for insert with check (public.is_admin());
create policy "User badges: Admin delete" on public.user_badges for delete using (public.is_admin());

-- Alerts table policies: only admins can insert alerts, everyone can read.
alter table public.alerts enable row level security;
create policy "Alerts: Public read" on public.alerts for select using (true);
create policy "Alerts: Admin write" on public.alerts for all using (public.is_admin());

-- Banners table policies: only admins manage banners, everyone reads active ones.
alter table public.banners enable row level security;
create policy "Banners: Public read" on public.banners for select using (active);
create policy "Banners: Admin write" on public.banners for all using (public.is_admin());