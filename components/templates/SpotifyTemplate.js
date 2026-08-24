"use client";

// The Spotify desktop app, not a page that borrows its palette.
//
// What makes that application recognisable is its shell rather than its
// colours: a black gutter with three rounded panes floating in it, a library
// rail down the left, one scroller in the middle that owns its own top bar, and
// a player pinned across the bottom. Every other Spotify-flavoured design on
// the internet is a green button on a dark page, so the shell is the work.
//
// The component owns a little state, which earlier versions did not: a track
// can be selected and played, the player bar follows it, and the bullets of
// whatever is playing light up in turn like lyrics. That is the one thing this
// template can do that a screenshot cannot, and it runs on the customer's own
// entered text.
//
// Honesty rules, unchanged from every other template: the progress bar and the
// volume fill are chrome and carry no numbers, there are no invented track
// durations, and the right-hand column of the track list shows the dates the
// customer actually typed. "Monthly listeners" is a themed display number
// derived from real counts (projects, skills, years of experience), the same
// device as Level Up's Builder Score, and it is not a claim of an audience.
// Achievements and certifications share one schema field, so they render once,
// as Top Charts.
//
// No Spotify wordmark or logo anywhere: the layout is the homage, and a
// trademark shipped into a paying customer's own repository is not ours to
// hand over. Where the application puts its mark, this puts the artist's.
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Figtree } from "next/font/google";
import { IconGithub, IconLinkedin, IconLink, dotColor, initials, stripProtocol, computeYearsOfExperience } from "./shared";
import CursorGlow from "./CursorGlow";

// Spotify sets its entire interface in Circular, which is licensed and not
// ours to serve. Figtree is the closest open face to it: same geometric
// skeleton, same double-storey a, near enough the same proportions that the
// headline weight lands where Circular's does.
const figtree = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], display: "swap" });

// The real values, off the application. The green shifted lighter years ago and
// most recreations still use the old one; the verified badge has never been
// green at all, it is the same blue as a checkmark anywhere else.
const GREEN = "#1ed760";
const BLUE = "#4cb3ff";
const PANE = "#121212";
const CARD = "#181818";
const CARD_HOVER = "#1f1f1f";
const CHIP = "#232323";
const SUBDUED = "#b3b3b3";

// Where the default song's title points. Only the recording is linked: the
// Lyrics card in this template renders the customer's own bullet points and
// nothing else, and the song that is cued in the player carries no lines at all.
const DEFAULT_SONG_URL = "https://youtu.be/qQzdAsjWGPg";

// How long a track runs before the player moves on. It is not a claim about
// anything, so it scales with how much there is to read rather than pretending
// to be a length in minutes.
function trackSeconds(lineCount) {
  return Math.min(40, Math.max(12, 9 + lineCount * 4));
}

function hueFor(seed) {
  let h = 0;
  const s = String(seed || "x");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
}

/* ----------------------------------------------------------------- icons -- */

// Drawn rather than downloaded, unlike the desktop template's vendor artwork.
// Spotify's icon set is not published under a licence that would let it ship
// inside a customer's repository, and unlike an operating system's raster icons
// these are flat geometry on a 16 unit grid, so they can be reproduced exactly
// instead of approximated.

function IconPlay({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
      <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.287V1.713Z" />
    </svg>
  );
}

function IconPause({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
      <path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7Zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6Z" />
    </svg>
  );
}

function IconShuffle({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
      <path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.151.922Z" />
      <path d="m13.151 15.078 2.83-2.828-2.83-2.828-1.06 1.06L13.109 11.5H11.16a2.25 2.25 0 0 1-1.724-.804l-1.799-2.14-.978 1.165 1.628 1.94A3.75 3.75 0 0 0 11.16 13h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06Z" />
      <path d="M.391 2H0v1.5h.391a2.25 2.25 0 0 1 1.724.804l1.798 2.14.979-1.165-1.628-1.94A3.75 3.75 0 0 0 .39 2Z" />
    </svg>
  );
}

function IconPrev({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
      <path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6Z" />
    </svg>
  );
}

function IconNext({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
      <path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.106A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6Z" />
    </svg>
  );
}

function IconRepeat({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
      <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439A2.25 2.25 0 0 0 14.5 9.75v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5Z" />
    </svg>
  );
}

function IconVolume({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
      <path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0Zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35Z" />
      <path d="M11.5 4.6a.75.75 0 0 1 1.024-.275 5.5 5.5 0 0 1 0 9.35.75.75 0 1 1-.748-1.3 4 4 0 0 0 0-6.8.75.75 0 0 1-.276-.975Z" />
    </svg>
  );
}

