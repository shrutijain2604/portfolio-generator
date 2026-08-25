// Saved a portfolio draft ahead of the old Vercel clone redirect. Rows are
// always created unpublished: supabase/schema.sql's RLS policy hides them from
// the publishable key until /deployed confirms a real deployment.

import { getSupabaseAdmin } from "@/lib/supabase";
import { sanitizePortfolioData, templates } from "@/lib/portfolioData";

const TEMPLATE_IDS = new Set(templates.map((t) => t.id));

// Empty, and permanently so. Every template now renders data/portfolio.js from
// its own repository and deploys through /api/github/create-repo, so no clone
// link should ever be built again: Vercel's clone flow cannot write a file, and
// would hand somebody a live site showing the sample portfolio.
//
// The route is kept because /live/[id] and /deployed still read the rows it
// wrote, for portfolios deployed before the handoff existed.
const TEMPLATE_REPOS = {};

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
      { error: "Deploying this template isn't available right now. Please pick another one." },
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
