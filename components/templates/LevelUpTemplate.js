// Pure presentational component: renders portfolio `data` only, holding no
// state of its own. The two interactive pieces (the status bar with its pause
// screen, the loadout) are isolated client components.
//
// The page is one continuous side-scrolling level: scrolling down is
// travelling right through it. A parallax world sits behind the content,
// terrain and a runner in front, and a status bar along the bottom of the
// screen rather than floating over it. The runner's stride is driven by scroll
// position, so the figure runs exactly as far as the visitor scrolls.
//
// Nothing on screen is invented: no XP, no level number, no proficiency bar.
// The three numbers are the stage count (sections filled in), the reading
// meter (scroll position), and a per-skill count of how many of the customer's
// own projects and roles mention that skill. A role reads as in progress or
// cleared purely from whether its end date says present.
//
// No photo: photoUrl is only offered for warm/scrapbook/spotify (see
// EditForm.js), so the status bar monogram is built from the name instead.

import { Chakra_Petch, Press_Start_2P, Russo_One } from "next/font/google";
import { LEVEL_UP_PALETTES, getPalette } from "@/lib/palettes";
import { dotColor, initials, stripProtocol } from "./shared";
import { PixelGround, PixelSky } from "./PixelWorld";
import LevelHud from "./LevelHud";
import LoadoutRack from "./LoadoutRack";

