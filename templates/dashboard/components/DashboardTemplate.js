// Pure presentational component: renders portfolio `data` only, holding no
// state of its own. The two interactive pieces (the timeline crosshair, the
// scroll-spy rail) are isolated client components.
//
// An operations console for one service, where the service is the person. One
// shared time axis holds it together: the Timeline panel lays every dated
// thing onto one year scale the visitor can scrub, and each Experience and
// Education row carries the same axis as a hairline bar, so a role's position
// in the page and in the career read as the same fact.
//
// Every number is an aggregate of entered data: years from typed dates, the
// concurrency strip from overlapping spans, the coverage matrix a real
// incidence table of tags against projects. No invented metrics, and a tile
// with no genuine value behind it does not render at all.
//
// No photo: photoUrl is only offered for warm/scrapbook/spotify (see
// EditForm.js), so the monogram plate is built from the name instead.

import { Archivo, Azeret_Mono } from "next/font/google";
import { SECTION_DEFINITIONS } from "@/lib/portfolioData";
import { DASHBOARD_PALETTES, getPalette } from "@/lib/palettes";
import {
  IconGithub,
  IconLinkedin,
  IconLink,
  IconMail,
  dotColor,
  initials,
  stripProtocol,
  parseYear,
  shade,
  tint,
} from "./shared";
import ConsoleRail from "./ConsoleRail";
import ConsoleTimeline from "./ConsoleTimeline";
import LiveSynced from "./LiveSynced";
import RevealOnScroll from "./RevealOnScroll";

// Archivo carries every label and every line of prose: a grotesque with tight,
// engineered sidebearings that holds up at 10px in a panel header, which is
// where most of this template's type actually lives. Azeret Mono carries every
// number, year, and axis tick, and nothing else, so the numeric register stays
// unmistakably instrument-like. Two faces, one job each.
const display = Archivo({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--dash-display" });
const mono = Azeret_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--dash-mono" });

const SECTION_DEFS = Object.fromEntries(SECTION_DEFINITIONS.map((s) => [s.id, s]));

// Sections that always want a full row. The rest can share one, but only with
// a neighbour of comparable size: see sectionWeight below.
const FULL_WIDTH_SECTIONS = new Set(["experience", "projects"]);

// Two panels sharing a row read as one band only if they end up roughly the
// same height. Judged two ways, because either alone gets a case wrong: a few
// rows of slack is invisible whatever the ratio says (a one-row Skills panel
// beside a two-row Profiles panel is fine at 2x), while a tall panel has to
// match proportionally (a 38-chip Skills panel beside three Achievements notes
// is not, and the hole under the shorter one is exactly the defect that
// pairing exists to avoid). Failing both, each panel takes its own full row.
const MAX_PAIR_GAP = 3;
const MAX_PAIR_RATIO = 1.8;

// Status colors are a semantic convention (green means running), not a brand
// choice, so they stay fixed rather than following the chosen palette, exactly
// as a real dashboard's success and warning colors do.
function statusColor(status) {
  const s = (status || "").toLowerCase();
  if (s === "active") return "#10b981";
  if (s === "archived") return "#94a3b8";
  return "#f59e0b";
}

function countBy(items, keyFn) {
  const counts = new Map();
  (items || []).forEach((item) => {
    const key = keyFn(item);
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

// Palette colors are always "#rrggbb" (see lib/palettes.js), so plain hex
// parsing is enough here, unlike shared.js's helpers, which also have to cope
// with the hsl() strings dotColor() returns for unrecognized labels.
function isDarkColor(hex) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean, 16);
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

function lift(color, percent) {
  return `color-mix(in srgb, ${color}, white ${percent}%)`;
}

// Small colored text has to clear WCAG AA against the palette's own canvas,
// and several PALETTE entries land under 4.5:1 raw. Every hue used as *text*
// goes through here first; hues used as a swatch, a rule, or a bar fill do not.
function inkOn(color, isDark) {
  return isDark ? lift(color, 36) : shade(color, 46);
}

function plural(count, one, many) {
  return `${count} ${count === 1 ? one : many}`;
}

// A year range as the console prints it. An arrow rather than a dash: this
// repo does not use en or em dashes, and "2021 → Present" reads as a window
// that is still open, which a hyphen does not.
function rangeLabel(start, end) {
  if (start && end) return `${start} → ${end}`;
  return start || end || "";
}

function IconPulse(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12h4l2.5-6 4 12L16 12h5" />
    </svg>
  );
}

function IconAxis(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4v16h16" />
      <path d="M8 15h6M8 11h10M8 7h4" />
    </svg>
  );
}

function IconGrid(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M9 3.5v17M15 3.5v17M3.5 9h17M3.5 15h17" />
    </svg>
  );
}

function IconBriefcase(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconGraduationCap(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
    </svg>
  );
}

function IconStack(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  );
}

function IconChip(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />
      <path d="M10 3v3.5M14 3v3.5M10 17.5V21M14 17.5V21M3 10h3.5M3 14h3.5M17.5 10H21M17.5 14H21" />
    </svg>
  );
}

function IconFlag(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 21V4M5 4h11l-1.5 4L16 12H5" />
    </svg>
  );
}

