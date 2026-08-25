"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { IconGithub, IconLink, IconLinkedin, IconMail } from "./shared";

// The status bar along the bottom of the level and the pause screen it opens:
// the only interactive chrome in the template, and the only client JavaScript.
//
// Current stage is tracked with an IntersectionObserver rather than a scroll
// handler, so no layout is read on the scroll path, and the fill along the top
// edge is a CSS scroll-driven animation. The pause screen needs focus
// management, a key handler and scroll locking, which is state by nature.
//
// The stage chips are the page's navigation on a wide screen; the pause screen
// is the same navigation on a narrow one, where six chips could not be given
// honest touch targets.

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Links arrive as a kind rather than as an icon component: a server
// component cannot hand a function across the boundary into a client one,
// and resolving the glyph here keeps the icon set shared with the rest of
// the template instead of forking a second copy of it.
const LINK_ICONS = { github: IconGithub, linkedin: IconLinkedin, website: IconLink };

function pad(value) {
  return String(value).padStart(2, "0");
}

export default function LevelHud({ name, role, initials, stages, email, links }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const dialogRef = useRef(null);
  const menuButtonRef = useRef(null);

  // Watch the stage sections themselves rather than tracking a scroll
  // offset: no layout is read on the scroll path. The root margin narrows
  // the detection band to a strip near the top of the viewport, so the
  // current stage is the one the visitor has actually reached rather than
  // whichever one still has a corner on screen, and a section visible only
  // behind the terrain never counts.
  useEffect(() => {
    const targets = stages
      .map((stage) => document.getElementById(stage.anchor))
      .filter(Boolean);
    if (targets.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        setActiveIndex(Math.max(stages.findIndex((stage) => stage.anchor === topmost.target.id), 0));
      },
      { rootMargin: "-14% 0px -72% 0px", threshold: 0 }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [stages]);

  const close = useCallback(() => {
    setPaused(false);
    menuButtonRef.current?.focus();
  }, []);

  // Escape closes, Tab cycles inside the pause screen. Both are the standard
  // contract for a modal, and a game that opens a pause menu you cannot
  // leave with Escape is the wrong kind of authentic.
  useEffect(() => {
    if (!paused) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll(FOCUSABLE);
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKey);
    dialogRef.current?.querySelector(FOCUSABLE)?.focus();
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [paused, close]);

  const active = stages[activeIndex];

  return (
    <>
      <div className="lu-hud-slot">
        <div className="lu-hud">
          {/* Literal reading progress, drawn by the scroll timeline. It is
              the one meter on this page and it measures the page, not the
              person. */}
          <div className="lu-hud-progress" aria-hidden="true" />

          <div className="lu-hud-inner">
            <div className="lu-hud-who">
              <span className="lu-plate" aria-hidden="true">
                {initials}
              </span>
              <span className="lu-hud-names">
                <span className="lu-hud-name">{name}</span>
                {role && <span className="lu-hud-role">{role}</span>}
              </span>
            </div>

            {stages.length > 0 && (
              <nav className="lu-hud-strip" aria-label="Level stages">
                <span className="lu-hud-count lu-pixel">
                  {pad(activeIndex + 1)}/{pad(stages.length)}
                </span>
                <span className="lu-hud-here">{active?.label}</span>
                <ul className="lu-chips">
                  {stages.map((stage, index) => (
                    <li key={stage.anchor}>
                      <a
                        href={`#${stage.anchor}`}
                        className={`lu-chip lu-pixel lu-focus${index === activeIndex ? " lu-chip-on" : ""}`}
                        aria-current={index === activeIndex ? "true" : undefined}
                      >
                        <span className="lu-chip-num">{pad(index + 1)}</span>
                        <span className="lu-sr">{stage.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <button
              ref={menuButtonRef}
              type="button"
              className="lu-hud-menu lu-pixel lu-focus"
              onClick={() => setPaused(true)}
              aria-expanded={paused}
            >
              Menu
            </button>
          </div>
        </div>
      </div>

      {paused && (
        <div className="lu-pause">
          {/* The scrim is a convenience, not the close affordance: Resume
              and Escape both close this and both are keyboard reachable, so
              the scrim carries no role and no place in the tab order. */}
          <div className="lu-pause-scrim" onClick={close} />
          <div
            ref={dialogRef}
            className="lu-pause-window"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lu-pause-title"
          >
            <p id="lu-pause-title" className="lu-pause-title lu-pixel">
              Paused
            </p>

            {stages.length > 0 && (
              <ul className="lu-pause-list">
                {stages.map((stage, index) => (
                  <li key={stage.anchor}>
                    <a href={`#${stage.anchor}`} className="lu-pause-item lu-focus" onClick={close}>
                      <span className="lu-pause-num lu-pixel">{pad(index + 1)}</span>
                      <span>{stage.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {(email || links.length > 0) && (
              <div className="lu-pause-contact">
                {email && (
                  <a href={`mailto:${email}`} className="lu-pause-item lu-focus" onClick={close}>
                    <span className="lu-pause-num" aria-hidden="true">
                      <IconMail className="lu-pause-icon" />
                    </span>
                    <span>{email}</span>
                  </a>
                )}
                {links.map((link) => {
                  const Icon = LINK_ICONS[link.kind] || IconLink;
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      className="lu-pause-item lu-focus"
                      onClick={close}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <span className="lu-pause-num" aria-hidden="true">
                        <Icon className="lu-pause-icon" />
                      </span>
                      <span>{link.label}</span>
                    </a>
                  );
                })}
              </div>
            )}

            <button type="button" className="lu-btn lu-btn-primary lu-pixel lu-focus" onClick={close}>
              Resume
            </button>
            <p className="lu-pause-hint">Escape also resumes.</p>
          </div>
        </div>
      )}
    </>
  );
}
