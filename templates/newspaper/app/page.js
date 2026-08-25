// Your site's one page. It renders at build time from data/portfolio.js, so
// there is no database behind it, no API key to set and nothing to configure:
// edit that file, commit, and the site rebuilds itself.
//
// Edit data/portfolio.js rather than this file. Entries left blank are dropped
// instead of rendering as empty rows, and a section missing from sectionOrder
// is added back at the end, so the page holds together while you work on it.
import portfolio from "@/data/portfolio";
import { sanitizePortfolioData } from "@/lib/portfolioData";
import NewspaperTemplate from "@/components/NewspaperTemplate";

export default function Page() {
  return <NewspaperTemplate data={sanitizePortfolioData(portfolio)} />;
}
