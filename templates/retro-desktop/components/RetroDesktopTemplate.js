"use client";

// Pure presentational component in spirit — it still renders only from the
// `data` prop with no data of its own — but unlike the other templates it
// keeps a bit of local UI state: which window is focused, and which "OS
// shell" is active. Desktop icons and taskbar/dock buttons are genuinely
// clickable and switch between real "windows" instead of everything being
// statically stacked.
//
// Three shells (Retro/Win95-98, Windows 11, macOS) share one content model
// — the same files/folders, built once from `data` — and only the chrome
// (window controls, taskbar vs. dock, wallpaper, fonts) changes per shell.
// The shell picker is local UI state, not saved portfolio data: it's a
// display preference a visitor can play with, the same way toggling light/
// dark on a website doesn't require an account.

import { useState } from "react";
import Image from "next/image";
import { IconGithub, IconLinkedin, IconLink, stripProtocol, computeYearsOfExperience } from "./shared";
import CursorGlow from "./CursorGlow";

const RAISED = "inset -1px -1px 0 #0a0a0a, inset 1px 1px 0 #fff, inset -2px -2px 0 #808080, inset 2px 2px 0 #dfdfdf";
const SUNKEN = "inset 1px 1px 0 #0a0a0a, inset -1px -1px 0 #fff, inset 2px 2px 0 #808080, inset -2px -2px 0 #dfdfdf";
const TITLEBAR = "linear-gradient(90deg, #000080, #1084d0)";

const THEME_TOKENS = {
  retro: {
    wallpaper: "/retro_classic_wallpaper.jpeg",
    glow: "120, 220, 255",
    linkColor: "#1084d0",
  },
  win11: {
    wallpaper: "/windows_11.jpg",
    glow: "130, 160, 255",
    linkColor: "#2563eb",
  },
  mac: {
    wallpaper: "/Macbook-Pro-Wallpaper-4K-Desktop.jpg",
    glow: "190, 175, 255",
    linkColor: "#0071e3",
  },
};

function IconFolder({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <path d="M2 9a2 2 0 0 1 2-2h8l3 3h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9Z" fill="#ffd75e" stroke="#8a6d1a" strokeWidth="1" />
    </svg>
  );
}

function IconFile({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <path d="M7 2h13l7 7v21a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" fill="#ffffff" stroke="#6b7280" strokeWidth="1" />
      <path d="M20 2v7h7" fill="none" stroke="#6b7280" strokeWidth="1" />
      <path d="M10 15h12M10 19h12M10 23h8" stroke="#1084d0" strokeWidth="1.4" />
    </svg>
  );
}

function IconTrash({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <path d="M9 10h14l-1.2 17a2 2 0 0 1-2 1.8H12.2a2 2 0 0 1-2-1.8L9 10Z" fill="#d1d5db" stroke="#4b5563" strokeWidth="1" />
      <path d="M6 10h20M12 10V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" fill="none" stroke="#4b5563" strokeWidth="1.4" />
    </svg>
  );
}

function IconEnvelope({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <rect x="3" y="7" width="26" height="19" fill="#ffffff" stroke="#4b5563" strokeWidth="1" />
      <path d="M3 8l13 10L29 8" fill="none" stroke="#1084d0" strokeWidth="1.6" />
    </svg>
  );
}

function IconRibbon({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <circle cx="16" cy="12" r="8" fill="#ffcf40" stroke="#a8801f" strokeWidth="1" />
      <path d="M11 18 8 29l8-4 8 4-3-11" fill="#e0433d" stroke="#9c2b26" strokeWidth="1" />
    </svg>
  );
}

function IconInfo({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <circle cx="16" cy="16" r="13" fill="#ffffff" stroke="#1084d0" strokeWidth="1.5" />
      <circle cx="16" cy="10.5" r="1.8" fill="#1084d0" />
      <rect x="14.3" y="14" width="3.4" height="11" rx="1" fill="#1084d0" />
    </svg>
  );
}

function IconWinFlag({ className }) {
  return (
    <svg viewBox="0 0 20 20" className={className}>
      <rect x="1" y="1" width="8" height="8" fill="#f35325" />
      <rect x="11" y="1" width="8" height="8" fill="#81bc06" />
      <rect x="1" y="11" width="8" height="8" fill="#05a6f0" />
      <rect x="11" y="11" width="8" height="8" fill="#ffba08" />
    </svg>
  );
}

function IconWin11Logo(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <rect x="1" y="1" width="8" height="8" />
      <rect x="11" y="1" width="8" height="8" />
      <rect x="1" y="11" width="8" height="8" />
      <rect x="11" y="11" width="8" height="8" />
    </svg>
  );
}

