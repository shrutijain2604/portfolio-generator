// The only page this site has. PORTFOLIO_ID is fixed per deployment — set
// once, as an env var, when the customer went through Vercel's clone flow
// (see the builder repo's app/api/portfolios/route.js for how the deploy
// link is constructed). Unlike the builder's /live/[id] validation route,
// there's no dynamic segment here: one deployment is permanently one
// portfolio.
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { sanitizePortfolioData } from "@/lib/portfolioData";
import LevelUpTemplate from "@/components/LevelUpTemplate";

export const dynamic = "force-dynamic";

export default async function Page() {
  const id = process.env.PORTFOLIO_ID;
  if (!id) notFound();

  const { data: row } = await getSupabase().from("portfolios").select("data").eq("id", id).single();
  if (!row) notFound();

  return <LevelUpTemplate data={sanitizePortfolioData(row.data)} />;
}
