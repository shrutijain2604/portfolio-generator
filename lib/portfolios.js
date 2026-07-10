// Shared between the /api/portfolios/[id]/publish route (kept for any
// future client-side use) and the /deployed page (a Server Component, which
// calls this directly rather than fetching its own API route over HTTP).
//
// Known limitation: nothing here cryptographically confirms deploymentUrl
// really came from Vercel's redirect (no Integration, no signed callback —
// see the earlier discussion on skipping the Marketplace flow). Requiring
// the URL to look like a *.vercel.app deployment is a sanity filter against
// stray/malformed calls, not real verification. Worst case if abused: a
// draft becomes readable slightly earlier than it should — same category of
// exposure is_published exists to limit, just not fully closed. Acceptable
// for now; would need a real verification step before this matters at scale.

import { getSupabaseAdmin } from "./supabase";

export async function publishPortfolio(id, deploymentUrl) {
  let hostname;
  try {
    hostname = new URL(deploymentUrl).hostname;
  } catch {
    return { ok: false, error: "Invalid deployment URL." };
  }
  if (!hostname.endsWith(".vercel.app")) {
    return { ok: false, error: "Deployment URL doesn't look like a Vercel deployment." };
  }

  const { error } = await getSupabaseAdmin()
    .from("portfolios")
    .update({ is_published: true, deployment_url: deploymentUrl })
    .eq("id", id);

  if (error) {
    console.error("publish portfolio error:", error.message);
    return { ok: false, error: "Couldn't publish your portfolio." };
  }

  return { ok: true };
}