function IconAppleLogo(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.7 12.4c0-2.6 2.1-3.8 2.2-3.9-1.2-1.7-3-1.9-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.1 2.5-1.8 3.1-.5 7.6 1.3 10.1.9 1.2 1.9 2.6 3.2 2.5 1.3-.1 1.8-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.3-1.2 3.1-2.5.7-1 1-2 1.3-2-2.3-.9-2.7-3.4-2.7-3.7ZM13.9 3.3c.7-.8 1.1-2 1-3.1-1 .1-2.2.7-2.9 1.5-.6.7-1.1 1.9-1 3 1.1.1 2.2-.6 2.9-1.4Z" />
    </svg>
  );
}

function IconMinimizeLine(props) {
  return (
    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1" {...props}>
      <path d="M1 5h8" />
    </svg>
  );
}

function IconMaximizeLine(props) {
  return (
    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1" {...props}>
      <rect x="1.5" y="1.5" width="7" height="7" />
    </svg>
  );
}

function IconCloseLine(props) {
  return (
    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" {...props}>
      <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
    </svg>
  );
}

function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconWifiGlyph(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M2 8.5a16 16 0 0 1 20 0" />
      <path d="M5.5 12.5a11 11 0 0 1 13 0" />
      <path d="M9 16.5a6 6 0 0 1 6 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconVolumeGlyph(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="M17 9a5 5 0 0 1 0 6" />
    </svg>
  );
}

function IconChevronLeft(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m15 5-7 7 7 7" />
    </svg>
  );
}

function IconChevronRight(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

function sectionGlyph(kind, className) {
  if (kind === "folder") return <IconFolder className={className} />;
  if (kind === "mail") return <IconEnvelope className={className} />;
  if (kind === "award") return <IconRibbon className={className} />;
  return <IconFile className={className} />;
}

// A simplified white/monochrome outline glyph set — used wherever the icon
// sits on a colored surface (Dock tiles) rather than the desktop, where the
// colorful sectionGlyph icons read better instead.
function monoGlyph(kind, className) {
  if (kind === "folder") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
      </svg>
    );
  }
  if (kind === "mail") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    );
  }
  if (kind === "award") {
    // A trophy silhouette reads as "achievement" more universally than a
    // ribbon at icon size, on both the Win11 taskbar and the Mac dock.
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
        <path d="M8 5H6a1 1 0 0 0-1 1c0 2 1.3 3 3.1 3.2M16 5h2a1 1 0 0 1 1 1c0 2-1.3 3-3.1 3.2" />
        <path d="M12 12v3M9 19h6" />
      </svg>
    );
  }
  if (kind === "trash") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 7h14l-1.2 12.5a2 2 0 0 1-2 1.5H8.2a2 2 0 0 1-2-1.5L5 7Z" />
        <path d="M3 7h18M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 2h7l5 5v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" />
      <path d="M14 2v5h5" />
      <path d="M9 14h6M9 17h6" />
    </svg>
  );
}

// macOS's wire-mesh waste basket — a different silhouette from Retro/Win11's
// solid Recycle Bin, since that's genuinely how the two OSes' trash icons
// differ from each other.
function trashWireGlyph(className) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={className}>
      <path d="M6 8l1.5 12a1 1 0 0 0 1 .9h7a1 1 0 0 0 1-.9L18 8" />
      <path d="M4 8h16M9 8V5.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V8" />
      <path d="M9 11v7M12 11v7M15 11v7" />
    </svg>
  );
}

// Ruled lines, no page outline — reads as a yellow legal pad (à la Apple
// Notes) rather than a generic document.
function notesLinesGlyph(className) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <path d="M5 6h14M5 10h14M5 14h10M5 18h7" />
    </svg>
  );
}

// The Finder icon is the whole tile — a two-tone blue face — not a small
// glyph on a colored background, which is why DockIcon renders it
// full-bleed instead of through the shared gradient+glyph layout.
function IconFinderLogo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
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

// Win11 taskbar "app logos" — each pinned/open section gets a distinct,
// branded-looking icon instead of the plain file/folder glyph used on the
// desktop, the same way Explorer/Notepad/Mail each have their own icon.
function IconNotepadLogo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#0a63c9" />
      <rect x="6.5" y="5" width="11" height="14" rx="1" fill="#fff" />
      <path d="M9 9h6M9 12h6M9 15h4" stroke="#0a63c9" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconExplorerLogo({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className}>
      <path d="M2 11a2 2 0 0 1 2-2h9l2.5 3H4a2 2 0 0 0-2 2v-3Z" fill="#bfe1ff" />
      <path d="M4 13h24a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V13Z" fill="#3a8ee6" />
      <path d="M4 13h24v3H4z" fill="#7fc1ff" />
    </svg>
  );
}

