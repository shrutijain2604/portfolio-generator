// Read-only — this site only ever reads its own row (gated by is_published
// via RLS, see the builder repo's supabase/schema.sql). No secret key here;
// it never needs to write anything.

import { createClient } from "@supabase/supabase-js";

let client;

export function getSupabase() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );
  }
  return client;
}
