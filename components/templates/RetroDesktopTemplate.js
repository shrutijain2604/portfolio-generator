"use client";

// A real desktop, not a picture of one.
//
// The component renders only from the `data` prop, like every other template,
// but it also owns a small window manager: windows open, focus, stack, drag,
// resize, minimise, maximise and close, the taskbar lists what is actually
// open, and the Start menu launches things. That machinery is the point. A
// desktop that cannot do those is a screenshot with a wallpaper behind it, and
// a visitor spots the difference in about two seconds.
//
// Three shells (Windows 95, Windows 11, macOS) share one content model, built
// once from `data`. Only the chrome changes per shell: bevels versus mica
// versus vibrancy, taskbar versus dock, and the fonts and scrollbars each
// system is recognised by. The shell is local UI state, not saved portfolio
// data: it is a display preference a visitor can play with, the same way
// toggling light and dark on a website does not require an account.
//
// No photo: the builder only offers photoUrl for warm/scrapbook/spotify, so
// there is never one to render here.

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IconGithub, IconLinkedin, IconLink, stripProtocol, computeYearsOfExperience, initials } from "./shared";
import CursorGlow from "./CursorGlow";

// Windows 95 drew every surface with a four-tone bevel: black and white for
// the outer edge, grey and silver for the inner. Everything raised in that
// shell is this shadow, everything inset is its mirror, and getting the four
// tones right is most of what makes the era read correctly.
const RAISED = "inset -1px -1px 0 #0a0a0a, inset 1px 1px 0 #fff, inset -2px -2px 0 #808080, inset 2px 2px 0 #dfdfdf";
const SUNKEN = "inset 1px 1px 0 #0a0a0a, inset -1px -1px 0 #fff, inset 2px 2px 0 #808080, inset -2px -2px 0 #dfdfdf";
const RAISED_THIN = "inset -1px -1px 0 #808080, inset 1px 1px 0 #fff";
const SUNKEN_THIN = "inset 1px 1px 0 #808080, inset -1px -1px 0 #fff";
const TITLE_ACTIVE = "linear-gradient(90deg, #000080, #1084d0)";
const TITLE_IDLE = "linear-gradient(90deg, #7f7f7f, #b4b4b4)";

// Windows 11 publishes the colours it paints itself with, down to the odd
// alphas, and an Explorer window in light mode is exactly these values. Reading
// them off the design system rather than reaching for a nearby Tailwind blue is
// the difference between a Windows window and a modern-looking one.
const W11 = {
  mica: "#f3f3f3",
  layer: "rgba(255, 255, 255, 0.7)",
  stroke: "rgba(0, 0, 0, 0.0578)",
  divider: "rgba(0, 0, 0, 0.0803)",
  text: "rgba(0, 0, 0, 0.8956)",
  textSoft: "rgba(0, 0, 0, 0.6063)",
  textFaint: "rgba(0, 0, 0, 0.4458)",
  hover: "rgba(0, 0, 0, 0.0373)",
  accent: "#0067c0",
  accentHover: "#1975c5",
  // The accent shifts lighter on dark surfaces, which is why the taskbar's
  // running-app line is not the same blue as a button in a window.
  accentLight: "#60cdff",
  // The one colour in the system that means "this button ends something".
  closeHover: "#c42b1c",
};

const THEME_TOKENS = {
  retro: {
    wallpaper: "/retro_classic_wallpaper.jpeg",
    glow: "120, 220, 255",
    linkColor: "#1084d0",
    font: "desk-font-95",
    scroll: "desk-scroll-95",
    binLabel: "Recycle Bin",
    taskbar: 34,
  },
  win11: {
    wallpaper: "/windows_11.jpg",
    glow: "130, 160, 255",
    linkColor: "#0067c0",
    font: "desk-font-11",
    scroll: "desk-scroll-11",
    binLabel: "Recycle Bin",
    taskbar: 48,
  },
  mac: {
    wallpaper: "/Macbook-Pro-Wallpaper-4K-Desktop.jpg",
    glow: "190, 175, 255",
    linkColor: "#0071e3",
    font: "desk-font-mac",
    scroll: "desk-scroll-mac",
    binLabel: "Trash",
    taskbar: 0,
  },
};

// The Dock floats over the desktop rather than pushing it up, so the stage
// reserves this much room at the bottom to keep a maximised window clear of it.
const DOCK_RESERVE = 84;

// Opening size per kind of thing, in CSS pixels, clamped to the stage at open
// time. A folder wants to be wider than a text file for the same reason it
// does on a real machine: it has columns.
const WINDOW_SIZE = {
  // The one window that opens on its own, so it opens big: it holds the whole
  // portfolio and the visitor should be reading, not resizing.
  document: { w: 840, h: 620 },
  // The introduction is a name, a role and a paragraph. Giving it a tight cap
  // keeps the centring honest, since the centre is worked out from the cap.
  intro: { w: 560, h: 300 },
  file: { w: 540, h: 400 },
  mail: { w: 520, h: 400 },
  award: { w: 560, h: 420 },
  folder: { w: 690, h: 460 },
  computer: { w: 620, h: 400 },
  bin: { w: 480, h: 300 },
  welcome: { w: 470, h: 300 },
};

const MIN_W = 300;
const MIN_H = 200;

// One desktop icon cell per shell, matching what DesktopIcon renders. The two
// systems disagree: Windows 95 drew a 32 pixel icon under a single line of
// 11px text, and Windows 11 draws a 48 pixel one with room for two lines. The
// cell measurements are rounded up on purpose, since they decide how many
// columns the icon field wraps into, and over-counting a column costs a strip
// of wallpaper, while under-counting buries an icon under a window.
const ICON_METRICS = {
  retro: { button: 80, cellW: 88, cellH: 92, icon: 32 },
  win11: { button: 94, cellW: 100, cellH: 108, icon: 48 },
  mac: { button: 80, cellW: 88, cellH: 92, icon: 32 },
};

// Where the windows land when the desktop boots with everything already open.
//
// Fractions of the free space rather than pixels, so the same strewn shape
// holds at any stage size, and a fixed table rather than a random one, so a
// re-render never reshuffles the desk under the visitor. The rows are
// deliberately out of step and the sizes deliberately uneven: a neat diagonal
// cascade reads as a screensaver, while this reads as a desk somebody has
// actually been working at. Every title bar stays clickable, which is what
// makes reading and closing them one at a time work.
// Horizontal placement is a fraction of the free width. Vertical placement is
// a fraction of the stage measured from whichever edge the slot names, and the
// two-edge business is the whole trick: a window is only as tall as its text,
// so anything placed from the top leaves the bottom of the desk bare. Half of
// these hang off the bottom edge instead, and they fill it whatever height
// they turn out to be.
const SCATTER = [
  { fx: 0.0, top: 0.02, scale: 0.95 },
  { fx: 0.58, top: 0.0, scale: 0.92 },
  { fx: 0.26, bottom: 0.03, scale: 1.0 },
  { fx: 0.97, top: 0.17, scale: 0.9 },
  { fx: 0.03, bottom: 0.24, scale: 0.96 },
  { fx: 0.68, bottom: 0.04, scale: 1.02 },
  { fx: 0.34, top: 0.13, scale: 0.9 },
  { fx: 0.92, bottom: 0.21, scale: 0.94 },
  { fx: 0.16, top: 0.36, scale: 1.0 },
  { fx: 0.76, top: 0.38, scale: 0.9 },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

// One drag primitive for both moving and resizing. Pointer capture keeps the
// gesture attached to the element that started it, so nothing has to listen on
// window, and the move handler is throttled to a frame and hands back only a
// delta: the caller writes a transform (or a size) straight to the DOM during
// the gesture and commits to React state once, on release. Committing every
// pointermove would re-render the whole window subtree at pointer rate.
function beginPointerDrag(event, { onMove, onEnd }) {
  const target = event.currentTarget;
  const startX = event.clientX;
  const startY = event.clientY;
  let frame = 0;
  let delta = { dx: 0, dy: 0 };

  target.setPointerCapture(event.pointerId);

  function handleMove(moveEvent) {
    delta = { dx: moveEvent.clientX - startX, dy: moveEvent.clientY - startY };
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      onMove(delta);
    });
  }

  function handleEnd() {
    if (frame) cancelAnimationFrame(frame);
    target.removeEventListener("pointermove", handleMove);
    target.removeEventListener("pointerup", handleEnd);
    target.removeEventListener("pointercancel", handleEnd);
    onEnd(delta);
  }

  target.addEventListener("pointermove", handleMove);
  target.addEventListener("pointerup", handleEnd);
  target.addEventListener("pointercancel", handleEnd);
}

/* ---------------------------------------------------------------- glyphs -- */

function IconFolder({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M2 9a2 2 0 0 1 2-2h8l3 3h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9Z" fill="#ffd75e" stroke="#8a6d1a" strokeWidth="1" />
    </svg>
  );
}

function IconFile({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M7 2h13l7 7v21a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" fill="#ffffff" stroke="#6b7280" strokeWidth="1" />
      <path d="M20 2v7h7" fill="none" stroke="#6b7280" strokeWidth="1" />
      <path d="M10 15h12M10 19h12M10 23h8" stroke="#1084d0" strokeWidth="1.4" />
    </svg>
  );
}

function IconTrash({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M9 10h14l-1.2 17a2 2 0 0 1-2 1.8H12.2a2 2 0 0 1-2-1.8L9 10Z" fill="#d1d5db" stroke="#4b5563" strokeWidth="1" />
      <path d="M6 10h20M12 10V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" fill="none" stroke="#4b5563" strokeWidth="1.4" />
    </svg>
  );
}

function IconEnvelope({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect x="3" y="7" width="26" height="19" fill="#ffffff" stroke="#4b5563" strokeWidth="1" />
      <path d="M3 8l13 10L29 8" fill="none" stroke="#1084d0" strokeWidth="1.6" />
    </svg>
  );
}

function IconRibbon({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="12" r="8" fill="#ffcf40" stroke="#a8801f" strokeWidth="1" />
      <path d="M11 18 8 29l8-4 8 4-3-11" fill="#e0433d" stroke="#9c2b26" strokeWidth="1" />
    </svg>
  );
}

function IconInfo({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="13" fill="#ffffff" stroke="#1084d0" strokeWidth="1.5" />
      <circle cx="16" cy="10.5" r="1.8" fill="#1084d0" />
      <rect x="14.3" y="14" width="3.4" height="11" rx="1" fill="#1084d0" />
    </svg>
  );
}

// The beige box with a CRT on top: the single most recognisable icon of the
// era, and the thing a Windows 95 desktop is incomplete without.
function IconComputer({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect x="3" y="4" width="26" height="18" rx="1.5" fill="#dcd7c8" stroke="#5b5b5b" strokeWidth="1" />
      <rect x="5.5" y="6.5" width="21" height="13" fill="#1084d0" stroke="#3b3b3b" strokeWidth="0.8" />
      <path d="M7 17.5c4-6 8-3 12-7.5" fill="none" stroke="#7fd0ff" strokeWidth="1" />
      <rect x="8" y="23" width="16" height="5" rx="1" fill="#c8c3b4" stroke="#5b5b5b" strokeWidth="1" />
      <rect x="10.5" y="24.5" width="11" height="2" fill="#9a9484" />
    </svg>
  );
}

function IconWin11Logo(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
      <rect x="1" y="1" width="8" height="8" />
      <rect x="11" y="1" width="8" height="8" />
      <rect x="1" y="11" width="8" height="8" />
      <rect x="11" y="11" width="8" height="8" />
    </svg>
  );
}

function IconAppleLogo(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16.7 12.4c0-2.6 2.1-3.8 2.2-3.9-1.2-1.7-3-1.9-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.1 2.5-1.8 3.1-.5 7.6 1.3 10.1.9 1.2 1.9 2.6 3.2 2.5 1.3-.1 1.8-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.3-1.2 3.1-2.5.7-1 1-2 1.3-2-2.3-.9-2.7-3.4-2.7-3.7ZM13.9 3.3c.7-.8 1.1-2 1-3.1-1 .1-2.2.7-2.9 1.5-.6.7-1.1 1.9-1 3 1.1.1 2.2-.6 2.9-1.4Z" />
    </svg>
  );
}

// Windows 95 window controls were 7x7 bitmaps, not line icons: a bar sitting
// on the baseline, a box with a thick top edge, and a hand-drawn cross.
function Glyph95Minimise(props) {
  return (
    <svg viewBox="0 0 10 10" fill="currentColor" aria-hidden {...props}>
      <rect x="1.5" y="6.5" width="6" height="2" />
    </svg>
  );
}

function Glyph95Maximise(props) {
  return (
    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" aria-hidden {...props}>
      <rect x="1.5" y="1.5" width="7" height="7" strokeWidth="1" />
      <path d="M1.5 2.5h7" strokeWidth="2" />
    </svg>
  );
}

function Glyph95Restore(props) {
  return (
    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" aria-hidden {...props}>
      <rect x="3.5" y="0.5" width="6" height="5" strokeWidth="1" />
      <rect x="0.5" y="3.5" width="6" height="6" strokeWidth="1" fill="#c0c0c0" />
    </svg>
  );
}

function Glyph95Close(props) {
  return (
    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden {...props}>
      <path d="M2.2 2.2 7.8 7.8M7.8 2.2 2.2 7.8" />
    </svg>
  );
}

function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconWifiGlyph(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden {...props}>
      <path d="M2 8.5a16 16 0 0 1 20 0" />
      <path d="M5.5 12.5a11 11 0 0 1 13 0" />
      <path d="M9 16.5a6 6 0 0 1 6 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconVolumeGlyph(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="M17 9a5 5 0 0 1 0 6" />
    </svg>
  );
}

function IconBatteryGlyph(props) {
  return (
    <svg viewBox="0 0 28 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <rect x="2" y="8" width="20" height="9" rx="2.5" />
      <path d="M24.5 11.5v2.5" strokeLinecap="round" />
      <rect x="4" y="10" width="14" height="5" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconControlCentre(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden {...props}>
      <path d="M4 8h16M4 16h16" />
      <circle cx="9" cy="8" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconChevronLeft(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="m15 5-7 7 7 7" />
    </svg>
  );
}

function IconChevronRight(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

function IconPower(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden {...props}>
      <path d="M12 3v9" />
      <path d="M6.8 6.8a8 8 0 1 0 10.4 0" />
    </svg>
  );
}

function IconGear(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1" strokeLinecap="round" />
    </svg>
  );
}

function IconGrid(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconTrophy({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5H6a1 1 0 0 0-1 1c0 2 1.3 3 3.1 3.2M16 5h2a1 1 0 0 1 1 1c0 2-1.3 3-3.1 3.2" />
      <path d="M12 12v3M9 19h6" />
    </svg>
  );
}

// A simplified outline set for anywhere the icon sits on a coloured surface
// (Dock tiles, Windows 11 taskbar) rather than on the desktop, where the
// full-colour icons read better.
function monoGlyph(kind, className) {
  if (kind === "folder" || kind === "computer") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
      </svg>
    );
  }
  if (kind === "mail") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    );
  }
  if (kind === "award") return <IconTrophy className={className} />;
  if (kind === "bin") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
        <path d="M5 7h14l-1.2 12.5a2 2 0 0 1-2 1.5H8.2a2 2 0 0 1-2-1.5L5 7Z" />
        <path d="M3 7h18M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M7 2h7l5 5v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" />
      <path d="M14 2v5h5" />
      <path d="M9 14h6M9 17h6" />
    </svg>
  );
}