function IconMailLogo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#2f7de1" />
      <rect x="5" y="7" width="14" height="10" rx="1.5" fill="#fff" />
      <path d="M5.5 7.5 12 13l6.5-5.5" fill="none" stroke="#2f7de1" strokeWidth="1.3" />
    </svg>
  );
}

function IconTrophyLogo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#d97706" />
      <path d="M8.5 7h7v3a3.5 3.5 0 0 1-7 0V7Z" fill="#fff" />
      <path d="M8.5 8H7a1 1 0 0 0-1 1c0 1.6 1.1 2.4 2.4 2.6M15.5 8H17a1 1 0 0 1 1 1c0 1.6-1.1 2.4-2.4 2.6" fill="none" stroke="#fff" strokeWidth="1" />
      <rect x="10.8" y="10.3" width="2.4" height="3.7" fill="#fff" />
      <path d="M8.7 17h6.6" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function taskbarLogo(kind, className) {
  if (kind === "folder") return <IconExplorerLogo className={className} />;
  if (kind === "mail") return <IconMailLogo className={className} />;
  if (kind === "award") return <IconTrophyLogo className={className} />;
  return <IconNotepadLogo className={className} />;
}

const DOCK_GRADIENTS = {
  file: "linear-gradient(160deg, #ffe27a, #f5a623)",
  mail: "linear-gradient(160deg, #6fb1ff, #1f6fe0)",
  award: "linear-gradient(160deg, #f6c453, #d97706)",
  trash: "linear-gradient(160deg, #e5e7eb, #9ca3af)",
};

// A real Explorer window has a command bar (New/Cut/Copy/Paste/...) and a
// left "Quick access" nav — rendered only when opening a folder, the same
// way a .txt file opens plainly in Notepad but a folder opens in Explorer.
function ExplorerCommandBar() {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto border-b border-black/5 bg-white/70 px-2 py-1.5 text-[11px] text-neutral-600">
      {["New", "Cut", "Copy", "Paste", "Rename", "Share", "Sort", "View"].map((label) => (
        <span key={label} className="shrink-0 whitespace-nowrap rounded px-2 py-1 hover:bg-black/5">
          {label}
        </span>
      ))}
    </div>
  );
}

function ExplorerNav() {
  return (
    <div className="hidden w-40 shrink-0 border-r border-black/5 bg-neutral-50/70 p-2 text-[12px] text-neutral-700 sm:block">
      <p className="px-2 py-1 text-[11px] font-semibold text-neutral-400">Quick access</p>
      {["Desktop", "Downloads", "Documents", "Pictures"].map((label) => (
        <div key={label} className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-black/5">
          <IconFolder className="h-4 w-4" />
          <span className="truncate">{label}</span>
        </div>
      ))}
      <p className="mt-3 px-2 py-1 text-[11px] font-semibold text-neutral-400">This PC</p>
    </div>
  );
}