// Three faces, one job each. Press Start 2P is the pixel face and is used
// only for chrome: stage numbers, status words, small caps labels, never a
// sentence, and never above 11px, which is where it stops being legible.
// Russo One carries the name and the stage titles; it is squared off and
// single weight, which is exactly the arcade marquee register and the reason
// it is not asked to do anything smaller. Chakra Petch carries every line of
// prose, because bullets and project descriptions are what a recruiter
// actually reads and a pixel font cannot hold a paragraph.
const pixel = Press_Start_2P({ subsets: ["latin"], weight: "400", variable: "--lu-pixel" });
const display = Russo_One({ subsets: ["latin"], weight: "400", variable: "--lu-display" });
const body = Chakra_Petch({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--lu-body" });

// Each content section is a stage in the level. The label is the stage's
// name in the fiction; the section's own id stays the anchor, so the
// editor's reorder list keeps working unchanged.
const STAGES = {
  experience: "Mission Log",
  projects: "Inventory",
  skills: "Loadout",
  education: "Origin",
  achievements: "Trophies",
  codingProfiles: "Guild Cards",
};

// Palette colors are always "#rrggbb" (see lib/palettes.js), so plain hex
// parsing is enough here, unlike shared.js's helpers, which also have to
// cope with the hsl() strings dotColor() returns for unrecognized labels.
function relativeLuminance(hex) {
  const value = parseInt(hex.replace("#", ""), 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a, b) {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Small colored text has to clear WCAG AA against the panel it sits on, and
// several palette hues do not on their own: the arcade red is 5.08:1 but the
// overworld green is 3.30:1. Every hue used as *text* goes through here
// first, mixing toward white on a dark palette and toward black on a light
// one until it clears. Hues used as a swatch, a rule or a fill do not.
function inkOn(hue, night) {
  return night
    ? `color-mix(in srgb, ${hue}, white 38%)`
    : `color-mix(in srgb, ${hue}, black 44%)`;
}

// Text sitting *on* a hue picks the palette's paper or its ink by which one
// actually contrasts with that hue, rather than assuming paper. The greens
// and golds in these palettes are light enough that paper on them lands
// around 3:1, and one of them is a project card's monogram plate.
function onFill(hue, paper, ink) {
  return contrast(paper, hue) >= contrast(ink, hue) ? paper : ink;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

// A year range as this template prints it. An arrow rather than a dash: it
// reads as a window that is still open where a hyphen does not, and this
// repo does not use en or em dashes.
function rangeLabel(start, end) {
  if (start && end) return `${start} → ${end}`;
  return start || end || "";
}

// Whether a role is still running, read from the end date the customer
// typed. This is the only status on the page and it is a reading of their
// own text, not an inference about them.
function isCurrent(end) {
  return /^(present|current|now|ongoing|today)$/i.test((end || "").trim());
}

// One skill's cross-reference: every project entry and every role entry the
// customer named that skill in. Matching is on a word boundary rather than a
// bare substring, so "Go" does not match "Google" while "React" still
// matches "React Native", and the whole entry counts, not just its tags:
// people write "built the pipeline in Python" in a bullet far more often than
// they remember to add a tag, and a feature that only reads tags finds almost
// nothing on a real resume.
//
// Deliberately no ranking and no score. This returns the names of entries,
// and the count shown next to a slot is the length of those two lists.
function buildLoadout(skills, projects, experience) {
  return skills.map((skill) => {
    const escaped = skill.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const named = new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#.]|$)`, "i");
    const anyOf = (...values) => values.flat().filter(Boolean).some((value) => named.test(value));
    return {
      name: skill,
      dot: dotColor(skill),
      projects: (projects || [])
        .filter((project) =>
          anyOf(project.tags || [], project.name, project.description, project.highlights || [])
        )
        .map((project) => project.name)
        .filter(Boolean),
      roles: (experience || [])
        .filter((job) => anyOf(job.bullets || [], job.role, job.company))
        .map((job) => [job.role, job.company].filter(Boolean).join(" at "))
        .filter(Boolean),
    };
  });
}

// One <style> for the whole template, rendered once at the root, rather than
// two copies of a rule in two globals.css files that can drift apart.
//
// Two things about the motion are worth stating up front. Every travelling
// part of the level runs on a CSS scroll-driven timeline, so there is no
// scroll handler, no observer and nothing on the main thread: the layers pan
// and the runner strides purely as a function of scroll position. And every
// such rule lives inside @supports, so a browser without scroll-driven
// animations gets the world fully drawn and standing still rather than an
// empty page; there, a slow time-based drift keeps it alive instead.
const TEMPLATE_CSS = `
.lu-root {
  position: relative;
  isolation: isolate;
  min-height: 100dvh;
  overflow-x: clip;
  background: var(--lu-sky-lo);
  color: var(--lu-ink);
  font-family: var(--lu-body), ui-sans-serif, system-ui, sans-serif;
  --lu-px: 4px;
  --lu-ground-h: calc(24 * var(--lu-px));
  --lu-hud-h: 54px;
  --lu-horizon: calc(var(--lu-hud-h) + var(--lu-ground-h));
  --lu-edge: 3px;
  --lu-drop: 6px;
  /* The lane the runner occupies, and the only thing the content column is
     not allowed to enter. Eighteen art pixels: the sprite is sixteen wide,
     with one either side for clearance. */
  --lu-lane: calc(18 * var(--lu-px));
  --lu-column: calc(54rem + var(--lu-lane));
}
@media (max-width: 639px) {
  .lu-root { --lu-px: 3px; --lu-hud-h: 48px; --lu-edge: 2px; --lu-drop: 4px; }
}

.lu-pixel {
  font-family: var(--lu-pixel), ui-monospace, monospace;
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1.6;
  text-transform: uppercase;
}
.lu-sr {
  position: absolute;
  width: 1px; height: 1px;
  margin: -1px; padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* Hard, square, offset: a focus ring in the same visual language as the
   rest of the page, and never removed. */
.lu-focus:focus-visible {
  outline: 3px solid var(--lu-pop);
  outline-offset: 3px;
  border-radius: 0;
}

/* ---- the world ------------------------------------------------------- */

/* Everything pinned to the screen here is sticky, not fixed, and sticks to
   the *bottom*. Both halves of that are load bearing.
   
   Sticky rather than fixed, because a fixed element sits outside every
   scroll container, so scroll(nearest) finds no timeline for it and the
   whole level stops moving. A sticky box inside a slot that spans the page
   stays pinned for the entire scroll while remaining a plain descendant of
   whichever scroller it is in, which is what lets one implementation drive
   both the deployed page and the editor's own scrolling preview pane.
   
   Bottom rather than top, because this scene is built off the horizon and
   the horizon is measured from the bottom of the screen. Sticking to the
   top would mean sizing these boxes in dvh, and dvh is the window, not the
   editor's pane: in the editor every dvh-tall box overshot the pane and put
   the terrain and the status bar below its fold. Pinned to the bottom, the
   terrain and the bar need no viewport unit at all, and the sky is the only
   box still measured in dvh, where overshooting simply means it starts a
   little above the top of the pane and nothing is lost.
   
   Each slot lays its box out at its own bottom edge, because a bottom-stuck
   sticky box is only ever pulled *up* toward the scrollport's bottom, never
   pushed down: laid out at the top of the page it would simply sit there and
   scroll away. And the sky's slot starts one viewport above the page, since a
   sticky box can be moved anywhere inside its containing block but never
   outside it, and in a pane shorter than the window the sky has to come up
   past the top of the page to reach the bottom of the pane. */
.lu-world-slot, .lu-fg-slot, .lu-hud-slot {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  pointer-events: none;
}
.lu-world-slot { inset: -100dvh 0 0; z-index: 0; }
.lu-fg-slot { inset: 0; z-index: 20; }
.lu-world, .lu-fg {
  position: sticky;
  bottom: 0;
  overflow: clip;
}
.lu-world { height: 100dvh; }
/* Tall enough for the terrain, the status bar under it and the runner
   standing on top, and not one pixel taller: this box is what the whole
   foreground is measured from. */
.lu-fg { height: calc(var(--lu-hud-h) + var(--lu-ground-h) + 26 * var(--lu-px)); }
/* The perspective origin sits exactly on the horizon, which is what makes a
   layer pushed back on z shrink toward the horizon instead of toward the
   middle of the screen: the same thing receding ground does. */
.lu-world {
  perspective: 1200px;
  perspective-origin: 50% calc(100% - var(--lu-horizon));
}
.lu-sky {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--lu-sky-hi) 0%, var(--lu-sky-lo) 78%);
}
.lu-haze {
  position: absolute;
  left: 0; right: 0;
  bottom: var(--lu-horizon);
  height: calc(30 * var(--lu-px));
  background: linear-gradient(180deg, transparent, var(--lu-sky-lo));
}

.lu-layer {
  position: absolute;
  /* Overscanned both ways: one tile each side so a pan never runs off the
     end of the art, and 40% each side so a layer shrunk by the perspective
     still covers the viewport it is behind. */
  left: calc(-40% - var(--lu-tile) * var(--lu-px));
  width: calc(180% + 2 * var(--lu-tile) * var(--lu-px));
  height: calc(var(--lu-art) * var(--lu-px));
  background-repeat: repeat-x;
  background-position: left bottom;
  background-size: calc(var(--lu-tile) * var(--lu-px)) calc(var(--lu-art) * var(--lu-px));
  transform: translateZ(var(--lu-z));
  will-change: transform;
}
.lu-stars { top: 0; height: 46%; background-position: left top; }
.lu-range, .lu-hills, .lu-structures { bottom: var(--lu-horizon); }
.lu-cloud-far { bottom: 88%; }
.lu-cloud-near { bottom: 78%; }
/* The sun, the clouds and the stars stay out of the perspective on purpose.
   The perspective origin sits on the horizon because that is where receding
   *ground* converges; a cloud does not converge there, and pushing the sky
   back on z dragged every one of them down into the band the title sits in. */
.lu-sun {
  position: absolute;
  right: 16%;
  top: 9%;
  width: calc(24 * var(--lu-px));
  height: calc(24 * var(--lu-px));
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.lu-ground { bottom: var(--lu-hud-h); }
.lu-fringe { bottom: calc(var(--lu-hud-h) + var(--lu-ground-h) - 1 * var(--lu-px)); }

/* One cycle of the pan is exactly one tile wide, so the jump back at the
   end of a cycle lands on identical art and the loop is invisible. The
   iteration count is therefore the layer's whole speed control: with a
   progress-based timeline, N iterations divide the page's scroll into N
   tiles of travel. */
@keyframes lu-pan {
  to { transform: translate3d(calc(-1 * var(--lu-tile) * var(--lu-px)), 0, var(--lu-z)); }
}
@supports (animation-timeline: scroll()) {
  .lu-layer {
    animation-name: lu-pan;
    animation-duration: auto;
    animation-timing-function: linear;
    animation-fill-mode: both;
    animation-iteration-count: var(--lu-loop);
    animation-timeline: scroll(nearest block);
  }
}
/* No scroll timelines: the level drifts slowly on a clock instead, so the
   world is alive everywhere rather than dead where the feature is missing.
   Speeds are derived from each layer's own travel so the depth ordering
   holds. */
@supports not (animation-timeline: scroll()) {
  .lu-layer {
    animation-name: lu-pan;
    animation-duration: calc(2400s / var(--lu-loop));
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
}

/* ---- the runner ------------------------------------------------------ */

.lu-runner {
  position: absolute;
  /* One art pixel inside the lane at the content column's left edge,
     wherever that edge happens to be. A viewport percentage cannot express
     this: the column is centred above its max-width and full width below it,
     so any single percentage that clears the text on a wide screen lands on
     top of it on a narrow one, which is exactly how the runner ended up
     buried under the panels on a phone. */
  left: max(var(--lu-px), calc((100% - var(--lu-column)) / 2 + var(--lu-px)));
  bottom: calc(var(--lu-hud-h) + var(--lu-ground-h) - 2 * var(--lu-px));
  width: calc(16 * var(--lu-px));
  height: calc(24 * var(--lu-px));
}
.lu-runner-frame, .lu-runner-shadow {
  position: absolute;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
.lu-runner-frame { inset: 0; }
.lu-runner-b { opacity: 0; }
.lu-runner-shadow {
  left: 0;
  bottom: calc(-1 * var(--lu-px));
  width: calc(16 * var(--lu-px));
  height: calc(4 * var(--lu-px));
  opacity: 0.5;
}
/* A two-frame cycle, stepped so the legs snap between poses the way a
   sprite sheet does rather than crossfading, and one art pixel of bob on
   the same beat. Tied to the scroll timeline, the figure covers ground only
   while the visitor is actually moving. */
@keyframes lu-stride-a { 0%, 49.9% { opacity: 1; } 50%, 100% { opacity: 0; } }
@keyframes lu-stride-b { 0%, 49.9% { opacity: 0; } 50%, 100% { opacity: 1; } }
@keyframes lu-bob { 0%, 49.9% { transform: translateY(0); } 50%, 100% { transform: translateY(calc(-1 * var(--lu-px))); } }
@supports (animation-timeline: scroll()) {
  .lu-runner-a, .lu-runner-b, .lu-runner {
    animation-duration: auto;
    animation-timing-function: step-end;
    animation-fill-mode: both;
    animation-iteration-count: 120;
    animation-timeline: scroll(nearest block);
  }
  .lu-runner-a { animation-name: lu-stride-a; }
  .lu-runner-b { animation-name: lu-stride-b; }
  .lu-runner { animation-name: lu-bob; }
}
@supports not (animation-timeline: scroll()) {
  .lu-runner-a, .lu-runner-b, .lu-runner {
    animation-duration: 0.5s;
    animation-timing-function: step-end;
    animation-iteration-count: infinite;
  }
  .lu-runner-a { animation-name: lu-stride-a; }
  .lu-runner-b { animation-name: lu-stride-b; }
  .lu-runner { animation-name: lu-bob; }
}

/* ---- the content column ---------------------------------------------- */

/* The column is inset from the left by one lane at every width, which is
   what lets the runner stay in front of the content without ever covering a
   word of it. The asymmetry is the design: a corridor with the character
   running down the near side of it. */
.lu-flow {
  position: relative;
  z-index: 10;
  margin: 0 auto;
  max-width: var(--lu-column);
  padding: 0 1rem calc(var(--lu-horizon) + 3rem) var(--lu-lane);
  perspective: 1400px;
}
@media (min-width: 640px) { .lu-flow { padding-right: 2rem; } }

/* ---- the title screen ------------------------------------------------ */

.lu-title {
  display: flex;
  min-height: calc(100dvh - var(--lu-horizon));
  flex-direction: column;
  justify-content: center;
  gap: 1.25rem;
  padding: 3.5rem 0 2rem;
}
.lu-title-name {
  margin: 0;
  font-family: var(--lu-display), ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(2.75rem, 11vw, 5.75rem);
  line-height: 0.92;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  overflow-wrap: break-word;
  /* A solid offset shadow, no blur: the way an arcade title plate is
     drawn, and the reason the name reads off the open sky. */
  text-shadow:
    var(--lu-edge) var(--lu-edge) 0 var(--lu-paper),
    calc(2 * var(--lu-edge)) calc(2 * var(--lu-edge)) 0 var(--lu-accent);
}
.lu-title-role {
  margin: 0;
  font-size: clamp(0.625rem, 1.9vw, 0.8125rem);
  color: var(--lu-accent-ink);
  letter-spacing: 0.16em;
}
.lu-title-bio {
  margin: 0;
  max-width: 44ch;
  font-size: 1rem;
  line-height: 1.65;
  color: var(--lu-ink-soft);
  white-space: pre-line;
  overflow-wrap: break-word;
}
.lu-title-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; }

/* Chunky, square, and pressed properly: the whole travel of the button is
   its own drop shadow collapsing, so it reads as a physical key. */
.lu-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 46px;
  padding: 0 1.1rem;
  border: 0;
  cursor: pointer;
  font-size: 0.6875rem;
  text-decoration: none;
  transition: transform 90ms steps(2), box-shadow 90ms steps(2);
}
.lu-btn-primary {
  background: var(--lu-accent);
  color: var(--lu-on-accent);
  box-shadow:
    0 0 0 var(--lu-edge) var(--lu-frame),
    var(--lu-drop) var(--lu-drop) 0 var(--lu-shadow);
}
.lu-btn-ghost {
  background: var(--lu-paper);
  color: var(--lu-ink);
  box-shadow:
    0 0 0 var(--lu-edge) var(--lu-frame),
    var(--lu-drop) var(--lu-drop) 0 var(--lu-shadow);
}
.lu-btn:hover { transform: translate3d(2px, 2px, 0); box-shadow: 0 0 0 var(--lu-edge) var(--lu-frame), calc(var(--lu-drop) - 2px) calc(var(--lu-drop) - 2px) 0 var(--lu-shadow); }
.lu-btn:active { transform: translate3d(var(--lu-drop), var(--lu-drop), 0); box-shadow: 0 0 0 var(--lu-edge) var(--lu-frame); }

.lu-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0 0;
  font-size: 0.5625rem;
  color: var(--lu-ink-soft);
}
.lu-hint-arrow { width: calc(4 * var(--lu-px)); height: calc(6 * var(--lu-px)); background: var(--lu-accent-ink); clip-path: polygon(0 0, 100% 0, 50% 100%); }
@keyframes lu-hint-out { to { opacity: 0; transform: translateY(8px); } }
@keyframes lu-hint-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(3px); } }
@supports (animation-timeline: scroll()) {
  /* The hint has done its job the moment the visitor moves, so it leaves
     as they start rather than sitting there being ignored. */
  .lu-hint {
    animation: lu-hint-out linear both;
    animation-timeline: scroll(nearest block);
    animation-range: 0 12vh;
  }
}
.lu-hint-arrow { animation: lu-hint-bob 1.4s ease-in-out infinite; }

/* ---- stages ---------------------------------------------------------- */

.lu-stage { margin-top: clamp(3.5rem, 9vh, 6rem); scroll-margin-top: 1.5rem; }
/* The tab is framed on three sides only and overlaps the panel by the
   width of the frame, so the two read as one window with a title tab rather
   than as a small box sitting on a big one. */
.lu-stage-tab {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: stretch;
  max-width: 100%;
  margin-bottom: calc(-1 * var(--lu-edge));
  background: var(--lu-paper);
  box-shadow:
    calc(-1 * var(--lu-edge)) 0 0 var(--lu-frame),
    var(--lu-edge) 0 0 var(--lu-frame),
    0 calc(-1 * var(--lu-edge)) 0 var(--lu-frame);
}
.lu-stage-num {
  display: flex;
  align-items: center;
  padding: 0.55rem 0.6rem;
  background: var(--lu-accent);
  color: var(--lu-on-accent);
  font-size: 0.625rem;
}
.lu-stage-label {
  margin: 0;
  display: flex;
  align-items: center;
  padding: 0.4rem 0.85rem;
  background: var(--lu-paper);
  color: var(--lu-ink);
  font-family: var(--lu-display), ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(0.9375rem, 2.4vw, 1.1875rem);
  font-weight: 400;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  overflow-wrap: break-word;
}

/* Raised plate: an outer hard frame, a lit top-left inner edge and a dark
   bottom-right one, then a solid offset shadow. No radius and no blur
   anywhere, which is the single biggest reason none of this reads as
   another rounded card. */
.lu-panel {
  position: relative;
  padding: 1.25rem;
  background: var(--lu-paper);
  box-shadow:
    0 0 0 var(--lu-edge) var(--lu-frame),
    inset var(--lu-edge) var(--lu-edge) 0 var(--lu-lit),
    inset calc(-1 * var(--lu-edge)) calc(-1 * var(--lu-edge)) 0 var(--lu-dim),
    var(--lu-drop) var(--lu-drop) 0 var(--lu-shadow);
}
@media (min-width: 640px) { .lu-panel { padding: 1.6rem 1.75rem; } }

@keyframes lu-arrive {
  from { opacity: 0; transform: translate3d(0, 28px, -180px) rotateX(7deg); }
  to { opacity: 1; transform: none; }
}
/* The hidden state lives inside @supports so that where scroll-driven
   animations are missing the stage is simply already in place, rather than
   stuck invisible waiting for a feature that never arrives. */
@supports (animation-timeline: view()) {
  .lu-stage {
    animation: lu-arrive linear both;
    animation-timeline: view();
    animation-range: entry 4% entry 54%;
  }
}

/* ---- mission log ----------------------------------------------------- */

.lu-quests { margin: 0; padding: 0; list-style: none; }
.lu-quest { position: relative; padding: 0 0 1.5rem calc(7 * var(--lu-px)); }
.lu-quest:last-child { padding-bottom: 0; }
/* A dotted chain rather than a solid rule: two on, two off, in whole art
   pixels, so the connector belongs to the same grid as everything else. */
.lu-quest::before {
  content: "";
  position: absolute;
  left: 0;
  top: calc(4 * var(--lu-px));
  bottom: 0;
  width: var(--lu-px);
  background: repeating-linear-gradient(180deg, var(--lu-rule-strong) 0 calc(2 * var(--lu-px)), transparent calc(2 * var(--lu-px)) calc(4 * var(--lu-px)));
}
.lu-quest:last-child::before { display: none; }
.lu-quest::after {
  content: "";
  position: absolute;
  left: calc(-1 * var(--lu-px));
  top: 0;
  width: calc(3 * var(--lu-px));
  height: calc(3 * var(--lu-px));
  background: var(--lu-accent);
  box-shadow: 0 0 0 var(--lu-px) var(--lu-paper), 0 0 0 calc(2 * var(--lu-px)) var(--lu-rule);
}
.lu-quest-head { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; }
.lu-tag {
  padding: 0.3rem 0.45rem;
  font-size: 0.5rem;
  line-height: 1;
  box-shadow: 0 0 0 2px var(--lu-frame);
}
.lu-tag-live { background: var(--lu-pop); color: var(--lu-on-pop); }
.lu-tag-done { background: var(--lu-paper); color: var(--lu-ink-soft); }
.lu-years { font-size: 0.5625rem; color: var(--lu-muted); letter-spacing: 0.08em; }
.lu-quest-role {
  margin: 0.6rem 0 0;
  font-family: var(--lu-display), ui-sans-serif, system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.2;
  color: var(--lu-ink);
  overflow-wrap: break-word;
}
.lu-quest-org { margin: 0.15rem 0 0; font-size: 0.875rem; font-weight: 600; color: var(--lu-accent-ink); overflow-wrap: break-word; }
.lu-objectives { margin: 0.7rem 0 0; padding: 0; list-style: none; display: grid; gap: 0.4rem; }
.lu-objective { display: flex; gap: 0.6rem; font-size: 0.9375rem; line-height: 1.55; color: var(--lu-ink-soft); }
.lu-objective span { min-width: 0; white-space: pre-line; overflow-wrap: break-word; }
/* A drawn box, not a glyph: it stays on the pixel grid and it is redundant
   decoration, since the status word above already carries the meaning. */
.lu-box {
  flex: 0 0 auto;
  margin-top: calc(1.5 * var(--lu-px));
  width: calc(3 * var(--lu-px));
  height: calc(3 * var(--lu-px));
  box-shadow: 0 0 0 var(--lu-px) var(--lu-rule-strong);
}
.lu-box-done { background: var(--lu-accent); }
.lu-box-open { background: transparent; }

/* ---- inventory ------------------------------------------------------- */

/* Items flow and share out whatever width is left rather than sitting in
   fixed tracks: one project fills its row, two split it, and a third left
   alone on the last row grows into the gap instead of stranding it. A grid
   with auto-fit tracks left an empty cell for every count that was not a
   multiple of the column count, which is most of them. */
.lu-items { margin: 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 1rem; }
.lu-items > li { flex: 1 1 17rem; min-width: 0; }
/* Pressed-in wells inside a raised plate, so an inventory slot reads as a
   slot. Each takes the hue of its own position in the palette. */
.lu-item {
  position: relative;
  display: flex;
  height: 100%;
  gap: 0.85rem;
  min-width: 0;
  padding: 0.9rem;
  background: color-mix(in srgb, var(--lu-hue) 8%, var(--lu-paper));
  box-shadow:
    inset var(--lu-edge) var(--lu-edge) 0 var(--lu-dim),
    inset calc(-1 * var(--lu-edge)) calc(-1 * var(--lu-edge)) 0 var(--lu-lit),
    0 0 0 2px var(--lu-rule);
  transition: transform 160ms ease-out, box-shadow 160ms ease-out;
}
.lu-item:hover, .lu-item:focus-within {
  transform: translate3d(0, -3px, 24px);
  box-shadow:
    inset var(--lu-edge) var(--lu-edge) 0 var(--lu-dim),
    inset calc(-1 * var(--lu-edge)) calc(-1 * var(--lu-edge)) 0 var(--lu-lit),
    0 0 0 2px var(--lu-hue);
}
.lu-item-icon {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(11 * var(--lu-px));
  height: calc(11 * var(--lu-px));
  background: var(--lu-hue);
  color: var(--lu-hue-on);
  font-size: 0.75rem;
  box-shadow: 0 0 0 2px var(--lu-frame);
}
.lu-item-body { min-width: 0; flex: 1 1 auto; }
.lu-item-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.4rem 0.5rem; }
.lu-item-name {
  margin: 0;
  font-family: var(--lu-display), ui-sans-serif, system-ui, sans-serif;
  font-size: 0.9375rem;
  font-weight: 400;
  color: var(--lu-ink);
  overflow-wrap: anywhere;
}
.lu-item-ver { font-size: 0.5rem; color: var(--lu-hue-ink); }
.lu-item-desc { margin: 0.45rem 0 0; font-size: 0.875rem; line-height: 1.55; color: var(--lu-ink-soft); white-space: pre-line; overflow-wrap: break-word; }
.lu-effects { margin: 0.6rem 0 0; padding: 0; list-style: none; display: grid; gap: 0.3rem; }
.lu-effect { display: flex; gap: 0.45rem; font-size: 0.8125rem; line-height: 1.5; color: var(--lu-ink-soft); }
.lu-effect-mark { flex: 0 0 auto; color: var(--lu-hue-ink); font-weight: 700; }
.lu-props { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.65rem; }
.lu-prop {
  padding: 0.2rem 0.4rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--lu-hue-ink);
  background: color-mix(in srgb, var(--lu-hue) 16%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--lu-hue) 40%, transparent);
  overflow-wrap: anywhere;
}
.lu-item-actions { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.75rem; }
.lu-action {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 0.6rem;
  font-size: 0.5rem;
  text-decoration: none;
  color: var(--lu-hue-on);
  background: var(--lu-hue);
  box-shadow: 0 0 0 2px var(--lu-frame), 3px 3px 0 var(--lu-shadow);
  transition: transform 90ms steps(2), box-shadow 90ms steps(2);
}
.lu-action:hover { transform: translate3d(1px, 1px, 0); box-shadow: 0 0 0 2px var(--lu-frame), 2px 2px 0 var(--lu-shadow); }
.lu-action:active { transform: translate3d(3px, 3px, 0); box-shadow: 0 0 0 2px var(--lu-frame); }

/* ---- loadout --------------------------------------------------------- */

.lu-slots { margin: 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.lu-slot {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 40px;
  padding: 0 0.7rem;
  background: var(--lu-well);
  color: var(--lu-ink-soft);
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: inset 2px 2px 0 var(--lu-dim), inset -2px -2px 0 var(--lu-lit), 0 0 0 2px var(--lu-rule);
}
.lu-slot-live {
  cursor: pointer;
  border: 0;
  color: var(--lu-ink);
  background: var(--lu-paper);
  box-shadow: 0 0 0 2px var(--lu-frame), 3px 3px 0 var(--lu-shadow);
  transition: transform 120ms steps(2), background-color 140ms ease-out, box-shadow 120ms steps(2), color 140ms ease-out;
}
.lu-slot-live:hover { transform: translate3d(1px, 1px, 0); box-shadow: 0 0 0 2px var(--lu-frame), 2px 2px 0 var(--lu-shadow); }
.lu-slot-on {
  background: var(--lu-accent);
  color: var(--lu-on-accent);
  transform: translate3d(3px, 3px, 0);
  box-shadow: 0 0 0 2px var(--lu-frame);
}
.lu-slot-dot { width: calc(2 * var(--lu-px)); height: calc(2 * var(--lu-px)); flex: 0 0 auto; }
.lu-slot-name { overflow-wrap: anywhere; }
.lu-slot-count { font-size: 0.5rem; opacity: 0.85; }
.lu-slot-detail {
  margin-top: 0.9rem;
  padding: 0.85rem 0.9rem;
  min-height: 3.75rem;
  background: var(--lu-well);
  box-shadow: inset 2px 2px 0 var(--lu-dim), inset -2px -2px 0 var(--lu-lit), 0 0 0 2px var(--lu-rule);
}
.lu-slot-detail-head { margin: 0 0 0.5rem; font-size: 0.5625rem; color: var(--lu-accent-ink); }
.lu-slot-line { margin: 0.3rem 0 0; font-size: 0.875rem; line-height: 1.55; color: var(--lu-ink-soft); overflow-wrap: break-word; }
.lu-slot-line-key {
  display: block;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--lu-muted);
}
.lu-slot-hint { margin: 0; font-size: 0.875rem; line-height: 1.55; color: var(--lu-muted); }

/* ---- origin ---------------------------------------------------------- */

.lu-plaques { margin: 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 0.85rem; }
/* Engraved, not raised: the inverse bevel of every other surface here, so
   a degree reads as something cut into the wall rather than sitting on it.
   Items grow into whatever width is left, so one degree fills its row
   instead of stranding half of it. */
.lu-plaque {
  flex: 1 1 16rem;
  min-width: 0;
  padding: 0.9rem 1rem;
  background: var(--lu-well);
  box-shadow: inset var(--lu-edge) var(--lu-edge) 0 var(--lu-dim), inset calc(-1 * var(--lu-edge)) calc(-1 * var(--lu-edge)) 0 var(--lu-lit);
}
.lu-plaque-degree {
  margin: 0;
  font-family: var(--lu-display), ui-sans-serif, system-ui, sans-serif;
  font-size: 1rem;
  color: var(--lu-ink);
  overflow-wrap: break-word;
}
.lu-plaque-school { margin: 0.2rem 0 0; font-size: 0.875rem; color: var(--lu-ink-soft); overflow-wrap: break-word; }
.lu-plaque-years { margin: 0.5rem 0 0; font-size: 0.5rem; color: var(--lu-muted); }

/* ---- trophies -------------------------------------------------------- */

.lu-trophies { margin: 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 0.75rem; }
.lu-trophies > li { flex: 1 1 17rem; min-width: 0; }
.lu-trophy {
  position: relative;
  overflow: hidden;
  display: flex;
  height: 100%;
  gap: 0.75rem;
  min-width: 0;
  padding: 0.85rem;
  background: var(--lu-well);
  box-shadow: inset 2px 2px 0 var(--lu-dim), inset -2px -2px 0 var(--lu-lit), 0 0 0 2px var(--lu-rule);
}
.lu-trophy-cup {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(9 * var(--lu-px));
  height: calc(9 * var(--lu-px));
  background: color-mix(in srgb, var(--lu-gold) 22%, transparent);
  color: var(--lu-gold-ink);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--lu-gold) 45%, transparent);
}
.lu-trophy-cup svg { width: 60%; height: 60%; }
.lu-trophy-text { margin: 0; min-width: 0; font-size: 0.875rem; line-height: 1.55; color: var(--lu-ink-soft); overflow-wrap: break-word; }
/* The shine passes once, as the trophy arrives, rather than looping
   forever: it rewards the reveal and then stops asking for attention. */
@keyframes lu-shine { from { transform: translateX(-120%) skewX(-18deg); } to { transform: translateX(320%) skewX(-18deg); } }
@supports (animation-timeline: view()) {
  .lu-trophy::after {
    content: "";
    position: absolute;
    top: 0; bottom: 0;
    width: 35%;
    background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--lu-gold) 30%, transparent), transparent);
    animation: lu-shine linear both;
    animation-timeline: view();
    animation-range: entry 20% entry 90%;
  }
}

/* ---- guild cards ----------------------------------------------------- */

.lu-cards { margin: 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 0.6rem; }
.lu-cards > li { flex: 1 1 12rem; min-width: 0; }
.lu-card {
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
  padding: 0.6rem 0.85rem;
  text-decoration: none;
  background: var(--lu-paper);
  box-shadow: 0 0 0 2px var(--lu-frame), 4px 4px 0 var(--lu-shadow);
  transition: transform 120ms steps(2), box-shadow 120ms steps(2);
}
.lu-card:hover { transform: translate3d(2px, 2px, 0); box-shadow: 0 0 0 2px var(--lu-frame), 2px 2px 0 var(--lu-shadow); }
.lu-card-plat { font-size: 0.875rem; font-weight: 700; color: var(--lu-ink); overflow-wrap: anywhere; }
.lu-card-url { font-size: 0.75rem; color: var(--lu-muted); overflow-wrap: anywhere; }

/* ---- credits --------------------------------------------------------- */

.lu-credits {
  margin: clamp(4rem, 12vh, 8rem) auto 0;
  max-width: 27rem;
  padding: 1.75rem 1.5rem;
  text-align: center;
  background: var(--lu-paper);
  box-shadow:
    0 0 0 var(--lu-edge) var(--lu-frame),
    inset var(--lu-edge) var(--lu-edge) 0 var(--lu-lit),
    inset calc(-1 * var(--lu-edge)) calc(-1 * var(--lu-edge)) 0 var(--lu-dim),
    var(--lu-drop) var(--lu-drop) 0 var(--lu-shadow);
}
.lu-credits-head { margin: 0 0 1rem; font-size: 0.625rem; color: var(--lu-ink-soft); }
.lu-credits-mail { margin: 0.9rem 0 0; font-size: 0.875rem; color: var(--lu-ink-soft); overflow-wrap: anywhere; }
.lu-credits-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem; margin-top: 1rem; }
.lu-credits-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 40px;
  padding: 0 0.7rem;
  font-size: 0.8125rem;
  text-decoration: none;
  color: var(--lu-ink);
  background: var(--lu-paper);
  box-shadow: 0 0 0 2px var(--lu-frame);
  overflow-wrap: anywhere;
}
.lu-credits-link:hover { color: var(--lu-accent-ink); box-shadow: 0 0 0 2px var(--lu-accent); }
.lu-credits-link svg { width: 14px; height: 14px; flex: 0 0 auto; }
.lu-credits-line { margin: 1.25rem 0 0; font-size: 0.75rem; color: var(--lu-ink-soft); }

/* ---- the status bar -------------------------------------------------- */

.lu-hud-slot { inset: 0; z-index: 30; }
.lu-hud {
  position: sticky;
  bottom: 0;
  height: var(--lu-hud-h);
  pointer-events: auto;
  background: var(--lu-paper);
  box-shadow: 0 calc(-1 * var(--lu-edge)) 0 var(--lu-frame);
  padding-bottom: env(safe-area-inset-bottom);
}
.lu-hud-progress {
  position: absolute;
  left: 0; top: 0;
  height: var(--lu-edge);
  width: 100%;
  background: var(--lu-accent);
  transform-origin: left center;
  transform: scaleX(0);
}
@supports (animation-timeline: scroll()) {
  .lu-hud-progress {
    animation: lu-fill linear both;
    animation-timeline: scroll(nearest block);
  }
}
/* Without a scroll timeline there is no honest progress to draw, so the bar
   sits full rather than sitting empty and claiming the page is unread. */
@supports not (animation-timeline: scroll()) { .lu-hud-progress { transform: scaleX(1); } }
@keyframes lu-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }

.lu-hud-inner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 100%;
  max-width: 78rem;
  margin: 0 auto;
  padding: 0 0.75rem;
}
.lu-hud-who { display: flex; align-items: center; gap: 0.5rem; min-width: 0; }
.lu-plate {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(9 * var(--lu-px));
  height: calc(9 * var(--lu-px));
  background: var(--lu-accent);
  color: var(--lu-on-accent);
  font-family: var(--lu-display), ui-sans-serif, system-ui, sans-serif;
  font-size: 0.8125rem;
  box-shadow: 0 0 0 2px var(--lu-frame);
}
.lu-hud-names { display: flex; flex-direction: column; min-width: 0; line-height: 1.2; }
.lu-hud-name {
  font-family: var(--lu-display), ui-sans-serif, system-ui, sans-serif;
  font-size: 0.8125rem;
  text-transform: uppercase;
  color: var(--lu-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lu-hud-role { font-size: 0.6875rem; color: var(--lu-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.lu-hud-strip { display: flex; align-items: center; gap: 0.5rem; margin-left: auto; min-width: 0; }
.lu-hud-count { font-size: 0.5rem; color: var(--lu-accent-ink); flex: 0 0 auto; }
.lu-hud-here {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--lu-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lu-chips { display: none; margin: 0; padding: 0; list-style: none; gap: 3px; }
@media (min-width: 900px) { .lu-chips { display: flex; } .lu-hud-here { min-width: 8.5rem; } }
.lu-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  font-size: 0.5rem;
  text-decoration: none;
  color: var(--lu-muted);
  background: var(--lu-well);
  box-shadow: inset 0 0 0 2px var(--lu-rule);
  transition: color 140ms ease-out, background-color 140ms ease-out, box-shadow 140ms ease-out;
}
.lu-chip:hover { color: var(--lu-ink); box-shadow: inset 0 0 0 2px var(--lu-accent); }
.lu-chip-on { color: var(--lu-on-accent); background: var(--lu-accent); box-shadow: inset 0 0 0 2px var(--lu-frame); }
.lu-hud-menu {
  flex: 0 0 auto;
  min-height: 38px;
  padding: 0 0.7rem;
  border: 0;
  cursor: pointer;
  font-size: 0.5rem;
  color: var(--lu-on-accent);
  background: var(--lu-accent);
  box-shadow: 0 0 0 2px var(--lu-frame), 3px 3px 0 var(--lu-shadow);
  transition: transform 90ms steps(2), box-shadow 90ms steps(2);
}
.lu-hud-menu:active { transform: translate3d(3px, 3px, 0); box-shadow: 0 0 0 2px var(--lu-frame); }

/* ---- the pause screen ------------------------------------------------ */

.lu-pause { position: fixed; inset: 0; z-index: 40; display: flex; align-items: center; justify-content: center; padding: 1.25rem; }
.lu-pause-scrim { position: absolute; inset: 0; background: color-mix(in srgb, var(--lu-sky-hi) 78%, black); }
.lu-pause-window {
  position: relative;
  width: 100%;
  max-width: 26rem;
  max-height: calc(100dvh - 2.5rem);
  overflow-y: auto;
  padding: 1.5rem;
  background: var(--lu-paper);
  box-shadow:
    0 0 0 var(--lu-edge) var(--lu-frame),
    inset var(--lu-edge) var(--lu-edge) 0 var(--lu-lit),
    inset calc(-1 * var(--lu-edge)) calc(-1 * var(--lu-edge)) 0 var(--lu-dim),
    var(--lu-drop) var(--lu-drop) 0 var(--lu-shadow);
}
.lu-pause-title { margin: 0 0 1.1rem; font-size: 0.875rem; color: var(--lu-accent-ink); }
.lu-pause-list { margin: 0 0 1rem; padding: 0; list-style: none; }
.lu-pause-contact { display: grid; margin-bottom: 1.25rem; }
.lu-pause-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-height: 44px;
  padding: 0 0.35rem;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--lu-ink);
  overflow-wrap: anywhere;
}
.lu-pause-item:hover { color: var(--lu-accent-ink); background: var(--lu-well); }
.lu-pause-num { flex: 0 0 auto; display: flex; align-items: center; justify-content: center; width: 1.6rem; font-size: 0.5rem; color: var(--lu-muted); }
.lu-pause-icon { width: 15px; height: 15px; }
.lu-pause-hint { margin: 0.75rem 0 0; font-size: 0.75rem; color: var(--lu-muted); }

/* ---- reduced motion -------------------------------------------------- */

/* Reduced motion keeps everything the motion carried: the world is fully
   drawn, the runner is standing on the ground, every stage is in place, and
   the surfaces still answer a pointer. Only the travelling parts stop.
   
   The reading meter is deliberately left running. It is not autonomous
   motion, it is a readout of where the visitor has scrolled to, and
   freezing it would either lie about the page or drop a piece of real
   information for no accessibility gain. */
@media (prefers-reduced-motion: reduce) {
  .lu-layer, .lu-runner, .lu-runner-a, .lu-runner-b, .lu-hint-arrow, .lu-trophy::after {
    animation: none;
  }
  .lu-runner-b { opacity: 0; }
  .lu-trophy::after { display: none; }
  .lu-hint { animation: none; opacity: 1; transform: none; }
  .lu-stage { animation: none; opacity: 1; transform: none; }
  .lu-btn, .lu-action, .lu-card, .lu-item, .lu-slot-live, .lu-chip, .lu-hud-menu { transition-duration: 1ms; }
}
`;

function IconTrophy(props) {
  // Drawn as rects on the same integer grid as the world's art, so the one
  // decorative glyph in the content does not arrive in a different visual
  // language than everything around it.
  return (
    <svg viewBox="0 0 12 12" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" {...props}>
      <path d="M2 1h8v3H9v2H8v1H7v2h2v1H3V9h2V7H4V6H3V4H2z" />
      <path d="M0 1h2v3H1V3H0zM10 1h2v3h-1V3h-1z" />
      <path d="M2 11h8v1H2z" />
    </svg>
  );
}

export default function LevelUpTemplate({ data }) {
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

  const palette = getPalette("level-up", data.paletteId) || LEVEL_UP_PALETTES[0];
  const colors = palette.colors;
  const { PAPER, INK, INK_SOFT, MUTED, ACCENT, POP, FRAME, SKY_HI, SKY_LO, PALETTE } = colors;
  const night = relativeLuminance(PAPER) < 0.18;

  // Every derived surface tone in one place. The bevel highlights are mixes
  // of the panel color rather than fixed whites and blacks, so the same
  // rules produce a lit edge on a cream panel and on a near-black one.
  const cssVars = {
    "--lu-paper": PAPER,
    "--lu-ink": INK,
    "--lu-ink-soft": INK_SOFT,
    "--lu-muted": MUTED,
    "--lu-accent": ACCENT,
    "--lu-accent-ink": inkOn(ACCENT, night),
    "--lu-on-accent": onFill(ACCENT, PAPER, INK),
    "--lu-pop": POP,
    "--lu-on-pop": onFill(POP, PAPER, INK),
    "--lu-frame": FRAME,
    "--lu-sky-hi": SKY_HI,
    "--lu-sky-lo": SKY_LO,
    // The lit inner edge is mixed from FRAME on a dark palette and from
    // white on a light one: a percentage of white on a near-black panel is
    // still near-black, so the bevel would simply not exist.
    "--lu-lit": night
      ? `color-mix(in srgb, ${PAPER}, ${FRAME} 34%)`
      : `color-mix(in srgb, ${PAPER}, white 62%)`,
    "--lu-dim": `color-mix(in srgb, ${PAPER}, black ${night ? 55 : 16}%)`,
    // A well is cut *into* the panel, so it goes darker than the panel in
    // both directions: toward black on a dark palette, toward the ink on a
    // light one. Mixing ink into a near-black panel would have made the
    // recesses lighter than the surface they are cut into.
    "--lu-well": night ? `color-mix(in srgb, ${PAPER}, black 55%)` : `color-mix(in srgb, ${PAPER}, ${INK} 7%)`,
    "--lu-rule": `color-mix(in srgb, ${PAPER}, ${INK} 22%)`,
    "--lu-rule-strong": `color-mix(in srgb, ${PAPER}, ${INK} 42%)`,
    "--lu-shadow": `color-mix(in srgb, ${SKY_HI}, black 45%)`,
    // The trophy plate keeps one hue across all of them, since a row of
    // awards in four different colors reads as a color key rather than as
    // a set of awards.
    "--lu-gold": PALETTE[3],
    "--lu-gold-ink": inkOn(PALETTE[3], night),
  };

  const loadout = skills?.length > 0 ? buildLoadout(skills, projects, experience) : [];

  const sections = {
    experience: experience?.length > 0 && (
      <ol className="lu-quests">
        {experience.map((job, i) => {
          const live = isCurrent(job.end);
          return (
            <li key={i} className="lu-quest">
              <div className="lu-quest-head">
                <span className={`lu-tag lu-pixel ${live ? "lu-tag-live" : "lu-tag-done"}`}>
                  {live ? "In progress" : "Cleared"}
                </span>
                <span className="lu-years lu-pixel">{rangeLabel(job.start, job.end)}</span>
              </div>
              <p className="lu-quest-role">{job.role}</p>
              {job.company && <p className="lu-quest-org">{job.company}</p>}
              {job.bullets?.length > 0 && (
                <ul className="lu-objectives">
                  {job.bullets.map((line, j) => (
                    <li key={j} className="lu-objective">
                      <span className={`lu-box ${live ? "lu-box-open" : "lu-box-done"}`} aria-hidden="true" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    ),

    projects: projects?.length > 0 && (
      <ul className="lu-items">
        {projects.map((project, i) => {
          const hue = PALETTE[i % PALETTE.length];
          const label = project.name || "Untitled project";
          return (
            <li key={i}>
              <div
              className="lu-item"
              style={{
                "--lu-hue": hue,
                "--lu-hue-ink": inkOn(hue, night),
                "--lu-hue-on": onFill(hue, PAPER, INK),
              }}
            >
              <span className="lu-item-icon lu-pixel" aria-hidden="true">
                {label.trim().charAt(0).toUpperCase()}
              </span>
              <div className="lu-item-body">
                <div className="lu-item-head">
                  <h3 className="lu-item-name">{label}</h3>
                  {project.version && (
                    <span className="lu-item-ver lu-pixel">v{String(project.version).replace(/^v/i, "")}</span>
                  )}
                  {project.status && <span className="lu-tag lu-pixel lu-tag-done">{project.status}</span>}
                </div>
                {project.description && <p className="lu-item-desc">{project.description}</p>}
                {project.highlights?.length > 0 && (
                  <ul className="lu-effects">
                    {project.highlights.map((line, j) => (
                      <li key={j} className="lu-effect">
                        <span className="lu-effect-mark" aria-hidden="true">
                          +
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {project.tags?.length > 0 && (
                  <div className="lu-props">
                    {project.tags.map((tag) => (
                      <span key={tag} className="lu-prop">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {(project.link || project.demo) && (
                  <div className="lu-item-actions">
                    {project.link && (
                      <a
                        className="lu-action lu-pixel lu-focus"
                        href={`https://${stripProtocol(project.link)}`}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        Source
                        <span className="lu-sr"> for {label}</span>
                      </a>
                    )}
                    {project.demo && (
                      <a
                        className="lu-action lu-pixel lu-focus"
                        href={`https://${stripProtocol(project.demo)}`}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        Play
                        <span className="lu-sr"> the live demo of {label}</span>
                      </a>
                    )}
                  </div>
                )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    ),

    skills: loadout.length > 0 && <LoadoutRack slots={loadout} />,

    education: education?.length > 0 && (
      <ul className="lu-plaques">
        {education.map((entry, i) => (
          <li key={i} className="lu-plaque">
            <p className="lu-plaque-degree">{entry.degree}</p>
            {entry.school && <p className="lu-plaque-school">{entry.school}</p>}
            {(entry.start || entry.end) && (
              <p className="lu-plaque-years lu-pixel">{rangeLabel(entry.start, entry.end)}</p>
            )}
          </li>
        ))}
      </ul>
    ),

    achievements: achievements?.length > 0 && (
      <ul className="lu-trophies">
        {achievements.map((text, i) => (
          <li key={i} className="lu-trophy">
            <span className="lu-trophy-cup">
              <IconTrophy />
            </span>
            <p className="lu-trophy-text">{text}</p>
          </li>
        ))}
      </ul>
    ),

    codingProfiles: codingProfiles?.length > 0 && (
      <ul className="lu-cards">
        {codingProfiles.map((profile, i) => (
          <li key={i}>
            <a
              className="lu-card lu-focus"
              href={`https://${stripProtocol(profile.url)}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              <span className="lu-card-plat">{profile.platform}</span>
              <span className="lu-card-url">{stripProtocol(profile.url)}</span>
            </a>
          </li>
        ))}
      </ul>
    ),
  };

  // The stages of the level, in the customer's own order. Only the sections
  // they actually filled in become stages, so the numbering, the count in
  // the status bar and the pause screen's list all describe the same page.
  const stages = (sectionOrder || [])
    .filter((id) => sections[id])
    .map((id) => ({ id, anchor: `section-${id}`, label: STAGES[id] }));

  const contactLinks = [
    links?.github && { kind: "github", href: `https://${stripProtocol(links.github)}`, label: stripProtocol(links.github) },
    links?.linkedin && {
      kind: "linkedin",
      href: `https://${stripProtocol(links.linkedin)}`,
      label: stripProtocol(links.linkedin),
    },
    links?.website && { kind: "website", href: `https://${stripProtocol(links.website)}`, label: stripProtocol(links.website) },
  ].filter(Boolean);

  return (
    <div className={`lu-root ${pixel.variable} ${display.variable} ${body.variable}`} style={cssVars}>
      <style>{TEMPLATE_CSS}</style>

      <PixelSky colors={colors} night={night} />

      <main className="lu-flow">
        <header className="lu-title">
          <h1 className="lu-title-name">{name || "Your Name"}</h1>
          {role && <p className="lu-title-role lu-pixel">{role}</p>}
          {bio && <p className="lu-title-bio">{bio}</p>}

          <div className="lu-title-actions">
            {stages.length > 0 && (
              <a className="lu-btn lu-btn-primary lu-pixel lu-focus" href={`#${stages[0].anchor}`}>
                Press start
              </a>
            )}
            {email && (
              <a className="lu-btn lu-btn-ghost lu-pixel lu-focus" href={`mailto:${email}`}>
                Get in touch
              </a>
            )}
          </div>

          {stages.length > 0 && (
            <p className="lu-hint lu-pixel">
              <span className="lu-hint-arrow" aria-hidden="true" />
              Scroll to run
            </p>
          )}
        </header>

        {stages.map((stage, index) => (
          <section key={stage.id} id={stage.anchor} className="lu-stage" aria-labelledby={`${stage.anchor}-label`}>
            <div className="lu-stage-tab">
              <span className="lu-stage-num lu-pixel" aria-hidden="true">
                {pad(index + 1)}
              </span>
              <h2 id={`${stage.anchor}-label`} className="lu-stage-label">
                {stage.label}
              </h2>
            </div>
            <div className="lu-panel">{sections[stage.id]}</div>
          </section>
        ))}

        <footer className="lu-credits">
          <p className="lu-credits-head lu-pixel">Thanks for playing</p>
          {email && (
            <>
              <a
                className="lu-btn lu-btn-primary lu-pixel lu-focus"
                href={`mailto:${email}`}
                aria-label={`Email ${name || "me"}`}
              >
                Continue?
              </a>
              <p className="lu-credits-mail">{email}</p>
            </>
          )}
          {contactLinks.length > 0 && (
            <div className="lu-credits-links">
              {contactLinks.map((link) => (
                <a key={link.href} className="lu-credits-link lu-focus" href={link.href} target="_blank" rel="noreferrer noopener">
                  {link.label}
                </a>
              ))}
            </div>
          )}
          <p className="lu-credits-line">
            {`\u00a9 ${new Date().getFullYear()} ${name || "Your Name"} \u00b7 Made with Dev Portfolio Builder`}
          </p>
        </footer>
      </main>

      <PixelGround colors={colors} />

      <LevelHud
        name={name || "Your Name"}
        role={role}
        initials={initials(name)}
        stages={stages}
        email={email}
        links={contactLinks}
      />
    </div>
  );
}
