"use client";

// Mounts the thoughts graphic. thoughts.js builds its own DOM and injects its
// own stylesheet, so this only gives it a host and clears the host on cleanup,
// since React runs effects twice in development.

import { useEffect, useRef } from "react";
import { createThoughts } from "./thoughts";

export default function ThoughtsMount({ className = "" }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    createThoughts(host);
    return () => host.replaceChildren();
  }, []);

  return <div ref={hostRef} className={className} style={{ minHeight: 210 }} />;
}