// Finder's toolbar (back/forward + a search field) and sidebar (Favorites /
// Locations) — same idea as ExplorerCommandBar/Nav, rendered only for a
// folder window.
function FinderToolbar() {
  return (
    <div className="flex items-center gap-1 border-b border-black/5 bg-white/60 px-3 py-1.5 text-neutral-400">
      <span className="flex h-6 w-6 items-center justify-center rounded hover:bg-black/5">
        <IconChevronLeft className="h-3.5 w-3.5" />
      </span>
      <span className="flex h-6 w-6 items-center justify-center rounded hover:bg-black/5">
        <IconChevronRight className="h-3.5 w-3.5" />
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
    <div className="hidden w-40 shrink-0 border-r border-black/5 bg-neutral-50/60 p-2 text-[12px] text-neutral-700 sm:block">
      <p className="px-2 py-1 text-[11px] font-semibold text-neutral-400">Favorites</p>
      {["AirDrop", "Recents", "Applications", "Desktop", "Documents", "Downloads"].map((label) => (
        <div key={label} className="flex items-center gap-2 rounded px-2 py-1 hover:bg-black/5">
          <IconFolder className="h-3.5 w-3.5" />
          <span className="truncate">{label}</span>
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

// A themed "sheet of paper" content sits on — Notepad's sunken white panel
// in Retro, a soft rounded card in Win11/macOS. Kept as one function
// (rather than three near-duplicate content trees) so a future section only
// needs to be written once.
function Surface({ theme, children }) {
  if (theme === "retro") {
    return (
      <div className="whitespace-pre-wrap bg-white p-3 font-mono text-xs leading-relaxed text-black" style={{ boxShadow: SUNKEN }}>
        {children}
      </div>
    );
  }
  const rounded = theme === "win11" ? "rounded-lg" : "rounded-xl";
  return (
    <div className={`whitespace-pre-wrap border border-black/5 bg-white p-4 text-[13px] leading-relaxed text-neutral-800 ${rounded}`}>
      {children}
    </div>
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
        className={`flex items-center justify-between border-b px-3 py-1.5 text-[11px] font-bold ${
          theme === "retro" ? "border-[#808080] bg-[#dfdfdf] text-black" : "border-black/5 bg-neutral-50 text-neutral-500"
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
                {sectionGlyph("file", "h-4 w-4")}
                <span className={`text-xs font-semibold ${theme === "retro" ? "text-black" : "text-neutral-900"}`}>
                  {project.name || "project"}
                </span>
                <span className="text-[10px] text-gray-500">v{project.version || "1.0.0"}</span>
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
      <a href={href} className="flex items-center gap-1.5 bg-[#c0c0c0] px-3 py-1 text-xs font-bold text-black" style={{ boxShadow: RAISED }}>
        {icon}
        {children}
      </a>
    );
  }
  if (theme === "win11") {
    return (
      <a
        href={href}
        className="flex items-center gap-1.5 rounded-md bg-[#2563eb] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
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

// Every one of these gets a genuinely designed treatment in every shell —
// the desktop/window chrome is what stays OS-accurate, but nobody's real
// Notepad can render chips, cards or icons, and that's fine: the content
// itself is free to look like a modern, well-designed app regardless of
// which decade the window around it is styled after.
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
                <span className="truncate text-xs font-bold text-black">{item.title}</span>
                <span className="shrink-0 text-[10px] text-gray-600">
                  {item.start} – {item.end}
                </span>
              </div>
              <p className="truncate text-[11px] text-gray-600">{item.subtitle}</p>
              {item.lines?.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {item.lines.map((line, j) => (
                    <li key={j} className="flex gap-1.5 text-[11px] text-black">
                      <span className="shrink-0" style={{ color: "#1084d0" }}>
                        ▸
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
                {item.start} – {item.end}
              </span>
            </div>
            <p className="text-xs text-neutral-500">{item.subtitle}</p>
            {item.lines?.length > 0 && (
              <ul className="mt-1.5 space-y-1">
                {item.lines.map((line, j) => (
                  <li key={j} className="flex gap-1.5 text-[13px] text-neutral-700">
                    <span className="text-neutral-300">•</span>
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
            className="flex items-center gap-2 bg-white px-2 py-1.5 text-xs text-black"
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
          <span className="mt-0.5 shrink-0 text-amber-500">🏆</span>
          <span className="whitespace-pre-line">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function renderSectionBody(section, theme, ctx) {
  const { body } = section;
  if (body.type === "projects") return <ProjectList projects={body.projects} theme={theme} />;
  if (body.type === "contact") return <ContactBody theme={theme} email={ctx.email} links={ctx.links} />;
  if (body.type === "profile")
    return (
      <Card theme={theme}>
        <ProfileBody theme={theme} name={body.name} role={body.role} bio={body.bio} />
      </Card>
    );
  if (body.type === "timeline")
    return (
      <Card theme={theme}>
        <TimelineBody theme={theme} items={body.items} extra={body.extra} />
      </Card>
    );
  if (body.type === "skills")
    return (
      <Card theme={theme}>
        <SkillChips theme={theme} items={body.items} />
      </Card>
    );
  if (body.type === "links")
    return (
      <Card theme={theme}>
        <LinksBody theme={theme} items={body.items} />
      </Card>
    );
  if (body.type === "achievements")
    return (
      <Card theme={theme}>
        <AchievementList theme={theme} items={body.items} />
      </Card>
    );
  return null;
}

function TitleBarButton({ children, onClick }) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className="flex h-4 w-4 items-center justify-center bg-[#c0c0c0] text-[9px] font-bold leading-none text-black"
      style={{ boxShadow: RAISED }}
    >
      {children}
    </Tag>
  );
}

// One Window component for all three shells — the title bar, corner
// radius and control-button style change per theme, but it's the same
// component so a future section is written once and just looks right
// everywhere. A folder-kind window additionally gets the real
// Explorer/Finder chrome (command bar/toolbar + Quick access/Favorites
// sidebar) — a .txt file still opens as a plain Notepad/TextEdit window.
function Window({ theme, kind, icon, title, children, onClose }) {
  const isFolder = kind === "folder";

  if (theme === "retro") {
    return (
      <div className="bg-[#c0c0c0] p-[3px]" style={{ boxShadow: RAISED }}>
        <div className="flex items-center justify-between gap-2 px-1.5 py-1" style={{ background: TITLEBAR }}>
          <div className="flex min-w-0 items-center gap-1.5 text-white">
            {icon}
            <span className="truncate text-xs font-bold">{title}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <TitleBarButton>_</TitleBarButton>
            <TitleBarButton>□</TitleBarButton>
            <TitleBarButton onClick={onClose}>×</TitleBarButton>
          </div>
        </div>
        <div className="bg-[#c0c0c0] p-3">{children}</div>
      </div>
    );
  }

  if (theme === "win11") {
    return (
      <div className="overflow-hidden rounded-lg border border-black/10 bg-white/95 shadow-2xl">
        <div className="flex items-center justify-between gap-2 border-b border-black/5 bg-neutral-50/95 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2 text-neutral-800">
            {icon}
            <span className="truncate text-[13px] font-medium">{title}</span>
          </div>
          <div className="flex shrink-0 items-center">
            <button type="button" className="flex h-7 w-9 items-center justify-center text-neutral-600 hover:bg-black/5">
              <IconMinimizeLine className="h-2.5 w-2.5" />
            </button>
            <button type="button" className="flex h-7 w-9 items-center justify-center text-neutral-600 hover:bg-black/5">
              <IconMaximizeLine className="h-2.5 w-2.5" />
            </button>
            <button type="button" onClick={onClose} className="flex h-7 w-9 items-center justify-center text-neutral-600 hover:bg-red-500 hover:text-white">
              <IconCloseLine className="h-3 w-3" />
            </button>
          </div>
        </div>
        {isFolder && <ExplorerCommandBar />}
        <div className="flex">
          {isFolder && <ExplorerNav />}
          <div className="min-w-0 flex-1 p-4">{children}</div>
        </div>
      </div>
    );
  }

  // mac
  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-white/95 shadow-2xl">
      <div className="relative flex items-center justify-center border-b border-black/5 bg-neutral-100/90 px-3 py-2">
        <div className="absolute left-3 flex items-center gap-[7px]">
          <button type="button" onClick={onClose} aria-label="Close" className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-1.5 text-neutral-600">
          {icon}
          <span className="truncate text-[12px] font-medium">{title}</span>
        </div>
      </div>
      {isFolder && <FinderToolbar />}
      <div className="flex">
        {isFolder && <FinderSidebar />}
        <div className="min-w-0 flex-1 p-4">{children}</div>
      </div>
    </div>
  );
}

function DesktopIcon({ theme, icon, label, active, onClick }) {
  let labelClass = "px-1";
  let labelStyle = { textShadow: active ? "none" : "1px 1px 1px #000", backgroundColor: active ? "#000080" : "transparent" };
  if (theme === "win11") {
    labelClass = `rounded px-1.5 py-0.5 ${active ? "bg-white/20 ring-1 ring-white/40" : ""}`;
    labelStyle = { textShadow: "0 1px 2px rgba(0,0,0,0.6)" };
  } else if (theme === "mac") {
    labelClass = `rounded px-1.5 py-0.5 ${active ? "bg-blue-500/70" : ""}`;
    labelStyle = { textShadow: "0 1px 2px rgba(0,0,0,0.5)" };
  }
  return (
    <button type="button" onClick={onClick} className="flex w-20 flex-col items-center gap-1 text-center">
      <div className="flex h-9 w-9 items-center justify-center drop-shadow">{icon}</div>
      <span className={`text-[11px] text-white ${labelClass}`} style={labelStyle}>
        {label}
      </span>
    </button>
  );
}

// Shared by Retro and Win11 — a full-width bottom bar with a Start button,
// task buttons and a clock. Only the shape/color/centering changes.
function ClassicTaskbar({ theme, sections, activeId, binOpen, onSelect, onBin, clock }) {
  if (theme === "retro") {
    return (
      <div className="relative flex shrink-0 items-center gap-2 bg-[#c0c0c0] px-2 py-1" style={{ boxShadow: RAISED }}>
        <span className="flex items-center gap-1.5 bg-[#c0c0c0] px-2.5 py-1 text-xs font-bold text-black" style={{ boxShadow: RAISED }}>
          <IconWinFlag className="h-4 w-4" /> Start
        </span>
        <div className="h-6 w-px bg-[#808080]" />
        <div className="flex flex-1 gap-1.5 overflow-x-auto">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-1 text-[11px] text-black"
              style={{ boxShadow: activeId === s.id && !binOpen ? SUNKEN : RAISED, backgroundColor: activeId === s.id && !binOpen ? "#dfdfdf" : "#c0c0c0" }}
            >
              {sectionGlyph(s.kind, "h-4 w-4")}
              {s.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onBin}
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-1 text-[11px] text-black"
            style={{ boxShadow: binOpen ? SUNKEN : RAISED, backgroundColor: binOpen ? "#dfdfdf" : "#c0c0c0" }}
          >
            <IconTrash className="h-4 w-4" />
            Recycle Bin
          </button>
        </div>
        <div className="whitespace-nowrap bg-[#dfdfdf] px-3 py-1 text-[11px] text-black" style={{ boxShadow: SUNKEN }}>
          {clock}
        </div>
      </div>
    );
  }

  // win11 — a search box next to Start, centered pinned icons, and a
  // system tray + two-line clock on the right, on a translucent dark bar.
  const today = new Date().toLocaleDateString();
  return (
    <div className="relative flex h-14 shrink-0 items-center bg-neutral-900/80 px-3 backdrop-blur-xl">
      <div className="flex flex-1 items-center justify-center gap-1.5">
        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/10">
          <IconWin11Logo className="h-4.5 w-4.5" />
        </button>
        <div className="flex h-9 w-44 shrink items-center gap-2 rounded-full bg-white/10 px-3 text-[12px] text-white/70">
          <IconSearch className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Search</span>
        </div>
        <div className="mx-1 h-6 w-px bg-white/15" />
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            title={s.label}
            className={`relative flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/10 ${
              activeId === s.id && !binOpen ? "bg-white/10" : ""
            }`}
          >
            {taskbarLogo(s.kind, "h-5 w-5")}
            {activeId === s.id && !binOpen && <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-white" />}
          </button>
        ))}
        <button
          type="button"
          onClick={onBin}
          title="Recycle Bin"
          className={`relative flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/10 ${binOpen ? "bg-white/10" : ""}`}
        >
          <IconTrash className="h-5 w-5" />
          {binOpen && <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-white" />}
        </button>
      </div>
      <div className="absolute right-3 flex items-center gap-3 text-white">
        <div className="flex items-center gap-2.5 opacity-90">
          <IconWifiGlyph className="h-3.5 w-3.5" />
          <IconVolumeGlyph className="h-3.5 w-3.5" />
        </div>
        <div className="rounded px-1.5 py-1 text-right leading-tight hover:bg-white/10">
          <div className="text-[11px]">{clock}</div>
          <div className="text-[10px] opacity-70">{today}</div>
        </div>
      </div>
    </div>
  );
}

// A Dock icon reads as "an app" because of its colorful gradient tile, not
// its glyph — a plain white square with a folder outline looks like a
// button, not a Mac. The Finder icon is a special case: on a real Mac it's
// the whole tile (a two-tone blue face), not a glyph on a background, so it
// renders full-bleed instead of through the shared gradient+glyph layout.
function DockIcon({ kind, label, active, onClick }) {
  const tileClass = `relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[14px] shadow-lg ring-1 ring-black/10 transition-transform group-hover:-translate-y-1.5 ${
    active ? "ring-2 ring-white/70" : ""
  }`;

  let inner;
  if (kind === "folder") {
    inner = <IconFinderLogo className="h-full w-full" />;
  } else if (kind === "trash") {
    inner = (
      <>
        <span className="absolute inset-0" style={{ background: DOCK_GRADIENTS.trash }} />
        <span className="relative text-neutral-600">{trashWireGlyph("h-6 w-6")}</span>
      </>
    );
  } else if (kind === "file") {
    inner = (
      <>
        <span className="absolute inset-0" style={{ background: DOCK_GRADIENTS.file }} />
        <span className="relative text-[#7a5a12]">{notesLinesGlyph("h-6 w-6")}</span>
      </>
    );
  } else {
    inner = (
      <>
        <span className="absolute inset-0" style={{ background: DOCK_GRADIENTS[kind] || DOCK_GRADIENTS.mail }} />
        <span className="relative text-white">{monoGlyph(kind, "h-6 w-6")}</span>
      </>
    );
  }

  return (
    <button type="button" onClick={onClick} title={label} className="group flex flex-col items-center">
      <span className={tileClass}>{inner}</span>
      <span className={`mt-1 h-1 w-1 rounded-full bg-white/90 ${active ? "opacity-100" : "opacity-0"}`} />
    </button>
  );
}

// macOS-only chrome: a floating centered Dock (replaces the taskbar) plus a
// top menu bar rendered separately in the main component.
function Dock({ sections, activeId, binOpen, onSelect, onBin }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center">
      <div className="pointer-events-auto flex items-end gap-2 rounded-[22px] border border-white/40 bg-white/25 px-2.5 py-2 shadow-2xl backdrop-blur-2xl">
        {sections.map((s) => (
          <DockIcon key={s.id} kind={s.kind} label={s.label} active={activeId === s.id && !binOpen} onClick={() => onSelect(s.id)} />
        ))}
        <div className="mx-1 h-9 w-px self-center bg-white/30" />
        <DockIcon kind="trash" label="Trash" active={binOpen} onClick={onBin} />
      </div>
    </div>
  );
}

function MacMenuBar({ appName, clock }) {
  return (
    <div className="relative z-10 flex h-7 shrink-0 items-center justify-between border-b border-black/5 bg-white/50 px-3 text-[12.5px] text-neutral-800 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <IconAppleLogo className="h-3.5 w-3.5" />
        <span className="font-semibold">{appName}</span>
        <span className="hidden gap-4 text-neutral-500 sm:flex">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Window</span>
          <span>Help</span>
        </span>
      </div>
      <div className="flex items-center gap-3 text-neutral-700">
        <IconSearch className="h-3.5 w-3.5" />
        <IconWifiGlyph className="h-3.5 w-3.5" />
        <IconVolumeGlyph className="h-3.5 w-3.5" />
        <span className="whitespace-nowrap">{clock}</span>
      </div>
    </div>
  );
}

// Small floating control that lets a visitor swap the OS shell live — a
// display preference, not saved portfolio data (see the header comment).
function ShellSwitcher({ theme, onChange, macOffset }) {
  const options = [
    { id: "retro", label: "95" },
    { id: "win11", label: "11" },
    { id: "mac", label: null },
  ];
  return (
    <div className={`pointer-events-auto absolute right-3 z-50 flex gap-1 rounded-full bg-black/30 p-1 backdrop-blur-md ${macOffset ? "top-11" : "top-3"}`}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          title={opt.id}
          className={`flex items-center justify-center rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
            theme === opt.id ? "bg-white/90 text-black" : "text-white hover:bg-white/20"
          }`}
        >
          {opt.label ?? <IconAppleLogo className="h-3 w-3" />}
        </button>
      ))}
    </div>
  );
}

export default function RetroDesktopTemplate({ data }) {
  const { name, role, bio, email, links, skills, codingProfiles, experience, education, achievements, projects, sectionOrder } = data;
  const yearsXp = computeYearsOfExperience(experience);
  const firstName = (name || "About").trim().split(/\s+/)[0];

  const [theme, setTheme] = useState("retro");
  const clock = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const macClock = `${new Date().toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}  ${clock}`;

  // The six reorderable sections (same ids as every other template's
  // SECTION_DEFINITIONS) — the customer's drag order picks which of these
  // exist as desktop icons/windows, and in what sequence. About and Contact
  // are deliberately outside this set, pinned first/last, same as elsewhere.
  const reorderable = {
    experience: experience?.length > 0 && {
      id: "experience",
      kind: "file",
      label: "Experience.txt",
      title: "Experience.txt",
      body: {
        type: "timeline",
        items: experience.map((job) => ({ title: job.role || "Role", subtitle: job.company || "Company", start: job.start, end: job.end, lines: job.bullets })),
        extra: yearsXp > 0 ? `(${yearsXp} yrs experience)` : "",
      },
    },
    education: education?.length > 0 && {
      id: "education",
      kind: "file",
      label: "Education.txt",
      title: "Education.txt",
      body: {
        type: "timeline",
        items: education.map((edu) => ({ title: edu.degree || "Degree", subtitle: edu.school || "School", start: edu.start, end: edu.end, lines: [] })),
        extra: "",
      },
    },
    projects: projects?.length > 0 && {
      id: "projects",
      kind: "folder",
      label: "Projects",
      title: "Projects",
      body: { type: "projects", projects },
    },
    skills: skills?.length > 0 && {
      id: "skills",
      kind: "file",
      label: "Skills.txt",
      title: "Skills.txt",
      body: { type: "skills", items: skills },
    },
    codingProfiles: codingProfiles?.length > 0 && {
      id: "codingProfiles",
      kind: "file",
      label: "CodingProfiles.txt",
      title: "CodingProfiles.txt",
      body: { type: "links", items: codingProfiles },
    },
    achievements: achievements?.length > 0 && {
      id: "achievements",
      kind: "award",
      label: "Achievements.txt",
      title: "Achievements.txt",
      body: { type: "achievements", items: achievements },
    },
  };
  const orderedReorderable = (sectionOrder || []).map((id) => reorderable[id]).filter(Boolean);

  const sections = [
    {
      id: "about",
      kind: "file",
      label: `${firstName}_Me.txt`,
      title: `${firstName}_Me.txt`,
      body: { type: "profile", name, role, bio },
    },
    ...orderedReorderable,
    {
      id: "contact",
      kind: "mail",
      label: "Contact.txt",
      title: "Contact_Me.txt",
      body: { type: "contact" },
    },
  ];

  const [activeId, setActiveId] = useState(sections[0].id);
  const [binOpen, setBinOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const active = sections.find((s) => s.id === activeId) || sections[0];

  // Real counts only — no invented stats, same rule as every other template.
  const tipParts = [
    projects?.length > 0 && `${projects.length} project${projects.length === 1 ? "" : "s"}`,
    skills?.length > 0 && `${skills.length} skill${skills.length === 1 ? "" : "s"}`,
    achievements?.length > 0 && `${achievements.length} achievement${achievements.length === 1 ? "" : "s"}`,
  ].filter(Boolean);

  const tokens = THEME_TOKENS[theme];
  const binLabel = theme === "mac" ? "Trash" : "Recycle Bin";

  function selectSection(id) {
    setBinOpen(false);
    setActiveId(id);
  }

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <Image
        key={theme}
        src={tokens.wallpaper}
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover"
      />
      {/* A soft vignette on every shell — mostly for icon/taskbar text
          legibility against a busy photo, not just a stylistic touch. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 0%, transparent 40%, rgba(0,0,0,0.32) 100%)" }}
      />
      <CursorGlow colorRgb={tokens.glow} size={550} />

      {theme === "mac" && <MacMenuBar appName={`${firstName}OS`} clock={macClock} />}

      <ShellSwitcher theme={theme} onChange={setTheme} macOffset={theme === "mac"} />

      {/* Scrollable desktop area — the taskbar/dock below lives outside
          this, as a plain (non-growing) flex item, so it always stays put
          at the bottom of the view instead of trailing the active window's
          content height. */}
      <div className="relative flex-1 overflow-y-auto px-6 pb-6 pt-8 sm:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Welcome dialog */}
          {welcomeOpen && (
            <div className="mb-8">
              <Window theme={theme} icon={<IconInfo className="h-4 w-4" />} title="Welcome" onClose={() => setWelcomeOpen(false)}>
                <div className="flex gap-4">
                  <IconInfo className="h-12 w-12 shrink-0" />
                  <div className="min-w-0">
                    <p className={theme === "retro" ? "text-sm font-bold text-black" : "text-sm font-semibold text-neutral-900"}>
                      Welcome to {name ? `${name}'s` : "this"} Desktop!
                    </p>
                    {role && <p className="mt-0.5 text-xs text-gray-700">{role}</p>}
                    <div className={`mt-3 pt-3 ${theme === "retro" ? "border-t border-[#808080]" : "border-t border-black/5"}`}>
                      <p className={theme === "retro" ? "text-xs font-bold text-black" : "text-xs font-semibold text-neutral-900"}>Tip of the day:</p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-700">
                        {tipParts.length > 0
                          ? `This desktop has ${tipParts.join(", ")} to explore — click an icon or a taskbar button to open it.`
                          : "Click an icon or a taskbar button below to open a window."}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  {theme === "retro" ? (
                    <label className="flex items-center gap-1.5 text-[11px] text-black">
                      <span className="flex h-3.5 w-3.5 items-center justify-center bg-white" style={{ boxShadow: SUNKEN }} />
                      Show this welcome screen next time
                    </label>
                  ) : (
                    <span className="text-[12px] text-neutral-500">Have a look around.</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setWelcomeOpen(false)}
                    className={
                      theme === "retro"
                        ? "shrink-0 bg-[#c0c0c0] px-6 py-1 text-xs font-bold text-black"
                        : theme === "win11"
                          ? "shrink-0 rounded-md bg-[#2563eb] px-5 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
                          : "shrink-0 rounded-full bg-[#0071e3] px-5 py-1.5 text-xs font-semibold text-white hover:bg-[#0077ed]"
                    }
                    style={theme === "retro" ? { boxShadow: RAISED } : undefined}
                  >
                    OK
                  </button>
                </div>
              </Window>
            </div>
          )}

          {/* Desktop icons */}
          <div className="mb-8 flex select-none flex-wrap gap-2">
            {sections.map((s) => (
              <DesktopIcon
                key={s.id}
                theme={theme}
                icon={sectionGlyph(s.kind, "h-8 w-8")}
                label={s.label}
                active={activeId === s.id && !binOpen}
                onClick={() => selectSection(s.id)}
              />
            ))}
            <DesktopIcon theme={theme} icon={<IconTrash className="h-8 w-8" />} label={binLabel} active={binOpen} onClick={() => setBinOpen(true)} />
          </div>

          {/* The one open window */}
          {binOpen ? (
            <Window theme={theme} kind="folder" icon={<IconTrash className="h-4 w-4" />} title={binLabel}>
              <Surface theme={theme}>This folder is empty.</Surface>
            </Window>
          ) : (
            <Window theme={theme} kind={active.kind} icon={sectionGlyph(active.kind, "h-4 w-4")} title={active.title}>
              {renderSectionBody(active, theme, { email, links })}
            </Window>
          )}
        </div>
      </div>

      {theme === "mac" ? (
        <Dock sections={sections} activeId={activeId} binOpen={binOpen} onSelect={selectSection} onBin={() => setBinOpen(true)} />
      ) : (
        <ClassicTaskbar theme={theme} sections={sections} activeId={activeId} binOpen={binOpen} onSelect={selectSection} onBin={() => setBinOpen(true)} clock={clock} />
      )}
    </div>
  );
}
