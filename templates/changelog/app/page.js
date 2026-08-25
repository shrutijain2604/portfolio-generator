// The only page this site has, and it reads its content from the repository
// it lives in: data/portfolio.js, right next to this file.
//
// That file is the whole portfolio. Editing it and committing is the entire
// update process, which is the point: the person who owns this repo owns
// their content outright and needs nothing and nobody else to change it.
//
// Deliberately not a database read. This site used to fetch its content at
// request time from the builder's Supabase project using a PORTFOLIO_ID env
// var, which meant three things that should never have been true of a site
// handed to somebody: the repo contained none of their data, they had no way
// to edit it, and the site stopped working the moment that database did.
//
// Nothing is fetched, so nothing can fail at request time and the page is
// prerendered at build.
import portfolio from "@/data/portfolio";
import { sanitizePortfolioData } from "@/lib/portfolioData";
import ChangelogTemplate from "@/components/ChangelogTemplate";

export default function Page() {
  // Still sanitized, and now for a better reason than before: this file is
  // hand-edited, so a half-finished entry left behind mid-edit is a normal
  // thing to encounter rather than a leftover from the builder.
  return <ChangelogTemplate data={sanitizePortfolioData(portfolio)} />;
}
