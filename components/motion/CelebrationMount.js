"use client";

// Mounts the celebration graphic. celebration.js builds its own DOM and injects
// its own stylesheet, so this only gives it a host and clears the host on
// cleanup, since React runs effects twice in development.

import { useEffect, useRef } from "react";
import { createCelebration } from "./celebration";

export default function CelebrationMount({ className = "" }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    createCelebration(host);
    return () => host.replaceChildren();
  }, []);

  return <div ref={hostRef} className={className} style={{ minHeight: 180 }} />;
}
