-- Run this in the Supabase SQL editor (SQL Editor -> New query) once the
-- project exists. `id` is a uuid, not sequential, so it's safe to use as the
-- public PORTFOLIO_ID baked into a deployed site's env vars — it's a lookup
-- key, not a secret, but shouldn't be guessable/enumerable either.

create table portfolios (
  id uuid primary key default gen_random_uuid(),
  template text not null,
  data jsonb not null,
  -- Only flips to true once a deployment actually succeeds (the server-side
  -- route that handles Vercel's redirect-url callback sets this, using the
  -- secret key, after seeing a real deployment-url come back) — not at the
  -- moment someone clicks "Deploy," which would leave abandoned/failed
  -- deploy attempts sitting publicly readable with no live site behind them.
  is_published boolean not null default false,
  -- Filled in alongside is_published, from Vercel's callback params — kept
  -- so the customer's live URL isn't only ever known transiently in that
  -- one query string on the /deployed success page.
  deployment_url text,
  created_at timestamptz not null default now()
);

-- Deployed portfolio sites read their own row using the public publishable
-- key, so RLS must allow that — but only for rows that are actually live,
-- and only reads. A draft still being edited (row exists but is_published is
-- false) is not readable through this key even if someone has the id, e.g.
-- from a leaked link or browser history — only a server-side call using the
-- secret key (which bypasses RLS entirely) can see it, same as inserts.
alter table portfolios enable row level security;

create policy "Published portfolios are publicly readable"
  on portfolios for select
  using (is_published = true);

-- RLS only controls row-level access — each role still needs base table
-- privileges first, and neither gets them automatically on this project.
-- Without these grants, both the secret key (service_role) and the
-- publishable key (anon) fail with "permission denied for table portfolios"
-- regardless of RLS policies or is_published.
grant select, insert, update, delete on public.portfolios to service_role;
grant select on public.portfolios to anon;
