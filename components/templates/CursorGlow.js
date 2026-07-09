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

    function handleMove(e) {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
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
