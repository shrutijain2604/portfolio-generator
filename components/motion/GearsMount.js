"use client";

// Mounts the gears graphic. gears.js builds its own DOM and injects its own
// stylesheet, so this only gives it a host and clears the host on cleanup,
// since React runs effects twice in development.

import { useEffect, useRef } from "react";
import { createGears } from "./gears";

export default function GearsMount({ className = "" }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    createGears(host);
    return () => host.replaceChildren();
  }, []);

  return <div ref={hostRef} className={className} style={{ minHeight: 210 }} />;
}