// macOS's wire waste basket is a different silhouette from the solid Recycle
// Bin, which is genuinely how the two systems' trash icons differ.
function trashWireGlyph(className) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={className} aria-hidden>
      <path d="M6 8l1.5 12a1 1 0 0 0 1 .9h7a1 1 0 0 0 1-.9L18 8" />
      <path d="M4 8h16M9 8V5.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V8" />
      <path d="M9 11v7M12 11v7M15 11v7" />
    </svg>
  );
}

// Ruled lines and no page outline, so it reads as a legal pad the way Notes
// does, rather than as a generic document.
function notesLinesGlyph(className) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className} aria-hidden>
      <path d="M5 6h14M5 10h14M5 14h10M5 18h7" />
    </svg>
  );
}

// Finder's icon is the whole tile, a two-tone blue face, not a glyph on a
// coloured background, which is why the Dock renders it full bleed.
function IconFinderLogo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect width="24" height="24" fill="#eaf5ff" />
      <path d="M12 0h12v24H12Z" fill="#0a63c9" />
      <path d="M0 0h12v24H0Z" fill="#7fc1ff" />
      <circle cx="7.4" cy="10.2" r="1.4" fill="#0a63c9" />
      <circle cx="16.6" cy="10.2" r="1.4" fill="#fff" />
      <path d="M5.8 15c1.7 2.2 4 2.2 5.9 0" stroke="#0a63c9" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M12.3 15c1.7 2.2 4 2.2 5.9 0" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// The one document that holds everything: a page with a heading block, so it