function IconHeart({ className, filled }) {
  if (filled) {
    return (
      <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
        <path d="M15.724 4.22A4.313 4.313 0 0 0 12.192.814a4.269 4.269 0 0 0-3.622 1.13.837.837 0 0 1-1.14 0A4.272 4.272 0 0 0 3.806.815 4.312 4.312 0 0 0 .275 4.22a5.02 5.02 0 0 0 1.596 4.579l5.1 4.998a1.474 1.474 0 0 0 2.06 0l5.098-4.998a5.02 5.02 0 0 0 1.596-4.58Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
      <path d="M1.69 2A4.582 4.582 0 0 1 8 2.023 4.583 4.583 0 0 1 11.88.817h.002a4.618 4.618 0 0 1 3.782 3.65v.003a4.543 4.543 0 0 1-1.011 3.84L9.35 14.629a1.765 1.765 0 0 1-2.093.464 1.762 1.762 0 0 1-.605-.463L1.348 8.309A4.582 4.582 0 0 1 1.689 2Zm3.158-.252A3.082 3.082 0 0 0 2.49 7.313l5.306 6.323a.265.265 0 0 0 .409 0l5.306-6.323a3.043 3.043 0 0 0 .68-2.57 3.118 3.118 0 0 0-2.551-2.463 3.079 3.079 0 0 0-2.612.816l-.007.007a1.501 1.501 0 0 1-2.045 0l-.007-.007a3.078 3.078 0 0 0-1.932-.848Z" />
    </svg>
  );
}

function IconMore({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
      <circle cx="2" cy="8" r="1.6" />
      <circle cx="8" cy="8" r="1.6" />
      <circle cx="14" cy="8" r="1.6" />
    </svg>
  );
}

function IconChevron({ className, dir = "left" }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={dir === "left" ? "M10 2 4 8l6 6" : "M6 2l6 6-6 6"} />
    </svg>
  );
}

