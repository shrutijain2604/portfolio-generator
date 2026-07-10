// Two separate clients, deliberately not one:
// - getSupabase() uses the public publishable key (anon role). Safe to
//   expose, RLS restricts it to reading published portfolios only.
// - getSupabaseAdmin() uses the secret key (service_role), which bypasses
//   RLS entirely. Only ever used from trusted server-side routes that create
//   drafts or flip is_published — never sent to the browser.
// See supabase/schema.sql for the RLS policy and role grants both rely on.

import { createClient } from "@supabase/supabase-js";

// Created lazily, on first actual use, instead of at module load — building
// a client eagerly at the top level throws if the env vars aren't set yet,
// which crashes the whole Next.js build (even for routes that only need it
// at request time) rather than just failing the one request that needs it.
let client;
let adminClient;

export function getSupabase() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );
  }
  return client;
}

export function getSupabaseAdmin() {
  if (!adminClient) {
    adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
  }
  return adminClient;
}
