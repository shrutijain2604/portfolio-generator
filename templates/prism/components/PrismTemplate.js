"use client";

// Pure presentational component: renders portfolio `data`, holding no state
// beyond which band is in view, the contract every template here follows.
//
// Refraction as a behaviour, never a picture: nothing draws a prism. Headings
// print in three colour channels that sit apart and slide back into register
// as they come up the page. Section hues tap one continuous dispersion ramp
// across sectionOrder, so reordering re-tunes the page, and each skill sits at
// the true spectral position of the colour shared.js derives from its name,
// making the plate a readout of the entered stack rather than decoration.
//
// Convergence is scroll-linked through animation-timeline: view(), so it costs
// no scroll listener. Where that is unsupported, and under reduced motion, the
// channels rest converged: the finished state is the default.
//
// No photo: photoUrl is only offered for warm/scrapbook/spotify (see
// EditForm.js), so the aperture monogram is built from the name instead.

import { useEffect, useRef, useState } from "react";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { PRISM_PALETTES, getPalette } from "@/lib/palettes";
import { SECTION_DEFINITIONS } from "@/lib/portfolioData";
import { IconGithub, IconLinkedin, IconLink, IconMail, dotColor, shade, tint, stripProtocol } from "./shared";

// Space Grotesk for anything structural: a geometric grotesque with wide
// apertures and a faintly technical skeleton, which is the voice of
// instrument labelling rather than of a marketing page. IBM Plex Mono (not
// the JetBrains Mono two other templates already use) carries every readout,
// wavelength, and year, so numbers stay in one clearly mechanical register.
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--pr-display",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--pr-mono",
});

const SECTION_LABELS = Object.fromEntries(SECTION_DEFINITIONS.map((s) => [s.id, s.label]));

// What one entry in each section is called, so a band can state its own real
// size ("3 roles") without inventing a metric. Both forms are spelled out
// rather than suffixed with an "s", which turns "entry" into "entrys".
const SECTION_UNITS = {
  experience: ["role", "roles"],
  projects: ["project", "projects"],
  education: ["degree", "degrees"],
  achievements: ["entry", "entries"],
  skills: ["skill", "skills"],
  codingProfiles: ["profile", "profiles"],
};

// Palette colors are always "#rrggbb" (see lib/palettes.js), so plain hex
// parsing is enough for these, unlike shared.js's helpers, which also have
// to cope with the hsl() strings dotColor() returns for unknown labels.
function hexChannels(hex) {
  const clean = hex.replace("#", "");
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
}