function IconVerified({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 1.5 14.06 3l2.5-.5.98 2.38 2.38.98-.5 2.5L21 12l-1.58 2.14.5 2.5-2.38.98-.98 2.38-2.5-.5L12 22.5l-2.14-1.5-2.5.5-.98-2.38-2.38-.98.5-2.5L3 12l1.5-2.14-.5-2.5 2.38-.98.98-2.38 2.5.5L12 1.5Z"
        fill={BLUE}
      />
      <path d="m8.2 12.1 2.5 2.5 5.1-5.1" stroke="#000" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconHome({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33Zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33Z" />
    </svg>
  );
}

function IconSearch({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28Zm-7.407 9.279c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.28Z" />
    </svg>
  );
}

function IconLibrary({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1ZM15.5 2.134A1 1 0 0 1 17 3v18a1 1 0 0 1-2 0V3a1 1 0 0 1 .5-.866ZM9 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1Zm11.316-.949 1.932-.518a1 1 0 0 0 .707-1.225L19.33 5.084a1 1 0 0 0-1.225-.707l-.518.139 2.729 16.535Z" />
    </svg>
  );
}

function IconPlus({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
      <path d="M7.25 1.25h1.5v6h6v1.5h-6v6h-1.5v-6h-6v-1.5h6v-6Z" />
    </svg>
  );
}

function IconQueue({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
      <path d="M15 15H1v-1.5h14V15Zm0-4.5H1V9h14v1.5Zm-14-7A2.5 2.5 0 0 1 3.5 1h9A2.5 2.5 0 0 1 15 3.5v2A2.5 2.5 0 0 1 12.5 8h-9A2.5 2.5 0 0 1 1 5.5v-2Zm2.5-1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-9Z" />
    </svg>
  );
}

function IconDevices({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
      <path d="M6 3a1 1 0 0 0-1 1v1H2.5A1.5 1.5 0 0 0 1 6.5v6A1.5 1.5 0 0 0 2.5 14h6a1.5 1.5 0 0 0 1.5-1.5V11h3.5A1.5 1.5 0 0 0 15 9.5v-6A1.5 1.5 0 0 0 13.5 2H6a1 1 0 0 0 0 1Zm4 6.5h3.5V3.5H6.5V5h2A1.5 1.5 0 0 1 10 6.5v3Zm-7.5-3h6v6h-6v-6Z" />
    </svg>
  );
}

// The three bars that dance beside whatever is currently playing. It is the
// only animated thing in a Spotify track list and the fastest way to say "this
// row, right now" without a word of copy.
function Equaliser({ playing }) {
  return (
    <span className={`flex h-4 items-end gap-[2px] ${playing ? "spot-eq" : ""}`} aria-hidden>
      {[0, 1, 2].map((bar) => (
        <span key={bar} className="w-[3px] rounded-[1px]" style={{ backgroundColor: GREEN, height: bar === 1 ? 15 : 9 }} />
      ))}
    </span>
  );
}

/* -------------------------------------------------------------- fragments -- */

// The square that stands in for album art. A photograph if the customer gave
// one, otherwise a two-tone field seeded off the title, which is what keeps a
// discography of eight projects from being eight identical grey tiles.
function Art({ src, seed, label, size = "h-full w-full", rounded = "rounded", text = "text-2xl" }) {
  if (src) return <img src={src} alt="" className={`${size} ${rounded} object-cover`} />;
  const hue = hueFor(seed);
  return (
    <span
      className={`${size} ${rounded} flex items-center justify-center font-black text-black/70`}
      style={{ background: `linear-gradient(140deg, hsl(${hue}, 62%, 52%), hsl(${(hue + 42) % 360}, 55%, 28%))` }}
    >
      <span className={text}>{label}</span>
    </span>
  );
}

// A green play button, at the three sizes the application actually uses it:
// the big one under the artist name, the medium one that rises out of an album
// tile on hover, and the small white one in the player.
function PlayButton({ playing, size = 56, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="spot-play flex shrink-0 items-center justify-center rounded-full text-black shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
      style={{ backgroundColor: GREEN, width: size, height: size }}
    >
      {playing ? (
        <IconPause className="h-[45%] w-[45%]" />
      ) : (
        <IconPlay className="h-[45%] w-[45%] translate-x-[6%]" />
      )}
    </button>
  );
}

// Every list in this template is one of these rows: a number that turns into a
// play triangle under the pointer, art, a title over a subtitle, and a
// right-hand column. That column never holds an invented duration; it holds the
// dates or the status the customer typed.
function TrackRow({ index, track, current, playing, onPlay, onSelect }) {
  return (
    <div
      className={`group grid min-h-14 cursor-default grid-cols-[16px_40px_1fr] items-center gap-4 rounded px-4 py-2 transition-colors hover:bg-white/10 sm:grid-cols-[16px_40px_1fr_auto] ${
        current ? "bg-white/[0.07]" : ""
      }`}
      onDoubleClick={() => onPlay(track.id)}
    >
      <span className="flex w-4 justify-center text-sm tabular-nums" style={{ color: current ? GREEN : SUBDUED }}>
        {current && playing ? (
          <Equaliser playing />
        ) : (
          <>
            <span className="group-hover:hidden">{index + 1}</span>
            <button
              type="button"
              onClick={() => onPlay(track.id)}
              aria-label={`Play ${track.title}`}
              className="hidden text-white group-hover:block"
            >
              <IconPlay className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </span>

      <span className="h-10 w-10 shrink-0">
        <Art src={track.image} seed={track.seed} label={(track.title || "?")[0]?.toUpperCase()} rounded="rounded-[2px]" text="text-base" />
      </span>

      {/* Wraps rather than truncates. A cut-off job title reads as a bug on a
          phone, not as a design decision, and the dates cannot simply vanish
          with the column that holds them, so below the breakpoint they join the
          end of the subtitle line instead. */}
      <button type="button" onClick={() => onSelect(track.id)} className="min-w-0 text-left">
        <span className="block break-words text-base font-medium" style={{ color: current ? GREEN : "#fff" }}>
          {track.title}
        </span>
        {(track.subtitle || track.meta) && (
          <span className="block break-words text-[13px]" style={{ color: SUBDUED }}>
            {track.subtitle}
            {track.meta && (
              <span className="sm:hidden">
                {track.subtitle ? " · " : ""}
                {track.meta}
              </span>
            )}
          </span>
        )}
      </button>

      <span className="hidden shrink-0 pl-4 text-[13px] tabular-nums sm:block" style={{ color: SUBDUED }}>
        {track.meta}
      </span>
    </div>
  );
}

// A release, laid out the way a role is: number, artwork, then everything else
// running across the full width of the pane. A vertical tile wasted that width
// and made a single project look like a layout accident next to nine empty
// columns; a row is the same shape whether there is one of them or a dozen.
function ProjectRow({ project, index, id, current, playing, onPlay }) {
  const title = project.name || "Untitled";
  const meta = [project.status || "Released", project.version && `v${project.version}`].filter(Boolean).join(" · ");
  return (
    <div className="group flex items-start gap-4 rounded px-4 py-3 transition-colors hover:bg-white/10">
      <span className="flex w-4 shrink-0 justify-center pt-4 text-sm tabular-nums" style={{ color: current ? GREEN : SUBDUED }}>
        {current && playing ? (
          <Equaliser playing />
        ) : (
          <>
            <span className="group-hover:hidden">{index + 1}</span>
            <button type="button" onClick={() => onPlay(id)} aria-label={`Play ${title}`} className="hidden text-white group-hover:block">
              <IconPlay className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </span>

      <span className="h-12 w-12 shrink-0">
        <Art src={project.image} seed={project.name || String(index)} label={title[0]?.toUpperCase()} rounded="rounded-[2px]" text="text-xl" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="min-w-0 break-words text-base font-medium" style={{ color: current ? GREEN : "#fff" }}>
            {title}
          </p>
          <span className="shrink-0 text-[13px]" style={{ color: SUBDUED }}>
            {meta}
          </span>
        </div>
        {project.description && (
          <p className="mt-1 whitespace-pre-line break-words text-[13px] leading-relaxed" style={{ color: SUBDUED }}>
            {project.description}
          </p>
        )}
        {project.highlights?.length > 0 && (
          <ul className="mt-2 space-y-1">
            {project.highlights.map((point, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-relaxed" style={{ color: SUBDUED }}>
                <span style={{ color: GREEN }}>&#9642;</span>
                <span className="whitespace-pre-line break-words">{point}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {project.tags?.map((tag) => (
            <span key={tag} className="rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ backgroundColor: CHIP, color: dotColor(tag) }}>
              {tag}
            </span>
          ))}
          {project.link && (
            <a href={`https://${stripProtocol(project.link)}`} className="text-[13px] font-bold hover:underline" style={{ color: GREEN }}>
              Source
            </a>
          )}
          {project.demo && (
            <a href={`https://${stripProtocol(project.demo)}`} className="text-[13px] font-bold hover:underline" style={{ color: GREEN }}>
              Live
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, action, children }) {
  return (
    <section id={`section-${id}`} className="scroll-mt-24 px-4 pb-8 sm:px-6">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-[-0.01em] text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/* ---------------------------------------------------------------- sidebar -- */

// Your Library, holding the portfolio's own sections. Spotify fills this rail
// with playlists and their track counts; every count here is the real length of
// the list it points at, and clicking a row scrolls the middle pane to it.
function Sidebar({ name, entries }) {
  return (
    <nav aria-label="Sections" className="hidden w-[280px] shrink-0 flex-col gap-2 lg:flex">
      <div className="rounded-lg px-3 py-4" style={{ backgroundColor: PANE }}>
        <a href="#top" className="flex h-10 items-center gap-5 px-3 text-[15px] font-bold text-white">
          <IconHome className="h-6 w-6" />
          Home
        </a>
        <span className="flex h-10 items-center gap-5 px-3 text-[15px] font-bold" style={{ color: SUBDUED }}>
          <IconSearch className="h-6 w-6" />
          Search
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-lg pt-2" style={{ backgroundColor: PANE }}>
        <div className="flex items-center justify-between px-5 py-2">
          <span className="flex items-center gap-3 text-[15px] font-bold" style={{ color: SUBDUED }}>
            <IconLibrary className="h-6 w-6" />
            Your Library
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ color: SUBDUED }} aria-hidden>
            <IconPlus className="h-4 w-4" />
          </span>
        </div>

        <div className="flex gap-2 px-4 pb-2 pt-1" aria-hidden>
          {["Playlists", "Artists"].map((chip) => (
            <span key={chip} className="rounded-full px-3 py-1.5 text-[13px] text-white" style={{ backgroundColor: CHIP }}>
              {chip}
            </span>
          ))}
        </div>

        <div className="spot-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          {entries.map((entry) => (
            <a key={entry.id} href={`#section-${entry.id}`} className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-white/10">
              <span className="h-12 w-12 shrink-0">
                <Art seed={entry.title} label={entry.title[0]} rounded="rounded" text="text-lg" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-medium text-white">{entry.title}</span>
                <span className="block truncate text-[13px]" style={{ color: SUBDUED }}>
                  Playlist &middot; {entry.count} {entry.count === 1 ? "item" : "items"}
                </span>
              </span>
            </a>
          ))}
          {entries.length === 0 && (
            <p className="px-3 py-6 text-[13px]" style={{ color: SUBDUED }}>
              Nothing in the library yet.
            </p>
          )}
        </div>

        <p className="px-5 pb-4 pt-2 text-[11px]" style={{ color: "#6a6a6a" }}>
          {name || "Your Name"}
        </p>
      </div>
    </nav>
  );
}

/* ----------------------------------------------------------------- player -- */

// `canStep` is not the same as "can play": the song is always cued, so play
// always works, but with nothing else in the queue there is nowhere to skip to.
function PlayerBar({ track, playing, canStep, onToggle, onPrev, onNext, onEnded, seconds, cycle }) {
  const [liked, setLiked] = useState(false);
  const idle = "text-[#b3b3b3] transition-colors hover:text-white";

  return (
    <div className="grid h-[72px] shrink-0 grid-cols-[1fr_auto] items-center gap-4 px-2 sm:grid-cols-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="h-14 w-14 shrink-0">
          <Art src={track?.image} seed={track?.seed || "you"} label={track?.initial || "?"} rounded="rounded" text="text-lg" />
        </span>
        <span className="min-w-0">
          {/* Clickable only when there is somewhere to go: a title styled as a
              link that does nothing is worse than a title that is plainly not
              one. */}
          {track?.href ? (
            <a
              href={track.href}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-sm font-medium text-white underline-offset-2 hover:underline"
            >
              {track.title}
            </a>
          ) : (
            <span className="block truncate text-sm font-medium text-white">{track?.title}</span>
          )}
          <span className="block truncate text-[11px]" style={{ color: SUBDUED }}>
            {track?.subtitle || ""}
          </span>
        </span>
        <button
          type="button"
          onClick={() => setLiked((on) => !on)}
          aria-label={liked ? "Remove from Liked Songs" : "Save to Liked Songs"}
          aria-pressed={liked}
          className={`ml-2 hidden shrink-0 sm:block ${liked ? "text-[#1ed760]" : idle}`}
        >
          <IconHeart className="h-4 w-4" filled={liked} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-4 sm:gap-5">
          <span className={`hidden sm:block ${idle}`} aria-hidden>
            <IconShuffle className="h-4 w-4" />
          </span>
          <button type="button" onClick={onPrev} disabled={!canStep} aria-label="Previous" className={`${idle} disabled:opacity-40`}>
            <IconPrev className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggle}
            aria-label={playing ? "Pause" : "Play"}
            className="spot-play flex h-8 w-8 items-center justify-center rounded-full bg-white text-black"
          >
            {playing ? <IconPause className="h-3.5 w-3.5" /> : <IconPlay className="h-3.5 w-3.5 translate-x-[6%]" />}
          </button>
          <button type="button" onClick={onNext} disabled={!canStep} aria-label="Next" className={`${idle} disabled:opacity-40`}>
            <IconNext className="h-4 w-4" />
          </button>
          <span className={`hidden sm:block ${idle}`} aria-hidden>
            <IconRepeat className="h-4 w-4" />
          </span>
        </div>
        {/* Chrome, deliberately without times beside it: a duration in minutes
            would be a number nobody typed. It runs while something is playing
            and hands the queue on when it reaches the end. */}
        <div className="hidden h-1 w-full max-w-[560px] overflow-hidden rounded-full bg-[#4d4d4d] sm:block" aria-hidden>
          <span
            key={cycle}
            onAnimationEnd={onEnded}
            className="spot-progress block h-full origin-left rounded-full bg-white"
            style={{ animationDuration: `${seconds}s` }}
          />
        </div>
      </div>

      <div className="hidden items-center justify-end gap-3 sm:flex" aria-hidden>
        <span className={idle}>
          <IconQueue className="h-4 w-4" />
        </span>
        <span className={idle}>
          <IconDevices className="h-4 w-4" />
        </span>
        <span className={idle}>
          <IconVolume className="h-4 w-4" />
        </span>
        <span className="h-1 w-24 overflow-hidden rounded-full bg-[#4d4d4d]">
          <span className="block h-full w-[70%] rounded-full bg-white" />
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- page -- */

export default function SpotifyTemplate({ data }) {
  const { name, role, bio, email, links, photoUrl, skills, codingProfiles, experience, education, achievements, projects, sectionOrder, nowPlaying } =
    data;
  const yearsXp = computeYearsOfExperience(experience);
  const bannerHue = hueFor(name || "artist");

  const [nowId, setNowId] = useState(null);
  const [playing, setPlaying] = useState(false);
  // Bumped on every track change so the progress bar and the lyric lines
  // remount and restart their animations together.
  const [cycle, setCycle] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef(null);
  const lyricsRef = useRef(null);

  // "Follow" reads as a social action rather than an email compose, so LinkedIn
  // is the closer real-world equivalent, with mailto for anyone who only gave
  // an address.
  const followHref = links?.linkedin ? `https://${stripProtocol(links.linkedin)}` : email ? `mailto:${email}` : null;

  const monthlyListeners =
    1000 + (projects?.length || 0) * 4200 + (skills?.length || 0) * 950 + yearsXp * 3100 + (achievements?.length || 0) * 1800;

  const songTitle = (nowPlaying?.track || "").trim();
  const songArtist = (nowPlaying?.artist || "").trim();
  const songUrl = (nowPlaying?.url || "").trim();

  // The queue: the song, then every role, then every release. Roles carry
  // lyrics because a compact track row has nowhere to put their bullets;
  // releases carry none, since a release row already prints everything it has
  // and the same words twice on one screen would read as a bug.
  //
  // The song is the one thing on this page that is not the customer's own work,
  // and it is deliberately in the queue and in no section: the player has to
  // have something cued on arrival, and a portfolio deserves a soundtrack. My
  // Way is the default for reasons that need no explaining. Anyone who would
  // rather pick their own says so in the form, and naming a song without naming
  // an artist leaves that line empty rather than crediting Sinatra with it.
  //
  // The title links out to the recording. The default carries its own link;
  // a customer's own song only becomes clickable if they gave one, and the
  // address is forced through https the same way every other link here is, so
  // a scheme typed into the box cannot become one the browser will execute.
  const tracks = useMemo(
    () => [
      {
        id: "anthem",
        title: songTitle || "My Way",
        subtitle: songTitle ? songArtist : "Frank Sinatra · 1969",
        href: songTitle ? (songUrl ? `https://${stripProtocol(songUrl)}` : null) : DEFAULT_SONG_URL,
        meta: "",
        lines: [],
        seed: songTitle || "my way",
        initial: songTitle ? songTitle[0].toUpperCase() : "♪",
        // Long enough that pressing play does not immediately skip out of it.
        seconds: 32,
      },
      ...(experience || []).map((job, i) => ({
        id: `job-${i}`,
        title: job.role || "Role",
        subtitle: job.company || "",
        meta: [job.start, job.end].filter(Boolean).join(" – "),
        lines: job.bullets || [],
        seed: job.company || String(i),
        initial: (job.role || "?")[0]?.toUpperCase(),
      })),
      ...(projects || []).map((project, i) => ({
        id: `project-${i}`,
        title: project.name || "Untitled",
        subtitle: project.status || "Project",
        meta: project.version ? `v${project.version}` : "",
        lines: [],
        seed: project.name || String(i),
        image: project.image,
        initial: (project.name || "?")[0]?.toUpperCase(),
      })),
    ],
    [experience, projects, songTitle, songArtist, songUrl],
  );

  // With nothing chosen yet the player holds the song, the way the application
  // always has something cued rather than an empty bar. Nothing in the lists is
  // marked as playing until the visitor actually picks something, which is why
  // the rows compare against nowId and this does not.
  const nowIndex = Math.max(0, tracks.findIndex((track) => track.id === nowId));
  const current = tracks[nowIndex];
  const seconds = current?.seconds ?? trackSeconds(current?.lines?.length || 0);

  const select = useCallback((id) => {
    setNowId(id);
    setCycle((n) => n + 1);
  }, []);

  const play = useCallback(
    (id) => {
      // Hitting play on the row that is already playing pauses it, the way
      // every play button in the application behaves.
      setPlaying((was) => (id === nowId ? !was : true));
      if (id !== nowId) select(id);
    },
    [nowId, select],
  );

  const step = useCallback(
    (delta) => {
      const next = (nowIndex + delta + tracks.length) % tracks.length;
      select(tracks[next].id);
      setPlaying(true);
    },
    [nowIndex, tracks, select],
  );

  const toggle = useCallback(() => {
    // Nothing picked yet means the song is what is cued, so starting from cold
    // has to commit it to state before the progress bar has anything to run on.
    if (!nowId) {
      select(tracks[0].id);
      setPlaying(true);
      return;
    }
    setPlaying((was) => !was);
  }, [tracks, nowId, select]);

  // The top bar goes from transparent to solid once the artist name has
  // scrolled behind it. An observer rather than a scroll handler, so nothing
  // reads layout on the scroll thread.
  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), { threshold: 0 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Picking a track from halfway down the page used to change the lyrics
  // somewhere the visitor could not see. `nearest` is the whole trick: it moves
  // the pane only when the card is actually off screen, so choosing a track
  // that is already beside its lyrics does not yank the page around.
  useEffect(() => {
    if (!nowId) return;
    const element = lyricsRef.current;
    if (!element) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "nearest" });
  }, [nowId]);

  // Lyrics: the bullets of whatever is playing, brightening one after another
  // as the track runs. It lives at the foot of the track list rather than up by
  // the header, because a card that changes has to sit where the thing that
  // changed it was clicked.
  const lyricsCard = current?.lines?.length > 0 && (
    <div ref={lyricsRef} className="mt-4 scroll-mt-24 rounded-lg p-5 sm:p-6" style={{ backgroundColor: `hsl(${hueFor(current.seed)}, 34%, 22%)` }}>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">Lyrics</p>
      <p className="mt-1 truncate text-lg font-bold text-white">{current.title}</p>
      <div key={cycle} className="mt-4 space-y-3">
        {current.lines.map((line, i) => (
          <p
            key={i}
            className="spot-lyric whitespace-pre-line text-lg font-bold leading-snug sm:text-2xl"
            style={{ animationDelay: `${((i + 0.35) / current.lines.length) * seconds}s` }}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );

  const sections = {
    experience: experience?.length > 0 && (
      <Section
        key="experience"
        id="experience"
        title="Popular"
        action={
          yearsXp > 0 ? (
            <span className="text-[13px] font-bold uppercase tracking-[0.08em]" style={{ color: SUBDUED }}>
              {yearsXp} years
            </span>
          ) : null
        }
      >
        <div>
          {tracks
            .filter((track) => track.id.startsWith("job-"))
            .map((track, i) => (
              <TrackRow
                key={track.id}
                index={i}
                track={track}
                current={track.id === nowId}
                playing={playing}
                onPlay={play}
                onSelect={select}
              />
            ))}
        </div>
        {lyricsCard}
      </Section>
    ),

    projects: projects?.length > 0 && (
      <Section
        key="projects"
        id="projects"
        title="Discography"
        action={
          <span className="text-[13px] font-bold uppercase tracking-[0.08em]" style={{ color: SUBDUED }}>
            {projects.length} {projects.length === 1 ? "release" : "releases"}
          </span>
        }
      >
        <div>
          {projects.map((project, i) => (
            <ProjectRow
              key={i}
              project={project}
              index={i}
              id={`project-${i}`}
              current={`project-${i}` === nowId}
              playing={playing}
              onPlay={play}
            />
          ))}
        </div>
      </Section>
    ),

    education: education?.length > 0 && (
      <Section key="education" id="education" title="Education">
        <div>
          {education.map((edu, i) => {
            const dates = [edu.start, edu.end].filter(Boolean).join(" – ");
            return (
              <div
                key={i}
                className="grid min-h-14 grid-cols-[40px_1fr] items-center gap-4 rounded px-4 py-2 transition-colors hover:bg-white/10 sm:grid-cols-[40px_1fr_auto]"
              >
                <span className="h-10 w-10 shrink-0">
                  <Art seed={edu.school || String(i)} label={(edu.degree || "?")[0]?.toUpperCase()} rounded="rounded-[2px]" text="text-base" />
                </span>
                <span className="min-w-0">
                  <span className="block break-words text-base font-medium text-white">{edu.degree || "Degree"}</span>
                  <span className="block break-words text-[13px]" style={{ color: SUBDUED }}>
                    {edu.school}
                    {dates && (
                      <span className="sm:hidden">
                        {edu.school ? " · " : ""}
                        {dates}
                      </span>
                    )}
                  </span>
                </span>
                <span className="hidden shrink-0 pl-4 text-[13px] tabular-nums sm:block" style={{ color: SUBDUED }}>
                  {dates}
                </span>
              </div>
            );
          })}
        </div>
      </Section>
    ),

    achievements: achievements?.length > 0 && (
      <Section key="achievements" id="achievements" title="Top Charts">
        <div>
          {achievements.map((item, i) => (
            <div key={i} className="flex items-start gap-4 rounded px-4 py-3 transition-colors hover:bg-white/10">
              <span className="w-4 shrink-0 pt-0.5 text-right text-sm font-bold tabular-nums" style={{ color: i === 0 ? GREEN : SUBDUED }}>
                {i + 1}
              </span>
              <p className="min-w-0 whitespace-pre-line break-words text-[15px] leading-relaxed text-white">{item}</p>
            </div>
          ))}
        </div>
      </Section>
    ),

    codingProfiles: codingProfiles?.length > 0 && (
      <Section key="codingProfiles" id="codingProfiles" title="Appears On">
        <div>
          {codingProfiles.map((profile, i) => (
            <a
              key={i}
              href={`https://${stripProtocol(profile.url)}`}
              className="grid min-h-14 grid-cols-[40px_1fr] items-center gap-4 rounded px-4 py-2 transition-colors hover:bg-white/10 sm:grid-cols-[40px_1fr_auto]"
            >
              <span className="h-10 w-10 shrink-0">
                <Art seed={profile.platform} label={(profile.platform || "?")[0]?.toUpperCase()} rounded="rounded-full" text="text-base" />
              </span>
              <span className="min-w-0">
                <span className="block break-words text-base font-medium text-white">{profile.platform}</span>
                {/* The address is the one thing here that may legitimately be
                    clipped: a long URL wrapped over three lines is noise, and
                    the link itself is the row. */}
                <span className="block truncate text-[13px]" style={{ color: SUBDUED }}>
                  {stripProtocol(profile.url)}
                </span>
              </span>
              <span className="hidden shrink-0 pl-4 text-[13px] sm:block" style={{ color: SUBDUED }}>
                Profile
              </span>
            </a>
          ))}
        </div>
      </Section>
    ),
  };

  const order = (sectionOrder || []).filter((id) => sections[id]);

  const libraryEntries = [
    experience?.length > 0 && { id: "experience", title: "Popular", count: experience.length },
    projects?.length > 0 && { id: "projects", title: "Discography", count: projects.length },
    education?.length > 0 && { id: "education", title: "Education", count: education.length },
    achievements?.length > 0 && { id: "achievements", title: "Top Charts", count: achievements.length },
    codingProfiles?.length > 0 && { id: "codingProfiles", title: "Appears On", count: codingProfiles.length },
    skills?.length > 0 && { id: "about", title: "About", count: skills.length },
  ].filter(Boolean);

  const socials = [
    links?.github && { href: `https://${stripProtocol(links.github)}`, icon: <IconGithub className="h-4 w-4" />, label: "GitHub" },
    links?.linkedin && { href: `https://${stripProtocol(links.linkedin)}`, icon: <IconLinkedin className="h-4 w-4" />, label: "LinkedIn" },
    links?.website && { href: `https://${stripProtocol(links.website)}`, icon: <IconLink className="h-4 w-4" />, label: "Website" },
  ].filter(Boolean);

  return (
    <div className={`${figtree.className} flex h-dvh flex-col gap-2 bg-black p-2 ${playing ? "spot-playing" : ""}`}>
      <CursorGlow colorRgb="30, 215, 96" size={480} />

      <div className="flex min-h-0 flex-1 gap-2">
        <Sidebar name={name} entries={libraryEntries} />

        {/* `isolate` is load-bearing, not decoration. The tint below is an
            absolutely positioned child, and a positioned element with no
            z-index paints above every in-flow sibling that follows it, which
            put a 420px sheet of gradient over the top of whatever section
            happened to sit there. Isolating the pane gives the tint somewhere
            to go behind the content and in front of the pane's own colour. */}
        <main id="top" className="spot-scroll relative isolate min-w-0 flex-1 overflow-y-auto rounded-lg" style={{ backgroundColor: PANE }}>
          {/* The header colour is seeded off the name, which is how the
              application tints this area from the artwork it is showing. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]"
            style={{ background: `linear-gradient(180deg, hsl(${bannerHue}, 42%, 30%) 0%, hsl(${bannerHue}, 28%, 16%) 55%, ${PANE} 100%)` }}
          />

          <div
            className="sticky top-0 z-20 flex h-12 items-center justify-between gap-4 px-4 transition-colors duration-300 sm:h-16 sm:px-6"
            style={{ backgroundColor: scrolled ? `hsl(${bannerHue}, 30%, 18%)` : "transparent" }}
          >
            <div className="flex min-w-0 items-center gap-4">
              <span className="hidden items-center gap-2 sm:flex" aria-hidden>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white">
                  <IconChevron className="h-4 w-4" dir="left" />
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white/40">
                  <IconChevron className="h-4 w-4" dir="right" />
                </span>
              </span>
              {/* The name and a play button slide in only once the real ones
                  have scrolled away, which is the detail that makes this bar
                  feel like the application's rather than a stuck header. */}
              <div className={`flex min-w-0 items-center gap-4 transition-all duration-300 ${scrolled ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}>
                <PlayButton playing={playing} size={32} onClick={toggle} label={playing ? "Pause" : "Play"} />
                <span className="truncate text-lg font-bold text-white">{name || "Your Name"}</span>
              </div>
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-black" style={{ backgroundColor: GREEN }}>
              {initials(name)}
            </span>
          </div>

          {/* Bottom-aligned, so whatever height is left above the name is
              gradient. On a phone that headroom is the whole first screen, so
              the floor comes down to something a thumb can scroll past. */}
          {/* The tint carries this area on its own. A photograph stretched
              across the top fought the name for contrast at every width and
              had to be scrimmed until it was barely visible anyway; it earns
              its keep in the About card, at a size worth looking at. */}
          <header className="relative flex min-h-[150px] flex-col justify-end px-4 pb-5 sm:min-h-[340px] sm:px-6 sm:pb-6">
            <div className="flex items-center gap-2">
              <IconVerified className="h-6 w-6" />
              <span className="text-sm font-medium text-white">Verified Artist</span>
            </div>
            <h1 className="mt-2 break-words text-[clamp(2rem,8vw,6rem)] font-black leading-[0.95] tracking-[-0.03em] text-white sm:mt-3">
              {name || "Your Name"}
            </h1>
            <p className="mt-3 text-sm text-white/90 sm:mt-4">
              {monthlyListeners.toLocaleString()} monthly listeners
              {role ? ` · ${role}` : ""}
            </p>
          </header>

          <div ref={sentinelRef} aria-hidden className="h-px" />

          <div className="relative flex items-center gap-5 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6">
            <PlayButton playing={playing} size={56} onClick={toggle} label={playing ? "Pause" : "Play"} />
            <span className="text-[#b3b3b3] transition-colors hover:text-white" aria-hidden>
              <IconShuffle className="h-8 w-8" />
            </span>
            {followHref && (
              <a
                href={followHref}
                className="rounded-full border border-[#7c7c7c] px-4 py-1.5 text-[13px] font-bold text-white transition-colors hover:border-white"
              >
                Follow
              </a>
            )}
            <span className="text-[#b3b3b3] transition-colors hover:text-white" aria-hidden>
              <IconMore className="h-6 w-6" />
            </span>
          </div>

          {order.map((id) => sections[id])}

          {(bio || skills?.length > 0 || socials.length > 0) && (
            <section id="section-about" className="scroll-mt-24 px-4 pb-8 sm:px-6">
              <h2 className="mb-2 text-2xl font-bold tracking-[-0.01em] text-white">About</h2>
              <div className="overflow-hidden rounded-lg" style={{ backgroundColor: CARD }}>
                <div className="relative h-48 sm:h-64">
                  <Art src={photoUrl} seed={name || "artist"} label={initials(name)} rounded="rounded-none" text="text-6xl" />
                  <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 30%, rgba(24,24,24,0.95))" }} />
                  <p className="absolute bottom-4 left-5 text-2xl font-bold text-white">
                    {monthlyListeners.toLocaleString()}
                    <span className="ml-2 text-sm font-normal" style={{ color: SUBDUED }}>
                      monthly listeners
                    </span>
                  </p>
                </div>
                <div className="p-5">
                  {bio && (
                    <p className="whitespace-pre-line text-[15px] leading-relaxed" style={{ color: SUBDUED }}>
                      {bio}
                    </p>
                  )}
                  {skills?.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span key={skill} className="rounded-full px-3 py-1.5 text-[13px] font-medium text-white" style={{ backgroundColor: CARD_HOVER }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  {socials.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {socials.map((social) => (
                        <a
                          key={social.label}
                          href={social.href}
                          className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-white/20"
                          style={{ backgroundColor: CARD_HOVER }}
                        >
                          {social.icon}
                          {social.label}
                        </a>
                      ))}
                      {email && (
                        <a
                          href={`mailto:${email}`}
                          className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold text-black transition-transform hover:scale-[1.03]"
                          style={{ backgroundColor: GREEN }}
                        >
                          Get in touch
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          <footer className="px-4 pb-10 text-[11px] sm:px-6" style={{ color: "#6a6a6a" }}>
            &copy; {new Date().getFullYear()} {name || "Your Name"} &middot; Made with Dev Portfolio Builder
          </footer>
        </main>
      </div>

      <PlayerBar
        track={current}
        playing={playing}
        canStep={tracks.length > 1}
        onToggle={toggle}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        onEnded={() => step(1)}
        seconds={seconds}
        cycle={cycle}
      />
    </div>
  );
}
