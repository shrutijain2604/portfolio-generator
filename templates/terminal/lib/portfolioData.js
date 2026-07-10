// Trimmed down from the builder app's lib/portfolioData.js — this
// standalone site only ever renders one already-saved portfolio, so it
// needs the sanitize step (defends against stray blank rows saved before
// the builder's own sanitize pass existed) but none of the editor's default
// data or template registry.

function hasText(...values) {
  return values.some((v) => (v || "").trim().length > 0);
}

// Kept in sync with the builder app's lib/portfolioData.js — must match
// exactly, since a draft's sectionOrder was written by the builder using
// these same ids.
const SECTION_IDS = ["experience", "projects", "education", "achievements", "skills", "codingProfiles"];

function normalizeSectionOrder(order) {
  const kept = (order || []).filter((id) => SECTION_IDS.includes(id));
  const missing = SECTION_IDS.filter((id) => !kept.includes(id));
  return [...kept, ...missing];
}

export function sanitizePortfolioData(data) {
  return {
    ...data,
    experience: (data.experience || []).filter((job) => hasText(job.company, job.role)),
    education: (data.education || []).filter((edu) => hasText(edu.school, edu.degree)),
    projects: (data.projects || []).filter((p) => hasText(p.name, p.description)),
    codingProfiles: (data.codingProfiles || []).filter((p) => hasText(p.platform, p.url)),
    sectionOrder: normalizeSectionOrder(data.sectionOrder),
  };
}
