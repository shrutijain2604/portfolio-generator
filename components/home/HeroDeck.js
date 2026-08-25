"use client";

// The hero's signature object: a stack of real template components in
// perspective that deals itself through all twelve.
//
// Live renders of the same components the editor and the subapps use, not
// screenshots, because a picture of a template drifts out of sync with the
// template, and this sits where that would be most visible.
//
// Only a window of four is mounted at a time: twelve full renders above the
// fold is a lot of DOM for a decorative object. The three cards behind the
// front keep their identity and shift a slot, so React reuses them.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { templateComponents } from "@/components/templates";
import { defaultPortfolioData, getTemplate, templates } from "@/lib/portfolioData";
import { ArrowRight } from "./marks";

// Every template that has a component to render, in the same order the gallery
// below lists them, so the deck and the wall tell the same story.
const DECK_IDS = templates.map((template) => template.id).filter((id) => templateComponents[id]);

// Cards drawn at once, including the one at the front. Four is where the fan
// stops reading as depth and starts reading as clutter.
const VISIBLE = 4;

// How far the pointer can push the stage, in degrees. Small on purpose: the
// depth cue comes from the cards' own z-offsets, and a big parallax swing on
// a stack this size reads as wobble rather than dimension.
const TILT_X = 6;
const TILT_Y = 8;

// How long each template holds the front of the deck.
const ROTATE_MS = 3000;

// How long the card that just left the front stays mounted. It has to outlast
// the 750ms transform transition in globals.css, or the outgoing card would
// blink out of existence instead of being dealt away.
const EXIT_MS = 800;