function isDarkColor(hex) {
  const [r, g, b] = hexChannels(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

function channelHex(value) {
  return Math.round(Math.min(255, Math.max(0, value)))
    .toString(16)
    .padStart(2, "0");
}

function mixHex(a, b, t) {
  const [ar, ag, ab] = hexChannels(a);
  const [br, bg, bb] = hexChannels(b);
  return `#${channelHex(ar + (br - ar) * t)}${channelHex(ag + (bg - ag) * t)}${channelHex(ab + (bb - ab) * t)}`;
}

// A continuous dispersion ramp across the palette's four PALETTE stops, so
// each band draws its hue from the customer's chosen theme instead of a
// hardcoded rainbow: Sunset Blush disperses pink into gold, Cosmic Noir
// slate into ice blue. A palette whose stops repeat (there are a few) simply
// reads as a tighter spectrum rather than breaking.
function rampAt(stops, t) {
  const clamped = Math.min(1, Math.max(0, t));
  const scaled = clamped * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(scaled));
  return mixHex(stops[index], stops[index + 1], scaled - index);
}

// A lighter version of a color, the counterpart to shared.js's shade().
// color-mix() rather than hex maths because this also has to accept the
// hsl() strings dotColor() returns.
function lift(color, percent = 32) {
  return `color-mix(in srgb, ${color}, white ${percent}%)`;
}

// Small colored text has to clear WCAG AA against the palette's own PAPER,
// and a few PALETTE entries land just under 4.5:1 raw (Cosmic Noir's slate
// on near-black is about 4.3:1). Every hue used as *text* goes through here
// first; hues used as a rule, a swatch, or a glow do not need it.
function inkOn(color, isDark) {
  return isDark ? lift(color, 34) : shade(color, 48);
}

// dotColor() returns "#rrggbb" for a known language and "hsl(h, 65%, 60%)"
// otherwise, so both forms have to reduce to a hue before a skill can be
// placed on the spectrograph plate.
function hueOf(color) {
  const hsl = color.match(/^hsl\(\s*(-?\d+(?:\.\d+)?)/);
  if (hsl) return ((parseFloat(hsl[1]) % 360) + 360) % 360;
  const [r, g, b] = hexChannels(color).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return 0;
  let h;
  if (max === r) h = (g - b) / delta;
  else if (max === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  return (((h * 60) % 360) + 360) % 360;
}

// Where a color falls on a real visible spectrum: 0 at the violet end, 1 at
// the red end. Hue runs backwards through the spectrum, so magenta (above
// 300 degrees, which has no single wavelength) collapses onto the violet end
// and red sits at the far right. This is what makes the skills plate honest:
// a line's position is a property of its color, which shared.js derives from
// the skill's own name.
function spectralPosition(color) {
  const hue = hueOf(color);
  return Math.min(1, Math.max(0, (300 - Math.min(hue, 300)) / 300));
}

function plural(count, [one, many]) {
  return `${count} ${count === 1 ? one : many}`;
}

function bandDomId(id) {
  return `prism-band-${id}`;
}

// One `<style>` for the whole template, rendered once at the root: keyframes
// plus the two font hooks (a pseudo-element cannot be handed a className, and
// neither can an SVG child that needs the mono face). Every autoplaying
// animation sits inside `prefers-reduced-motion: no-preference`, so a
// reduced-motion preference never matches the rule at all and the
// un-animated element is already the finished state: no JS media check, and
// nothing left half-hidden.
const TEMPLATE_CSS = `
.pr-display { font-family: var(--pr-display), ui-sans-serif, system-ui, sans-serif; }
.pr-mono { font-family: var(--pr-mono), ui-monospace, SFMono-Regular, Menlo, monospace; }

/* The three channel copies are stacked with grid rather than by absolutely
   positioning two of them over a static third. Absolute copies have to be
   given a box to fill, and any property that changes an inline box's baseline
   (overflow on a truncated label is the one that bit) slides that copy out of
   register, which reads as doubled text rather than as fringing. Sharing one
   grid cell means all three are laid out by the same rules and wrap
   identically, at any width and any length. */
.pr-split-stack { display: grid; }
.pr-split-stack > * { grid-area: 1 / 1; }

/* The resting state, and the only state anywhere the enhancements below do not
   apply: channels just in register, a hair apart. Declared outside every
   @supports and @media guard on purpose, so this is what an unsupported
   browser and a reduced-motion reader both get, already finished. */
.pr-chroma-a { transform: translate3d(-1.5px, 0, 0); }
.pr-chroma-b { transform: translate3d(1.5px, 0, 0); }

/* Pointer-driven split, for the index. Pure CSS, so running a cursor down a
   list costs no listener and no re-render. */
.pr-split-hover .pr-chroma-a,
.pr-split-hover .pr-chroma-b { transition: transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1); }
.pr-index-stop:hover .pr-chroma-a,
.pr-index-stop:focus-visible .pr-chroma-a { transform: translate3d(-6px, 0, 0); }
.pr-index-stop:hover .pr-chroma-b,
.pr-index-stop:focus-visible .pr-chroma-b { transform: translate3d(6px, 0, 0); }
@media (prefers-reduced-motion: reduce) {
  .pr-split-hover .pr-chroma-a,
  .pr-split-hover .pr-chroma-b { transition-duration: 1ms; }
}

/* The signature: channels enter far apart and close as the element rises
   through the viewport. Two ranges, because the hero is the one element that
   is already on screen at load and so has no entry to animate over: it
   disperses as the page is scrolled away from, while every heading below
   converges as it arrives. */
@keyframes pr-converge-a {
  from { transform: translate3d(-7px, 0, 0); }
  to { transform: translate3d(-1.5px, 0, 0); }
}
@keyframes pr-converge-b {
  from { transform: translate3d(7px, 0, 0); }
  to { transform: translate3d(1.5px, 0, 0); }
}
@keyframes pr-disperse-a {
  from { transform: translate3d(-1.5px, 0, 0); }
  to { transform: translate3d(-13px, 0, 0); }
}
@keyframes pr-disperse-b {
  from { transform: translate3d(1.5px, 0, 0); }
  to { transform: translate3d(13px, 0, 0); }
}
@keyframes pr-emission-in {
  from { opacity: 0; transform: scaleY(0.15); }
  to { opacity: 1; transform: scaleY(1); }
}

/* Cards lift toward the reader and pick up a thin halo in their own band hue.
   Transform and box-shadow only, and the lift is kept to a few pixels: the
   depth here is meant to be felt rather than performed. */
.pr-card {
  transition: transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 280ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.pr-card:hover, .pr-card:focus-within {
  transform: translate3d(0, -4px, 0);
  box-shadow: 0 2px 8px rgba(15, 15, 35, 0.06), 0 26px 60px -18px color-mix(in srgb, var(--pr-card-hue) 42%, transparent);
}
@media (prefers-reduced-motion: reduce) {
  .pr-card { transition-duration: 1ms; }
  .pr-card:hover, .pr-card:focus-within { transform: none; }
}
@media (prefers-reduced-motion: no-preference) {
  .pr-emission { animation: pr-emission-in 700ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
}
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .pr-split .pr-chroma-a {
      animation: pr-converge-a linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 92%;
    }
    .pr-split .pr-chroma-b {
      animation: pr-converge-b linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 92%;
    }
    .pr-split-hero .pr-chroma-a {
      animation: pr-disperse-a linear both;
      animation-timeline: view();
      animation-range: exit -20% exit 100%;
    }
    .pr-split-hero .pr-chroma-b {
      animation: pr-disperse-b linear both;
      animation-timeline: view();
      animation-range: exit -20% exit 100%;
    }
  }
}
`;

function IconArrowOut(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

// One soft, static wash rather than a rendered light rig. The page needs a
// ground that is not flat paper on a wide viewport, but the old version drew a
// perspective floor grid receding to a horizon, which was the literalism this
// redesign is removing: it said "optical bench" out loud instead of letting the
// colour behave like light.
//
// Fixed, and clipped by its own wrapper rather than by an ancestor, so it stays
// under the viewport as the page scrolls and can never widen the document. It
// sits outside the `@container` element on purpose: a container context becomes
// the containing block for fixed descendants, which would silently turn this
// back into a page-height absolute layer.
function Wash({ colors, isDark }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute -left-[18%] -top-[26%] h-[86vh] w-[86vw]"
        style={{
          background: `radial-gradient(closest-side, ${tint(colors.PALETTE[0], isDark ? 24 : 13)}, transparent)`,
        }}
      />
      <div
        className="absolute -bottom-[30%] -right-[16%] h-[70vh] w-[70vw]"
        style={{
          background: `radial-gradient(closest-side, ${tint(colors.PALETTE[3], isDark ? 20 : 11)}, transparent)`,
        }}
      />
    </div>
  );
}

// A chromatic split held just short of illegible: two offset colored copies
// under a fully opaque copy in INK, so the text's contrast is exactly INK's and
// only the fringes are colored. `screen` on a dark theme and `multiply` on a
// light one, because either blend mode in the wrong direction just disappears
// into the background.
//
// `variant` picks what drives the offset. Headings converge as they arrive; the
// hero, already on screen before any scrolling has happened, has no arrival to
// animate and instead disperses as the reader leaves it; index labels split
// under the pointer. All three fall back to the same converged resting offset.
function ChromaticText({ children, colors, isDark, variant = "heading", className = "" }) {
  const blendMode = isDark ? "screen" : "multiply";
  const driver =
    variant === "hero" ? "pr-split-hero" : variant === "hover" ? "pr-split-hover" : "pr-split";
  return (
    <span className={`pr-split-stack ${driver} ${className}`}>
      <span
        aria-hidden
        className="pr-chroma-a"
        style={{ color: colors.PALETTE[0], mixBlendMode: blendMode, opacity: 0.75 }}
      >
        {children}
      </span>
      <span
        aria-hidden
        className="pr-chroma-b"
        style={{ color: colors.PALETTE[3], mixBlendMode: blendMode, opacity: 0.75 }}
      >
        {children}
      </span>
      <span>{children}</span>
    </span>
  );
}

// The page's one recurring graphic, and the only place the spectrum is drawn
// rather than behaved: a hairline carrying the customer's own band hues in
// order. It is the legend for the whole page, it costs a single gradient, and
// it stays a rule rather than becoming a picture of one.
function SpectralRule({ bands, colors, fade = "none" }) {
  const count = bands.length;
  const hues = count > 0 ? bands.map((band) => band.hue) : [colors.POP];
  const stops = hues.map((hue, i) => `${hue} ${hues.length > 1 ? (i / (hues.length - 1)) * 100 : 50}%`).join(", ");
  const mask =
    fade === "right"
      ? "linear-gradient(to right, black 55%, transparent)"
      : fade === "both"
        ? "linear-gradient(to right, transparent, black 12%, black 88%, transparent)"
        : undefined;
  return (
    <span
      aria-hidden
      className="block h-px w-full"
      style={{
        background: hues.length > 1 ? `linear-gradient(to right, ${stops})` : hues[0],
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}

// The section index, drawn as the spectrum itself with its stops labelled.
// Laying sections out along the spectrum makes the width carry information
// rather than be dead space, and puts the page's one idea to work as
// navigation: the reader picks a wavelength, not a contents row.
//
// Equal grid columns rather than positions computed from each band's hue, so
// no two labels can collide however long they are or however many sections
// there are. The rule above carries the true continuous dispersion.
function SectionIndex({ bands, colors, isDark }) {
  const count = bands.length;

  return (
    <nav aria-label="Sections">
      {/* Along the spectrum, once there is width to spread across. */}
      <div className="hidden @2xl:block">
        <SpectralRule bands={bands} colors={colors} />
        <ol className="grid" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
          {bands.map((band, i) => (
            <li key={band.id} className="min-w-0">
              <a
                href={`#${bandDomId(band.id)}`}
                className="pr-index-stop group block min-w-0 pb-1 pr-4 outline-none focus-visible:ring-2"
                style={{ "--tw-ring-color": band.hue }}
              >
                {/* The tick hangs off the rule above. Scaled rather than
                    grown, so lengthening it on hover never touches layout. */}
                <span
                  aria-hidden
                  className="block h-7 w-px origin-top scale-y-[0.42] transition-transform duration-300 ease-out group-hover:scale-y-100 group-focus-visible:scale-y-100"
                  style={{ backgroundColor: band.hue }}
                />
                <span className="pr-mono mt-3 block text-[10.5px] tabular-nums" style={{ color: colors.MUTED }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="pr-display mt-2 block break-words text-[13px] font-medium uppercase leading-tight tracking-[0.12em]"
                  style={{ color: colors.INK_SOFT }}
                >
                  <ChromaticText colors={colors} isDark={isDark} variant="hover">
                    {band.label}
                  </ChromaticText>
                </span>
                <span className="pr-mono mt-2 block text-[10.5px] tabular-nums" style={{ color: colors.MUTED }}>
                  {plural(band.count, band.unit)}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>

      {/* Stacked in a narrow column, where a row has no dead gutter to leave
          and spreading six labels across the width would only crush them. */}
      <ol className="@2xl:hidden" style={{ borderBottom: `1px solid ${tint(colors.INK, 10)}` }}>
        {bands.map((band, i) => (
          <li key={band.id}>
            <a
              href={`#${bandDomId(band.id)}`}
              className="pr-index-stop group flex items-center gap-3.5 py-3.5 outline-none focus-visible:ring-2"
              style={{
                borderTop: `1px solid ${tint(colors.INK, 10)}`,
                "--tw-ring-color": band.hue,
              }}
            >
              <span className="pr-mono shrink-0 text-[10.5px] tabular-nums" style={{ color: colors.MUTED }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                aria-hidden
                className="h-px w-5 shrink-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-[1.8] group-focus-visible:scale-x-[1.8]"
                style={{ backgroundColor: band.hue }}
              />
              <span
                className="pr-display min-w-0 flex-1 break-words text-[12.5px] font-medium uppercase tracking-[0.12em]"
                style={{ color: colors.INK_SOFT }}
              >
                <ChromaticText colors={colors} isDark={isDark} variant="hover">
                  {band.label}
                </ChromaticText>
              </span>
              <span className="pr-mono shrink-0 text-[10.5px] tabular-nums" style={{ color: colors.MUTED }}>
                {plural(band.count, band.unit)}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Vertical spectrum rail, sticky beside the content on a wide canvas. Every
// tick is a real anchor, so this is keyboard-navigable section navigation
// rather than a decorative scroll indicator. Labels stay in the DOM (so each
// link keeps its accessible name) but only the active or hovered one is
// visible: six vertical labels shown at once would collide on a short
// viewport.
function SpectrumRail({ bands, activeId, colors, isDark }) {
  const count = bands.length;
  const stops = bands.map((band, i) => `${band.hue} ${count > 1 ? (i / (count - 1)) * 100 : 50}%`).join(", ");
  return (
    // The nav is taken out of flow so a viewport-tall sticky rail cannot
    // inflate the grid row it shares with the content: left in flow, `h-dvh`
    // became the row's minimum height, and a portfolio shorter than one
    // viewport ended up with a screen of dead space before its closing
    // section. `max-h-full` then clamps the rail to the row for exactly that
    // short-content case, where there is nothing to scroll past anyway.
    <div className="relative hidden @4xl:block">
      <nav aria-label="Sections" className="absolute inset-0">
        <div className="sticky top-0 flex h-dvh max-h-full items-center">
          <div className="relative h-[76%] w-full">
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-px"
              style={{
                background: count > 1 ? `linear-gradient(to bottom, ${stops})` : bands[0]?.hue,
                boxShadow: `0 0 12px ${tint(bands[Math.floor(count / 2)]?.hue || colors.POP, 70)}`,
              }}
            />
            <ul className="absolute inset-0">
              {bands.map((band, i) => {
                const active = band.id === activeId;
                return (
                  <li
                    key={band.id}
                    className="absolute left-0 -translate-y-1/2"
                    style={{
                      top: `${count > 1 ? (i / (count - 1)) * 100 : 50}%`,
                    }}
                  >
                    <a
                      href={`#${bandDomId(band.id)}`}
                      aria-current={active ? "true" : undefined}
                      className="group flex items-center gap-2.5 outline-none focus-visible:ring-2"
                      style={{ "--tw-ring-color": band.hue }}
                    >
                      <span
                        aria-hidden
                        className="h-px w-[26px] origin-left transition-transform duration-300 ease-out"
                        style={{
                          backgroundColor: band.hue,
                          transform: `scaleX(${active ? 1 : 0.45})`,
                          boxShadow: active ? `0 0 10px ${band.hue}` : "none",
                        }}
                      />
                      <span
                        className={`pr-mono text-[10px] uppercase tracking-[0.18em] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 ${
                          active ? "opacity-100" : "opacity-0"
                        }`}
                        style={{
                          writingMode: "vertical-rl",
                          color: active ? inkOn(band.hue, isDark) : colors.MUTED,
                        }}
                      >
                        {band.label}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

// The rail's narrow-canvas form: the same spectrum laid horizontally with a
// travelling marker and the active band named in full. Sticky rather than
// fixed so it can never cover the content it indexes.
function SpectrumStrip({ bands, activeId, colors, isDark }) {
  const count = bands.length;
  const activeIndex = Math.max(
    0,
    bands.findIndex((band) => band.id === activeId),
  );
  const active = bands[activeIndex];
  const stops = bands.map((band, i) => `${band.hue} ${count > 1 ? (i / (count - 1)) * 100 : 50}%`).join(", ");
  return (
    <div
      className="sticky top-0 z-30 -mx-5 mb-2 flex items-center gap-3 px-5 py-3 backdrop-blur-md @2xl:-mx-10 @2xl:px-10 @4xl:hidden"
      style={{
        backgroundColor: isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.72)",
        borderBottom: `1px solid ${tint(colors.INK, 12)}`,
      }}
    >
      <div
        aria-hidden
        className="relative h-px min-w-0 flex-1"
        style={{
          background: count > 1 ? `linear-gradient(to right, ${stops})` : bands[0]?.hue,
        }}
      >
        <span
          className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 transition-[left] duration-300 ease-out"
          style={{
            left: `${count > 1 ? (activeIndex / (count - 1)) * 100 : 50}%`,
            backgroundColor: active?.hue,
            boxShadow: `0 0 10px ${active?.hue}`,
          }}
        />
      </div>
      <span className="pr-mono shrink-0 text-[10px] uppercase tracking-[0.18em]" style={{ color: colors.INK_SOFT }}>
        {active?.label}
      </span>
    </div>
  );
}

function Band({ band, index, colors, isDark, innerRef, children }) {
  return (
    <section id={bandDomId(band.id)} ref={innerRef} data-band-id={band.id} className="scroll-mt-16 pt-10 @4xl:scroll-mt-8">
      <header className="mb-8">
        <div
          aria-hidden
          className="h-px w-full"
          style={{
            background: `linear-gradient(to right, ${band.hue}, ${tint(band.hue, 22)} 34%, transparent 78%)`,
          }}
        />
        <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="pr-mono text-[11px] tabular-nums" style={{ color: colors.MUTED }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          {/* Every section heading is where the page repeats its one idea: the
              channels arrive apart and close as the heading rises. */}
          <h2 className="pr-display text-[clamp(1.35rem,3cqw,2.1rem)] font-semibold tracking-tight" style={{ color: colors.INK }}>
            <ChromaticText colors={colors} isDark={isDark}>
              {band.label}
            </ChromaticText>
          </h2>
          <span className="pr-mono text-[11px] tabular-nums" style={{ color: colors.MUTED }}>
            {plural(band.count, band.unit)}
          </span>
        </div>
      </header>
      {children}
    </section>
  );
}

// A card that lifts toward the reader and lights its own top edge with the
// page's spectrum. The previous version tilted in 3D under the cursor and drew
// two colored border fringes that leaned with the pointer, plus corner
// brackets to look like a mounted optic: that was the literalism this redesign
// removes, and it also meant a mousemove handler measuring geometry on every
// card in a grid. What is left is one transform, no listener, and the same
// affordance.
function RefractionCard({ children, hue, colors, isDark }) {
  return (
    <article
      className="pr-card group relative min-w-0 p-5 @2xl:p-6"
      style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.62)",
        border: `1px solid ${tint(colors.INK, isDark ? 12 : 14)}`,
        boxShadow: isDark ? "0 18px 50px rgba(0,0,0,0.4)" : "0 18px 50px rgba(15,15,35,0.07)",
        "--pr-card-hue": hue,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-within:scale-x-100"
        style={{
          background: `linear-gradient(to right, ${colors.PALETTE[0]}, ${colors.PALETTE[1]}, ${colors.POP}, ${colors.PALETTE[3]})`,
        }}
      />
      <div className="relative">{children}</div>
    </article>
  );
}

// Experience as a beam path: one node per role on a single ray. Years read
// vertically in mono, which keeps the column narrow and means the dates never
// need a dash between them.
function ExperienceBand({ experience, hue, colors }) {
  return (
    <ol className="space-y-9">
      {experience.map((job, i) => (
        <li
          key={`${job.company}-${job.role}-${i}`}
          className="grid grid-cols-[2.6rem_1.25rem_minmax(0,1fr)] gap-x-3 @2xl:grid-cols-[4.5rem_1.5rem_minmax(0,1fr)] @2xl:gap-x-5"
        >
          <div className="pr-mono pt-0.5 text-right text-[11px] tabular-nums leading-tight" style={{ color: colors.MUTED }}>
            {job.end && <div style={{ color: colors.INK_SOFT }}>{job.end}</div>}
            {job.end && job.start && <div aria-hidden className="my-1.5 ml-auto h-2.5 w-px" style={{ backgroundColor: tint(colors.INK, 25) }} />}
            {job.start && <div>{job.start}</div>}
          </div>
          <div aria-hidden className="relative">
            <span className="absolute left-1/2 top-1 h-2.5 w-2.5 -translate-x-1/2 rotate-45" style={{ backgroundColor: hue, boxShadow: `0 0 12px ${hue}` }} />
            {i < experience.length - 1 && (
              <span
                className="absolute bottom-[-2.25rem] left-1/2 top-5 w-px -translate-x-1/2"
                style={{
                  background: `linear-gradient(to bottom, ${tint(hue, 70)}, ${tint(hue, 12)})`,
                }}
              />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="pr-display break-words text-[16.5px] font-semibold leading-snug" style={{ color: colors.INK }}>
              {job.role || "Role"}
            </h3>
            {job.company && (
              <p className="pr-mono mt-1 break-words text-[12px] uppercase tracking-[0.12em]" style={{ color: colors.MUTED }}>
                {job.company}
              </p>
            )}
            {job.bullets?.length > 0 && (
              <ul className="mt-3 space-y-2">
                {job.bullets.map((line, j) => (
                  <li key={j} className="flex min-w-0 gap-3">
                    <span aria-hidden className="mt-[0.7em] h-px w-3.5 shrink-0" style={{ backgroundColor: tint(hue, 70) }} />
                    <span className="min-w-0 whitespace-pre-line break-words text-[14.5px] leading-relaxed" style={{ color: colors.INK_SOFT }}>
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function ProjectsBand({ projects, hue, colors, isDark }) {
  return (
    <div className="grid gap-5 @3xl:grid-cols-2">
      {projects.map((project, i) => (
        <RefractionCard key={`${project.name}-${i}`} hue={hue} colors={colors} isDark={isDark}>
          <div className="flex items-baseline gap-3">
            <span className="pr-mono text-[11px] tabular-nums" style={{ color: colors.MUTED }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="pr-display min-w-0 flex-1 break-words text-[17px] font-semibold leading-snug" style={{ color: colors.INK }}>
              {project.name || "Project"}
            </h3>
            {project.version && (
              <span className="pr-mono shrink-0 text-[11px] tabular-nums" style={{ color: colors.MUTED }}>
                v{project.version}
              </span>
            )}
          </div>
          {project.status && (
            <p className="pr-mono mt-2 inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.16em]" style={{ color: inkOn(hue, isDark) }}>
              <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: hue }} />
              {project.status}
            </p>
          )}
          {project.description && (
            <p className="mt-3 whitespace-pre-line break-words text-[14.5px] leading-relaxed" style={{ color: colors.INK_SOFT }}>
              {project.description}
            </p>
          )}
          {project.highlights?.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {project.highlights.map((line, j) => (
                <li key={j} className="flex min-w-0 gap-3">
                  <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0" style={{ backgroundColor: tint(hue, 70) }} />
                  <span className="min-w-0 break-words text-[13.5px] leading-relaxed" style={{ color: colors.INK_SOFT }}>
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {project.tags?.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="pr-mono px-2 py-1 text-[10.5px] uppercase tracking-[0.1em]"
                  style={{
                    backgroundColor: tint(dotColor(tag), isDark ? 16 : 12),
                    color: inkOn(dotColor(tag), isDark),
                  }}
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
          {(project.link || project.demo) && (
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              {project.link && (
                <a
                  href={`https://${stripProtocol(project.link)}`}
                  className="pr-mono inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.14em] underline-offset-4 outline-none hover:underline focus-visible:underline"
                  style={{ color: inkOn(hue, isDark) }}
                >
                  Source <IconArrowOut className="h-3 w-3 shrink-0" />
                </a>
              )}
              {project.demo && (
                <a
                  href={`https://${stripProtocol(project.demo)}`}
                  className="pr-mono inline-flex items-center gap-1.5 text-[11.5px] uppercase tracking-[0.14em] underline-offset-4 outline-none hover:underline focus-visible:underline"
                  style={{ color: inkOn(hue, isDark) }}
                >
                  Live <IconArrowOut className="h-3 w-3 shrink-0" />
                </a>
              )}
            </div>
          )}
        </RefractionCard>
      ))}
    </div>
  );
}

// Skills as an emission spectrum. Each line sits at the true spectral position
// of the colour shared.js derives from that skill's name, so the plate is a
// readout of what was entered rather than a decorative gradient. It is
// aria-hidden with the list below carrying the same information as text, and
// stays near-black on every palette, because that is what a spectrum is read
// off.
//
// Two skills sharing a hue would land on one line and hide each other (Python
// and PostgreSQL both sit near 210 degrees), so positions are pushed apart by
// the smallest gap that keeps both legible. Spectral order is preserved.
const MIN_LINE_GAP = 0.035;

function SkillsBand({ skills, colors }) {
  const lines = skills
    .map((skill) => {
      const color = dotColor(skill);
      return { skill, color, position: spectralPosition(color) };
    })
    .sort((a, b) => a.position - b.position);
  let previous = -1;
  lines.forEach((line) => {
    line.position = Math.min(1, Math.max(line.position, previous + MIN_LINE_GAP));
    previous = line.position;
  });

  return (
    <div>
      <div
        aria-hidden
        className="relative h-24 overflow-hidden @2xl:h-32"
        style={{
          backgroundColor: "#04040b",
          border: `1px solid ${tint(colors.INK, 14)}`,
        }}
      >
        {/* Wavelength graticule, so an empty stretch of the plate reads as
            "no lines here" rather than as a plate that failed to draw. */}
        <div
          className="absolute inset-x-0 bottom-0 h-2.5"
          style={{
            backgroundImage: "repeating-linear-gradient(to right, rgba(255,255,255,0.3) 0 1px, transparent 1px 8.3333%)",
            backgroundPosition: "2% 0",
            backgroundSize: "96% 100%",
            backgroundRepeat: "no-repeat",
          }}
        />
        {lines.map((line, i) => (
          <span
            key={line.skill}
            className="pr-emission absolute inset-y-0"
            style={{
              left: `${2 + line.position * 96}%`,
              animationDelay: `${i * 45}ms`,
            }}
          >
            <span
              className="absolute inset-y-0 left-1/2 w-[16px] -translate-x-1/2 blur-[7px]"
              style={{
                background: `linear-gradient(to bottom, transparent, ${line.color} 18%, ${line.color} 82%, transparent)`,
                opacity: 0.4,
              }}
            />
            <span
              className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2"
              style={{
                background: `linear-gradient(to bottom, transparent, ${line.color} 12%, ${line.color} 88%, transparent)`,
                boxShadow: `0 0 14px ${line.color}`,
              }}
            />
          </span>
        ))}
      </div>
      <div aria-hidden className="mt-1.5 flex justify-between">
        {[400, 500, 600, 700].map((nm) => (
          <span key={nm} className="pr-mono text-[10px] tabular-nums" style={{ color: colors.MUTED }}>
            {nm}nm
          </span>
        ))}
      </div>
      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5">
        {lines.map((line) => (
          <li key={line.skill} className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden
              className="h-3 w-px shrink-0"
              style={{
                backgroundColor: line.color,
                boxShadow: `0 0 8px ${line.color}`,
              }}
            />
            <span className="pr-display break-words text-[14px] font-medium" style={{ color: colors.INK_SOFT }}>
              {line.skill}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EducationBand({ education, hue, colors }) {
  return (
    <ul>
      {education.map((edu, i) => (
        <li
          key={`${edu.school}-${i}`}
          className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-4 py-4"
          style={{ borderTop: `1px solid ${tint(colors.INK, 12)}` }}
        >
          <p className="pr-mono pt-0.5 text-[11px] tabular-nums" style={{ color: colors.MUTED }}>
            {[edu.start, edu.end].filter(Boolean).join(" / ")}
          </p>
          <div className="min-w-0">
            <h3 className="pr-display break-words text-[15.5px] font-semibold leading-snug" style={{ color: colors.INK }}>
              {edu.degree || "Degree"}
            </h3>
            {edu.school && (
              <p className="mt-1 flex min-w-0 items-center gap-2 break-words text-[13.5px]" style={{ color: colors.INK_SOFT }}>
                <span aria-hidden className="h-px w-3 shrink-0" style={{ backgroundColor: tint(hue, 70) }} />
                {edu.school}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function AchievementsBand({ achievements, hue, colors }) {
  return (
    <ul className="space-y-4">
      {achievements.map((item, i) => (
        <li key={i} className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-4">
          <span
            aria-hidden
            className="relative mt-[0.7em] block h-px w-full"
            style={{
              background: `linear-gradient(to right, transparent, ${hue})`,
            }}
          >
            <span
              className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
              style={{ backgroundColor: hue, boxShadow: `0 0 10px ${hue}` }}
            />
          </span>
          <p className="min-w-0 break-words text-[14.5px] leading-relaxed" style={{ color: colors.INK_SOFT }}>
            {item}
          </p>
        </li>
      ))}
    </ul>
  );
}

function ProfilesBand({ codingProfiles, colors, isDark }) {
  return (
    <ul>
      {codingProfiles.map((profile, i) => {
        const color = dotColor(profile.platform);
        return (
          <li key={`${profile.platform}-${i}`} style={{ borderTop: `1px solid ${tint(colors.INK, 12)}` }}>
            <a
              href={`https://${stripProtocol(profile.url)}`}
              className="group flex min-w-0 items-center gap-3.5 py-3.5 outline-none focus-visible:ring-2"
              style={{ "--tw-ring-color": color }}
            >
              <span
                aria-hidden
                className="h-3 w-3 shrink-0 rounded-full border-2 transition-transform duration-200 group-hover:scale-125"
                style={{ borderColor: color }}
              />
              <span className="pr-display shrink-0 text-[14.5px] font-medium" style={{ color: colors.INK }}>
                {profile.platform}
              </span>
              <span className="pr-mono min-w-0 flex-1 truncate text-[12px]" style={{ color: colors.MUTED }}>
                {stripProtocol(profile.url)}
              </span>
              <IconArrowOut
                className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                style={{ color: inkOn(color, isDark) }}
              />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

// The closing move, expressed the way the rest of the page expresses light:
// the spectrum runs the full width and resolves into a single line of INK, so
// the dispersion the page opened with comes back to white. Previously this was
// an SVG of every band's ray converging on a point, which is the diagram this
// redesign is removing. A gradient says the same thing and stays a rule.
function Recombination({ bands, colors }) {
  return (
    <div aria-hidden className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-center">
      <SpectralRule bands={bands} colors={colors} />
      <span
        className="block h-px w-full"
        style={{ background: `linear-gradient(to right, ${colors.INK}, ${tint(colors.INK, 12)})` }}
      />
    </div>
  );
}

export default function PrismTemplate({ data }) {
  const { name, role, bio, email, links, skills, codingProfiles, experience, education, achievements, projects, sectionOrder } = data;

  const palette = getPalette("prism", data.paletteId) || PRISM_PALETTES[0];
  const colors = palette.colors;
  const { PAPER, INK, INK_SOFT, MUTED, POP, PALETTE } = colors;
  const isDark = isDarkColor(PAPER);

  const entries = {
    experience: experience || [],
    projects: projects || [],
    education: education || [],
    achievements: achievements || [],
    skills: skills || [],
    codingProfiles: codingProfiles || [],
  };

  // Only sections that actually have content become bands, and each band's
  // hue is its own slot on the palette's dispersion ramp, so a customer with
  // two sections gets two cleanly separated colors rather than two
  // neighbours out of a fixed four.
  const populated = (sectionOrder || []).filter((id) => entries[id]?.length > 0);
  const bands = populated.map((id, i) => {
    const hue = rampAt(PALETTE, populated.length > 1 ? i / (populated.length - 1) : 0.5);
    return {
      id,
      label: SECTION_LABELS[id],
      unit: SECTION_UNITS[id],
      count: entries[id].length,
      hue,
    };
  });

  const bandRefs = useRef([]);
  const [activeId, setActiveId] = useState(bands[0]?.id || null);
  const bandKey = populated.join(",");
  // Falls back to the first band when the tracked one has since been removed
  // (a section emptied in the editor), so neither rail can end up with
  // nothing lit.
  const currentId = bands.some((band) => band.id === activeId) ? activeId : bands[0]?.id;

  // Which band is in view drives both rail forms. An IntersectionObserver
  // watching a thin strip across the middle of the viewport is what makes
  // this work identically on the deployed page and inside the builder's
  // scrollable preview pane, where a window-scroll listener would be reading
  // the wrong scroller entirely. The rects come from the entries, so nothing
  // here forces a layout.
  useEffect(() => {
    const nodes = bandRefs.current.filter(Boolean);
    if (nodes.length === 0) return undefined;
    const observer = new IntersectionObserver(
      (observed) => {
        const visible = observed
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
        if (visible.length > 0) setActiveId(visible[0].target.dataset.bandId);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [bandKey]);

  // Friendly labels ("GitHub", not the raw URL): these only ever render as
  // the closing section's buttons, which read better as a short action name
  // than as a handle. Deliberately the page's only contact block: a second
  // copy up in the hero is the duplication Front Page already had to lose.
  const contactItems = [
    email && { label: "Email", href: `mailto:${email}`, Icon: IconMail },
    links?.github && {
      label: "GitHub",
      href: `https://${stripProtocol(links.github)}`,
      Icon: IconGithub,
    },
    links?.linkedin && {
      label: "LinkedIn",
      href: `https://${stripProtocol(links.linkedin)}`,
      Icon: IconLinkedin,
    },
    links?.website && {
      label: "Website",
      href: `https://${stripProtocol(links.website)}`,
      Icon: IconLink,
    },
  ].filter(Boolean);

  function renderBandBody(band) {
    if (band.id === "experience") return <ExperienceBand experience={experience} hue={band.hue} colors={colors} />;
    if (band.id === "projects") return <ProjectsBand projects={projects} hue={band.hue} colors={colors} isDark={isDark} />;
    if (band.id === "skills") return <SkillsBand skills={skills} colors={colors} />;
    if (band.id === "education") return <EducationBand education={education} hue={band.hue} colors={colors} />;
    if (band.id === "achievements") return <AchievementsBand achievements={achievements} hue={band.hue} colors={colors} />;
    if (band.id === "codingProfiles") return <ProfilesBand codingProfiles={codingProfiles} colors={colors} isDark={isDark} />;
    return null;
  }

  return (
    // `overflow-x-clip`, not `overflow-hidden`: clip keeps the wide light
    // sources from widening the page without turning this into a scroll
    // container, which would break the rail's `position: sticky`.
    <div className="relative min-h-dvh overflow-x-clip" style={{ backgroundColor: PAPER, color: INK }}>
      <style>{TEMPLATE_CSS}</style>
      <Wash colors={colors} isDark={isDark} />

      {/* The container context lives here rather than on the root so the
          fixed wash above still resolves against the viewport, and so every
          `cqw` type size and `@` breakpoint below measures the actual content
          column, which is what lets this fit the builder's half-width
          preview pane as well as a full page. The padding sits on the inner
          wrapper because a query container cannot match a container query
          against itself. */}
      <div className={`${display.variable} ${mono.variable} @container relative mx-auto w-full max-w-[1440px]`}>
        <div className="px-5 py-10 @2xl:px-10 @2xl:py-14 @5xl:px-16">
          {/* The name is the light source, so it gets the whole column and
              the page's loudest split. The old hero gave half its width to a
              drawing of a prism and squeezed the person into the other half;
              here the person is the hero and the index sits beneath, where an
              index belongs. */}
          <header>
            <div className="flex items-center gap-4 pb-12 @2xl:pb-16">
              <span className="pr-mono shrink-0 text-[10.5px] uppercase tracking-[0.3em]" style={{ color: MUTED }}>
                {palette.label}
              </span>
              <span className="min-w-0 flex-1">
                <SpectralRule bands={bands} colors={colors} fade="right" />
              </span>
            </div>

            <h1
              className="pr-display break-words text-[clamp(2.6rem,10.5cqw,8rem)] font-bold leading-[0.9] tracking-[-0.035em]"
              style={{ color: INK, textWrap: "balance" }}
            >
              <ChromaticText colors={colors} isDark={isDark} variant="hero">
                {name || "Your Name"}
              </ChromaticText>
            </h1>

            {/* Role and summary share a bottom edge rather than a top one. Top
                aligned, a one-line role beside a four-line paragraph left the
                paragraph hanging in the corner with nothing to relate to and
                an empty quarter of the page under it; sitting them on the same
                baseline makes the pair read as one block. The summary also
                gets a spectral edge to hang off, so it is anchored to
                something instead of floating in white space. */}
            <div className="mt-7 grid gap-x-12 gap-y-7 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] @3xl:items-end">
              <p
                className="pr-mono break-words text-[clamp(0.78rem,1.4cqw,0.95rem)] uppercase leading-relaxed tracking-[0.2em]"
                style={{ color: INK_SOFT }}
              >
                {role || "Your Role"}
              </p>
              {bio && (
                <p
                  className="max-w-[54ch] whitespace-pre-line break-words pl-5 text-[15.5px] leading-relaxed"
                  style={{
                    color: INK_SOFT,
                    borderLeft: `2px solid transparent`,
                    borderImage: `linear-gradient(to bottom, ${bands[0]?.hue || POP}, ${
                      bands[bands.length - 1]?.hue || POP
                    }) 1`,
                  }}
                >
                  {bio}
                </p>
              )}
            </div>

            {bands.length > 0 && (
              <div className="mt-12 @2xl:mt-16">
                <SectionIndex bands={bands} colors={colors} isDark={isDark} />
              </div>
            )}
          </header>

          {bands.length > 0 && (
            <div className="mt-10 @4xl:grid @4xl:grid-cols-[7rem_minmax(0,1fr)] @4xl:gap-10">
              <SpectrumRail bands={bands} activeId={currentId} colors={colors} isDark={isDark} />
              <main className="min-w-0">
                <SpectrumStrip bands={bands} activeId={currentId} colors={colors} isDark={isDark} />
                {bands.map((band, i) => (
                  <Band
                    key={band.id}
                    band={band}
                    index={i}
                    colors={colors}
                    isDark={isDark}
                    innerRef={(node) => {
                      bandRefs.current[i] = node;
                    }}
                  >
                    {renderBandBody(band)}
                  </Band>
                ))}
              </main>
            </div>
          )}

          {contactItems.length > 0 && (
            <section className="mt-24">
              <Recombination bands={bands} colors={colors} />
              <div className="mt-6 flex flex-col gap-5 @2xl:flex-row @2xl:items-end @2xl:justify-between">
                <div>
                  <p className="pr-mono text-[10.5px] uppercase tracking-[0.3em]" style={{ color: MUTED }}>
                    Contact
                  </p>
                  <h2 className="pr-display mt-2 text-[clamp(1.6rem,4cqw,2.6rem)] font-semibold tracking-tight" style={{ color: INK }}>
                    Get in touch
                  </h2>
                </div>
                <ul className="flex flex-wrap items-center gap-2.5">
                  {contactItems.map(({ label, href, Icon }, i) => (
                    <li key={href}>
                      <a
                        href={href}
                        className="pr-mono inline-flex items-center gap-2 px-4 py-2.5 text-[11.5px] uppercase tracking-[0.16em] outline-none transition-colors focus-visible:ring-2"
                        style={{
                          border: `1px solid ${i === 0 ? tint(POP, 60) : tint(INK, 20)}`,
                          backgroundColor: i === 0 ? tint(POP, isDark ? 18 : 14) : "transparent",
                          color: i === 0 ? inkOn(POP, isDark) : INK_SOFT,
                          "--tw-ring-color": POP,
                        }}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span>{label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 pt-6" style={{ borderTop: `1px solid ${tint(INK, 12)}` }}>
            <p className="pr-mono text-[10.5px] uppercase tracking-[0.2em]" style={{ color: MUTED }}>
              © {new Date().getFullYear()} {name || "Your Name"}
            </p>
            <p className="pr-mono text-[10.5px] uppercase tracking-[0.2em]" style={{ color: MUTED, opacity: 0.7 }}>
              Made with Dev Portfolio Builder
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
