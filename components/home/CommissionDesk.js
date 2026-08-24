"use client";

// The landing page's closing argument: a template gallery is not everything, so
// this is where someone who already knows what they want commissions it.
//
// The signature idea is that the brief writes itself. Every choice on the left
// lands as a written line on the plate to the right, and sending then opens a
// compose window with exactly that text already in it. Nobody is handed an
// empty compose window and asked to explain themselves from scratch, and the
// document they watched assemble is the document that gets sent.
//
// Sending offers three destinations rather than one mailto. A bare mailto is
// handed to whatever the operating system registered, which on a Mac is Apple
// Mail even for the many people who have never opened it, so the flow dead-ends
// in an app they do not use. Gmail's compose URL covers most visitors, the
// mailto still serves anyone on a real desktop client, and copying covers every
// remaining client without this page having to guess at it.
//
// Nothing is posted anywhere and nothing is stored: this surface has no server
// route behind it on purpose, so a half-finished brief someone abandons never
// becomes a record sitting in a database.

import { useEffect, useRef, useState } from "react";
import { ArrowRight, BriefMark } from "./marks";

// The two facts on this surface that are not derived from what the visitor
// picks. Both are quoted verbatim from what the work actually costs and where
// it actually lands, and they are kept together because they are the pair most
// likely to change.
const COMMISSION_EMAIL = "shru.jain2604@gmail.com";
const COMMISSION_NAME = "Shruti";
const STARTING_PRICE = "Rs. 4,999";

// Single choice: what the thing even is. Phrased as the visitor would say it
// out loud, since these strings are read back to them inside their own email.
const BUILD_KINDS = [
  { id: "beyond", label: "A portfolio, but none of the ones you have" },
  { id: "idea", label: "A personal site built around one idea" },
  { id: "rebuild", label: "A rebuild of a site I already have" },
  { id: "other", label: "Something else entirely" },
];

// Multiple choice: the direction. Deliberately about craft rather than
// features, because that is what changes the price of a build and what is
// worth agreeing on before a call rather than during one.
const DIRECTIONS = [
  { id: "three-d", label: "3D or WebGL" },
  { id: "scroll", label: "Scroll-driven motion" },
  { id: "pastiche", label: "An interface pastiche: IDE, terminal, OS" },
  { id: "editorial", label: "Editorial and print-led" },
  { id: "playful", label: "Playful or game-like" },
  { id: "data", label: "Driven by real data" },
];

// Long enough for a real sentence, short enough that the composed mailto stays
// well inside the length a mail client will accept without truncating it.
const NOTE_LIMIT = 240;

const SUBJECT = "Custom portfolio commission";

// The three questions are headings, not captions. A numbered ordinal in the
// accent beside a display-face line is the same device the handoff beats use
// further up the page, so the form reads as part of the argument rather than
// as a widget bolted onto the end of it.
function GroupHead({ step, htmlFor, children }) {
  const inner = (
    <>
      <span className="home-nums shrink-0 text-[13px] text-[var(--home-accent)]">{step}</span>
      <span className="home-grotesque text-[21px] leading-[1.12] sm:text-[25px]">{children}</span>
    </>
  );

  // A fieldset labels itself with a legend; the note is a single control, so it
  // takes a real label pointing at the textarea instead.
  return htmlFor ? (
    <label htmlFor={htmlFor} className="flex items-baseline gap-3">
      {inner}
    </label>
  ) : (
    <legend className="flex items-baseline gap-3">{inner}</legend>
  );
}

