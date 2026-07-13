"use client";

import { useEffect, useRef } from "react";

// A small crosshair that trails the pointer with a bit of lag, layered on
// top of the ambient CursorGlow — the "aim reticle" HUD touch this
// template's game framing calls for. Mutates its own style directly on
// each animation frame instead of using React state, the same technique
// CursorGlow uses, so tracking the mouse never triggers a re-render of the
// page. Nothing appears until the mouse actually moves, so touch devices
// (which never fire mousemove) never see it.
export default function ReticleCursor({ color }) {
  const ref = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const active = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function handleMove(e) {
      target.current = { x: e.clientX, y: e.clientY };
      if (!active.current) {
        active.current = true;
        pos.current = { ...target.current };
        el.style.opacity = "1";
      }
    }
    function handleLeave() {
      active.current = false;
      el.style.opacity = "0";
    }

    let frame;
    function tick() {
      pos.current.x += (target.current.x - pos.current.x) * 0.25;
      pos.current.y += (target.current.y - pos.current.y) * 0.25;
      el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      frame = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseleave", handleLeave);
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[15] hidden opacity-0 transition-opacity duration-300 sm:block"
      style={{ willChange: "transform" }}
    >
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="9" stroke={color} strokeWidth="1.5" opacity="0.8" />
        <line x1="14" y1="0" x2="14" y2="6" stroke={color} strokeWidth="1.5" />
        <line x1="14" y1="22" x2="14" y2="28" stroke={color} strokeWidth="1.5" />
        <line x1="0" y1="14" x2="6" y2="14" stroke={color} strokeWidth="1.5" />
        <line x1="22" y1="14" x2="28" y2="14" stroke={color} strokeWidth="1.5" />
      </svg>
    </div>
  );
}
