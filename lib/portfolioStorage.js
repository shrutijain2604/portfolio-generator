// Shared with both the editor (which writes on every change) and the
// standalone preview route (which only reads) — the preview page has no
// other way to see a user's in-progress draft, since nothing is persisted
// to the database until "Deploy my portfolio" is clicked.
import { defaultPortfolioData, normalizeSectionOrder } from "./portfolioData";

export const PORTFOLIO_STORAGE_KEY = "dev-portfolio-builder:data";

// Returns the saved draft merged over the schema defaults, or null if
// there's no draft yet, it's corrupted, or localStorage isn't available
// (e.g. during server rendering).
export function loadStoredPortfolioData() {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    // A draft saved before a schema field existed (e.g. codingProfiles)
    // won't have it — default missing arrays to empty rather than
    // undefined, or every `.map()` on that field throws.
    return {
      ...defaultPortfolioData,
      ...parsed,
      codingProfiles: parsed.codingProfiles || [],
      sectionOrder: normalizeSectionOrder(parsed.sectionOrder),
    };
  } catch {
    return null;
  }
}

// Used by the preview pages' theme switcher — a change made there needs to
// land back in the same draft the editor reads/writes, so switching back to
// the editor tab shows it too, without a live cross-tab sync mechanism.
export function saveStoredPortfolioData(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(data));
}
