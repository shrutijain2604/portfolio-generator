// Shared data shape every template reads from. Templates never own state —
// they're pure render functions of this object, which is what lets the
// editor swap templates instantly without losing the user's input.

// The content sections a customer can freely reorder. Intro (name/role/bio/
// contact) and the closing contact CTA are deliberately not in this list —
// every template design anchors those first/last, so letting them be
// dragged into the middle would just produce broken-looking layouts.
export const SECTION_DEFINITIONS = [
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "achievements", label: "Achievements" },
  { id: "skills", label: "Skills" },
  { id: "codingProfiles", label: "Coding Profiles" },
];

// Matches each template's original hardcoded order, so a draft that
// predates this feature (no sectionOrder saved) renders exactly as before.
export const DEFAULT_SECTION_ORDER = ["skills", "codingProfiles", "experience", "education", "achievements", "projects"];

// Guarantees every known section id appears exactly once — defends against
// a draft saved before a new section type existed (missing id) or one saved
// with a since-removed id (stale id), either of which would otherwise make
// a section silently never render, or a reorder-list row that maps to
// nothing.
export function normalizeSectionOrder(order) {
  const knownIds = SECTION_DEFINITIONS.map((s) => s.id);
  const kept = (order || []).filter((id) => knownIds.includes(id));
  const missing = knownIds.filter((id) => !kept.includes(id));
  return [...kept, ...missing];
}

export const defaultPortfolioData = {
  name: "Ada Lovelace",
  role: "Full-Stack Engineer",
  bio: "I build fast, accessible web apps and occasionally write an algorithm a century ahead of the hardware it needs.",
  email: "ada@example.com",
  photoUrl: "/default-photo.jpg",
  sectionOrder: DEFAULT_SECTION_ORDER,
  // Only consulted by templates that define a palette set (see
  // lib/palettes.js) — every other template ignores it entirely, and a
  // template with palettes falls back to its own default for an id it
  // doesn't recognize, so this being stale after a template switch is safe.
  paletteId: "heritage",
  links: {
    github: "github.com/ada",
    linkedin: "linkedin.com/in/ada",
    website: "ada.dev",
  },
  skills: ["JavaScript", "React", "Node.js", "PostgreSQL", "Python"],
  codingProfiles: [
    { platform: "LeetCode", url: "leetcode.com/ada" },
    { platform: "Codeforces", url: "codeforces.com/profile/ada" },
  ],
  experience: [
    {
      company: "Analytical Engines Inc.",
      role: "Senior Engineer",
      start: "2023",
      end: "Present",
      image: "",
      bullets: [
        "Led migration to a distributed job scheduler, cutting batch runtime 40%",
        "Mentored 3 junior engineers through their first production incidents",
      ],
    },
    {
      company: "Babbage Systems",
      role: "Software Engineer",
      start: "2021",
      end: "2023",
      image: "",
      bullets: [
        "Built the first punched-card CI pipeline",
        "Shipped the internal design system used by 6 product teams",
      ],
    },
  ],
  education: [
    {
      school: "Stanford University",
      degree: "BSc Computer Science",
      start: "2015",
      end: "2019",
    },
  ],
  achievements: [
    "Speaker, Analytical Engines Conf 2024 — \"Scheduling at Scale\"",
    "Runner-up, National Collegiate Programming Contest, 2018",
  ],
  projects: [
    {
      name: "notation-engine",
      version: "2.4.0",
      status: "Active",
      image: "",
      description:
        "A DSL for describing computational sequences, with a compiler that targets both JS and WASM.",
      tags: ["typescript", "compilers", "wasm"],
      link: "github.com/ada/notation-engine",
      demo: "notation-engine.dev",
      highlights: [
        "Custom parser + AST, no external parser-generator dependency",
        "WASM backend cut execution time 12x versus the JS interpreter",
        "400+ stars, used in 3 university compiler courses",
      ],
    },
    {
      name: "diff-viewer",
      version: "1.0.3",
      status: "Active",
      image: "",
      description: "Lightweight side-by-side diff viewer for the browser, embeddable in 5 minutes.",
      tags: ["react", "dom"],
      link: "github.com/ada/diff-viewer",
      demo: "diff-viewer.ada.dev",
      highlights: [
        "Zero-dependency core, renders diffs for files up to 50k lines",
        "Published on npm, 8k weekly downloads",
      ],
    },
    {
      name: "punchcard-cli",
      version: "0.9.1",
      status: "Archived",
      image: "",
      description: "A joke CLI that formats your terminal output as 19th-century punch cards.",
      tags: ["rust", "cli"],
      link: "github.com/ada/punchcard-cli",
      demo: "",
      highlights: ["Built in a weekend, briefly trended on a Rust subreddit"],
    },
  ],
};

export const templates = [
  {
    id: "changelog",
    name: "Changelog",
    description: "Experience as commit history, projects as a package registry.",
    locked: false,
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "A CLI-styled portfolio you navigate like a shell session.",
    locked: false,
  },
  {
    id: "editorial",
    name: "Editorial Minimal",
    description: "A calm, magazine-style profile — serif headlines, generous whitespace, projects as case studies.",
    locked: false,
  },
  {
    id: "warm",
    name: "Warm & Personal",
    description: "A friendly, conversational profile — real photo, warm tone, timeline-style story.",
    locked: false,
  },
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Metrics-and-widgets layout, like an internal admin panel.",
    locked: false,
  },
  {
    id: "level-up",
    name: "Level Up",
    description: "Playful game-HUD framing — XP, stat sheet, achievements unlocked.",
    locked: false,
    tag: "Playful — best for game/creative-tech roles",
  },
  {
    id: "retro-desktop",
    name: "Retro Desktop",
    description: "A nostalgic fake desktop — folder icons, a Resume.txt, windows already open.",
    locked: false,
    tag: "Playful — best for indie/creative/game-dev roles",
  },
  {
    id: "scrapbook",
    name: "Digital Scrapbook",
    description: "Sticky notes, polaroids, and a hand-drawn timeline — feels like flipping through a real notebook.",
    locked: false,
  },
  {
    id: "spotify",
    name: "Artist Profile",
    description: "Projects as a discography, skills as a playlist, experience as your listening history.",
    locked: false,
  },
];

export function getTemplate(id) {
  return templates.find((t) => t.id === id);
}

function hasText(...values) {
  return values.some((v) => (v || "").trim().length > 0);
}

// Templates decide things like "show Experience, or fall back to Education"
// by checking array length — so a row the user added via "+ Add experience"
// but hasn't (or won't) fill in must never reach a template as a stub, or it
// both counts as "has experience" and renders with blank text. Strip those
// before rendering; the raw, unfiltered data still goes to the form so an
// in-progress blank row doesn't disappear out from under someone mid-edit.
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
