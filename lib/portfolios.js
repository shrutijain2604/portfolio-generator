// Shared between the /api/portfolios/[id]/publish route and the /deployed page,
// a Server Component that calls this directly rather than over HTTP.
//
// Known limitation: nothing confirms deploymentUrl really came from Vercel.
// Requiring a *.vercel.app shape is a sanity filter, not verification. Worst
// case, a draft becomes readable slightly earlier than it should. Would need a
// real verification step before it matters at scale.

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
