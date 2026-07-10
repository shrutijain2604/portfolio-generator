"use client";

import { useEffect, useRef } from "react";

// A soft radial glow that follows the mouse. Drop it as a direct child of
// any `position: relative` container — it attaches its own listeners to
// that parent element and mutates its own style directly, so mousemove
// never triggers a React re-render of the (potentially large) template tree.
export default function CursorGlow({ colorRgb = "16, 185, 129", size = 500 }) {
  const glowRef = useRef(null);

  useEffect(() => {
    const glow = glowRef.current;
    const parent = glow?.parentElement;
    if (!parent) return;

    // Even at opacity 0 (before the first mousemove), an absolutely
    // positioned box at its full `size` still contributes to the parent's
    // scrollable overflow — cap it to the parent's actual size up front so
    // a narrower-than-`size` container (e.g. a phone-width preview) never
    // gets a stray horizontal scrollbar from an invisible box.
    const initialRect = parent.getBoundingClientRect();
    glow.style.width = `${Math.min(size, initialRect.width)}px`;
    glow.style.height = `${Math.min(size, initialRect.height)}px`;

    function handleMove(e) {
      const rect = parent.getBoundingClientRect();
      // Shrunk to fit and clamped to the parent's own box so the glow can
      // never extend past its edges — relying on an ancestor's `overflow`
      // to clip this instead would also disable `position: sticky`
      // anywhere inside that ancestor (mismatched overflow-x/overflow-y
      // forces the visible axis to `auto` per spec, which still counts as
      // a scroll container). A container narrower than `size` (e.g. a
      // phone-width preview) needs the box itself capped, not just
      // repositioned — clamping position alone can't fit a box bigger
      // than its container.
      const w = Math.min(size, rect.width);
      const h = Math.min(size, rect.height);
      const x = Math.min(Math.max(e.clientX - rect.left - w / 2, 0), Math.max(rect.width - w, 0));
      const y = Math.min(Math.max(e.clientY - rect.top - h / 2, 0), Math.max(rect.height - h, 0));
      glow.style.width = `${w}px`;
      glow.style.height = `${h}px`;
      glow.style.transform = `translate(${x}px, ${y}px)`;
      glow.style.opacity = "1";
    }
    function handleLeave() {
      glow.style.opacity = "0";
    }

    parent.addEventListener("mousemove", handleMove);
    parent.addEventListener("mouseleave", handleLeave);
    return () => {
      parent.removeEventListener("mousemove", handleMove);
      parent.removeEventListener("mouseleave", handleLeave);
    };
  }, [size]);

  return (
    <div
      ref={glowRef}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 opacity-0 blur-3xl transition-opacity duration-300 ease-out"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, rgba(${colorRgb}, 0.18), transparent 70%)`,
        willChange: "transform, opacity",
      }}
    />
  );
}