// reads as a résumé rather than as another text file among the text files.
function IconDocument({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M6 2h13l7 7v21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" fill="#ffffff" stroke="#4b5563" strokeWidth="1" />
      <path d="M19 2v7h7" fill="none" stroke="#4b5563" strokeWidth="1" />
      <rect x="8.5" y="12" width="7" height="7" rx="1" fill="#1084d0" />
      <path d="M17.5 13h6M17.5 16h6M17.5 19h4" stroke="#1084d0" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M8.5 23h15M8.5 26h11" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// The real Windows 95 shell icons, at the two sizes the system actually used:
// 32 pixels on the desktop and in folder windows, 16 in title bars, taskbar
// buttons and menus. Anything not in this map keeps the drawn fallback below.
const WIN95_ICONS = {
  document: "text-file",
  file: "text-file",
  folder: "folder-closed",
  mail: "mail",
  award: "certificate",
  computer: "my-computer",
  bin: "recycle-bin-empty",
  welcome: "info",
};

// Bitmaps, not vectors: they are rendered at their native size with a plain
// <img> so nothing re-encodes or resamples them. next/image would optimise
// them into a modern format and hand back a blurred 16 pixel icon, which is
// the opposite of the point.
function Win95Icon({ kind, size = 32, className = "" }) {
  const name = WIN95_ICONS[kind];
  if (!name) return itemGlyph(kind, size >= 32 ? "h-8 w-8" : "h-4 w-4");
  const source = size >= 32 ? 32 : 16;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a 16px bitmap icon must not be re-encoded or resampled, which is exactly what the image pipeline would do to it
    <img
      src={`/retro-desktop/win95/${name}-${source}.png`}
      alt=""
      width={size}
      height={size}
      draggable={false}
      className={`desk-pixel shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

function Win95Chrome({ name, size = 16, className = "" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- same reason as Win95Icon: these are period bitmaps, not artwork to be re-encoded
    <img
      src={`/retro-desktop/win95/${name}-${size}.png`}
      alt=""
      width={size}
      height={size}
      draggable={false}
      className={`desk-pixel shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

// Windows 11 draws two different icons for the same thing at the same time:
// the document's own icon wherever the file appears, and the icon of the
// application that opens it in the taskbar and the title bar. Both maps are
// real shell artwork, so a .txt looks like a .txt on the desk and like Notepad
// on the taskbar, which is exactly what the system does.
const WIN11_FILE_ICONS = {
  document: "text-document",
  file: "text-document",
  // Windows has no icon for an achievement, and neither has this desktop: an
  // Achievements.txt is a text file and is drawn as one.
  award: "text-document",
  folder: "folder",
  computer: "this-pc",
  mail: "mail",
  bin: "recycle-bin-empty",
};

const WIN11_APP_ICONS = {
  document: "notepad",
  file: "notepad",
  award: "notepad",
  folder: "explorer",
  computer: "explorer",
  mail: "mail",
  bin: "recycle-bin-empty",
};

// One 256px source per icon, drawn down by the browser. next/image is the usual
// choice, but these appear at half a dozen sizes across the shell and it would
// fetch a separate variant for each; a single source cached once is the cheaper
// trade, and at these sizes the artwork is downscaled either way.
function Win11Icon({ name, size, className = "" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- one shared 256px source drawn at many sizes; a per-size variant from the image pipeline buys nothing here
    <img
      src={`/retro-desktop/win11/${name}.png`}
      alt=""
      width={size}
      height={size}
      draggable={false}
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

function Win11FileIcon({ kind, size, className }) {
  return <Win11Icon name={WIN11_FILE_ICONS[kind] || "text-document"} size={size} className={className} />;
}

function Win11AppIcon({ kind, size, className }) {
  return <Win11Icon name={WIN11_APP_ICONS[kind] || "notepad"} size={size} className={className} />;
}

// Microsoft's own Fluent System Icons, loaded as a mask so each glyph takes the
// colour of the control it sits in the way an icon font does. They are the same
// shapes Windows 11 uses for its window controls, its tray and Explorer's
// command bar, so none of this shell's chrome is a drawn approximation of a
// Microsoft glyph. The set is 20px artwork on a 16 unit body, which is why 16
// is the size everything here asks for: it lands the stroke on a pixel.
function FluentGlyph({ name, size = 16, className = "" }) {
  const source = `url("/retro-desktop/win11/${name}.svg")`;
  return (
    <span
      aria-hidden
      className={`desk-glyph-11 ${className}`}
      style={{ width: size, height: size, maskImage: source, WebkitMaskImage: source }}
    />
  );
}

// Explorer's toolbar buttons lived in a bitmap strip inside shell32, not as
// icon files, so these are drawn to match: flat, two or three colours, and
// square-edged, the way a 1995 toolbar bitmap was.
function Toolbar95Glyph({ name }) {
  const common = { width: 16, height: 16, viewBox: "0 0 16 16", "aria-hidden": true, className: "shrink-0" };
  if (name === "up")
    return (
      <svg {...common}>
        <path d="M1 4h5l1.5 1.5H15v8H1V4Z" fill="#ffd75e" stroke="#7a5a12" strokeWidth="1" />
        <path d="M8 5.5 11 9H9.2v3H6.8V9H5l3-3.5Z" fill="#fff" stroke="#000" strokeWidth="0.8" />
      </svg>
    );
  if (name === "cut")
    return (
      <svg {...common}>
        <path d="M4 2.5 11 12M12 2.5 5 12" stroke="#4b5563" strokeWidth="1.4" />
        <circle cx="4.5" cy="12.5" r="2" fill="#fff" stroke="#4b5563" strokeWidth="1" />
        <circle cx="11.5" cy="12.5" r="2" fill="#fff" stroke="#4b5563" strokeWidth="1" />
      </svg>
    );
  if (name === "copy")
    return (
      <svg {...common}>
        <path d="M3 1.5h6l2.5 2.5V11H3V1.5Z" fill="#fff" stroke="#4b5563" strokeWidth="1" />
        <path d="M6 5h6l2.5 2.5V15H6V5Z" fill="#fff" stroke="#000080" strokeWidth="1" />
        <path d="M8 8h4M8 10.5h4" stroke="#1084d0" strokeWidth="1" />
      </svg>
    );
  if (name === "paste")
    return (
      <svg {...common}>
        <path d="M2.5 3h11v12h-11V3Z" fill="#c0c0c0" stroke="#4b5563" strokeWidth="1" />
        <path d="M5.5 1.5h5v2.5h-5V1.5Z" fill="#dfdfdf" stroke="#4b5563" strokeWidth="1" />
        <path d="M6 7h7v7.5H6V7Z" fill="#fff" stroke="#000080" strokeWidth="1" />
      </svg>
    );
  if (name === "delete")
    return (
      <svg {...common}>
        <path d="M3.5 4h9l-1 10.5h-7L3.5 4Z" fill="#d1d5db" stroke="#4b5563" strokeWidth="1" />
        <path d="M2 4h12M6 4V2.5h4V4" stroke="#4b5563" strokeWidth="1" />
      </svg>
    );
  if (name === "properties")
    return (
      <svg {...common}>
        <path d="M3.5 1.5h6l3 3V14h-9V1.5Z" fill="#fff" stroke="#4b5563" strokeWidth="1" />
        <path d="M9.5 1.5v3h3" fill="none" stroke="#4b5563" strokeWidth="1" />
        <path d="M5.5 7h5M5.5 9.5h5M5.5 12h3" stroke="#1084d0" strokeWidth="1" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M1.5 2.5h13v11h-13v-11Z" fill="#fff" stroke="#4b5563" strokeWidth="1" />
      <path d="M3.5 5h3v3h-3V5Z" fill="#1084d0" />
      <path d="M8 5.5h5M8 7.5h5M3.5 10.5h9.5M3.5 12.5h9.5" stroke="#808080" strokeWidth="1" />
    </svg>
  );
}

function itemGlyph(kind, className) {
  if (kind === "document") return <IconDocument className={className} />;
  if (kind === "folder") return <IconFolder className={className} />;
  if (kind === "mail") return <IconEnvelope className={className} />;
  if (kind === "award") return <IconRibbon className={className} />;
  if (kind === "computer") return <IconComputer className={className} />;
  if (kind === "bin") return <IconTrash className={className} />;
  if (kind === "welcome") return <IconInfo className={className} />;
  return <IconFile className={className} />;
}

const DOCK_GRADIENTS = {
  file: "linear-gradient(160deg, #ffe27a, #f5a623)",
  mail: "linear-gradient(160deg, #6fb1ff, #1f6fe0)",
  award: "linear-gradient(160deg, #f6c453, #d97706)",
  welcome: "linear-gradient(160deg, #9fd4ff, #2f7de1)",
  bin: "linear-gradient(160deg, #e5e7eb, #9ca3af)",
};

/* --------------------------------------------------------------- content -- */

// Everything below renders the customer's own data. The chrome around it is
// what stays period-accurate: no real Notepad can draw a chip or a card, and
// that is fine, because the content is free to look like a well-made modern
// app whichever decade the window frame comes from.

function Card({ theme, children }) {
  if (theme === "retro") {
    return (
      <div className="bg-white p-3" style={{ boxShadow: SUNKEN }}>
        {children}
      </div>
    );
  }
  const rounded = theme === "win11" ? "rounded-lg" : "rounded-xl";
  return <div className={`border border-black/5 bg-white p-4 ${rounded}`}>{children}</div>;
}

function ProfileBody({ theme, name, role, bio }) {
  if (theme === "retro") {
    return (
      <div>
        <div className="flex items-center gap-2.5 border-b-2 border-[#808080] pb-2.5">
          <IconInfo className="h-7 w-7 shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-black">{name || "Your Name"}</p>
            <p className="truncate text-xs text-gray-700">{role || "Your Role"}</p>
          </div>
        </div>
        {bio && <p className="mt-2.5 whitespace-pre-line text-xs leading-relaxed text-black">{bio}</p>}
      </div>
    );
  }
  return (
    <div>
      <p className="text-lg font-semibold text-neutral-900">{name || "Your Name"}</p>
      <p className="text-sm text-neutral-500">{role || "Your Role"}</p>
      {bio && <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-neutral-700">{bio}</p>}
    </div>
  );
}

function TimelineBody({ theme, items, extra }) {
  if (theme === "retro") {
    return (
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2.5 bg-white p-2.5" style={{ boxShadow: SUNKEN }}>
            <div className="w-1 shrink-0" style={{ background: "#000080" }} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xs font-bold text-black">{item.title}</span>
                <span className="shrink-0 text-[10px] text-gray-600">
                  {item.start} - {item.end}
                </span>
              </div>
              <p className="text-[11px] text-gray-600">{item.subtitle}</p>
              {item.lines?.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {item.lines.map((line, j) => (
                    <li key={j} className="flex gap-1.5 text-[11px] text-black">
                      <span className="shrink-0" style={{ color: "#1084d0" }}>
                        &#9656;
                      </span>
                      <span className="whitespace-pre-line">{line}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
        {extra && <p className="text-[10px] text-gray-600">{extra}</p>}
      </div>
    );
  }
  return (
    <div>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="border-b border-black/5 pb-3 last:border-0 last:pb-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
              <span className="shrink-0 text-[11px] text-neutral-400">
                {item.start} - {item.end}
              </span>
            </div>
            <p className="text-xs text-neutral-500">{item.subtitle}</p>
            {item.lines?.length > 0 && (
              <ul className="mt-1.5 space-y-1">
                {item.lines.map((line, j) => (
                  <li key={j} className="flex gap-1.5 text-[13px] text-neutral-700">
                    <span className="text-neutral-300">&bull;</span>
                    <span className="whitespace-pre-line">{line}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      {extra && <p className="mt-3 text-[11px] text-neutral-400">{extra}</p>}
    </div>
  );
}

function SkillChips({ theme, items }) {
  if (theme === "retro") {
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((skill) => (
          <span key={skill} className="bg-[#c0c0c0] px-2.5 py-1 text-[11px] font-medium text-black" style={{ boxShadow: RAISED }}>
            {skill}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((skill) => (
        <span key={skill} className="rounded-md border border-black/5 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700">
          {skill}
        </span>
      ))}
    </div>
  );
}

function LinksBody({ theme, items }) {
  const linkColor = THEME_TOKENS[theme].linkColor;
  if (theme === "retro") {
    return (
      <div className="space-y-1.5">
        {items.map((profile, i) => (
          <a
            key={i}
            href={`https://${stripProtocol(profile.url)}`}
            className="desk-focus-95 flex items-center gap-2 bg-white px-2 py-1.5 text-xs text-black"
            style={{ boxShadow: SUNKEN }}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-[#c0c0c0]" style={{ boxShadow: RAISED }}>
              <IconLink className="h-3 w-3" />
            </span>
            <span className="shrink-0 font-semibold">{profile.platform}</span>
            <span className="ml-auto truncate text-[10px]" style={{ color: linkColor }}>
              {stripProtocol(profile.url)}
            </span>
          </a>
        ))}
      </div>
    );
  }
  return (
    <div className="-m-1 space-y-0.5">
      {items.map((profile, i) => (
        <a
          key={i}
          href={`https://${stripProtocol(profile.url)}`}
          className="flex items-center justify-between gap-3 rounded-md p-2 text-[13px] hover:bg-black/5"
        >
          <span className="font-medium text-neutral-800">{profile.platform}</span>
          <span className="truncate text-xs" style={{ color: linkColor }}>
            {stripProtocol(profile.url)}
          </span>
        </a>
      ))}
    </div>
  );
}

function AchievementList({ theme, items }) {
  if (theme === "retro") {
    return (
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5 bg-white p-2.5" style={{ boxShadow: SUNKEN }}>
            <IconRibbon className="h-6 w-6 shrink-0" />
            <p className="whitespace-pre-line text-xs leading-relaxed text-black">{item}</p>
          </div>
        ))}
      </div>
    );
  }
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-neutral-700">
          <IconTrophy className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <span className="whitespace-pre-line">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ProjectList({ projects, theme }) {
  const linkColor = THEME_TOKENS[theme].linkColor;
  const shellClass =
    theme === "retro"
      ? "bg-white"
      : theme === "win11"
        ? "overflow-hidden rounded-lg border border-black/5 bg-white"
        : "overflow-hidden rounded-xl border border-black/5 bg-white";
  return (
    <div className={shellClass} style={theme === "retro" ? { boxShadow: SUNKEN } : undefined}>
      <div
        className={`flex items-center justify-between px-3 py-1.5 text-[11px] font-bold ${
          theme === "retro" ? "border-b border-[#808080] bg-[#dfdfdf] text-black" : "border-b border-black/5 bg-neutral-50 text-neutral-500"
        }`}
      >
        <span>Name</span>
        <span>Status</span>
      </div>
      <div className={theme === "retro" ? "divide-y divide-[#e5e5e5]" : "divide-y divide-neutral-100"}>
        {projects.map((project, i) => (
          <div key={i} className={`px-3 py-2.5 ${theme === "retro" && i % 2 === 1 ? "bg-[#f4f4f4]" : ""}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <IconFile className="h-4 w-4" />
                <span className={`text-xs font-semibold ${theme === "retro" ? "text-black" : "text-neutral-900"}`}>
                  {project.name || "project"}
                </span>
                {project.version && <span className="text-[10px] text-gray-500">v{project.version}</span>}
              </div>
              {project.status && (
                <span
                  className="text-[10px] font-medium"
                  style={{
                    color:
                      project.status.toLowerCase() === "active"
                        ? "#0a7d2c"
                        : project.status.toLowerCase() === "archived"
                          ? "#6b7280"
                          : "#a8710a",
                  }}
                >
                  {project.status}
                </span>
              )}
            </div>
            <p className="mt-1 whitespace-pre-line pl-5 text-xs text-gray-700">{project.description}</p>
            {project.highlights?.length > 0 && (
              <ul className="mt-1 space-y-0.5 pl-5">
                {project.highlights.map((point, j) => (
                  <li key={j} className="flex gap-1.5 text-[11px] text-gray-600">
                    <span style={{ color: linkColor }}>&#9656;</span>
                    <span className="whitespace-pre-line">{point}</span>
                  </li>
                ))}
              </ul>
            )}
            {project.tags?.length > 0 && <p className="mt-1 pl-5 text-[10px] text-gray-500">{project.tags.join(", ")}</p>}
            {(project.link || project.demo) && (
              <p className="mt-1 pl-5 text-[10px]">
                {project.link && (
                  <a href={`https://${stripProtocol(project.link)}`} className="underline" style={{ color: linkColor }}>
                    Source
                  </a>
                )}
                {project.link && project.demo && " · "}
                {project.demo && (
                  <a href={`https://${stripProtocol(project.demo)}`} className="underline" style={{ color: linkColor }}>
                    Live
                  </a>
                )}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionButton({ theme, href, icon, children }) {
  if (theme === "retro") {
    return (
      <a href={href} className="desk-focus-95 flex items-center gap-1.5 bg-[#c0c0c0] px-3 py-1 text-xs font-bold text-black" style={{ boxShadow: RAISED }}>
        {icon}
        {children}
      </a>
    );
  }
  if (theme === "win11") {
    // A Windows 11 accent button: 32 tall, 4px corners, and the system accent
    // rather than a blue picked to look like it.
    return (
      <a
        href={href}
        className="flex h-8 items-center gap-2 rounded-[4px] bg-[#0067c0] px-3.5 text-[14px] text-white transition-colors hover:bg-[#1975c5] active:bg-[#2b7cc9]"
      >
        {icon}
        {children}
      </a>
    );
  }
  return (
    <a
      href={href}
      className="flex items-center gap-1.5 rounded-full bg-[#0071e3] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0077ed]"
    >
      {icon}
      {children}
    </a>
  );
}

function ContactRow({ theme, icon, label, value }) {
  if (theme === "retro") {
    return (
      <div className="flex items-center gap-2 bg-white px-2 py-1.5 text-xs text-black" style={{ boxShadow: SUNKEN }}>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-[#c0c0c0]" style={{ boxShadow: RAISED }}>
          {icon}
        </span>
        <span className="font-semibold">{label}</span>
        <span className="ml-auto truncate text-[10px] text-gray-700">{value}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2.5 text-[13px] text-neutral-700">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-500">{icon}</span>
      <span className="font-medium text-neutral-800">{label}</span>
      <span className="ml-auto truncate text-xs text-neutral-500">{value}</span>
    </div>
  );
}

function ContactBody({ theme, email, links }) {
  return (
    <>
      <Card theme={theme}>
        <div className="space-y-1.5">
          {email && <ContactRow theme={theme} icon={<IconEnvelope className="h-3 w-3" />} label="Email" value={email} />}
          {links?.github && <ContactRow theme={theme} icon={<IconGithub className="h-3 w-3" />} label="GitHub" value={stripProtocol(links.github)} />}
          {links?.linkedin && (
            <ContactRow theme={theme} icon={<IconLinkedin className="h-3 w-3" />} label="LinkedIn" value={stripProtocol(links.linkedin)} />
          )}
          {links?.website && <ContactRow theme={theme} icon={<IconLink className="h-3 w-3" />} label="Website" value={stripProtocol(links.website)} />}
        </div>
      </Card>
      <div className="mt-3 flex flex-wrap gap-2">
        {email && (
          <ActionButton theme={theme} href={`mailto:${email}`}>
            Send Email
          </ActionButton>
        )}
        {links?.github && (
          <ActionButton theme={theme} href={`https://${stripProtocol(links.github)}`} icon={<IconGithub className="h-3.5 w-3.5" />}>
            GitHub
          </ActionButton>
        )}
        {links?.linkedin && (
          <ActionButton theme={theme} href={`https://${stripProtocol(links.linkedin)}`} icon={<IconLinkedin className="h-3.5 w-3.5" />}>
            LinkedIn
          </ActionButton>
        )}
        {links?.website && (
          <ActionButton theme={theme} href={`https://${stripProtocol(links.website)}`} icon={<IconLink className="h-3.5 w-3.5" />}>
            Website
          </ActionButton>
        )}
      </div>
    </>
  );
}

// The contents of My Computer: the same things that are on the desktop, listed
// as files, and openable from here exactly as they are out there. Large Icons
// was the default view in every one of these shells, so that is the view.
function FolderListing({ theme, entries, emptyText, onOpen }) {
  const wrapper = theme === "retro" ? "bg-white p-2" : theme === "win11" ? "-m-1 p-1" : "rounded-xl border border-black/5 bg-white p-3";

  if (entries.length === 0) {
    return (
      <div className={wrapper} style={theme === "retro" ? { boxShadow: SUNKEN } : undefined}>
        <p className={theme === "retro" ? "p-4 text-center text-xs text-gray-600" : "p-6 text-center text-[13px] text-neutral-400"}>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={`${wrapper} flex flex-wrap gap-1`} style={theme === "retro" ? { boxShadow: SUNKEN } : undefined}>
      {entries.map((entry) => (
        <button
          key={entry.id}
          type="button"
          onClick={() => onOpen(entry)}
          title={`Open ${entry.label}`}
          className={`desk-focus-95 flex flex-col items-center gap-1.5 text-center ${
            theme === "retro"
              ? "w-[80px] p-[6px] hover:bg-[#000080]/10"
              : theme === "win11"
                ? "w-[104px] rounded-[4px] p-2.5 hover:bg-black/[0.037]"
                : "w-[92px] rounded-lg p-2 hover:bg-black/5"
          }`}
        >
          {theme === "retro" ? (
            <Win95Icon kind={entry.kind} size={32} />
          ) : theme === "win11" ? (
            <Win11FileIcon kind={entry.kind} size={48} />
          ) : (
            itemGlyph(entry.kind, "h-8 w-8")
          )}
          <span
            className={`w-full break-words leading-tight ${
              theme === "retro" ? "text-black" : theme === "win11" ? "text-[12px]" : "text-[11px] text-neutral-700"
            }`}
            style={theme === "win11" ? { color: W11.text } : undefined}
          >
            {entry.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// The whole portfolio as one document, in the customer's own section order.
//
// This is the window the desktop opens itself with, and it exists because the
// metaphor has a cost: a visitor who has to guess that the content is behind
// eight icons mostly does not find out. So the reading path is a single
// scroll, in one window, with nothing to discover first. The individual files
// are still there for anyone who would rather poke around, and they are the
// same content, not a second copy of it.
function DocumentBody({ theme, blocks, binLabel }) {
  return (
    <div className={theme === "retro" ? "space-y-4" : "space-y-6"}>
      {blocks.map((block) => (
        <section key={block.id}>
          {theme === "retro" ? (
            <h2 className="mb-1.5 flex items-center gap-1.5 border-b border-[#808080] pb-1 text-[11px] font-bold uppercase tracking-[0.1em] text-black">
              {itemGlyph(block.kind, "h-3.5 w-3.5")}
              {block.docTitle}
            </h2>
          ) : (
            <h2 className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-neutral-900">
              {itemGlyph(block.kind, "h-4 w-4")}
              {block.docTitle}
            </h2>
          )}
          {block.body}
        </section>
      ))}
      {/* Said at the end rather than in a dialog at the start: by here the
          visitor has what they came for, and the desktop is a bonus they can
          take or leave. */}
      <p
        className={
          theme === "retro"
            ? "border-t border-[#808080] pt-2 text-[10px] text-gray-600"
            : "border-t border-black/5 pt-3 text-[11px] text-neutral-400"
        }
      >
        Every section above is also a file on the desktop behind this window. Open one, drag it by its title bar, or try the Start menu.
        Nothing you can do in here breaks anything, and the {binLabel} is empty.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------- window chrome -- */

// Explorer and Finder furniture. It is set dressing, so it is hidden from
// assistive tech and is not focusable: a Quick access list that navigates
// nowhere would be a worse lie to a screen reader than to an eye.
// Explorer's two chrome rows as Windows 11 rebuilt them: the icon command bar
// that replaced the ribbon, and the address row under it with the back, forward
// and up arrows, the breadcrumb and the search box. Both are set dressing, so
// they are inert and hidden from assistive tech: a Sort button that sorts
// nothing would be a worse lie to a screen reader than to an eye.
function ExplorerChrome11({ label }) {
  const pill = { background: W11.layer, boxShadow: `inset 0 0 0 1px ${W11.stroke}` };
  return (
    <div aria-hidden className="shrink-0 text-[12px]" style={{ color: W11.text }}>
      <div className="flex h-10 items-center gap-0.5 overflow-hidden px-2">
        <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[4px] py-1.5 pl-2 pr-2.5">
          <FluentGlyph name="new" size={16} />
          New
          <span className="text-[8px]" style={{ color: W11.textSoft }}>
            &#9662;
          </span>
        </span>
        <span className="mx-1 h-4 w-px shrink-0" style={{ background: W11.divider }} />
        {["cut", "copy", "paste", "rename", "delete"].map((glyph) => (
          <span key={glyph} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px]">
            <FluentGlyph name={glyph} size={16} />
          </span>
        ))}
        <span className="mx-1 h-4 w-px shrink-0" style={{ background: W11.divider }} />
        <span className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[4px] px-2 py-1.5 sm:flex">
          <FluentGlyph name="sort" size={16} />
          Sort
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[4px] px-2 py-1.5 sm:flex">
          <FluentGlyph name="view" size={16} />
          View
        </span>
      </div>

      <div className="flex h-10 items-center gap-0.5 px-2">
        {[
          { glyph: "arrow-left", dim: false },
          { glyph: "arrow-right", dim: true },
          { glyph: "arrow-up", dim: false },
        ].map((arrow) => (
          <span
            key={arrow.glyph}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px]"
            style={{ color: arrow.dim ? W11.textFaint : W11.textSoft }}
          >
            <FluentGlyph name={arrow.glyph} size={16} />
          </span>
        ))}
        <span className="ml-1 flex min-w-0 flex-1 items-center gap-1.5 rounded-[4px] px-2.5 py-1.5" style={pill}>
          <Win11Icon name="this-pc" size={16} />
          <span className="shrink-0" style={{ color: W11.textSoft }}>
            This PC
          </span>
          <FluentGlyph name="chevron-right" size={12} className="opacity-40" />
          <span className="truncate">{label}</span>
        </span>
        <span className="ml-1.5 hidden w-40 shrink-0 items-center gap-2 rounded-[4px] px-2.5 py-1.5 md:flex" style={pill}>
          <span className="flex shrink-0" style={{ color: W11.textSoft }}>
            <FluentGlyph name="search" size={14} />
          </span>
          <span className="truncate" style={{ color: W11.textFaint }}>
            Search {label}
          </span>
        </span>
      </div>
    </div>
  );
}

// The navigation pane, listing only the places this machine's own icons cover.
// Inventing a OneDrive row with a borrowed glyph would be the kind of detail
// that reads wrong precisely because everything around it reads right.
function ExplorerNav11({ label }) {
  return (
    <div aria-hidden className="hidden w-[178px] shrink-0 overflow-hidden px-1.5 pt-1 text-[12px] sm:block" style={{ color: W11.text }}>
      {["Desktop", "Downloads", "Documents", "Pictures"].map((entry) => (
        <div key={entry} className="flex h-8 items-center gap-2.5 rounded-[4px] px-2.5">
          <Win11Icon name="folder" size={16} />
          <span className="truncate">{entry}</span>
        </div>
      ))}
      <div className="my-1.5 ml-2.5 h-px" style={{ background: W11.divider }} />
      <div className="flex h-8 items-center gap-2.5 rounded-[4px] px-2.5">
        <Win11Icon name="this-pc" size={16} />
        <span className="truncate">This PC</span>
      </div>
      {/* Where you actually are, marked the way Explorer marks it: a tinted row
          with an accent bar down the left edge. */}
      <div className="relative flex h-8 items-center gap-2.5 rounded-[4px] px-2.5" style={{ background: W11.hover }}>
        <span className="absolute left-0 top-1/2 h-3.5 w-[3px] -translate-y-1/2 rounded-full" style={{ background: W11.accent }} />
        <Win11Icon name="folder" size={16} />
        <span className="truncate">{label}</span>
      </div>
    </div>
  );
}

function FinderToolbar() {
  return (
    <div aria-hidden className="flex shrink-0 items-center gap-1 border-b border-black/5 bg-white/60 px-3 py-1.5 text-neutral-400">
      <span className="flex h-6 w-6 items-center justify-center rounded hover:bg-black/5">
        <IconChevronLeft className="h-3.5 w-3.5" />
      </span>
      <span className="flex h-6 w-6 items-center justify-center rounded hover:bg-black/5 opacity-40">
        <IconChevronRight className="h-3.5 w-3.5" />
      </span>
      <span className="ml-2 flex items-center gap-0.5 rounded-md bg-black/5 p-0.5">
        <span className="rounded bg-white px-1.5 py-0.5 shadow-sm">
          <IconGrid className="h-3 w-3 text-neutral-600" />
        </span>
        <span className="px-1.5 py-0.5">
          <IconGrid className="h-3 w-3 opacity-50" />
        </span>
      </span>
      <div className="flex-1" />
      <div className="flex items-center gap-1.5 rounded-md bg-black/5 px-2 py-1 text-[11px] text-neutral-500">
        <IconSearch className="h-3 w-3" /> Search
      </div>
    </div>
  );
}

function FinderSidebar() {
  return (
    <div aria-hidden className="hidden w-36 shrink-0 overflow-hidden border-r border-black/5 bg-neutral-50/60 p-2 text-[12px] text-neutral-700 sm:block">
      <p className="px-2 py-1 text-[11px] font-semibold text-neutral-400">Favourites</p>
      {["AirDrop", "Recents", "Applications", "Desktop", "Documents"].map((entry) => (
        <div key={entry} className="flex items-center gap-2 rounded px-2 py-1 hover:bg-black/5">
          <IconFolder className="h-3.5 w-3.5" />
          <span className="truncate">{entry}</span>
        </div>
      ))}
      <p className="mt-3 px-2 py-1 text-[11px] font-semibold text-neutral-400">Locations</p>
      <div className="flex items-center gap-2 rounded px-2 py-1 hover:bg-black/5">
        <IconFolder className="h-3.5 w-3.5" />
        <span className="truncate">Macintosh HD</span>
      </div>
    </div>
  );
}

// Windows 95 hung a menu bar off every window. These open nothing, which is
// why they are inert and hidden from assistive tech: they are the frame, not
// the controls. The controls are the title bar buttons and the Start menu.
// Metrics are the system's: 18px tall, 6px of padding either side of a label,
// and the access-key underline that every menu carried.
function MenuBar95() {
  return (
    <div aria-hidden className="flex h-[18px] shrink-0 items-center px-0.5 text-black">
      {[
        ["F", "ile"],
        ["E", "dit"],
        ["V", "iew"],
        ["H", "elp"],
      ].map(([head, tail]) => (
        <span key={head} className="px-1.5 leading-[18px] hover:bg-[#000080] hover:text-white">
          <span className="underline">{head}</span>
          {tail}
        </span>
      ))}
    </div>
  );
}

// A title bar button was 16x14 with the caption's 2px inset, and its bevel
// flipped to sunken while held, with the glyph nudged a pixel down and right.
// Both halves of that are what makes a click feel like the real thing.
function Button95({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="desk-focus-95 flex h-[14px] w-[16px] items-center justify-center bg-[#c0c0c0] text-black active:translate-x-px active:translate-y-px"
      style={{ boxShadow: RAISED_THIN }}
    >
      {children}
    </button>
  );
}

// A Windows 11 caption button is 46 wide by 32 tall with a 16px glyph, and the
// close button is the only control in the system that turns red under the
// pointer. Both of those are load-bearing: the proportions are what the eye
// recognises, and the red is what stops anyone closing a window by accident.
function CaptionButton11({ label, glyph, danger, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-8 w-[46px] shrink-0 items-center justify-center transition-colors ${
        danger ? "hover:bg-[#c42b1c] hover:text-white" : "hover:bg-black/[0.055]"
      }`}
      style={{ color: "inherit" }}
    >
      <FluentGlyph name={glyph} size={16} />
    </button>
  );
}

// Snap Layouts, the arrangement grid Windows 11 drops when you hover a
// maximise button. Each zone is a fraction of the desk, so one table covers
// every stage size, and picking a zone really does move and resize the window:
// the window manager already had everything it needed to honour it, which is
// why this is the shell's one memorable gesture rather than a picture of one.
const SNAP_LAYOUTS = [
  [
    [0, 0, 0.5, 1],
    [0.5, 0, 0.5, 1],
  ],
  [
    [0, 0, 0.66, 1],
    [0.66, 0, 0.34, 1],
  ],
  [
    [0, 0, 0.34, 1],
    [0.34, 0, 0.32, 1],
    [0.66, 0, 0.34, 1],
  ],
  [
    [0, 0, 0.5, 0.5],
    [0.5, 0, 0.5, 0.5],
    [0, 0.5, 0.5, 0.5],
    [0.5, 0.5, 0.5, 0.5],
  ],
];

function SnapFlyout({ title, onSnap, onDismiss }) {
  return (
    <div
      onPointerLeave={onDismiss}
      className="desk-menu-in absolute right-0 top-full z-20 w-[236px] rounded-lg p-2 backdrop-blur-2xl"
      style={{
        background: "rgba(249, 249, 249, 0.92)",
        boxShadow: `0 8px 24px rgba(0, 0, 0, 0.28), inset 0 0 0 1px ${W11.stroke}`,
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        {SNAP_LAYOUTS.map((zones, layout) => (
          <div key={layout} className="relative h-[56px] rounded-[4px]" style={{ background: "rgba(0, 0, 0, 0.045)" }}>
            {zones.map((zone, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onSnap(zone)}
                aria-label={`Snap ${title} to position ${index + 1} of ${zones.length} in layout ${layout + 1}`}
                className="desk-snap-zone absolute rounded-[3px]"
                style={{
                  left: `calc(${zone[0] * 100}% + 2px)`,
                  top: `calc(${zone[1] * 100}% + 2px)`,
                  width: `calc(${zone[2] * 100}% - 4px)`,
                  height: `calc(${zone[3] * 100}% - 4px)`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// One Window for all three shells. The frame, the controls and the furniture
// change per theme; the drag, resize and focus behaviour does not, so a new
// section is written once and behaves the same everywhere.
function Window({ theme, item, win, zIndex, focused, compact, stage, children, onFocus, onClose, onMinimise, onToggleMax, onCommit }) {
  const rootRef = useRef(null);
  const [snapOpen, setSnapOpen] = useState(false);
  const maximised = win.max || compact;
  const isFolder = item.kind === "folder" || item.kind === "computer" || item.kind === "bin";
  // A dialog is not an application window in any of these systems: no menu
  // bar, no tab strip, and nothing to minimise it to.
  const isDialog = item.kind === "welcome";
  const scrollClass = THEME_TOKENS[theme].scroll;

  // Height follows the content until the content runs past what the window was
  // allowed to be, and only then does the body scroll. A fixed height would
  // leave a short section sitting above a field of empty window, which is the
  // one thing that makes a desktop look like a mock-up of a desktop. Once the
  // visitor drags the resize grip, `win.h` is set and their size wins.
  //
  // The stagger only exists on the opening volley, where a dozen windows
  // appearing on the same frame would read as a glitch rather than as a desk
  // being laid out.
  const animationDelay = win.delay ? `${win.delay}ms` : undefined;
  const edge = win.by == null ? win.y : win.by;
  // Fixed height only when the window is maximised or the visitor has resized
  // it by hand. Otherwise the frame is left to wrap its content, and the limit
  // lives on the client area instead (see bodyStyle): capping the frame while
  // its body is a flex child makes the frame's own auto height ambiguous, and
  // the window ends up taller than what it holds, with a field of empty grey
  // under the last line.
  const sized = maximised || win.h != null;
  const frameStyle = maximised
    ? { left: 0, top: 0, width: "100%", height: "100%", zIndex, animationDelay }
    : {
        left: win.x,
        width: win.w,
        zIndex,
        animationDelay,
        ...(win.by == null ? { top: win.y } : { bottom: win.by }),
        ...(win.h == null ? {} : { height: win.h }),
      };

  // Chrome eats into the room the content gets: a caption, plus a menu bar,
  // plus Explorer's address bar, toolbar and status bar when it is a folder.
  // Windows 11 stacks a 40px tabbed title bar over Explorer's 40px command bar,
  // its 40px address row and a 28px status bar; a Notepad window is the tabbed
  // title bar on its own.
  const chromeHeight =
    theme === "retro" ? (isFolder ? 108 : 40) : theme === "win11" ? (isFolder ? 148 : 40) : isFolder ? 116 : 74;
  const bodyClass = sized ? "min-h-0 flex-1" : "";
  const bodyStyle = sized
    ? undefined
    : { maxHeight: Math.max(120, Math.min(win.cap, stage.h - edge - 12) - chromeHeight) };

  function handleTitlePointerDown(event) {
    onFocus();
    if (maximised || event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest("button")) return;
    event.preventDefault();
    const element = rootRef.current;
    beginPointerDrag(event, {
      onMove: ({ dx, dy }) => {
        element.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      },
      onEnd: ({ dx, dy }) => {
        element.style.transform = "";
        if (dx === 0 && dy === 0) return;
        // A dragged window stops being anchored to whichever edge it opened
        // against and becomes an ordinary top-left position, read off the
        // layout so a bottom-anchored window does not jump. The title bar has
        // to stay reachable, so a window can hang off the edges but never far
        // enough to lose the bar that drags it back.
        onCommit({
          x: clamp(win.x + dx, -(win.w - 130), stage.w - 130),
          y: clamp(element.offsetTop + dy, 0, stage.h - 34),
          by: null,
        });
      },
    });
  }

  function handleResizePointerDown(event) {
    onFocus();
    if (event.button !== 0) return;
    event.preventDefault();
    const element = rootRef.current;
    // Read the height off the element rather than the record: until the first
    // manual resize the window is sized by its own content and `win.h` is null.
    const startH = element.offsetHeight;
    const startTop = element.offsetTop;
    // A window growing from a bottom anchor would grow upwards, away from the
    // grip being dragged. Pin it to its current top for the gesture, and commit
    // that top with the new size.
    if (win.by != null) {
      element.style.top = `${startTop}px`;
      element.style.bottom = "auto";
    }
    const nextSize = ({ dx, dy }) => ({
      w: clamp(win.w + dx, MIN_W, stage.w - win.x),
      h: clamp(startH + dy, MIN_H, stage.h - startTop),
    });
    beginPointerDrag(event, {
      onMove: (delta) => {
        const { w, h } = nextSize(delta);
        element.style.width = `${w}px`;
        element.style.height = `${h}px`;
      },
      onEnd: (delta) => onCommit({ ...nextSize(delta), y: startTop, by: null }),
    });
  }

  // A snap zone is a fraction of the desk, so the same table works whatever
  // size the stage is. Snapping drops whichever edge the window was anchored
  // to and takes an explicit box, the same shape a manual resize commits.
  function handleSnap(zone) {
    setSnapOpen(false);
    onCommit({
      x: Math.round(zone[0] * stage.w),
      y: Math.round(zone[1] * stage.h),
      by: null,
      w: Math.max(MIN_W, Math.round(zone[2] * stage.w)),
      h: Math.max(MIN_H, Math.round(zone[3] * stage.h)),
      max: false,
    });
  }

  const resizeGrip =
    maximised || compact ? null : (
      <span
        aria-hidden
        onPointerDown={handleResizePointerDown}
        className="absolute bottom-0 right-0 z-10 h-4 w-4 cursor-nwse-resize"
        style={
          theme === "retro"
            ? {
                backgroundImage:
                  "linear-gradient(135deg, transparent 0 45%, #808080 45% 55%, transparent 55% 65%, #808080 65% 75%, transparent 75%)",
              }
            : undefined
        }
      />
    );

  if (theme === "retro") {
    return (
      <section
        ref={rootRef}
        aria-label={item.title}
        onPointerDown={onFocus}
        style={frameStyle}
        className="desk-window-in absolute flex flex-col bg-[#c0c0c0] p-[3px]"
      >
        {/* The caption is 18px tall with a 2px inset, the title sits in bold
            at 11px, and the buttons group tight with a 2px gap before Close.
            Those four numbers are most of what the eye recognises. */}
        <div
          onPointerDown={handleTitlePointerDown}
          onDoubleClick={onToggleMax}
          className={`flex h-[18px] shrink-0 select-none items-center justify-between gap-2 pl-[2px] pr-[2px] ${
            maximised ? "" : "cursor-grab active:cursor-grabbing"
          }`}
          style={{ background: focused ? TITLE_ACTIVE : TITLE_IDLE }}
        >
          <div className={`flex min-w-0 items-center gap-1 ${focused ? "text-white" : "text-[#c8c8c8]"}`}>
            <Win95Icon kind={item.kind} size={16} />
            <span className="truncate font-bold">{item.title}</span>
          </div>
          <div className="flex shrink-0 items-center gap-px">
            {!isDialog && (
              <>
                <Button95 label={`Minimise ${item.title}`} onClick={onMinimise}>
                  <Glyph95Minimise className="h-2.5 w-2.5" />
                </Button95>
                <Button95 label={maximised ? `Restore ${item.title}` : `Maximise ${item.title}`} onClick={onToggleMax}>
                  {maximised ? <Glyph95Restore className="h-2.5 w-2.5" /> : <Glyph95Maximise className="h-2.5 w-2.5" />}
                </Button95>
              </>
            )}
            <span className={isDialog ? "" : "ml-[2px]"}>
              <Button95 label={`Close ${item.title}`} onClick={onClose}>
                <Glyph95Close className="h-2.5 w-2.5" />
              </Button95>
            </span>
          </div>
        </div>

        {!isDialog && <MenuBar95 />}

        {isFolder && (
          <div aria-hidden className="shrink-0">
            <div className="flex items-center gap-1 px-1 py-[3px]">
              <span className="text-black">Address</span>
              <span className="flex min-w-0 flex-1 items-center gap-1 bg-white px-1 py-px text-black" style={{ boxShadow: SUNKEN_THIN }}>
                <Win95Icon kind={item.kind} size={16} />
                <span className="truncate">{item.label}</span>
              </span>
            </div>
            <div className="flex items-center gap-px px-1 pb-[3px]">
              {["up", "cut", "copy", "paste", "delete", "properties", "views"].map((glyph, i) => (
                <Fragment key={glyph}>
                  {(i === 1 || i === 4 || i === 6) && <span className="mx-1 h-4 w-px bg-[#808080] shadow-[1px_0_0_#fff]" />}
                  <span className="flex h-[22px] w-[23px] items-center justify-center bg-[#c0c0c0]">
                    <Toolbar95Glyph name={glyph} />
                  </span>
                </Fragment>
              ))}
            </div>
          </div>
        )}

        <div
          className={`desk-95-body overflow-auto bg-[#c0c0c0] p-[3px] ${bodyClass} ${scrollClass}`}
          style={{ boxShadow: SUNKEN_THIN, ...bodyStyle }}
        >
          {children}
        </div>

        {isFolder && (
          <div className="mt-[2px] flex h-[20px] shrink-0 gap-[2px] text-black">
            <span className="flex flex-1 items-center truncate px-1" style={{ boxShadow: SUNKEN_THIN }}>
              {item.statusText}
            </span>
            <span className="w-[120px]" style={{ boxShadow: SUNKEN_THIN }} />
            <span className="w-[16px]" style={{ boxShadow: SUNKEN_THIN }} />
          </div>
        )}

        {resizeGrip}
      </section>
    );
  }

  if (theme === "win11") {
    return (
      <section
        ref={rootRef}
        aria-label={item.title}
        onPointerDown={onFocus}
        // Mica: the wallpaper, blurred and washed out, showing through the
        // frame. A maximised window loses its rounded corners, the way every
        // Windows 11 window does when it fills the screen.
        style={{ ...frameStyle, background: "rgba(243, 243, 243, 0.86)" }}
        className={`desk-window-in absolute flex flex-col ring-1 backdrop-blur-2xl ${maximised ? "" : "rounded-lg"} ${
          focused ? "shadow-[0_28px_64px_rgba(0,0,0,0.38)] ring-black/25" : "shadow-[0_10px_28px_rgba(0,0,0,0.2)] ring-black/15"
        }`}
      >
        {/* Windows 11 put the tabs in the title bar, in Notepad and in Explorer
            both, so the caption row is 40px and the tab sits on its bottom edge
            while the caption buttons stay pinned to the top at 32. */}
        <div
          onPointerDown={handleTitlePointerDown}
          onDoubleClick={onToggleMax}
          className={`flex shrink-0 select-none items-end gap-1 pl-2 ${isDialog ? "h-8" : "h-10"} ${
            maximised ? "" : "cursor-grab active:cursor-grabbing"
          }`}
        >
          {isDialog ? (
            <span className="flex min-w-0 flex-1 items-center self-center text-[12px]" style={{ color: W11.text }}>
              <span className="truncate">{item.title}</span>
            </span>
          ) : (
            <>
              <span
                className="flex h-8 min-w-0 max-w-[260px] items-center gap-2 rounded-t-[7px] px-3"
                style={{ background: focused ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.45)" }}
              >
                <Win11FileIcon kind={item.kind} size={16} />
                <span className="truncate text-[12px]" style={{ color: W11.text }}>
                  {item.label}
                </span>
                <span className="ml-1 shrink-0 opacity-40" style={{ color: W11.text }}>
                  <FluentGlyph name="chrome-close" size={12} />
                </span>
              </span>
              <span
                aria-hidden
                className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px]"
                style={{ color: W11.textSoft }}
              >
                <FluentGlyph name="new" size={14} />
              </span>
              <span className="flex-1" />
            </>
          )}

          <div className="flex shrink-0 self-start" style={{ color: W11.text }}>
            {!isDialog && (
              <>
                <CaptionButton11 label={`Minimise ${item.title}`} glyph="chrome-minimize" onClick={onMinimise} />
                {/* The maximise button and the Snap Layouts flyout it drops are
                    one control: hovering or tabbing to the button opens the
                    grid, and leaving the pair closes it again. */}
                <span
                  className="relative flex"
                  onPointerEnter={() => !compact && setSnapOpen(true)}
                  onPointerLeave={() => setSnapOpen(false)}
                  onFocus={() => !compact && setSnapOpen(true)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setSnapOpen(false);
                  }}
                >
                  <CaptionButton11
                    label={maximised ? `Restore ${item.title}` : `Maximise ${item.title}`}
                    glyph={maximised ? "chrome-restore" : "chrome-maximize"}
                    onClick={onToggleMax}
                  />
                  {snapOpen && !compact && (
                    <SnapFlyout title={item.title} onSnap={handleSnap} onDismiss={() => setSnapOpen(false)} />
                  )}
                </span>
              </>
            )}
            <CaptionButton11 label={`Close ${item.title}`} glyph="chrome-close" danger onClick={onClose} />
          </div>
        </div>

        {/* Everything under the caption is clipped to the frame's bottom
            corners here rather than on the frame itself, so the Snap flyout can
            hang past the window edge the way the real one does. */}
        <div className={`flex flex-col overflow-hidden ${maximised ? "" : "rounded-b-lg"} ${sized ? "min-h-0 flex-1" : ""}`}>
          {isFolder && <ExplorerChrome11 label={item.label} />}

          <div className={`flex ${sized ? "min-h-0 flex-1" : ""}`}>
            {isFolder && <ExplorerNav11 label={item.label} />}
            <div
              className={`desk-11-body min-w-0 flex-1 overflow-auto p-4 ${isFolder ? "rounded-tl-lg" : ""} ${
                sized ? "min-h-0" : ""
              } ${scrollClass}`}
              style={{
                background: "#ffffff",
                boxShadow: isFolder ? `inset 1px 1px 0 ${W11.stroke}` : undefined,
                ...bodyStyle,
              }}
            >
              {children}
            </div>
          </div>

          {isFolder && (
            <div className="flex h-7 shrink-0 items-center px-3 text-[12px]" style={{ color: W11.textSoft }}>
              {item.statusText}
            </div>
          )}
        </div>

        {resizeGrip}
      </section>
    );
  }

  // macOS
  return (
    <section
      ref={rootRef}
      aria-label={item.title}
      onPointerDown={onFocus}
      style={frameStyle}
      className={`desk-window-in group/window absolute flex flex-col overflow-hidden rounded-[11px] bg-white/95 ring-1 ring-black/15 ${
        focused ? "shadow-[0_28px_70px_rgba(0,0,0,0.45)]" : "shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
      }`}
    >
      <div
        onPointerDown={handleTitlePointerDown}
        onDoubleClick={onToggleMax}
        className={`relative flex shrink-0 select-none items-center justify-center border-b border-black/5 bg-neutral-100/90 px-3 py-2 backdrop-blur-xl ${
          maximised ? "" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        <div className="absolute left-3 flex items-center gap-[7px]">
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${item.title}`}
            className={`flex h-3 w-3 items-center justify-center rounded-full text-[7px] font-bold leading-none text-black/55 ${
              focused ? "bg-[#ff5f57]" : "bg-neutral-300"
            }`}
          >
            <span className="opacity-0 group-hover/window:opacity-100">&times;</span>
          </button>
          <button
            type="button"
            onClick={onMinimise}
            aria-label={`Minimise ${item.title}`}
            className={`flex h-3 w-3 items-center justify-center rounded-full text-[9px] font-bold leading-none text-black/55 ${
              focused ? "bg-[#febc2e]" : "bg-neutral-300"
            }`}
          >
            <span className="opacity-0 group-hover/window:opacity-100">&minus;</span>
          </button>
          <button
            type="button"
            onClick={onToggleMax}
            aria-label={maximised ? `Restore ${item.title}` : `Zoom ${item.title}`}
            className={`flex h-3 w-3 items-center justify-center rounded-full text-[8px] font-bold leading-none text-black/55 ${
              focused ? "bg-[#28c840]" : "bg-neutral-300"
            }`}
          >
            <span className="opacity-0 group-hover/window:opacity-100">&#10011;</span>
          </button>
        </div>
        <div className={`flex min-w-0 items-center gap-1.5 ${focused ? "text-neutral-700" : "text-neutral-400"}`}>
          {itemGlyph(item.kind, "h-3.5 w-3.5 shrink-0")}
          <span className="truncate text-[12.5px] font-semibold">{item.title}</span>
        </div>
      </div>

      {isFolder && <FinderToolbar />}

      <div className={`flex ${sized ? "min-h-0 flex-1" : ""}`}>
        {isFolder && <FinderSidebar />}
        <div className={`min-w-0 flex-1 overflow-auto p-4 ${sized ? "min-h-0" : ""} ${scrollClass}`} style={bodyStyle}>
          {children}
        </div>
      </div>

      {isFolder && (
        <div className="shrink-0 border-t border-black/5 bg-neutral-50/80 py-1 text-center text-[11px] text-neutral-500">{item.statusText}</div>
      )}

      {resizeGrip}
    </section>
  );
}

/* --------------------------------------------------------------- desktop -- */

function DesktopIcon({ theme, item, selected, onSelect, onOpen }) {
  // A real desktop wants a double click here. This one opens on a single one
  // anyway: a visitor who clicks once, sees nothing happen and leaves has been
  // charged for the accuracy, and the desktop is the joke, not the toll. The
  // double click still works, since opening a window that is already open just
  // brings it to the front.
  function handleClick() {
    onSelect();
    onOpen();
  }

  // Windows 95 selected an icon by inverting its label to navy and dotting a
  // focus rectangle round it, and it never softened the label with a shadow:
  // the shadow here is a later convention that keeps white text legible on a
  // photographic wallpaper, so it stays, but only while nothing is selected.
  const cell = ICON_METRICS[theme];
  let labelClass = "px-[2px] text-white";
  let labelStyle = {
    textShadow: selected ? "none" : "1px 1px 1px rgba(0,0,0,0.85)",
    backgroundColor: selected ? "#000080" : "transparent",
    outline: selected ? "1px dotted #fff" : "none",
    outlineOffset: "-1px",
  };
  if (theme === "win11") {
    // Windows 11 selects the whole cell, not the label: a 4px rounded wash with
    // a hairline edge, and the label keeps its shadow either way.
    labelClass = "px-1 text-white";
    labelStyle = { textShadow: "0 1px 2px rgba(0,0,0,0.7)" };
  } else if (theme === "mac") {
    labelClass = `rounded-[5px] px-1.5 py-0.5 text-white ${selected ? "bg-[#0071e3]" : ""}`;
    labelStyle = { textShadow: selected ? "none" : "0 1px 2px rgba(0,0,0,0.55)" };
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onDoubleClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      aria-label={`Open ${item.label}`}
      style={{
        width: cell.button,
        ...(theme === "win11" && selected
          ? { background: "rgba(255, 255, 255, 0.22)", boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.35)" }
          : null),
      }}
      className={`desk-focus-95 flex shrink-0 flex-col items-center gap-[3px] p-[6px] text-center ${
        theme === "retro" ? "" : theme === "win11" ? "rounded-[4px]" : "rounded-lg"
      } ${selected && theme === "mac" ? "bg-white/10" : ""}`}
    >
      <span
        className={`flex items-center justify-center ${theme === "retro" ? "" : "drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"}`}
        style={{ width: cell.icon, height: cell.icon }}
      >
        {theme === "retro" ? (
          // A selected icon in Windows 95 was drawn through a navy 50% dither,
          // which reads as a blue tint over the bitmap.
          <span className={selected ? "relative" : undefined}>
            <Win95Icon kind={item.kind} size={32} />
            {selected && <span className="absolute inset-0 bg-[#000080] opacity-40 mix-blend-multiply" />}
          </span>
        ) : theme === "win11" ? (
          <Win11FileIcon kind={item.kind} size={cell.icon} />
        ) : (
          itemGlyph(item.kind, "h-8 w-8")
        )}
      </span>
      <span className={`break-words leading-tight ${theme === "win11" ? "text-[12px]" : "text-[11px]"} ${labelClass}`} style={labelStyle}>
        {item.label}
      </span>
    </button>
  );
}

/* ---------------------------------------------------------------- shells -- */

// The taskbar is 28px tall with a 2px raised lip along the top, the Start
// button is 22px in a 2px-inset row, task buttons are 160px wide and share
// the space equally, and the tray is a sunken well on the right. A pressed
// task button also stipples its face, which is the detail that separates the
// real thing from a grey rectangle with a border.
function Taskbar95({ items, windows, focusedId, startOpen, onStart, onTask, clock }) {
  return (
    <div
      className="relative z-30 flex h-[28px] shrink-0 select-none items-center gap-[3px] bg-[#c0c0c0] px-[2px]"
      style={{ boxShadow: "inset 0 1px 0 #fff, inset 0 2px 0 #dfdfdf" }}
    >
      <button
        type="button"
        onClick={onStart}
        aria-expanded={startOpen}
        className="desk-focus-95 flex h-[22px] shrink-0 items-center gap-[3px] bg-[#c0c0c0] pl-[3px] pr-[6px] font-bold text-black"
        style={{ boxShadow: startOpen ? SUNKEN_THIN : RAISED }}
      >
        <Win95Chrome name="start-flag" size={16} className={startOpen ? "translate-x-px translate-y-px" : ""} />
        <span className={startOpen ? "translate-x-px translate-y-px" : ""}>Start</span>
      </button>

      <span className="h-[22px] w-px bg-[#808080] shadow-[1px_0_0_#fff]" />

      <div className="flex min-w-0 flex-1 items-center gap-[3px] overflow-hidden">
        {windows.map((win) => {
          const item = items[win.id];
          const pressed = focusedId === win.id && !win.min;
          return (
            <button
              key={win.id}
              type="button"
              onClick={() => onTask(win.id)}
              className="desk-focus-95 flex h-[22px] min-w-0 max-w-[160px] flex-1 items-center gap-[3px] whitespace-nowrap px-[3px] text-left text-black"
              style={{
                boxShadow: pressed ? SUNKEN_THIN : RAISED,
                backgroundColor: "#c0c0c0",
                // The depressed face carried a 50% dither in the era's palette.
                backgroundImage: pressed
                  ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2'%3E%3Crect width='1' height='1' fill='%23dfdfdf'/%3E%3Crect x='1' y='1' width='1' height='1' fill='%23dfdfdf'/%3E%3C/svg%3E\")"
                  : undefined,
              }}
            >
              <span className={pressed ? "flex min-w-0 flex-1 items-center gap-[3px] translate-x-px translate-y-px" : "flex min-w-0 flex-1 items-center gap-[3px]"}>
                <Win95Icon kind={item.kind} size={16} />
                <span className={`truncate ${pressed ? "font-bold" : ""}`}>{item.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex h-[22px] shrink-0 items-center gap-[6px] px-[6px] text-black" style={{ boxShadow: SUNKEN_THIN }}>
        <Win95Chrome name="speaker" size={16} />
        <span className="whitespace-nowrap tabular-nums">{clock}</span>
      </div>
    </div>
  );
}

function StartMenu95({ firstName, entries, theme, onOpen, onOpenAll, onTheme, onHelp, onShutDown, onDismiss }) {
  const [submenu, setSubmenu] = useState(null);

  // Menu rows are 20px with a 16px icon, the way every Start menu item was
  // laid out, and the banner down the left edge reads bottom-up in bold with
  // the version in light grey behind the name.
  const rowClass =
    "flex h-[20px] w-full items-center gap-[6px] px-[6px] text-left text-black hover:bg-[#000080] hover:text-white";

  return (
    <div className="desk-menu-in flex w-[220px] bg-[#c0c0c0] p-[3px]" style={{ boxShadow: RAISED }}>
      <div
        aria-hidden
        className="flex w-[21px] shrink-0 items-end justify-center pb-2"
        style={{ background: "linear-gradient(180deg, #1084d0, #000080)", writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        <span className="text-[15px] font-bold tracking-wide text-white">
          {firstName}
          <span className="text-[#c0c0c0]">95</span>
        </span>
      </div>

      <div className="min-w-0 flex-1 py-[2px]">
        <div className="relative" onMouseLeave={() => setSubmenu(null)}>
          <button
            type="button"
            onClick={() => setSubmenu(submenu === "programs" ? null : "programs")}
            onMouseEnter={() => setSubmenu("programs")}
            className={rowClass}
            aria-expanded={submenu === "programs"}
          >
            <Win95Icon kind="folder" size={16} />
            <span className="flex-1 font-bold">Programs</span>
            <span aria-hidden>&#9656;</span>
          </button>
          {submenu === "programs" && (
            <div className="desk-menu-in absolute left-full top-0 z-10 w-[196px] bg-[#c0c0c0] p-[3px]" style={{ boxShadow: RAISED }}>
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    onOpen(entry.id);
                    onDismiss();
                  }}
                  className={rowClass}
                >
                  <Win95Icon kind={entry.kind} size={16} />
                  <span className="truncate">{entry.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" onMouseLeave={() => setSubmenu(null)}>
          <button
            type="button"
            onClick={() => setSubmenu(submenu === "settings" ? null : "settings")}
            onMouseEnter={() => setSubmenu("settings")}
            className={rowClass}
            aria-expanded={submenu === "settings"}
          >
            <IconGear className="h-4 w-4 shrink-0" />
            <span className="flex-1 font-bold">Settings</span>
            <span aria-hidden>&#9656;</span>
          </button>
          {submenu === "settings" && (
            <div className="desk-menu-in absolute left-full top-0 z-10 w-[168px] bg-[#c0c0c0] p-[3px]" style={{ boxShadow: RAISED }}>
              <p className="px-[6px] py-[2px] font-bold text-gray-600">Display</p>
              {[
                { id: "retro", label: "Windows 95" },
                { id: "win11", label: "Windows 11" },
                { id: "mac", label: "macOS" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onTheme(option.id);
                    onDismiss();
                  }}
                  className={rowClass}
                >
                  <span className="w-3 shrink-0 text-center" aria-hidden>
                    {theme === option.id ? "•" : ""}
                  </span>
                  <span className="truncate">{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            onOpenAll();
            onDismiss();
          }}
          className={rowClass}
        >
          <IconDocument className="h-5 w-5 shrink-0" />
          <span className="font-semibold">Open Everything</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onHelp();
            onDismiss();
          }}
          className={rowClass}
        >
          <IconInfo className="h-5 w-5 shrink-0" />
          <span className="font-semibold">Help</span>
        </button>

        <div className="my-1 h-px bg-[#808080] shadow-[0_1px_0_#fff]" />

        <button type="button" onClick={onShutDown} className={rowClass}>
          <IconPower className="h-4 w-4 shrink-0" />
          <span className="font-bold">Shut Down...</span>
        </button>
      </div>
    </div>
  );
}

// The Windows 11 taskbar: 48px tall, its buttons centred, 40px square each with
// a 24px icon, and a running app marked by a line under it that widens when the
// app is the one in front. The tray sits right, the clock and date stack under
// each other, and the four pixels past the clock are the Show desktop strip,
// which does what it has always done.
function Taskbar11({ items, windows, focusedId, startOpen, onStart, onTask, onShowDesktop, clock, today }) {
  return (
    <div
      className="relative z-30 flex h-12 shrink-0 select-none items-center px-2 backdrop-blur-2xl"
      style={{ background: "rgba(32, 32, 32, 0.82)", boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.07)" }}
    >
      <div className="flex flex-1 items-center justify-center gap-1">
        <button
          type="button"
          onClick={onStart}
          aria-label="Start"
          aria-expanded={startOpen}
          className={`flex h-10 w-10 items-center justify-center rounded-[5px] transition-colors hover:bg-white/10 ${
            startOpen ? "bg-white/15" : ""
          }`}
        >
          <Win11Icon name="start" size={24} />
        </button>
        <div
          aria-hidden
          className="hidden h-9 w-44 shrink items-center gap-2.5 rounded-full px-3.5 text-[12px] text-white/70 sm:flex"
          style={{ background: "rgba(255, 255, 255, 0.08)", boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.09)" }}
        >
          <FluentGlyph name="search" size={16} />
          <span className="truncate">Search</span>
        </div>
        <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-[5px] text-white/85">
          <FluentGlyph name="task-view" size={24} />
        </span>
        <span className="mx-1 h-6 w-px bg-white/15" />
        {windows.map((win) => {
          const item = items[win.id];
          const current = focusedId === win.id && !win.min;
          return (
            <button
              key={win.id}
              type="button"
              onClick={() => onTask(win.id)}
              title={item.label}
              aria-label={item.label}
              className={`relative flex h-10 w-10 items-center justify-center rounded-[5px] transition-colors hover:bg-white/10 ${
                current ? "bg-white/[0.14]" : ""
              }`}
            >
              <Win11AppIcon kind={item.kind} size={24} />
              <span
                className={`absolute bottom-[3px] h-[3px] rounded-full transition-all ${current ? "w-4" : "w-1.5 opacity-60"}`}
                style={{ background: W11.accentLight }}
              />
            </button>
          );
        })}
      </div>

      <div className="absolute right-2 flex items-center text-white">
        <span
          aria-hidden
          className="flex items-center gap-2.5 rounded-[5px] px-2 py-1.5 text-white/85 transition-colors hover:bg-white/10"
        >
          <FluentGlyph name="wifi" size={16} />
          <FluentGlyph name="volume" size={16} />
          <FluentGlyph name="battery" size={16} />
        </span>
        <span className="rounded-[5px] px-2 py-1 text-right text-[12px] leading-4 transition-colors hover:bg-white/10">
          <span className="block tabular-nums">{clock}</span>
          <span className="block">{today}</span>
        </span>
        <button
          type="button"
          onClick={onShowDesktop}
          aria-label="Show desktop"
          className="ml-1 h-9 w-[6px] rounded-sm border-l border-white/25 transition-colors hover:bg-white/15"
        />
      </div>
    </div>
  );
}

// The Windows 11 Start menu, in the shape it actually has: a search field, a
// grid of pinned apps under a header with All apps on the right, a Recommended
// list under its own header, and an account bar across the bottom on a darker
// strip. The one thing it will not do is invent its Recommended list. Windows
// fills that from what you have really opened, and so does this: the row is
// whatever the visitor has opened on this desk, in the order they opened it,
// with the system's own empty state when they have opened nothing yet.
function StartMenu11({ name, role, entries, recent, theme, onOpen, onOpenAll, onTheme, onShutDown, onDismiss }) {
  const [query, setQuery] = useState("");
  const [powerOpen, setPowerOpen] = useState(false);
  const term = query.trim().toLowerCase();
  const shown = term ? entries.filter((entry) => entry.label.toLowerCase().includes(term)) : entries;

  function launch(id) {
    onOpen(id);
    onDismiss();
  }

  return (
    <div
      className="desk-menu-in w-[min(620px,calc(100vw-1.5rem))] overflow-hidden rounded-lg text-white backdrop-blur-2xl"
      style={{
        background: "rgba(43, 43, 43, 0.88)",
        boxShadow: "0 32px 80px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(255, 255, 255, 0.09)",
      }}
    >
      <div className="p-6 pb-5">
        <label
          className="flex items-center gap-2.5 rounded-[16px] px-4 py-2"
          style={{ background: "rgba(255, 255, 255, 0.06)", boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.1)" }}
        >
          <FluentGlyph name="search" size={16} className="opacity-70" />
          <span className="sr-only">Search apps</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for apps and files"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-white placeholder:text-white/50 focus:outline-none"
          />
        </label>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-[14px] font-semibold">Pinned</p>
          <button
            type="button"
            onClick={() => {
              onOpenAll();
              onDismiss();
            }}
            className="flex items-center gap-1.5 rounded-[4px] px-3 py-1 text-[12px] font-medium transition-colors hover:bg-white/10"
            style={{ boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.1)" }}
          >
            Open all
            <FluentGlyph name="chevron-right" size={12} className="opacity-70" />
          </button>
        </div>

        <div className="mt-2 grid grid-cols-4 gap-0.5 sm:grid-cols-6">
          {shown.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => launch(entry.id)}
              className="flex flex-col items-center gap-1.5 rounded-[4px] px-1 pb-2 pt-3 transition-colors hover:bg-white/[0.06]"
            >
              <Win11AppIcon kind={entry.kind} size={32} />
              <span className="w-full break-words text-center text-[12px] leading-tight text-white/90">{entry.label}</span>
            </button>
          ))}
          {shown.length === 0 && (
            <p className="col-span-full py-8 text-center text-[13px] text-white/50">No results for &ldquo;{query}&rdquo;.</p>
          )}
        </div>

        <p className="mt-6 text-[14px] font-semibold">Recommended</p>
        {recent.length === 0 ? (
          <p className="mt-2 py-3 text-[13px] text-white/55">
            Open something and it will show up here, the way it does on a machine you have been using for a while.
          </p>
        ) : (
          <div className="mt-1 grid gap-0.5 sm:grid-cols-2">
            {recent.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => launch(entry.id)}
                className="flex items-center gap-3 rounded-[4px] px-2 py-2 text-left transition-colors hover:bg-white/[0.06]"
              >
                <Win11FileIcon kind={entry.kind} size={32} />
                <span className="min-w-0">
                  <span className="block truncate text-[13px]">{entry.label}</span>
                  <span className="block truncate text-[12px] text-white/55">Opened on this desk</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 px-6 py-3" style={{ background: "rgba(255, 255, 255, 0.04)" }}>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
          style={{ background: W11.accent }}
        >
          {initials(name)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-medium">{name || "Your Name"}</span>
          {role && <span className="block truncate text-[12px] text-white/55">{role}</span>}
        </span>

        {/* The shell picker lives here as well as on the floating switcher,
            because inside the fiction this is where a display setting belongs. */}
        <div className="ml-auto flex items-center gap-0.5 rounded-[4px] p-0.5 text-[12px]" style={{ background: "rgba(255, 255, 255, 0.06)" }}>
          {[
            { id: "retro", label: "95" },
            { id: "win11", label: "11" },
            { id: "mac", label: "macOS" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onTheme(option.id)}
              aria-pressed={theme === option.id}
              className={`rounded-[3px] px-2.5 py-1 transition-colors ${
                theme === option.id ? "bg-white text-neutral-900" : "hover:bg-white/10"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setPowerOpen((open) => !open)}
            aria-label="Power"
            aria-expanded={powerOpen}
            className="flex h-8 w-8 items-center justify-center rounded-[4px] transition-colors hover:bg-white/10"
          >
            <IconPower className="h-4 w-4" />
          </button>
          {powerOpen && (
            <div
              className="desk-menu-in absolute bottom-full right-0 mb-2 w-36 rounded-lg p-1"
              style={{
                background: "rgba(43, 43, 43, 0.96)",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.09)",
              }}
            >
              <button
                type="button"
                onClick={onShutDown}
                className="flex w-full items-center gap-2.5 rounded-[4px] px-2.5 py-1.5 text-left text-[13px] transition-colors hover:bg-white/10"
              >
                <IconPower className="h-4 w-4" /> Shut down
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DockIcon({ item, active, onClick }) {
  let inner;
  if (item.kind === "folder" || item.kind === "computer") {
    inner = <IconFinderLogo className="h-full w-full" />;
  } else if (item.kind === "bin") {
    inner = (
      <>
        <span className="absolute inset-0" style={{ background: DOCK_GRADIENTS.bin }} />
        <span className="relative text-neutral-600">{trashWireGlyph("h-6 w-6")}</span>
      </>
    );
  } else if (item.kind === "file") {
    inner = (
      <>
        <span className="absolute inset-0" style={{ background: DOCK_GRADIENTS.file }} />
        <span className="relative text-[#7a5a12]">{notesLinesGlyph("h-6 w-6")}</span>
      </>
    );
  } else {
    inner = (
      <>
        <span className="absolute inset-0" style={{ background: DOCK_GRADIENTS[item.kind] || DOCK_GRADIENTS.mail }} />
        <span className="relative text-white">{monoGlyph(item.kind, "h-6 w-6")}</span>
      </>
    );
  }

  return (
    <button type="button" onClick={onClick} title={item.label} aria-label={item.label} className="desk-dock-item group flex flex-col items-center">
      <span className="desk-dock-tile relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[13px] shadow-lg ring-1 ring-black/10">
        {inner}
      </span>
      <span className={`mt-1 h-1 w-1 rounded-full bg-black/70 ${active ? "opacity-100" : "opacity-0"}`} />
    </button>
  );
}

function Dock({ entries, binItem, openIds, onOpen }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex justify-center px-3">
      <nav
        aria-label="Dock"
        className="desk-dock pointer-events-auto flex max-w-full items-end gap-2 overflow-x-auto rounded-[22px] border border-white/40 bg-white/25 px-2.5 py-2 shadow-2xl backdrop-blur-2xl"
      >
        {entries.map((entry) => (
          <DockIcon key={entry.id} item={entry} active={openIds.has(entry.id)} onClick={() => onOpen(entry.id)} />
        ))}
        <span aria-hidden className="mx-1 h-9 w-px shrink-0 self-center bg-black/15" />
        <DockIcon item={binItem} active={openIds.has(binItem.id)} onClick={() => onOpen(binItem.id)} />
      </nav>
    </div>
  );
}

function MacMenuBar({ appName, clock, menuOpen, onMenu, theme, onTheme, onAbout, onOpenAll, onShutDown }) {
  return (
    <div className="relative z-40 flex h-7 shrink-0 select-none items-center justify-between border-b border-black/10 bg-white/55 px-3 text-[12.5px] text-neutral-800 backdrop-blur-2xl">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Apple menu"
          aria-expanded={menuOpen}
          className={`-mx-1 rounded px-1 py-0.5 ${menuOpen ? "bg-black/10" : "hover:bg-black/5"}`}
        >
          <IconAppleLogo className="h-3.5 w-3.5" />
        </button>
        <span className="font-semibold">{appName}</span>
        <span aria-hidden className="hidden gap-4 text-neutral-600 sm:flex">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Window</span>
          <span>Help</span>
        </span>
      </div>
      <div className="flex items-center gap-3 text-neutral-700">
        <IconBatteryGlyph className="h-3.5 w-4" />
        <IconWifiGlyph className="h-3.5 w-3.5" />
        <IconControlCentre className="h-3.5 w-3.5" />
        <IconSearch className="h-3.5 w-3.5" />
        <span className="whitespace-nowrap tabular-nums">{clock}</span>
      </div>

      {menuOpen && (
        <div className="desk-menu-in absolute left-2 top-7 w-56 rounded-lg border border-black/10 bg-white/85 p-1 text-[13px] text-neutral-800 shadow-2xl backdrop-blur-2xl">
          <button type="button" onClick={onAbout} className="w-full rounded px-2.5 py-1.5 text-left hover:bg-[#0071e3] hover:text-white">
            About This Mac
          </button>
          <button type="button" onClick={onOpenAll} className="w-full rounded px-2.5 py-1.5 text-left hover:bg-[#0071e3] hover:text-white">
            Open Everything
          </button>
          <div className="my-1 h-px bg-black/10" />
          <p className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">System Settings</p>
          {[
            { id: "retro", label: "Windows 95" },
            { id: "win11", label: "Windows 11" },
            { id: "mac", label: "macOS" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onTheme(option.id)}
              className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left hover:bg-[#0071e3] hover:text-white"
            >
              <span className="w-3 shrink-0" aria-hidden>
                {theme === option.id ? "✓" : ""}
              </span>
              {option.label}
            </button>
          ))}
          <div className="my-1 h-px bg-black/10" />
          <button type="button" onClick={onShutDown} className="w-full rounded px-2.5 py-1.5 text-left hover:bg-[#0071e3] hover:text-white">
            Shut Down...
          </button>
        </div>
      )}
    </div>
  );
}

// Shutting down is the one thing every one of these systems does with its
// whole screen, and the amber line on black is the single most quoted frame
// of the Windows 95 era. Clicking anywhere brings the machine back.
function PowerOverlay({ theme, onRestart }) {
  let body;
  if (theme === "retro") {
    body = (
      <div className="px-6 text-center font-mono">
        <p className="text-lg leading-relaxed text-[#ffb000] sm:text-2xl">It&rsquo;s now safe to turn off your computer.</p>
        <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-[#8a6a1f]">Click anywhere to restart</p>
      </div>
    );
  } else if (theme === "win11") {
    body = (
      <div className="flex flex-col items-center gap-7 text-center text-white">
        {/* White, not the blue tile: the shutdown screen is the one place
            Windows 11 draws its own logo as a silhouette. */}
        <IconWin11Logo className="h-9 w-9 opacity-90" />
        <p className="text-[17px]">Shutting down</p>
        <div className="flex gap-1.5" aria-hidden>
          {[0, 1, 2, 3, 4].map((dot) => (
            <span key={dot} className="desk-boot-dot h-1.5 w-1.5 rounded-full bg-white" style={{ animationDelay: `${dot * 130}ms` }} />
          ))}
        </div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Click anywhere to restart</p>
      </div>
    );
  } else {
    body = (
      <div className="flex flex-col items-center gap-7 text-center text-white">
        <IconAppleLogo className="h-11 w-11" />
        <div className="h-1 w-44 overflow-hidden rounded-full bg-white/20">
          <span className="block h-full w-1/3 rounded-full bg-white/80" />
        </div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Click anywhere to restart</p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onRestart}
      aria-label="Restart the desktop"
      className="absolute inset-0 z-[60] flex cursor-default items-center justify-center"
      style={{ background: theme === "win11" ? "#0067b8" : theme === "mac" ? "#141416" : "#000" }}
    >
      {body}
    </button>
  );
}

// Both of the desktop's set pieces, the one that greets a visitor and the one
// that thanks them for clearing the desk, are the same object: a dialog in the
// shell's own chrome. Windows 95 dialogs are a caption, an icon, two lines and
// a row of buttons, and the later shells are the same thing with the corners
// rounded off, so it is one component rather than six.
function ShellDialog({ theme, title, lead, body, footnote, actions, onClose }) {
  if (theme === "retro") {
    return (
      <div className="desk-window-in w-[min(420px,calc(100vw-2rem))] bg-[#c0c0c0] p-[3px]" style={{ boxShadow: RAISED }}>
        <div className="flex h-[18px] shrink-0 select-none items-center justify-between pl-[2px] pr-[2px]" style={{ background: TITLE_ACTIVE }}>
          <div className="flex min-w-0 items-center gap-1 text-white">
            <Win95Icon kind="welcome" size={16} />
            <span className="truncate font-bold">{title}</span>
          </div>
          <Button95 label={`Close ${title}`} onClick={onClose}>
            <Glyph95Close className="h-2.5 w-2.5" />
          </Button95>
        </div>
        {/* The caption stays in the system's own 11px face; everything the
            visitor is meant to read switches to the window's, same as any
            other client area in this shell. */}
        <div className="desk-95-body">
          <div className="flex gap-3.5 p-4">
            <Win95Icon kind="welcome" size={32} />
            <div className="min-w-0">
              <p className="desk-95-lead font-bold text-black">{lead}</p>
              <p className="mt-2 text-black">{body}</p>
              {footnote && (
                <p className="mt-3 border-t border-[#808080] pt-2 text-[#3a3a3a] shadow-[0_-1px_0_#fff]">{footnote}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 px-4 pb-4">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={`desk-focus-95 h-[26px] min-w-[116px] px-3 bg-[#c0c0c0] text-black active:translate-x-px active:translate-y-px ${
                  action.primary ? "font-bold" : ""
                }`}
                style={{ boxShadow: RAISED }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Windows 11's own dialog is a content dialog: no title bar and no close
  // button, its title set as a 20px heading inside the body, and a button row
  // on a darker strip where the buttons share the width equally. It says the
  // same things the 95 dialog says, in the same order, in this system's voice.
  if (theme === "win11") {
    return (
      <div
        className="desk-window-in w-[min(460px,calc(100vw-2rem))] overflow-hidden rounded-lg"
        style={{
          background: W11.mica,
          boxShadow: "0 32px 64px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="px-6 pb-5 pt-5">
          <p className="text-[20px] font-semibold leading-7" style={{ color: W11.text }}>
            {title}
          </p>
          <p className="mt-3 text-[14px] font-semibold leading-5" style={{ color: W11.text }}>
            {lead}
          </p>
          <p className="mt-1.5 text-[14px] leading-5" style={{ color: W11.textSoft }}>
            {body}
          </p>
          {/* An InfoBar, which is the control Windows 11 uses for exactly this
              kind of aside: a tinted panel with the system's information glyph
              and one line of reassurance, rather than small grey text under a
              rule. */}
          {footnote && (
            <div
              className="mt-4 flex gap-2.5 rounded-[4px] p-3"
              style={{ background: "rgba(0, 103, 192, 0.06)", boxShadow: `inset 0 0 0 1px ${W11.stroke}` }}
            >
              <IconInfo className="mt-px h-4 w-4 shrink-0" />
              <p className="min-w-0 text-[12px] leading-4" style={{ color: W11.textSoft }}>
                {footnote}
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-2 border-t px-6 py-4" style={{ borderColor: W11.divider, background: "rgba(0, 0, 0, 0.02)" }}>
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={`h-8 flex-1 rounded-[4px] text-[14px] transition-colors ${
                action.primary
                  ? "bg-[#0067c0] text-white hover:bg-[#1975c5] active:bg-[#2b7cc9]"
                  : "bg-[#fdfdfd] text-black/90 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.07)] hover:bg-[#f5f5f5] active:bg-[#f0f0f0]"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="desk-window-in w-[min(420px,calc(100vw-2rem))] rounded-2xl border border-black/10 bg-white/95 p-5 shadow-2xl backdrop-blur-2xl">
      <div className="flex gap-3">
        {itemGlyph("welcome", "h-8 w-8 shrink-0")}
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-neutral-900">{lead}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-600">{body}</p>
          {footnote && <p className="mt-3 border-t border-black/5 pt-2.5 text-[12px] text-neutral-500">{footnote}</p>}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className={
              action.primary
                ? `px-3.5 py-1.5 text-[13px] font-semibold text-white ${
                    theme === "win11" ? "rounded-md bg-[#2563eb] hover:bg-[#1d4ed8]" : "rounded-full bg-[#0071e3] hover:bg-[#0077ed]"
                  }`
                : `px-3.5 py-1.5 text-[13px] font-medium text-neutral-700 hover:bg-black/5 ${
                    theme === "win11" ? "rounded-md border border-black/10" : "rounded-full border border-black/10"
                  }`
            }
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// The curtain. It is the only thing on screen when a visitor arrives, and
// dismissing it is what fans the desk out, so the reveal is the reward for the
// one click rather than something they walk into. Closing it and taking the
// button do the same thing: there is no way to end up looking at an empty
// desktop wondering what happened.
function WelcomeDialog({ theme, name, role, binLabel, onEnter }) {
  // The two shells this visitor is not currently looking at, named rather than
  // listed generically: offering someone Windows 11 while they are standing in
  // Windows 11 is the sort of line that gives the whole thing away.
  const elsewhere = [theme !== "retro" && "Windows 95", theme !== "win11" && "Windows 11", theme !== "mac" && "a Mac"].filter(Boolean);
  const launcher = theme === "mac" ? "Apple menu" : "Start menu";

  return (
    <ShellDialog
      theme={theme}
      title="Welcome"
      lead={`${name || "This"}${name ? "'s" : ""} desktop${role ? `, ${role}` : ""}`}
      body="Every window is already open behind this one, strewn across the desk the way a real one is at the end of a working day. Read a window, close it, move to the next. Drag any of them by the title bar if it is standing in front of something better."
      footnote={`Nothing here can break: the ${binLabel} is empty, and the ${launcher} puts it all back. It will also hand you ${elsewhere.join(" or ")} instead, if you would rather.`}
      actions={[{ label: "Have a look", onClick: onEnter, primary: true }]}
      onClose={onEnter}
    />
  );
}

// The other bookend. The number is years of experience worked out from the
// dates the customer actually entered, the same figure the Experience window
// shows. With no dates to work from there is no number, and the line does not
// claim one.
function ClearedDialog({ theme, yearsXp, binLabel, onReopen, onDismiss }) {
  return (
    <ShellDialog
      theme={theme}
      title="Desktop"
      lead={yearsXp > 0 ? `That was about ${yearsXp} years of work, filed away in a few clicks.` : "That is everything, filed away."}
      body={`Thanks for tidying up. Nothing was lost: the ${binLabel} is still empty, and it all goes back the way it was.`}
      actions={[
        { label: "Put it back", onClick: onReopen, primary: true },
        { label: "Leave it tidy", onClick: onDismiss },
      ]}
      onClose={onDismiss}
    />
  );
}

function ShellSwitcher({ theme, onChange, offset }) {
  const options = [
    { id: "retro", label: "95" },
    { id: "win11", label: "11" },
    { id: "mac", label: null },
  ];
  return (
    <div className="pointer-events-auto absolute right-3 z-40 flex gap-1 rounded-full bg-black/35 p-1 backdrop-blur-md" style={{ top: offset }}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          aria-label={option.id === "mac" ? "macOS" : option.id === "win11" ? "Windows 11" : "Windows 95"}
          aria-pressed={theme === option.id}
          className={`flex items-center justify-center rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
            theme === option.id ? "bg-white/90 text-black" : "text-white hover:bg-white/20"
          }`}
        >
          {option.label ?? <IconAppleLogo className="h-3 w-3" />}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ page -- */

export default function RetroDesktopTemplate({ data }) {
  const { name, role, bio, email, links, skills, codingProfiles, experience, education, achievements, projects, sectionOrder } = data;
  const yearsXp = computeYearsOfExperience(experience);
  const firstName = (name || "About").trim().split(/\s+/)[0];

  const [theme, setTheme] = useState("retro");
  const [wins, setWins] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [startOpen, setStartOpen] = useState(false);
  const [appleOpen, setAppleOpen] = useState(false);
  const [poweredOff, setPoweredOff] = useState(false);
  const [tidyDismissed, setTidyDismissed] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [entered, setEntered] = useState(false);
  // What the Windows 11 Start menu lists under Recommended. It is what the
  // visitor has actually opened, most recent first, because that is what the
  // real one lists and because inventing the row would be inventing content.
  const [recentIds, setRecentIds] = useState([]);
  const [now, setNow] = useState(null);
  const [stage, setStage] = useState({ w: 0, h: 0 });

  const stageRef = useRef(null);
  const zRef = useRef(10);
  const cascadeRef = useRef(0);
  const bootedRef = useRef(false);

  const tokens = THEME_TOKENS[theme];
  // Below this the desktop metaphor stops working: there is no room to place a
  // window beside anything, so every window opens filling the stage, the way a
  // phone runs one app at a time.
  const compact = stage.w > 0 && stage.w < 720;

  // The six reorderable sections use the same ids as every other template, so
  // the customer's drag order picks which files exist here and in what order.
  // About and Contact sit outside that set, pinned first and last, as elsewhere.
  const reorderable = {
    experience: experience?.length > 0 && {
      kind: "file",
      label: "Experience.txt",
      docTitle: "Experience",
      body: (
        <Card theme={theme}>
          <TimelineBody
            theme={theme}
            items={experience.map((job) => ({
              title: job.role || "Role",
              subtitle: job.company || "Company",
              start: job.start,
              end: job.end,
              lines: job.bullets,
            }))}
            extra={yearsXp > 0 ? `${yearsXp} yrs experience` : ""}
          />
        </Card>
      ),
    },
    education: education?.length > 0 && {
      kind: "file",
      label: "Education.txt",
      docTitle: "Education",
      body: (
        <Card theme={theme}>
          <TimelineBody
            theme={theme}
            items={education.map((edu) => ({
              title: edu.degree || "Degree",
              subtitle: edu.school || "School",
              start: edu.start,
              end: edu.end,
              lines: [],
            }))}
          />
        </Card>
      ),
    },
    projects: projects?.length > 0 && {
      kind: "folder",
      label: "Projects",
      docTitle: "Projects",
      statusText: `${projects.length} object${projects.length === 1 ? "" : "s"}`,
      body: <ProjectList projects={projects} theme={theme} />,
    },
    skills: skills?.length > 0 && {
      kind: "file",
      label: "Skills.txt",
      docTitle: "Skills",
      body: (
        <Card theme={theme}>
          <SkillChips theme={theme} items={skills} />
        </Card>
      ),
    },
    codingProfiles: codingProfiles?.length > 0 && {
      kind: "file",
      label: "CodingProfiles.txt",
      docTitle: "Coding Profiles",
      body: (
        <Card theme={theme}>
          <LinksBody theme={theme} items={codingProfiles} />
        </Card>
      ),
    },
    achievements: achievements?.length > 0 && {
      kind: "award",
      label: "Achievements.txt",
      docTitle: "Achievements",
      body: (
        <Card theme={theme}>
          <AchievementList theme={theme} items={achievements} />
        </Card>
      ),
    },
  };

  const fileEntries = [
    {
      id: "about",
      kind: "file",
      label: `${firstName}_Me.txt`,
      docTitle: "About",
      body: (
        <Card theme={theme}>
          <ProfileBody theme={theme} name={name} role={role} bio={bio} />
        </Card>
      ),
    },
    ...(sectionOrder || [])
      .map((id) => (reorderable[id] ? { id, ...reorderable[id] } : null))
      .filter(Boolean),
    {
      id: "contact",
      kind: "mail",
      label: "Contact.txt",
      docTitle: "Contact",
      body: <ContactBody theme={theme} email={email} links={links} />,
    },
  ];

  // Only as many windows as there are scatter slots. Past that the desk stops
  // reading as strewn and starts reading as a pile, and no sparse portfolio
  // gets anywhere near the limit anyway.
  const bootOrder = fileEntries.slice(0, SCATTER.length);

  // The icon field wraps into columns down the left edge, and windows open to
  // the right of it: a window dropped on top of the icons hides the way into
  // everything else, which is the one thing the desktop cannot afford.
  const cell = ICON_METRICS[theme];
  const perColumn = Math.max(1, Math.floor((stage.h - 16) / cell.cellH));
  // Three system icons (the document, My Computer, the bin) sit alongside
  // the files, and only the count matters here, not the entries.
  const iconColumns = Math.ceil((fileEntries.length + 3) / perColumn);
  const iconReserve = clamp(iconColumns * cell.cellW + 10, 0, Math.max(0, stage.w - MIN_W - 24));

  const openWindow = useCallback(
    (id, kind, slot) => {
      setSelectedIcon(id);
      setStartOpen(false);
      setAppleOpen(false);
      setTidyDismissed(false);
      setRecentIds((prev) => [id, ...prev.filter((entry) => entry !== id)].slice(0, 4));
      setWins((prev) => {
        const z = ++zRef.current;
        const existing = prev.find((win) => win.id === id);
        if (existing) return prev.map((win) => (win.id === id ? { ...win, min: false, z } : win));

        // A numbered slot takes a scatter position; "centre" asks for the
        // middle of the desk, which is where the introduction always sits.
        const spread = typeof slot === "number" ? SCATTER[slot % SCATTER.length] : null;
        // The introduction has its own size and is always centred, wherever it
        // is opened from: it is the first thing to read, so it holds the middle
        // of the desk and everything else is arranged around it.
        const intro = id === "about";
        const size = WINDOW_SIZE[intro ? "intro" : kind] || WINDOW_SIZE.file;
        const w = clamp(Math.round(size.w * (spread?.scale ?? 1)), MIN_W, Math.max(MIN_W, stage.w - 16));
        const h = clamp(Math.round(size.h * (spread?.scale ?? 1)), MIN_H, Math.max(MIN_H, stage.h - 16));

        const left = 6 + iconReserve;
        const freeX = Math.max(0, stage.w - w - left - 12);
        const freeY = Math.max(0, stage.h - h - 12);
        const band = Math.max(0, stage.h - 80);

        let x;
        let y = null;
        let by = null;
        if (spread) {
          x = left + Math.round(spread.fx * freeX);
          if (spread.bottom == null) y = clamp(Math.round(spread.top * band), 6, Math.max(6, stage.h - 60));
          else by = clamp(Math.round(spread.bottom * band), 6, Math.max(6, stage.h - 60));
        } else if (intro || slot === "centre" || kind === "welcome" || kind === "document") {
          x = left + Math.round(freeX / 2);
          y = 6 + Math.round(freeY / 2);
        } else {
          // Anything opened by hand later cascades, stepping so a second
          // window never lands exactly on the first.
          const step = cascadeRef.current++ % 6;
          x = clamp(left + step * 26, left, left + freeX);
          y = clamp(28 + step * 24, 6, 6 + freeY);
        }

        // `h: null` means "as tall as the content"; `cap` is as tall as it is
        // allowed to get before the body starts scrolling instead.
        return [
          ...prev,
          { id, x, y, by, w, h: null, cap: h, min: false, max: compact, z, delay: typeof slot === "number" ? slot * 55 : 0 },
        ];
      });
    },
    [stage.w, stage.h, compact, iconReserve],
  );

  function openFromListing(entry) {
    openWindow(entry.id, entry.kind);
  }

  const documentEntry = {
    id: "portfolio",
    kind: "document",
    label: `${firstName}_Portfolio.txt`,
    body: <DocumentBody theme={theme} blocks={fileEntries} binLabel={tokens.binLabel} />,
  };

  const computerEntry = {
    id: "computer",
    kind: "computer",
    label: "My Computer",
    statusText: `${fileEntries.length + 1} object${fileEntries.length === 0 ? "" : "s"}`,
    body: (
      <FolderListing theme={theme} entries={[documentEntry, ...fileEntries]} emptyText="This folder is empty." onOpen={openFromListing} />
    ),
  };

  const binEntry = {
    id: "bin",
    kind: "bin",
    label: tokens.binLabel,
    statusText: "0 objects",
    body: <FolderListing theme={theme} entries={[]} emptyText={`${tokens.binLabel} is empty.`} onOpen={openFromListing} />,
  };

  // The document sits first, ahead of My Computer: it is the thing to read,
  // and the first icon on a desktop is the one people click.
  const desktopEntries = [documentEntry, computerEntry, ...fileEntries, binEntry];
  const items = {};
  for (const entry of desktopEntries) {
    items[entry.id] = {
      ...entry,
      // Windows 95 named the app in the title bar; the later shells stopped.
      title: theme === "retro" && (entry.kind === "file" || entry.kind === "document") ? `${entry.label} - Notepad` : entry.label,
      statusText: entry.statusText || "",
    };
  }
  // Resolved here rather than stored as entries: the bodies inside `items` are
  // rebuilt whenever the shell changes, and a Recommended row holding a stale
  // one would open a window rendered for the wrong desktop.
  const recent = recentIds.map((id) => items[id]).filter(Boolean);

  function closeWindow(id) {
    setWins((prev) => prev.filter((win) => win.id !== id));
  }

  // The Show desktop strip at the far end of the Windows 11 taskbar. It has
  // done the same thing since 2009, so it does it here.
  function minimiseAll() {
    setWins((prev) => (prev.some((win) => !win.min) ? prev.map((win) => ({ ...win, min: true })) : prev));
  }

  function focusWindow(id) {
    setWins((prev) => {
      const top = prev.reduce((highest, win) => Math.max(highest, win.z), 0);
      const target = prev.find((win) => win.id === id);
      if (!target || target.z === top) return prev;
      const z = ++zRef.current;
      return prev.map((win) => (win.id === id ? { ...win, z } : win));
    });
  }

  function updateWindow(id, patch) {
    setWins((prev) => prev.map((win) => (win.id === id ? { ...win, ...patch } : win)));
  }

  function handleTaskClick(id) {
    const win = wins.find((entry) => entry.id === id);
    if (!win) return;
    // Clicking the button of the window you are already looking at minimises
    // it, which is what both taskbars have always done.
    if (!win.min && focusedId === id) updateWindow(id, { min: true });
    else openWindow(id, items[id]?.kind);
  }

  const visible = wins.filter((win) => !win.min);
  const focusedId = visible.length > 0 ? visible.reduce((front, win) => (win.z > front.z ? win : front)).id : null;
  const stacked = [...visible].sort((a, b) => a.z - b.z);
  const rendered = compact ? stacked.filter((win) => win.id === focusedId) : stacked;
  const openIds = new Set(wins.map((win) => win.id));
  // Derived rather than tracked in an effect: the desk is clear when the last
  // window is closed, and closing one already re-renders.
  const deskCleared = entered && wins.length === 0 && !tidyDismissed && !poweredOff && !welcomeOpen;

  // The clock is client-only state rather than a value computed during render:
  // rendering `new Date()` would disagree between the server pass and the first
  // client pass and trip a hydration mismatch, and a desktop clock that never
  // moves is its own kind of wrong.
  useEffect(() => {
    function tick() {
      setNow(new Date());
    }
    tick();
    const timer = setInterval(tick, 30000);
    return () => clearInterval(timer);
  }, []);

  // Windows are placed in pixels, so the stage has to be measured before the
  // first one can open, and re-measured whenever the pane around it changes.
  // Re-clamping the open windows belongs in this callback rather than in an
  // effect of its own: a window left hanging off the new edge is a window
  // nobody can reach, and the resize is the event that stranded it.
  useEffect(() => {
    const element = stageRef.current;
    if (!element) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setStage((prev) => (prev.w === width && prev.h === height ? prev : { w: width, h: height }));
      setWins((prev) => {
        let changed = false;
        const next = prev.map((win) => {
          const w = clamp(win.w, MIN_W, Math.max(MIN_W, width - 16));
          const h = win.h == null ? null : clamp(win.h, MIN_H, Math.max(MIN_H, height - 16));
          const cap = clamp(win.cap, MIN_H, Math.max(MIN_H, height - 16));
          const x = clamp(win.x, -(w - 130), Math.max(0, width - 130));
          const y = win.y == null ? null : clamp(win.y, 0, Math.max(0, height - 34));
          const by = win.by == null ? null : clamp(win.by, 6, Math.max(6, height - 60));
          if (w === win.w && h === win.h && cap === win.cap && x === win.x && y === win.y && by === win.by) return win;
          changed = true;
          return { ...win, w, h, cap, x, y, by };
        });
        return changed ? next : prev;
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // The desktop boots with every file already open and strewn across it, and
  // the visitor reads them and closes them one by one, the way you clear a
  // desk. Nothing is hidden behind a double click, and the last window closing
  // is the end of the portfolio.
  //
  // Opened back to front so the first section ends up on top and focused, and
  // it cannot run until the stage has been measured, since windows are placed
  // in pixels inside it.
  const openAll = useCallback(() => {
    const scattered = bootOrder.filter((entry) => entry.id !== "about");
    for (let i = scattered.length - 1; i >= 0; i -= 1) {
      openWindow(scattered[i].id, scattered[i].kind, i);
    }
    // The introduction goes last so it lands on top of the scatter, focused,
    // and it is the only one that is always centred: it is the thing to read
    // first, and the rest of the desk is arranged around it.
    openWindow("about", "file", "centre");
  }, [bootOrder, openWindow]);

  useEffect(() => {
    if (!entered || bootedRef.current || stage.w === 0) return;
    bootedRef.current = true;
    openAll();
  }, [entered, stage.w, openAll]);

  // Escape closes the front window, which is the shortcut every one of these
  // systems answers to, and the way out for anyone driving by keyboard.
  useEffect(() => {
    function handleKey(event) {
      if (event.key !== "Escape") return;
      if (startOpen || appleOpen) {
        setStartOpen(false);
        setAppleOpen(false);
        return;
      }
      if (welcomeOpen) {
        setWelcomeOpen(false);
        setEntered(true);
        return;
      }
      if (focusedId) closeWindow(focusedId);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [focusedId, startOpen, appleOpen, welcomeOpen]);

  const clock = now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--";
  const today = now ? now.toLocaleDateString() : "";
  const macClock = now ? `${now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}  ${clock}` : clock;
  const frontItem = focusedId ? items[focusedId] : null;
  const macAppName = !frontItem ? "Finder" : frontItem.kind === "file" ? "TextEdit" : frontItem.kind === "mail" ? "Mail" : "Finder";

  function dismissMenus() {
    setStartOpen(false);
    setAppleOpen(false);
  }

  function powerDown() {
    dismissMenus();
    setWins([]);
    setPoweredOff(true);
  }

  function restart() {
    setPoweredOff(false);
    cascadeRef.current = 0;
    openAll();
  }

  return (
    <div className={`relative flex h-dvh w-full flex-col overflow-hidden ${tokens.font}`}>
      <Image key={theme} src={tokens.wallpaper} alt="" fill priority sizes="100vw" className="pointer-events-none object-cover" />
      {/* A soft vignette on every shell, mostly so icon and taskbar text stays
          legible against a busy photograph rather than as decoration. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 0%, transparent 40%, rgba(0,0,0,0.34) 100%)" }}
      />
      <CursorGlow colorRgb={tokens.glow} size={550} />

      {theme === "mac" && (
        <MacMenuBar
          appName={macAppName}
          clock={macClock}
          menuOpen={appleOpen}
          onMenu={() => setAppleOpen((open) => !open)}
          theme={theme}
          onTheme={(next) => {
            setTheme(next);
            dismissMenus();
          }}
          onAbout={() => openWindow("about", "file")}
          onOpenAll={openAll}
          onShutDown={powerDown}
        />
      )}

      <div className="relative min-h-0 flex-1">
        <div ref={stageRef} className="absolute inset-x-0 top-0" style={{ bottom: theme === "mac" ? DOCK_RESERVE : 0 }}>
          {/* The icon field covers the whole desktop, so it is also what a
              click on "empty desktop" actually lands on: clearing the
              selection and any open menu belongs here, not on the stage. */}
          <div
            className="absolute inset-0 flex select-none flex-col flex-wrap content-start gap-0.5 p-2"
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedIcon(null);
                dismissMenus();
              }
            }}
          >
            {desktopEntries.map((entry) => (
              <DesktopIcon
                key={entry.id}
                theme={theme}
                item={entry}
                selected={selectedIcon === entry.id}
                onSelect={() => setSelectedIcon(entry.id)}
                onOpen={() => openWindow(entry.id, entry.kind)}
              />
            ))}
          </div>

          {welcomeOpen && (
            <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
              <WelcomeDialog
                theme={theme}
                name={name}
                role={role}
                binLabel={tokens.binLabel}
                onEnter={() => {
                  setWelcomeOpen(false);
                  setEntered(true);
                }}
              />
            </div>
          )}

          {deskCleared && (
            <div className="absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2">
              <ClearedDialog
                theme={theme}
                yearsXp={yearsXp}
                binLabel={tokens.binLabel}
                onReopen={openAll}
                onDismiss={() => setTidyDismissed(true)}
              />
            </div>
          )}

          {rendered.map((win, index) => (
            <Window
              key={win.id}
              theme={theme}
              item={items[win.id]}
              win={win}
              zIndex={10 + index}
              focused={focusedId === win.id}
              compact={compact}
              stage={stage}
              onFocus={() => focusWindow(win.id)}
              onClose={() => closeWindow(win.id)}
              onMinimise={() => updateWindow(win.id, { min: true })}
              onToggleMax={() => updateWindow(win.id, { max: !win.max })}
              onCommit={(patch) => updateWindow(win.id, patch)}
            >
              {items[win.id].body}
            </Window>
          ))}
        </div>

        {theme === "mac" && (
          <Dock entries={[computerEntry, ...fileEntries]} binItem={binEntry} openIds={openIds} onOpen={(id) => openWindow(id, items[id].kind)} />
        )}
      </div>

      {startOpen && theme !== "mac" && (
        <>
          {/* A click anywhere else dismisses the menu, the way it does on a real
              machine. It is a plain overlay, not a focus trap: the menu's own
              buttons stay in the tab order behind it. */}
          <button
            type="button"
            aria-label="Close the Start menu"
            onClick={dismissMenus}
            className="absolute inset-0 z-30 cursor-default"
            style={{ bottom: tokens.taskbar }}
          />
          <div
            className={`absolute z-40 ${theme === "retro" ? "left-1" : "left-1/2 -translate-x-1/2"}`}
            style={{ bottom: tokens.taskbar + 4 }}
          >
            {theme === "retro" ? (
              <StartMenu95
                firstName={firstName}
                entries={desktopEntries}
                theme={theme}
                onOpen={(id) => openWindow(id, items[id].kind)}
                onOpenAll={openAll}
                onTheme={setTheme}
                onHelp={() => setWelcomeOpen(true)}
                onShutDown={powerDown}
                onDismiss={dismissMenus}
              />
            ) : (
              <StartMenu11
                name={name}
                role={role}
                entries={desktopEntries}
                recent={recent}
                theme={theme}
                onOpen={(id) => openWindow(id, items[id].kind)}
                onOpenAll={openAll}
                onTheme={setTheme}
                onShutDown={powerDown}
                onDismiss={dismissMenus}
              />
            )}
          </div>
        </>
      )}

      {theme === "retro" && (
        <Taskbar95
          items={items}
          windows={wins}
          focusedId={focusedId}
          startOpen={startOpen}
          onStart={() => setStartOpen((open) => !open)}
          onTask={handleTaskClick}
          clock={clock}
        />
      )}
      {theme === "win11" && (
        <Taskbar11
          items={items}
          windows={wins}
          focusedId={focusedId}
          startOpen={startOpen}
          onStart={() => setStartOpen((open) => !open)}
          onTask={handleTaskClick}
          onShowDesktop={minimiseAll}
          clock={clock}
          today={today}
        />
      )}

      <ShellSwitcher theme={theme} onChange={setTheme} offset={theme === "mac" ? 40 : 12} />

      {/* Last, and over everything: shutting down covers the taskbar too. */}
      {poweredOff && <PowerOverlay theme={theme} onRestart={restart} />}
    </div>
  );
}
