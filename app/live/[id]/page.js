// Validates the runtime-fetch pipeline for one template (Terminal) before
// every template gets converted. In the final architecture, each template
// lives in its own standalone repo whose single page reads a fixed
// PORTFOLIO_ID from an env var, set once at deploy time via Vercel's clone
// flow. Here, inside the shared builder repo, the id is a route param
// instead so different sample rows can be tested without redeploying.
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { sanitizePortfolioData } from "@/lib/portfolioData";
import TerminalTemplate from "@/components/templates/TerminalTemplate";

export const dynamic = "force-dynamic";

export default async function LivePortfolioPage({ params }) {
  const { id } = await params;

  const { data: row, error } = await getSupabase()
    .from("portfolios")
    .select("data")
    .eq("id", id)
    .single();

  if (error) console.error("live portfolio fetch error:", error.message);

  if (!row) {
    notFound();
  }

  return <TerminalTemplate data={sanitizePortfolioData(row.data)} />;
}
