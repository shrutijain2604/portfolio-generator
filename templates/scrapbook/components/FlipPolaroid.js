"use client";

import { useState } from "react";

// Lets a visitor flip a project's photo to see a handwritten note on the
// back, echoing this template's "flipping through a real notebook" bit.
// Renders as a plain, non-interactive image when there's no real note to
// show on the back — flipping to a blank card would be a dead end.
export default function FlipPolaroid({ front, back, label, className = "" }) {
  const [flipped, setFlipped] = useState(false);

  if (!back) {
    return <div className={className}>{front}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      aria-label={flipped ? `Show ${label} photo` : `Show the note on the back of ${label}`}
      className={`scrapbook-flip-card block w-full cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40 ${className}`}
    >
      <span className={`scrapbook-flip-inner ${flipped ? "scrapbook-flipped" : ""}`}>
        <span className="scrapbook-flip-face scrapbook-flip-front">
          {front}
          {/* A folded-corner "there's more here" hint, always visible —
              not just on hover — since touch devices have no hover to
              reveal it with. */}
          <span aria-hidden className="scrapbook-flip-hint" />
        </span>
        <span className="scrapbook-flip-face scrapbook-flip-back">{back}</span>
      </span>
    </button>
  );
}
