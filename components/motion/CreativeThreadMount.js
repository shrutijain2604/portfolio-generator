"use client";

// Mounts the creative thread graphic. creative-thread.js builds its own DOM
// and injects its own stylesheet, so this only gives it a host and clears the
// host on cleanup, since React runs effects twice in development.

import { useEffect, useRef } from "react";
import { createCreativeThread } from "./creative-thread";

export default function CreativeThreadMount({ className = "" }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    createCreativeThread(host);
    return () => host.replaceChildren();
  }, []);

  return <div ref={hostRef} className={className} style={{ minHeight: 190 }} />;
}