export default function CommissionDesk() {
  const [kind, setKind] = useState("");
  const [directions, setDirections] = useState([]);
  const [note, setNote] = useState("");
  const [copy, setCopy] = useState("");
  const copyTimer = useRef(0);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const toggleDirection = (id) => {
    setDirections((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const kindLabel = BUILD_KINDS.find((item) => item.id === kind)?.label || "";
  const trimmedNote = note.trim();

  // Keys are stable identities rather than the text itself, so typing in the
  // note does not remount its line and replay the write-in animation on every
  // keystroke. Direction lines key on their own id, which is what makes each
  // newly ticked chip, and only that one, animate into the document.
  // Labels are written from the sender's side, because these head the sections
  // of an email they are signing. They are shared with the plate rather than
  // restated there, so the document on screen and the message that leaves are
  // worded identically.
  const rows = [
    {
      key: "build",
      label: "What I want built",
      items: kindLabel ? [{ key: kind, text: kindLabel }] : [],
    },
    {
      key: "direction",
      label: "Direction",
      items: DIRECTIONS.filter((item) => directions.includes(item.id)).map((item) => ({
        key: item.id,
        text: item.label,
      })),
    },
    {
      key: "notes",
      label: "In my own words",
      items: trimmedNote ? [{ key: "note", text: trimmedNote }] : [],
    },
  ];

  const filled = rows.filter((row) => row.items.length > 0);
  const started = filled.length > 0;

  // The plain-text twin of the plate, built from the same rows so the two can
  // never describe different briefs.
  //
  // It deliberately does not restate the handoff. That is a promise this site
  // makes to the sender, not a term the sender needs to recite back, and an
  // email in which someone quotes your own offer to you reads like a form.
  // Someone who picked nothing gets a blank space to write into instead of a
  // near-empty message, since the point is to leave them somewhere to start.
  const body = [
    `Hi ${COMMISSION_NAME},`,
    "",
    "I found you through Dev Portfolio Builder and I would like to commission a custom portfolio.",
    "",
    ...(started
      ? filled.flatMap((row) => [row.label, ...row.items.map((item) => `  ${item.text}`), ""])
      : ["Here is what I have in mind:", "", "", ""]),
    `I have seen that custom builds start at ${STARTING_PRICE} including the handoff, and I am happy to settle scope and the final number on a call.`,
    "",
    "Thanks,",
    "",
  ].join("\n");

  const subject = encodeURIComponent(SUBJECT);
  const encodedBody = encodeURIComponent(body);

  const mailto = `mailto:${COMMISSION_EMAIL}?subject=${subject}&body=${encodedBody}`;
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    COMMISSION_EMAIL
  )}&su=${subject}&body=${encodedBody}`;

  // The clipboard call throws rather than resolving false when it is
  // unavailable (an insecure origin, or a browser that withholds it), so the
  // failure is caught and said out loud instead of leaving someone pressing a
  // button that silently does nothing. The address is on screen underneath
  // either way, so a failed copy is never a dead end.
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`To: ${COMMISSION_EMAIL}\nSubject: ${SUBJECT}\n\n${body}`);
      setCopy("done");
    } catch {
      setCopy("failed");
    }
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopy(""), 5000);
  };

  return (
    <div className="home-commission grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,33rem)] lg:gap-16">
      <div className="home-reveal">
        <fieldset className="border-0 p-0">
          <GroupHead step="01">What should it be</GroupHead>
          <div className="mt-6 flex flex-wrap gap-3">
            {BUILD_KINDS.map((item) => (
              <label key={item.id} className="home-chip">
                <input
                  type="radio"
                  name="commission-kind"
                  value={item.id}
                  checked={kind === item.id}
                  onChange={() => setKind(item.id)}
                  className="sr-only"
                />
                <span className="home-chip-dot" aria-hidden="true" />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-14 border-0 p-0">
          <GroupHead step="02">Direction, pick any</GroupHead>
          <div className="mt-6 flex flex-wrap gap-3">
            {DIRECTIONS.map((item) => (
              <label key={item.id} className="home-chip">
                <input
                  type="checkbox"
                  value={item.id}
                  checked={directions.includes(item.id)}
                  onChange={() => toggleDirection(item.id)}
                  className="sr-only"
                />
                <span className="home-chip-dot" aria-hidden="true" />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-14">
          <GroupHead step="03" htmlFor="commission-note">
            In one line, what is in your head
          </GroupHead>
          <textarea
            id="commission-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={NOTE_LIMIT}
            rows={3}
            placeholder="A site that opens like a case file, one document at a time."
            className="home-field mt-6 w-full resize-none rounded-[var(--home-radius)] px-5 py-4 text-[16px] leading-[1.6]"
          />
          <p className="home-nums mt-2 text-right text-[11px] text-[var(--home-faint)]">
            {note.length}/{NOTE_LIMIT}
          </p>
        </div>
      </div>

      {/* The document, on the same navy plate the handoff artifacts use. It is
          sticky so it stays beside the questions the whole way down, which also
          gives the section its parallax: the plate holds while the column
          beside it scrolls, with no scroll handler involved.

          It starts a little above the first question rather than level with it.
          This column runs taller than the one beside it, so matching their tops
          left the two ending at visibly different heights; lifting it settles
          the pair on a shared baseline, which is the edge the eye actually
          reads. The offset is desktop-only, since the columns stack below lg
          and there is no second edge to line up against. */}
      <div className="home-brief-stage lg:-mt-24 lg:sticky lg:top-24 lg:self-start">
        <div className="home-brief-plate home-inset overflow-hidden rounded-xl">
          <div className="flex items-center gap-3 border-b border-white/15 px-7 py-5">
            <BriefMark className="h-5 w-5 shrink-0 text-[var(--home-strong)]" aria-hidden="true" />
            <span className="home-nums truncate text-[15px] text-[var(--home-strong)]">
              Commission brief
            </span>
            <span className="home-label ml-auto shrink-0 rounded-full border border-white/20 px-3 py-1.5">
              {started ? "Ready" : "Draft"}
            </span>
          </div>

          {/* Announced politely rather than assertively: lines land here as a
              consequence of the choice just made, so a screen reader should
              hear the confirmation after the control it came from, not cut
              across it. */}
          <dl className="min-h-[15rem] space-y-7 px-7 py-7" aria-live="polite">
            {!started && (
              <p className="text-[15px] leading-[1.65] text-[var(--home-faint)]">
                Answer anything on the left and it gets written here. This is the message that
                gets sent, so nothing arrives that you did not put in it.
              </p>
            )}

            {filled.map((row) => (
              <div key={row.key}>
                <dt className="home-label">{row.label}</dt>
                <dd className="mt-2.5 space-y-2">
                  {row.items.map((item) => (
                    <p
                      key={item.key}
                      className="home-brief-line text-[15px] leading-[1.6] text-[var(--home-text)]"
                    >
                      {item.text}
                    </p>
                  ))}
                </dd>
              </div>
            ))}

          </dl>

          {/* Below the rule are the terms, not the message. Keeping the handoff
              down here rather than as a line in the document above is what lets
              the plate stay an honest preview: everything above the rule is
              exactly what gets sent, and nothing more.

              The price stacks under its own label rather than sharing a
              baseline with it, which is what lets the number be set large
              enough to read as the answer to the question the whole section is
              asking. */}
          <div className="border-t border-white/15 px-7 py-6">
            <p className="home-label">Starting at</p>
            <p className="home-nums mt-2 text-[30px] italic leading-none text-[var(--home-strong)]">
              {STARTING_PRICE}
            </p>
            <p className="mt-3 text-[13px] leading-[1.55] text-[var(--home-faint)]">
              Includes the handoff: the source in your GitHub, hosted on your Vercel. Scope and
              the final number get settled on a call.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <p className="home-grotesque text-[19px] leading-none">Send it with</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a
              href={gmail}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--home-strong)] px-5 py-3 text-[14px] font-medium text-[var(--home-bg)] transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--home-strong)]"
            >
              Gmail
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>

            {/* Still here for anyone who genuinely lives in a desktop client.
                It is quiet rather than primary because it is the option most
                likely to open something the visitor never uses. */}
            <a href={mailto} className="home-quiet-link">
              Your mail app
            </a>

            <button type="button" onClick={handleCopy} className="home-quiet-link">
              Copy the brief
            </button>
          </div>

          <p
            aria-live="polite"
            className="mt-4 min-h-[1.2em] text-[12.5px] leading-[1.55] text-[var(--home-faint)]"
          >
            {copy === "done" && "Copied, address and all. Paste it wherever you write email."}
            {copy === "failed" && "Your browser blocked the copy. The address is just below."}
          </p>

          <p className="mt-1 max-w-[36ch] text-[12.5px] leading-[1.55] text-[var(--home-faint)]">
            Whichever you pick, the brief arrives already written. Nothing is sent from this page
            and nothing is stored here. You can also just write to{" "}
            <a href={mailto} className="home-quiet-link">
              {COMMISSION_EMAIL}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
