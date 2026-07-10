// Trimmed down from the builder app's lib/portfolioData.js — this
// standalone site only ever renders one already-saved portfolio, so it
// needs the sanitize step (defends against stray blank rows saved before
// the builder's own sanitize pass existed) and SECTION_DEFINITIONS (read by
// LevelUpTemplate for section labels and its drag-order support), but none
// of the editor's default data or template registry.
//
// Kept in sync with the builder app's lib/portfolioData.js — the ids and
// labels must match exactly, since a draft's sectionOrder was written by
// the builder using these same ids.

export const SECTION_DEFINITIONS = [
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "achievements", label: "Achievements" },
  { id: "skills", label: "Skills" },
  { id: "codingProfiles", label: "Coding Profiles" },
];

function hasText(...values) {
  return values.some((v) => (v || "").trim().length > 0);
}

function normalizeSectionOrder(order) {
  const knownIds = SECTION_DEFINITIONS.map((s) => s.id);
  const kept = (order || []).filter((id) => knownIds.includes(id));
  const missing = knownIds.filter((id) => !kept.includes(id));
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