function IconArrowOut(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

const SECTION_ICONS = {
  experience: IconBriefcase,
  education: IconGraduationCap,
  projects: IconStack,
  skills: IconChip,
  codingProfiles: IconLink,
  achievements: IconFlag,
};

// One <style> for the whole template, rendered once at the root, rather than
// two copies of a rule in two globals.css files that can drift apart. Every
// autoplaying animation sits inside `prefers-reduced-motion: no-preference`,
// so a reduced-motion preference never matches the rule at all and the
// un-animated element is already in its finished state: nothing is left
// half-hidden and no JS media query is involved.
const TEMPLATE_CSS = `
.dash-root { font-family: var(--dash-display), ui-sans-serif, system-ui, sans-serif; }
.dash-mono {
  font-family: var(--dash-mono), ui-monospace, SFMono-Regular, Menlo, monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
.dash-label {
  font-family: var(--dash-mono), ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.dash-tight { letter-spacing: -0.035em; }
.dash-focus:focus-visible {
  outline: 2px solid var(--dash-accent);
  outline-offset: 2px;
  border-radius: 4px;
}
.dash-scroll { scrollbar-width: thin; scrollbar-color: var(--dash-rule-strong) transparent; }

.dash-panel {
  position: relative;
  border-radius: 10px;
  border: 1px solid var(--dash-rule);
  background: var(--dash-surface);
  box-shadow: var(--dash-shadow);
  transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 220ms ease-out, border-color 220ms ease-out;
}
.dash-panel:hover, .dash-panel:focus-within {
  transform: translate3d(0, -2px, 0);
  border-color: var(--dash-rule-strong);
  box-shadow: var(--dash-shadow-lift);
}
/* A 1px top highlight, so every panel catches the same overhead light and
   reads as a raised plate rather than a flat outlined box. */
.dash-panel::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  border-radius: 10px 10px 0 0;
  background: var(--dash-sheen);
  pointer-events: none;
}
.dash-well {
  border-radius: 8px;
  background: var(--dash-well);
  box-shadow: inset 0 1px 0 var(--dash-inset), inset 0 0 0 1px var(--dash-rule);
}

.dash-rail-item {
  position: relative;
  display: flex;
  width: 5rem;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  border-radius: 8px;
  padding: 0.55rem 0.2rem;
  text-align: center;
  transition: background-color 180ms ease-out, color 180ms ease-out;
}
.dash-rail-mark {
  position: absolute;
  left: 0;
  top: 22%;
  bottom: 22%;
  width: 2px;
  border-radius: 0 2px 2px 0;
  transition: background-color 180ms ease-out;
}
.dash-rail-label {
  font-family: var(--dash-mono), ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 8.5px;
  line-height: 1.3;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  overflow-wrap: normal;
  word-break: normal;
  hyphens: none;
}

.dash-tick { flex: 1 1 0; min-width: 2px; max-width: 7px; border-radius: 1px; }
.dash-spark { flex: 1 1 0; min-width: 0; border-radius: 1px 1px 0 0; }

.dash-tl { --dash-label-w: 6.5rem; }
@media (min-width: 640px) { .dash-tl { --dash-label-w: 10.5rem; } }
.dash-tl-row {
  display: grid;
  grid-template-columns: var(--dash-label-w) minmax(0, 1fr);
  align-items: center;
  height: 2.35rem;
}
.dash-tl-overlay { position: absolute; left: var(--dash-label-w); right: 0; top: 0; bottom: 0; pointer-events: none; }
.dash-tl-cursor { position: absolute; top: 0; bottom: 0; border-left: 1px solid; border-right: 1px solid; }
.dash-tl-track { position: relative; height: 1.6rem; overflow: hidden; border-radius: 4px; }
.dash-tl-bar {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  min-width: 3px;
  overflow: hidden;
  border-radius: 3px;
  border-left: 2px solid;
  padding: 0 0.4rem;
  transform-origin: left center;
  transition: background-color 180ms ease-out, opacity 180ms ease-out;
}
.dash-tl-bar-text { font-size: 10.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dash-tl-strip { display: flex; align-items: flex-end; gap: 1px; overflow: hidden; height: 1.6rem; border-radius: 4px; }
.dash-tl-col { flex: 1 1 0; min-width: 0; border-radius: 1px 1px 0 0; transform-origin: bottom center; transition: background-color 180ms ease-out; }
.dash-tl-axis { height: 1.4rem; align-items: flex-end; border-top: 1px solid; padding-top: 0.4rem; margin-top: 0.3rem; }

.dash-matrix { width: 100%; border-collapse: separate; border-spacing: 2px; }
.dash-matrix th, .dash-matrix td { padding: 0; }
.dash-cell { display: block; height: 1.15rem; border-radius: 2px; }

@keyframes dash-in { from { opacity: 0; transform: translate3d(0, 12px, 0); } to { opacity: 1; transform: none; } }
@keyframes dash-grow { from { opacity: 0; transform: scaleX(0.03); } to { opacity: 1; transform: none; } }
@keyframes dash-rise { from { opacity: 0; transform: scaleY(0.06); } to { opacity: 1; transform: none; } }
@keyframes dash-led { 0%, 100% { opacity: 0.55; transform: scale(1); } 50% { opacity: 0; transform: scale(2.1); } }

@media (prefers-reduced-motion: no-preference) {
  .dash-arrive > * { animation: dash-in 520ms cubic-bezier(0.16, 1, 0.3, 1) both; }
  .dash-arrive > *:nth-child(2) { animation-delay: 70ms; }
  .dash-arrive > *:nth-child(3) { animation-delay: 140ms; }
  .dash-arrive > *:nth-child(4) { animation-delay: 210ms; }
  .dash-arrive > *:nth-child(5) { animation-delay: 280ms; }
  .dash-arrive > *:nth-child(6) { animation-delay: 350ms; }
  .dash-tl-bar { animation: dash-grow 640ms cubic-bezier(0.16, 1, 0.3, 1) both; }
  .dash-tl-col { animation: dash-rise 520ms cubic-bezier(0.16, 1, 0.3, 1) both; }
  .dash-led { animation: dash-led 2.6s ease-in-out infinite; }
}
@media (prefers-reduced-motion: reduce) {
  .dash-panel { transition-duration: 1ms; }
  .dash-panel:hover, .dash-panel:focus-within { transform: none; }
}
`;

// The console's ground: a hairline measurement grid and one soft pool of the
// palette's own primary, fixed under the viewport so the page reads as content
// laid on an instrument surface rather than a document on white. Fixed and
// clipped by its own wrapper, so it can never widen the document, and it is
// the light source the panel highlights are consistent with.
function Backdrop({ colors, isDark }) {
  const line = tint(colors.INK, isDark ? 7 : 5);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
          backgroundSize: "38px 38px",
          maskImage: "radial-gradient(120% 90% at 20% 0%, black 30%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(120% 90% at 20% 0%, black 30%, transparent 78%)",
        }}
      />
      <div
        className="absolute -left-[10%] -top-[22%] h-[70vh] w-[70vw]"
        style={{ background: `radial-gradient(closest-side, ${tint(colors.PALETTE[0], isDark ? 20 : 12)}, transparent)` }}
      />
    </div>
  );
}

