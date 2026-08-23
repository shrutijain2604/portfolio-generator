"use client";

import { useEffect, useRef, useState } from "react";

// The room's light, and the one control over it. Two things happen here:
// the page opens at the visitor's own hour, and they can move it.
//
// Both work by writing `data-light` on the enclosing `.warm-room` element
// directly, rather than lifting the value into React state the template
// reads. The room is a large server-rendered tree, and re-rendering all of
// it to change one attribute would be the expensive way to do something the
// stylesheet already does for free: every sun position, shadow direction,
// sky and spill in WarmTemplate is derived from that single attribute in
// CSS. So the only React state here is what this control needs to
// describe itself: which button is pressed, and what the clock says.

const HOURS = [
  { id: "dawn", label: "Dawn", blurb: "dawn", disc: "color-mix(in srgb, var(--warm-sun) 55%, white)" },
  { id: "day", label: "Midday", blurb: "midday", disc: "color-mix(in srgb, var(--warm-sun) 30%, white)" },
  { id: "golden", label: "Golden hour", blurb: "golden hour", disc: "var(--warm-sun)" },
  { id: "lamp", label: "Lamplight", blurb: "lamplight", disc: "color-mix(in srgb, var(--warm-sun) 45%, #241a2e)" },
];

// Where the visitor's own clock puts them. Deliberately coarse: these are
// the four lights the room can actually be in, not a claim about sunrise
// times anywhere in particular.
function hourToLight(hour) {
  if (hour >= 5 && hour < 9) return "dawn";
  if (hour >= 9 && hour < 16) return "day";
  if (hour >= 16 && hour < 20) return "golden";
  return "lamp";
}

export default function HourDial({ colors }) {
  const ref = useRef(null);
  // Both the server render and the first client render have to agree, so
  // both start on the template's own default hour. The visitor's real one
  // can only be read after mount, which is what the first effect is for.
  const [light, setLight] = useState("golden");
  const [clock, setClock] = useState(null);
  const [chosen, setChosen] = useState(false);

  function applyLight(id) {
    const room = ref.current?.closest(".warm-room");
    if (room) room.dataset.light = id;
  }

  useEffect(() => {
    const id = hourToLight(new Date().getHours());
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate one-time read of a client-only source (the visitor's clock), not a derived-state loop
    setLight(id);
    const room = ref.current?.closest(".warm-room");
    if (room) room.dataset.light = id;
  }, []);

  // Kept ticking so a page left open overnight doesn't keep insisting it is
  // still the afternoon. The light itself stays where it was put: moving the
  // sun under a reader mid-sentence would be motion nobody asked for.
  useEffect(() => {
    function read() {
      setClock(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    }
    const initial = setTimeout(read, 0);
    const id = setInterval(read, 30000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, []);

  const blurb = HOURS.find((h) => h.id === light)?.blurb || "golden hour";

  // Three phrasings, because the sentence has to stay true: before the clock
  // is readable it claims nothing about the visitor, once it is readable it
  // explains the light, and after they have moved the light themselves it
  // stops crediting their clock for it.
  const line = !clock
    ? `This room is at ${blurb}.`
    : chosen
      ? `This room is at ${blurb}. It's ${clock} where you are.`
      : `It's ${clock} where you are, so this room is at ${blurb}.`;

  return (
    <div ref={ref} className="flex flex-col gap-2.5">
      {/* aria-live so the sentence is announced when the light moves, since
          for a screen reader that sentence is the only carrier of what the
          buttons did. */}
      <p className="text-[12.5px] leading-5" style={{ color: colors.MUTED }} aria-live="polite">
        {line}
      </p>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Light in this room">
        {HOURS.map((hour) => (
          <button
            key={hour.id}
            type="button"
            aria-pressed={hour.id === light}
            onClick={() => {
              setLight(hour.id);
              setChosen(true);
              applyLight(hour.id);
            }}
            className="warm-dial-btn flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-3.5 text-[12.5px] font-medium"
            style={{ color: colors.INK_SOFT }}
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: hour.disc, boxShadow: `0 0 8px ${hour.disc}` }}
            />
            {hour.label}
          </button>
        ))}
      </div>
    </div>
  );
}
