// Saves a portfolio draft ahead of the Vercel deploy redirect. Always
// created unpublished — supabase/schema.sql's RLS policy means the row is
// invisible to the public publishable key (and so to any deployed site)
// until the /deployed callback confirms a real deployment and flips
// is_published, not at the moment this route is hit.
//
// Also builds the Vercel clone URL here rather than in the browser: it
// needs NEXT_PUBLIC_SUPABASE_URL/PUBLISHABLE_KEY baked into the deployed
// project's own env vars (same values for every customer, since every
// deployed site reads from this one database) alongside the per-customer
// PORTFOLIO_ID, and this is the one place that already has the
// repository-url -> template mapping without duplicating it client-side.

import { getSupabaseAdmin } from "@/lib/supabase";
import { sanitizePortfolioData, templates } from "@/lib/portfolioData";

const TEMPLATE_IDS = new Set(templates.map((t) => t.id));

// TODO: each remaining template needs its own templates/<id>/ subdirectory
// (standalone Next.js app, same pattern as templates/terminal/) pushed to
// the repo before it can go here. Maps to null until that exists — the
// route below refuses to build a deploy link rather than send someone to a
// broken clone.
const TEMPLATE_REPOS = {
  changelog: "https://github.com/shrutijain2604/portfolio-generator/tree/master/templates/changelog",
  terminal: "https://github.com/shrutijain2604/portfolio-generator/tree/master/templates/terminal",
  editorial: "https://github.com/shrutijain2604/portfolio-generator/tree/master/templates/editorial",
  warm: "https://github.com/shrutijain2604/portfolio-generator/tree/master/templates/warm",
  dashboard: "https://github.com/shrutijain2604/portfolio-generator/tree/master/templates/dashboard",
  "level-up": null,
  "retro-desktop": null,
  scrapbook: null,
  spotify: null,
};

export async function POST(request) {
  const body = await request.json();
  const { template, data, origin } = body || {};

  if (!TEMPLATE_IDS.has(template)) {
    return Response.json({ error: "Unknown template." }, { status: 400 });
  }
  if (!data || typeof data !== "object") {
    return Response.json({ error: "Missing portfolio data." }, { status: 400 });
  }

  const repoUrl = TEMPLATE_REPOS[template];
  if (!repoUrl) {
    return Response.json(
      { error: "Deploying this template isn't set up yet — its standalone repo doesn't exist." },
      { status: 501 }
    );
  }

  const { data: row, error } = await getSupabaseAdmin()
    .from("portfolios")
    .insert({ template, data: sanitizePortfolioData(data), is_published: false })
    .select("id")
    .single();

  if (error) {
    console.error("save portfolio draft error:", error.message);
    return Response.json({ error: "Couldn't save your portfolio — please try again." }, { status: 500 });
  }

  const deployUrl = new URL("https://vercel.com/new/clone");
  deployUrl.searchParams.set("repository-url", repoUrl);
  deployUrl.searchParams.set("env", "PORTFOLIO_ID,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  deployUrl.searchParams.set(
    "envDefaults",
    JSON.stringify({
      PORTFOLIO_ID: row.id,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    })
  );
  deployUrl.searchParams.set("redirect-url", `${origin}/deployed?portfolioId=${row.id}`);

  return Response.json({ id: row.id, deployUrl: deployUrl.toString() });
}