function Panel({ id, title, icon: Icon, meta, accent, colors, children, className = "", bodyClassName = "p-4 sm:p-5" }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`dash-panel flex h-full min-w-0 flex-col scroll-mt-24 ${className}`}
    >
      <header
        className="flex items-center gap-2.5 border-b px-4 py-2.5"
        style={{ borderColor: colors.RULE }}
      >
        {Icon ? (
          <span className="shrink-0" style={{ color: accent }}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
        )}
        <h2 id={`${id}-title`} className="dash-label min-w-0 truncate" style={{ color: colors.INK }}>
          {title}
        </h2>
        {meta && (
          <span className="dash-mono ml-auto shrink-0 text-[10px]" style={{ color: colors.MUTED }}>
            {meta}
          </span>
        )}
      </header>
      <div className={`min-w-0 flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

// One tick per real item: a count you can also read at a glance, and for
// projects a status breakdown, without a single derived percentage.
function Ticks({ items }) {
  return (
    <div className="mt-3 flex h-1.5 gap-[2px]" aria-hidden="true">
      {items.slice(0, 28).map((item, i) => (
        <span key={`${item.key}-${i}`} className="dash-tick" style={{ backgroundColor: item.color }} />
      ))}
    </div>
  );
}

function Spark({ values, peak, color, empty }) {
  return (
    <div className="mt-3 flex h-4 items-end gap-[2px]" aria-hidden="true">
      {values.map((value, i) => (
        <span
          key={i}
          className="dash-spark"
          style={{
            height: `${Math.max(value / peak, 0.08) * 100}%`,
            backgroundColor: value === 0 ? empty : color,
          }}
        />
      ))}
    </div>
  );
}

// Cells of one strip rather than free-floating cards: a cell always divides
// the width it is given, so a portfolio with one real metric and one with four
// both produce a filled readout row instead of a stranded card beside a void.
function Tile({ label, value, note, accent, colors, chart, rule }) {
  return (
    <div className="min-w-[11rem] flex-1 border-l p-4 first:border-l-0" style={{ borderColor: rule }}>
      <p className="dash-label break-words" style={{ color: colors.MUTED }}>
        {label}
      </p>
      <p className="dash-mono dash-tight mt-2 text-[2rem] font-semibold leading-none" style={{ color: colors.INK }}>
        {value}
      </p>
      {note && (
        <p className="dash-mono mt-1.5 break-words text-[10px] leading-tight" style={{ color: colors.MUTED }}>
          {note}
        </p>
      )}
      {chart}
      <div className="mt-3 h-[2px] w-8 rounded-full" style={{ backgroundColor: accent }} />
    </div>
  );
}

export default function DashboardTemplate({ data }) {
  const {
    name,
    role,
    bio,
    email,
    links,
    skills,
    codingProfiles,
    experience,
    education,
    achievements,
    projects,
    sectionOrder,
  } = data;

  const palette = getPalette("dashboard", data.paletteId) || DASHBOARD_PALETTES[0];
  const { PAPER, INK, INK_SOFT, MUTED, ACCENT, POP, PALETTE } = palette.colors;
  const isDark = isDarkColor(PAPER);

  // The surface system. A panel is lighter than its canvas and a well is
  // darker than the panel, in both modes, which is what makes a recessed
  // chart read as recessed whether the customer picked Midnight or Amber.
  const RULE = tint(INK, isDark ? 13 : 11);
  const RULE_STRONG = tint(INK, isDark ? 26 : 20);
  const SURFACE = isDark ? lift(PAPER, 5) : lift(PAPER, 74);
  const WELL = isDark ? shade(PAPER, 34) : `color-mix(in srgb, ${INK} 4%, ${SURFACE})`;
  const RAIL_BG = isDark ? shade(PAPER, 22) : `color-mix(in srgb, ${INK} 3%, ${PAPER})`;
  const SHEEN = tint(INK, isDark ? 18 : 0);
  const colors = { ...palette.colors, RULE, RULE_STRONG, SURFACE, WELL };

  // Shadows only carry depth on a light canvas. On a dark one the same values
  // are invisible, so the raised edge comes from the 1px top highlight
  // instead, and the shadow shrinks to a contact edge.
  const SHADOW = isDark
    ? `0 1px 0 ${tint(INK, 4)}, 0 18px 34px -26px rgba(0,0,0,0.9)`
    : `0 1px 2px ${tint(INK, 5)}, 0 16px 30px -22px ${tint(INK, 26)}`;
  const SHADOW_LIFT = isDark
    ? `0 1px 0 ${tint(INK, 7)}, 0 26px 46px -24px rgba(0,0,0,0.95)`
    : `0 2px 4px ${tint(INK, 7)}, 0 26px 44px -20px ${tint(INK, 32)}`;

  const railTheme = {
    ink: INK,
    muted: MUTED,
    accent: ACCENT,
    rule: RULE,
    railBg: RAIL_BG,
    palette: PALETTE,
  };

  // Every dated thing the customer entered, on one axis. Rows whose dates do
  // not parse into years are left out of the chart (they cannot be placed
  // honestly) but still render in full in their own panel below.
  const spans = [
    ...(experience || []).map((job, i) => ({
      id: `role-${i}`,
      title: job.role || job.company,
      sub: job.company || job.role,
      start: parseYear(job.start),
      end: parseYear(job.end) ?? parseYear(job.start),
      kind: "role",
      color: PALETTE[i % PALETTE.length],
    })),
    ...(education || []).map((edu, i) => ({
      id: `study-${i}`,
      title: edu.degree || edu.school,
      sub: edu.school || edu.degree,
      start: parseYear(edu.start),
      end: parseYear(edu.end) ?? parseYear(edu.start),
      kind: "study",
      color: PALETTE[(PALETTE.length - 1 - (i % PALETTE.length)) % PALETTE.length],
    })),
  ]
    .filter((span) => span.start && span.end && span.end >= span.start)
    .map((span) => ({ ...span, ink: inkOn(span.color, isDark) }))
    .sort((a, b) => b.start - a.start || b.end - a.end);

  const domain = spans.length > 0
    ? { from: Math.min(...spans.map((s) => s.start)), to: Math.max(...spans.map((s) => s.end)) }
    : null;
  const timelineKinds = [
    spans.some((s) => s.kind === "role") && { kind: "role", label: "Roles", color: PALETTE[0] },
    spans.some((s) => s.kind === "study") && { kind: "study", label: "Study", color: PALETTE[PALETTE.length - 1] },
  ].filter(Boolean);

  // Concurrency per year: how many tracked spans overlap. Real overlap, which
  // is why it reads 1 for a linear career and 2 for someone who worked through
  // a degree, and why it is worth drawing at all.
  const yearLoad = domain
    ? Array.from({ length: domain.to - domain.from + 1 }, (_, i) =>
        spans.filter((s) => domain.from + i >= s.start && domain.from + i <= s.end).length
      )
    : [];
  const peakLoad = Math.max(1, ...yearLoad);

  // Years of experience as the number of years the roles actually touch, not
  // a sum of their durations. Summing is both wrong when two roles overlap
  // (it double counts the shared years) and useless when every role starts and
  // ends inside one calendar year, which the schema's year-only dates make
  // common: it computes zero for someone with four real jobs.
  const roleSpans = spans.filter((span) => span.kind === "role");
  const roleWindow = roleSpans.length > 0
    ? { from: Math.min(...roleSpans.map((s) => s.start)), to: Math.max(...roleSpans.map((s) => s.end)) }
    : null;
  const years = roleWindow ? roleWindow.to - roleWindow.from + 1 : 0;
  const companyCount = new Set((experience || []).map((job) => (job.company || "").trim().toLowerCase()).filter(Boolean)).size;
  const projectTags = (projects || []).flatMap((project) => project.tags || []);
  const tagCounts = countBy(projectTags, (tag) => tag);
  const tagUse = new Map(tagCounts);
  const technologies = [...new Set([...(skills || []), ...projectTags].map((t) => t.trim()).filter(Boolean))];
  const statusCounts = countBy(projects, (project) => project.status || "Unspecified");

  const tiles = [
    years > 0 && {
      label: "Years experience",
      value: years,
      note: roleWindow ? `${roleWindow.from} → ${roleWindow.to}` : null,
      chart: domain ? (
        <Spark values={yearLoad} peak={peakLoad} color={tint(PALETTE[0], isDark ? 55 : 45)} empty={tint(INK, 8)} />
      ) : null,
    },
    experience?.length > 0 && {
      label: "Roles",
      value: experience.length,
      note: companyCount > 0 ? plural(companyCount, "company", "companies") : null,
      chart: <Ticks items={experience.map((job, i) => ({ key: job.company || i, color: PALETTE[i % PALETTE.length] }))} />,
    },
    projects?.length > 0 && {
      label: "Projects",
      value: projects.length,
      note: statusCounts.map(([status, count]) => `${count} ${status.toLowerCase()}`).join(", "),
      chart: <Ticks items={projects.map((project, i) => ({ key: project.name || i, color: statusColor(project.status) }))} />,
    },
    technologies.length > 0 && {
      label: "Technologies",
      value: technologies.length,
      note: tagCounts.length > 0 ? `${tagCounts.length} tagged in projects` : `${skills?.length || 0} declared`,
      chart: <Ticks items={technologies.map((tech) => ({ key: tech, color: dotColor(tech) }))} />,
    },
  ].filter(Boolean);

  // Coverage matrix: a real incidence table of technology against project.
  // Only worth a panel when there is genuinely a grid to read, which means at
  // least two tagged projects and at least two distinct technologies.
  const taggedProjects = (projects || []).filter((project) => project.tags?.length > 0);
  const matrixRows = tagCounts.slice(0, 12);
  const showMatrix = taggedProjects.length >= 2 && matrixRows.length >= 2;

  const contactLinks = [
    email && { label: "Email", value: email, href: `mailto:${email}`, Icon: IconMail },
    links?.github && { label: "GitHub", value: stripProtocol(links.github), href: `https://${stripProtocol(links.github)}`, Icon: IconGithub },
    links?.linkedin && { label: "LinkedIn", value: stripProtocol(links.linkedin), href: `https://${stripProtocol(links.linkedin)}`, Icon: IconLinkedin },
    links?.website && { label: "Website", value: stripProtocol(links.website), href: `https://${stripProtocol(links.website)}`, Icon: IconLink },
  ].filter(Boolean);

  // A role or degree row carries the same axis as the Timeline panel above as
  // a hairline bar, so a row's position in the page and its position in the
  // career are visibly the same fact. Undated rows simply get no bar.
  function AxisBar({ start, end, color }) {
    const from = parseYear(start);
    const to = parseYear(end) ?? from;
    if (!domain || !from || !to || to < from) return null;
    const columns = domain.to - domain.from + 1;
    return (
      <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full" style={{ backgroundColor: tint(INK, 8) }} aria-hidden="true">
        <div
          className="h-full rounded-full"
          style={{
            marginLeft: `${((from - domain.from) / columns) * 100}%`,
            width: `${((to - from + 1) / columns) * 100}%`,
            backgroundColor: color,
          }}
        />
      </div>
    );
  }

  // Roughly how many text rows tall each panel will be, estimated from the
  // entered data. Used only to lay out the wall, never shown.
  const sectionWeight = {
    experience: (experience?.length || 0) * 3,
    projects: (projects?.length || 0) * 3,
    education: (education?.length || 0) * 2.2,
    achievements: (achievements?.length || 0) * 1.6,
    skills: skills?.length > 0 ? Math.ceil(skills.length / 5) : 0,
    codingProfiles: (codingProfiles?.length || 0) * 2,
  };

  const order = sectionOrder || [];
  const visibleIds = order.filter((id) => sectionWeight[id] > 0);

  // Pair adjacent half-width panels so a row never ends in a dangling gap,
  // whatever order the customer dragged the sections into, but only when the
  // two are close enough in size to read as one band (see MAX_PAIR_GAP). A
  // section with no suitable neighbour takes the full row rather than standing
  // beside six empty columns.
  const spanFor = {};
  for (let i = 0; i < visibleIds.length; i += 1) {
    const id = visibleIds[i];
    const next = visibleIds[i + 1];
    const pairable = Boolean(next) && !FULL_WIDTH_SECTIONS.has(id) && !FULL_WIDTH_SECTIONS.has(next);
    const taller = pairable ? Math.max(sectionWeight[id], sectionWeight[next]) : 0;
    const shorter = pairable ? Math.min(sectionWeight[id], sectionWeight[next]) : 0;
    const matched = pairable && (taller - shorter <= MAX_PAIR_GAP || taller / shorter <= MAX_PAIR_RATIO);
    if (matched) {
      spanFor[id] = "lg:col-span-6";
      spanFor[next] = "lg:col-span-6";
      i += 1;
    } else {
      spanFor[id] = "lg:col-span-12";
    }
  }

  const sections = {
    experience: experience?.length > 0 && (
      <Panel
        id="section-experience"
        title="Experience"
        icon={IconBriefcase}
        accent={PALETTE[0]}
        colors={colors}
        meta={plural(experience.length, "role", "roles")}
      >
        <ol className="space-y-4">
          {experience.map((job, i) => {
            const color = PALETTE[i % PALETTE.length];
            return (
              <li
                key={i}
                className="grid grid-cols-1 gap-x-6 gap-y-3 border-t pt-4 first:border-t-0 first:pt-0 md:grid-cols-[15rem_minmax(0,1fr)]"
                style={{ borderColor: RULE }}
              >
                <div className="min-w-0">
                  <h3 className="break-words text-[15px] font-semibold leading-tight" style={{ color: INK }}>
                    {job.role}
                  </h3>
                  <p className="dash-mono break-words text-[11px]" style={{ color: inkOn(color, isDark) }}>
                    {job.company}
                  </p>
                  <p className="dash-mono mt-1 text-[11px]" style={{ color: MUTED }}>
                    {rangeLabel(job.start, job.end)}
                  </p>
                  <AxisBar start={job.start} end={job.end} color={color} />
                </div>
                {job.bullets?.length > 0 && (
                  <ul className="space-y-1.5">
                    {job.bullets.map((bullet, j) => (
                      <li key={j} className="flex min-w-0 gap-2.5 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                        <span className="dash-mono shrink-0 text-[11px]" style={{ color: color }} aria-hidden="true">
                          +
                        </span>
                        <span className="min-w-0 whitespace-pre-line break-words">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      </Panel>
    ),

    education: education?.length > 0 && (
      <Panel
        id="section-education"
        title="Education"
        icon={IconGraduationCap}
        accent={PALETTE[PALETTE.length - 1]}
        colors={colors}
        meta={plural(education.length, "entry", "entries")}
      >
        <ol className="space-y-4">
          {education.map((edu, i) => {
            const color = PALETTE[(PALETTE.length - 1 - (i % PALETTE.length)) % PALETTE.length];
            return (
              <li key={i} className="border-t pt-4 first:border-t-0 first:pt-0" style={{ borderColor: RULE }}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <div className="min-w-0">
                    <h3 className="break-words text-[15px] font-semibold leading-tight" style={{ color: INK }}>
                      {edu.degree}
                    </h3>
                    <p className="dash-mono break-words text-[11px]" style={{ color: inkOn(color, isDark) }}>
                      {edu.school}
                    </p>
                  </div>
                  <span className="dash-mono shrink-0 text-[11px]" style={{ color: MUTED }}>
                    {rangeLabel(edu.start, edu.end)}
                  </span>
                </div>
                <AxisBar start={edu.start} end={edu.end} color={color} />
              </li>
            );
          })}
        </ol>
      </Panel>
    ),

    projects: projects?.length > 0 && (
      <Panel
        id="section-projects"
        title="Projects"
        icon={IconStack}
        accent={PALETTE[1] || PALETTE[0]}
        colors={colors}
        meta={plural(projects.length, "service", "services")}
      >
        <div className="flex flex-wrap gap-3">
          {projects.map((project, i) => {
            const status = statusColor(project.status);
            return (
              <article
                key={i}
                className="dash-well flex min-w-0 flex-[1_1_20rem] flex-col p-3.5"
                style={{ borderLeft: `2px solid ${status}` }}
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: status }} aria-hidden="true" />
                  <h3 className="dash-mono min-w-0 break-words text-[13px] font-semibold" style={{ color: INK }}>
                    {project.name || "Untitled project"}
                  </h3>
                  {project.version && (
                    <span className="dash-mono shrink-0 text-[10px]" style={{ color: MUTED }}>
                      v{project.version}
                    </span>
                  )}
                  {project.status && (
                    <span className="dash-label ml-auto shrink-0" style={{ color: inkOn(status, isDark) }}>
                      {project.status}
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className="mt-2 min-w-0 whitespace-pre-line break-words text-[13px] leading-relaxed" style={{ color: INK_SOFT }}>
                    {project.description}
                  </p>
                )}
                {project.highlights?.length > 0 && (
                  <ul className="mt-2.5 space-y-1">
                    {project.highlights.map((highlight, j) => (
                      <li key={j} className="flex min-w-0 gap-2 text-[12.5px] leading-snug" style={{ color: MUTED }}>
                        <span className="dash-mono shrink-0 text-[10px]" aria-hidden="true">
                          ›
                        </span>
                        <span className="min-w-0 break-words">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {project.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="dash-mono flex min-w-0 items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px]"
                        style={{ backgroundColor: tint(dotColor(tag), isDark ? 18 : 14), color: inkOn(dotColor(tag), isDark) }}
                      >
                        <span className="h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: dotColor(tag) }} />
                        <span className="break-words">{tag}</span>
                      </span>
                    ))}
                  </div>
                )}
                {(project.link || project.demo) && (
                  <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-3">
                    {project.link && (
                      <a
                        href={`https://${stripProtocol(project.link)}`}
                        className="dash-focus dash-label flex items-center gap-1"
                        style={{ color: inkOn(ACCENT, isDark) }}
                      >
                        Source <IconArrowOut className="h-3 w-3" />
                      </a>
                    )}
                    {project.demo && (
                      <a
                        href={`https://${stripProtocol(project.demo)}`}
                        className="dash-focus dash-label flex items-center gap-1"
                        style={{ color: inkOn(ACCENT, isDark) }}
                      >
                        Live <IconArrowOut className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </Panel>
    ),

    skills: skills?.length > 0 && (
      <Panel
        id="section-skills"
        title="Skills"
        icon={IconChip}
        accent={PALETTE[2] || PALETTE[0]}
        colors={colors}
        meta={plural(skills.length, "entry", "entries")}
      >
        <ul className="flex flex-wrap gap-1.5">
          {skills.map((skill) => {
            const used = tagUse.get(skill) || tagUse.get(skill.trim()) || 0;
            return (
              <li
                key={skill}
                className="flex min-w-0 items-center gap-2 rounded border px-2 py-1"
                style={{ borderColor: RULE, backgroundColor: tint(INK, isDark ? 6 : 4) }}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: dotColor(skill) }} aria-hidden="true" />
                <span className="min-w-0 break-words text-[12.5px]" style={{ color: INK_SOFT }}>
                  {skill}
                </span>
                {used > 0 && (
                  <span className="dash-mono shrink-0 text-[10px]" style={{ color: MUTED }} title={`Tagged on ${plural(used, "project", "projects")}`}>
                    ×{used}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </Panel>
    ),

    codingProfiles: codingProfiles?.length > 0 && (
      <Panel
        id="section-codingProfiles"
        title="Coding Profiles"
        icon={IconLink}
        accent={PALETTE[3] || PALETTE[0]}
        colors={colors}
        meta={plural(codingProfiles.length, "account", "accounts")}
      >
        <ul className="flex flex-wrap gap-2">
          {codingProfiles.map((profile, i) => (
            <li key={i} className="min-w-0 flex-[1_1_14rem]">
              <a
                href={`https://${stripProtocol(profile.url)}`}
                className="dash-focus dash-well flex min-w-0 items-center gap-2.5 px-3 py-2.5"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: dotColor(profile.platform) }} aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block break-words text-[13px] font-medium" style={{ color: INK }}>
                    {profile.platform}
                  </span>
                  <span className="dash-mono block min-w-0 truncate text-[10.5px]" style={{ color: MUTED }}>
                    {stripProtocol(profile.url)}
                  </span>
                </span>
                <IconArrowOut className="ml-auto h-3 w-3 shrink-0" style={{ color: MUTED }} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </Panel>
    ),

    achievements: achievements?.length > 0 && (
      <Panel
        id="section-achievements"
        title="Achievements"
        icon={IconFlag}
        accent={PALETTE[1] || PALETTE[0]}
        colors={colors}
        meta={plural(achievements.length, "note", "notes")}
      >
        <ul className={spanFor.achievements === "lg:col-span-12" ? "lg:columns-2 lg:gap-x-10" : ""}>
          {achievements.map((item, i) => (
            <li
              key={i}
              className="mb-2.5 flex min-w-0 gap-3 break-inside-avoid text-[13.5px] leading-relaxed last:mb-0"
              style={{ color: INK_SOFT }}
            >
              <span
                className="mt-[6px] h-2 w-2 shrink-0 rotate-45 rounded-[1px]"
                style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                aria-hidden="true"
              />
              <span className="min-w-0 max-w-[70ch] break-words">{item}</span>
            </li>
          ))}
        </ul>
      </Panel>
    ),
  };

  const navItems = [
    { href: "#overview", label: "Overview", icon: <IconPulse className="h-4 w-4" /> },
    domain && { href: "#timeline", label: "Timeline", icon: <IconAxis className="h-4 w-4" /> },
    showMatrix && { href: "#coverage", label: "Coverage", icon: <IconGrid className="h-4 w-4" /> },
    ...visibleIds.map((id) => {
      const Icon = SECTION_ICONS[id];
      return { href: `#section-${id}`, label: SECTION_DEFS[id]?.label, icon: Icon && <Icon className="h-4 w-4" /> };
    }),
    { href: "#contact", label: "Contact", icon: <IconMail className="h-4 w-4" /> },
  ].filter(Boolean);

  return (
    <div
      className={`dash-root relative flex min-h-dvh ${display.variable} ${mono.variable}`}
      style={{
        backgroundColor: PAPER,
        color: INK,
        "--dash-accent": ACCENT,
        "--dash-rule": RULE,
        "--dash-rule-strong": RULE_STRONG,
        "--dash-surface": SURFACE,
        "--dash-well": WELL,
        "--dash-sheen": SHEEN,
        "--dash-inset": tint(INK, isDark ? 10 : 6),
        "--dash-shadow": SHADOW,
        "--dash-shadow-lift": SHADOW_LIFT,
      }}
    >
      <style>{TEMPLATE_CSS}</style>
      <Backdrop colors={palette.colors} isDark={isDark} />

      <ConsoleRail items={navItems} theme={railTheme} />

      <div className="relative min-w-0 flex-1">
        {/* Console chrome: the identity and status readout stay pinned, the way
            a real product's header does, so the visitor never scrolls away
            from whose console this is. */}
        <header
          className="sticky top-0 z-30 border-b backdrop-blur-md"
          style={{ borderColor: RULE, backgroundColor: tint(PAPER, 86) }}
        >
          <div className="mx-auto flex max-w-[80rem] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
            <span
              aria-hidden="true"
              className="dash-mono flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-[11px] font-semibold"
              style={{ backgroundColor: tint(POP, isDark ? 22 : 16), color: inkOn(POP, isDark) }}
            >
              {initials(name)}
            </span>
            <p className="dash-mono min-w-0 truncate text-[12px] font-semibold" style={{ color: INK }}>
              {name || "Your Name"}
            </p>
            <p className="dash-label hidden min-w-0 truncate sm:block" style={{ color: MUTED }}>
              {role || "Your Role"}
            </p>
            <div className="ml-auto flex shrink-0 items-center gap-3">
              {domain && (
                <span className="dash-mono hidden text-[10.5px] sm:inline" style={{ color: MUTED }}>
                  {domain.from} → {domain.to}
                </span>
              )}
              <LiveSynced accent={PALETTE[1] || PALETTE[0]} textColor={MUTED} />
            </div>
          </div>
          <ConsoleRail items={navItems} theme={railTheme} variant="strip" />
        </header>

        <main className="mx-auto max-w-[80rem] px-4 pb-16 pt-6 sm:px-6 lg:pt-8">
          {/* Overview */}
          <section id="overview" aria-labelledby="overview-title" className="scroll-mt-24">
            <div className="flex flex-wrap items-start gap-5">
              {/* The monogram plate. Real light: a gradient across two palette
                  hues, a 1px inner highlight along the top edge, and a cast
                  shadow from the same overhead source as every panel. */}
              <div className="relative shrink-0">
                <div
                  className="dash-mono flex h-16 w-16 items-center justify-center rounded-[14px] text-xl font-semibold sm:h-20 sm:w-20 sm:text-2xl"
                  style={{
                    background: `linear-gradient(150deg, ${PALETTE[0]}, ${PALETTE[1] || PALETTE[0]})`,
                    color: isDarkColor(PALETTE[0]) ? "#ffffff" : shade(PALETTE[0], 68),
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), 0 18px 30px -18px ${tint(PALETTE[0], 70)}`,
                  }}
                >
                  {initials(name)}
                </div>
                <span
                  className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full"
                  style={{ backgroundColor: PAPER }}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="dash-led absolute inset-0 rounded-full" style={{ backgroundColor: "#10b981" }} />
                    <span className="relative h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#10b981" }} />
                  </span>
                  <span className="sr-only">Live</span>
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <h1
                  id="overview-title"
                  className="dash-tight break-words text-[clamp(1.9rem,4.4vw,3rem)] font-semibold leading-[1.05]"
                  style={{ color: INK }}
                >
                  {name || "Your Name"}
                </h1>
                <p className="dash-label mt-2 break-words" style={{ color: inkOn(POP, isDark) }}>
                  {role || "Your Role"}
                </p>
                {bio && (
                  <p className="mt-3 max-w-[62ch] break-words text-[15px] leading-relaxed" style={{ color: INK_SOFT }}>
                    {bio}
                  </p>
                )}
              </div>
            </div>

            {tiles.length > 0 && (
              <div className="dash-well mt-6 flex flex-wrap overflow-hidden">
                {tiles.map((tile, i) => (
                  <Tile key={tile.label} {...tile} accent={PALETTE[i % PALETTE.length]} colors={colors} rule={RULE} />
                ))}
              </div>
            )}
          </section>

          {/* Timeline: the shared axis every dated row below is also plotted on. */}
          {domain && (
            <div className="mt-4">
              <Panel
                id="timeline"
                title="Career timeline"
                icon={IconAxis}
                accent={PALETTE[0]}
                colors={colors}
                meta={`${domain.from} → ${domain.to}`}
              >
                <ConsoleTimeline
                  spans={spans}
                  from={domain.from}
                  to={domain.to}
                  kinds={timelineKinds}
                  theme={{
                    ink: INK,
                    inkSoft: INK_SOFT,
                    muted: MUTED,
                    accent: ACCENT,
                    rule: RULE,
                    track: tint(INK, isDark ? 6 : 4),
                    isDark,
                  }}
                />
              </Panel>
            </div>
          )}

          {/* Coverage: technology against project, as an incidence table. */}
          {showMatrix && (
            <RevealOnScroll arrivedClassName="dash-arrive" threshold={0.15}>
              <div className="mt-4">
                <Panel
                  id="coverage"
                  title="Stack coverage"
                  icon={IconGrid}
                  accent={PALETTE[2] || PALETTE[0]}
                  colors={colors}
                  meta={`${matrixRows.length} × ${taggedProjects.length}`}
                >
                  <div className="dash-scroll overflow-x-auto">
                    <table className="dash-matrix min-w-[22rem]">
                      <caption className="sr-only">
                        Which of these projects use each technology, and how many projects use it in total.
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col" className="dash-label w-[9rem] pb-2 text-left" style={{ color: MUTED }}>
                            Technology
                          </th>
                          {taggedProjects.map((project, i) => (
                            <th
                              key={i}
                              scope="col"
                              className="dash-mono w-8 pb-2 text-center text-[10px] font-medium"
                              style={{ color: MUTED }}
                            >
                              <abbr title={project.name || `Project ${i + 1}`} className="no-underline">
                                {String(i + 1).padStart(2, "0")}
                              </abbr>
                            </th>
                          ))}
                          <th scope="col" className="dash-label w-10 pb-2 text-right" style={{ color: MUTED }}>
                            Use
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {matrixRows.map(([tag, count]) => {
                          const hue = dotColor(tag);
                          return (
                            <tr key={tag}>
                              <th scope="row" className="pr-3 text-left align-middle">
                                <span className="flex min-w-0 items-center gap-2">
                                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: hue }} aria-hidden="true" />
                                  <span className="min-w-0 truncate text-[12px] font-medium" style={{ color: INK_SOFT }}>
                                    {tag}
                                  </span>
                                </span>
                              </th>
                              {taggedProjects.map((project, i) => {
                                const used = (project.tags || []).includes(tag);
                                return (
                                  <td key={i} className="align-middle">
                                    <span
                                      className="dash-cell"
                                      style={{ backgroundColor: used ? hue : tint(INK, isDark ? 7 : 6) }}
                                      aria-hidden="true"
                                    />
                                    <span className="sr-only">{used ? "used" : "not used"}</span>
                                  </td>
                                );
                              })}
                              <td className="dash-mono pl-2 text-right align-middle text-[11px]" style={{ color: MUTED }}>
                                {count}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <ol className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 border-t pt-3" style={{ borderColor: RULE }}>
                    {taggedProjects.map((project, i) => (
                      <li key={i} className="dash-mono flex min-w-0 items-baseline gap-1.5 text-[10.5px]" style={{ color: MUTED }}>
                        <span style={{ color: INK_SOFT }}>{String(i + 1).padStart(2, "0")}</span>
                        <span className="min-w-0 break-words">{project.name || `Project ${i + 1}`}</span>
                      </li>
                    ))}
                  </ol>
                </Panel>
              </div>
            </RevealOnScroll>
          )}

          {/* Section panels, in the customer's chosen order. */}
          {visibleIds.length > 0 && (
            <RevealOnScroll arrivedClassName="dash-arrive" threshold={0.05}>
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
                {visibleIds.map((id) => (
                  <div key={id} className={`min-w-0 ${spanFor[id]}`}>
                    {sections[id]}
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          )}

          {/* Contact */}
          <div className="mt-4">
            <Panel id="contact" title="Endpoints" icon={IconMail} accent={POP} colors={colors} meta={plural(contactLinks.length, "route", "routes")}>
              <p className="max-w-xl text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
                {contactLinks.length > 0
                  ? "Open for work and collaboration. These are the ways in."
                  : "No contact routes have been added to this portfolio yet."}
              </p>
              {contactLinks.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {contactLinks.map(({ label, value, href, Icon }) => (
                    <li key={href} className="min-w-0 flex-[1_1_15rem]">
                      <a
                        href={href}
                        className="dash-focus dash-well flex min-w-0 items-center gap-3 px-3 py-2.5 transition-colors"
                        style={{ color: INK_SOFT }}
                      >
                        <Icon className="h-4 w-4 shrink-0" style={{ color: inkOn(ACCENT, isDark) }} aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="dash-label block" style={{ color: MUTED }}>
                            {label}
                          </span>
                          <span className="dash-mono block min-w-0 truncate text-[12px]" style={{ color: INK }}>
                            {value}
                          </span>
                        </span>
                        <IconArrowOut className="ml-auto h-3.5 w-3.5 shrink-0" style={{ color: MUTED }} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <footer
            className="dash-mono mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-4 text-[10.5px]"
            style={{ borderColor: RULE, color: MUTED }}
          >
            <span>© {new Date().getFullYear()} {name || "Your Name"}</span>
            <span aria-hidden="true">·</span>
            <span>{palette.label} console</span>
            <span className="ml-auto">Made with Dev Portfolio Builder</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
