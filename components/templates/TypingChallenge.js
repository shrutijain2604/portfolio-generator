"use client";

import { useRef, useState } from "react";

// A real skill test, not a decorative toy — type the snippet as fast and
// accurately as you can, see your WPM/accuracy, and beat your own best.
// Snippets are real code/CLI one-liners; the score is the visitor's own
// live-computed result, not a claim about the portfolio owner.
const SNIPPETS = [
  "const sum = (a, b) => a + b;",
  "for (let i = 0; i < arr.length; i++) total += arr[i];",
  'git commit -m "fix: resolve race condition in cache"',
  "SELECT * FROM users WHERE active = true;",
  "docker run -p 3000:3000 myapp:latest",
  "return arr.filter(Boolean).map(x => x * 2);",
  "npm run build && npm test",
  'if (!user) throw new Error("Unauthorized");',
  "const memo = new Map();",
  "git rebase -i HEAD~3",
];

function pickSnippet(exclude) {
  const pool = SNIPPETS.filter((s) => s !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function TypingChallenge({ accent, paper, ink, inkSoft, muted, pixelClassName }) {
  const [snippet, setSnippet] = useState(() => pickSnippet());
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState("idle"); // idle | running | done
  const [result, setResult] = useState(null);
  const [best, setBest] = useState(null);
  const startRef = useRef(null);
  const inputRef = useRef(null);

  function start() {
    setSnippet((prev) => pickSnippet(prev));
    setTyped("");
    setResult(null);
    setStatus("running");
    startRef.current = null;
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function handleChange(e) {
    if (status !== "running") return;
    const value = e.target.value.slice(0, snippet.length);
    if (startRef.current === null && value.length > 0) {
      startRef.current = Date.now();
    }
    setTyped(value);

    if (value.length === snippet.length) {
      const seconds = Math.max((Date.now() - startRef.current) / 1000, 0.5);
      let correct = 0;
      for (let i = 0; i < snippet.length; i++) {
        if (value[i] === snippet[i]) correct++;
      }
      const accuracy = Math.round((correct / snippet.length) * 100);
      const wpm = Math.round(snippet.length / 5 / (seconds / 60));
      const finalResult = { wpm, accuracy, seconds: seconds.toFixed(1) };
      setResult(finalResult);
      setStatus("done");
      setBest((prevBest) => (!prevBest || wpm > prevBest.wpm ? finalResult : prevBest));
    }
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className={`${pixelClassName} text-[8px] leading-none`} style={{ color: inkSoft }}>
          TYPE THE SNIPPET — SPEED + ACCURACY
        </p>
        {best && (
          <p className={`${pixelClassName} text-[10px] leading-none`} style={{ color: accent }}>
            BEST {best.wpm} WPM
          </p>
        )}
      </div>

      <div
        className="rounded-md border-2 p-4 font-mono text-sm leading-relaxed"
        style={{ borderColor: `${accent}55`, backgroundColor: `${accent}0d` }}
        onClick={() => status === "running" && inputRef.current?.focus()}
      >
        {status === "idle" && !result ? (
          <p style={{ color: inkSoft }}>Ready when you are.</p>
        ) : (
          <p className="whitespace-pre-wrap break-all">
            {snippet.split("").map((char, i) => {
              let color = muted;
              if (i < typed.length) color = typed[i] === char ? "#10b981" : "#ef4444";
              const isCursor = i === typed.length && status === "running";
              return (
                <span key={i} style={{ color, backgroundColor: isCursor ? `${accent}33` : undefined }}>
                  {char}
                </span>
              );
            })}
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {status !== "running" && (
          <button
            type="button"
            onClick={start}
            className={`${pixelClassName} rounded border-2 px-3 py-2.5 text-[9px] uppercase tracking-wide transition-transform active:translate-y-[1px]`}
            style={{ backgroundColor: accent, color: paper, borderColor: accent }}
          >
            {status === "done" ? "Try Again" : "Start Typing Test"}
          </button>
        )}
        {status === "running" && (
          <input
            ref={inputRef}
            value={typed}
            onChange={handleChange}
            onPaste={(e) => e.preventDefault()}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full max-w-sm rounded border-2 bg-transparent px-3 py-2 font-mono text-sm outline-none"
            style={{ borderColor: accent, color: ink }}
            placeholder="Start typing…"
          />
        )}
        {result && (
          <p className={`${pixelClassName} text-[9px] leading-none`} style={{ color: accent }}>
            {result.wpm} WPM · {result.accuracy}% ACC · {result.seconds}s
          </p>
        )}
      </div>
    </div>
  );
}
