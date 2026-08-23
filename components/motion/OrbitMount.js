"use client";

// Mounts the orbit graphic. orbit.js builds its own DOM and injects its own
// stylesheet, so all this does is give it a host element and clean up after
// it: React runs effects twice in development, and without the teardown a
// remount would leave two copies of the svg and the style tag behind.
//
// Named OrbitMount rather than Orbit because macOS filesystems are
// case-insensitive, so a component file named Orbit.js would be the same file
// as orbit.js and silently overwrite it.

import { useEffect, useRef } from "react";
import { createOrbit } from "./orbit";

export default function OrbitMount({ className = "" }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    createOrbit(host);
    return () => host.replaceChildren();
  }, []);

  // The graphic's own height, reserved here so the page does not shift when it
  // mounts on the client.
  return <div ref={hostRef} className={className} style={{ minHeight: 190 }} />;
}