export default function HeroDeck() {
  const [front, setFront] = useState(0);
  const [exiting, setExiting] = useState(null);
  const [paused, setPaused] = useState(false);
  const tiltRef = useRef(null);
  const rectRef = useRef(null);
  const frameRef = useRef(0);
  const prevFrontRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  // The deck cycles on its own so all twelve templates get seen without
  // requiring a click. It stops while someone is hovering, focused inside it
  // or reading with reduced motion turned on, since an animation that moves
  // the thing you are pointing at is worse than no animation.
  useEffect(() => {
    if (paused) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const id = setInterval(() => {
      setFront((current) => (current + 1) % DECK_IDS.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [paused]);

  // Whichever card just lost the front keeps rendering for one transition, at
  // a slot in front of the stack, so it reads as being dealt off the top.
  useEffect(() => {
    const previous = prevFrontRef.current;
    prevFrontRef.current = front;
    if (previous === front) return undefined;

    setExiting(DECK_IDS[previous]);
    const timer = setTimeout(() => setExiting(null), EXIT_MS);
    return () => clearTimeout(timer);
  }, [front]);

  // The one layout read happens on pointer enter and is then reused for the
  // whole hover, so no frame in the move handler reads geometry back. Cards
  // sit above the stage, so offsetX/offsetY would be measured against
  // whichever child is under the cursor, which is why this tracks clientX
  // against a cached rect instead.
  const handleEnter = useCallback((event) => {
    rectRef.current = event.currentTarget.getBoundingClientRect();
    setPaused(true);
  }, []);

  const handleMove = useCallback((event) => {
    const rect = rectRef.current;
    if (!rect || !rect.width || !rect.height) return;
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const el = tiltRef.current;
      if (!el) return;
      el.style.setProperty("--tilt-y", `${(nx * TILT_Y).toFixed(2)}deg`);
      el.style.setProperty("--tilt-x", `${(-ny * TILT_X).toFixed(2)}deg`);
    });
  }, []);

  const handleLeave = useCallback(() => {
    setPaused(false);
    rectRef.current = null;
    cancelAnimationFrame(frameRef.current);
    const el = tiltRef.current;
    if (!el) return;
    el.style.setProperty("--tilt-y", "0deg");
    el.style.setProperty("--tilt-x", "0deg");
  }, []);

  // Slot 0 is the front, and the card on its way out sits at -1, one step
  // nearer the viewer than the front. Keying on the template id rather than
  // the slot is what lets a card keep its DOM as it moves back through the
  // stack instead of being torn down and rebuilt every turn.
  const cards = [];
  for (let slot = 0; slot < VISIBLE; slot += 1) {
    cards.push({ id: DECK_IDS[(front + slot) % DECK_IDS.length], slot });
  }
  if (exiting && !cards.some((card) => card.id === exiting)) {
    cards.push({ id: exiting, slot: -1 });
  }

  return (
    <div
      className="home-frame relative"
      onPointerEnter={handleEnter}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="home-deck-float">
        <div
          ref={tiltRef}
          className="home-deck-tilt relative"
          style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
        >
          {/* Contact shadow. Anchored under the front card so the stack reads
              as sitting above the page rather than pasted onto it. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 bottom-0 h-10 translate-y-7 rounded-[50%] blur-2xl"
            style={{ background: "rgba(23, 20, 15, 0.4)" }}
          />

          <div className="home-frame-viewport relative">
            {cards.map(({ id, slot }) => {
              const isFront = slot === 0;
              const isLeaving = slot < 0;
              const template = getTemplate(id);
              const Template = templateComponents[id];
              if (!template || !Template) return null;

              return (
                <div
                  key={id}
                  data-exit={isLeaving ? "true" : undefined}
                  aria-hidden={isLeaving ? "true" : undefined}
                  className={`home-deck-card absolute inset-0 rounded-[var(--home-radius)] border ${
                    isLeaving ? "pointer-events-none" : ""
                  }`}
                  style={{
                    "--slot": slot,
                    borderColor: isFront ? "rgba(23,20,15,0.9)" : "rgba(23,20,15,0.55)",
                    boxShadow: isFront
                      ? "0 3px 8px rgba(23,20,15,0.16), 0 44px 70px -26px rgba(23,20,15,0.45)"
                      : "0 22px 44px -22px rgba(23,20,15,0.34)",
                  }}
                >
                  <div className="relative h-full w-full overflow-hidden rounded-[var(--home-radius)] bg-[#17140f]">
                    {/* Window chrome. The address is the sample data's own
                        website field, so even the furniture here is showing
                        real data rather than invented branding. The colours
                        are set inline because .home-label is unlayered and
                        beats a Tailwind text utility in the cascade. */}
                    <div className="flex items-center gap-3 border-b border-white/12 px-3.5 py-2.5">
                      {slot <= 0 ? (
                        <>
                          <span className="home-nums truncate text-[10px] text-white/45">
                            {defaultPortfolioData.links.website}
                          </span>
                          <span
                            className="home-label ml-auto"
                            style={{ color: "rgba(255,255,255,0.45)" }}
                          >
                            {template.name}
                          </span>
                        </>
                      ) : (
                        <span className="h-[13px]" aria-hidden="true" />
                      )}
                    </div>

                    <div className="relative flex-1 overflow-hidden" style={{ height: "calc(100% - 39px)" }}>
                      {/* pointer-events-none for the same reason the gallery
                          card needs it: the template renders its own real
                          anchors and interactive bits, and they must not
                          compete with this card's control. */}
                      <div className="home-frame-render pointer-events-none absolute left-0 top-0">
                        <Template data={defaultPortfolioData} />
                      </div>

                      <div
                        aria-hidden="true"
                        className="home-deck-haze pointer-events-none absolute inset-0 bg-[#17140f]"
                        style={{ "--slot": slot }}
                      />
                    </div>
                  </div>

                  {isFront && (
                    <Link
                      href={`/editor/${id}`}
                      className="home-deck-open-link absolute inset-0 flex items-end justify-start rounded-[var(--home-radius)] p-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--home-strong)]"
                    >
                      <span className="home-label home-deck-open flex items-center gap-2 rounded-full px-4 py-2.5">
                        Open {template.name}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </Link>
                  )}

                  {slot > 0 && (
                    <button
                      type="button"
                      onClick={() => setFront(DECK_IDS.indexOf(id))}
                      className="absolute inset-0 cursor-pointer rounded-[var(--home-radius)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--home-strong)]"
                    >
                      <span className="sr-only">Bring the {template.name} template to the front</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
