"use client";

// Scales a block of type until it exactly fills the height it has been given.
//
// Why this exists: the Front Page template is a single no-scroll page, so its
// body has a FIXED height budget. Picking type sizes to match that budget from
// the data alone (character counts, entry counts, `vh` curves) was tried and
// repeatedly failed, because the two variables that decide whether copy fits —
// how much copy there is, and how large the window is — interact in a way no
// static heuristic tracked. The failures went both directions: too large and
// real sentences were silently clipped off the page; too small and a third of
// the page sat empty. One tier boundary shrank the type 12%, which (column
// height scales with roughly the SQUARE of type size) cost 22% of the page.
//
// So instead of predicting, measure. Binary-search a multiplier for the largest
// value at which the content still fits, then keep it. Self-correcting for any
// content and any viewport, and it converges in ~11 synchronous reflows of one
// element, once per resize.
//
// The overflow test deserves a note: a CSS multi-column box with a constrained
// height does NOT grow taller when it runs out of room, it creates additional
// columns beside the existing ones. So `scrollHeight` stays equal to
// `clientHeight` even while content is being lost, and the real signal is
// `scrollWidth`. Checking only the height is what let the earlier clipping go
// unnoticed.

import { useEffect, useRef } from "react";

// Below MIN the type would stop being legible; a portfolio that cannot fit even
// there keeps MIN and is allowed to clip rather than becoming unreadable.
const MIN = 0.62;
const MAX = 2.1;
const STEPS = 11;

export default function FitToPage({ as: Tag = "div", minWidth = 1100, measure, children, ...rest }) {
  const ref = useRef(null);

  // useEffect, not useLayoutEffect: this renders on the server too, and
  // useLayoutEffect warns there. The cost is that the first paint uses the
  // unscaled default before the fit lands.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const set = (v) => el.style.setProperty("--np-fit", String(v));
    // `measure` names the multi-column box inside this element. Scaling is
    // applied to the whole page so the lede and the body stay in proportion,
    // but the thing that actually runs out of room is the column flow.
    const target = () => (measure ? el.querySelector(measure) : el);
    // See the note above: width is the signal that matters for multi-column.
    const overflows = () => {
      const t = target();
      if (t && (t.scrollWidth > t.clientWidth + 1 || t.scrollHeight > t.clientHeight + 1)) return true;
      return el.scrollHeight > el.clientHeight + 1;
    };

    const fit = () => {
      // Gate on THIS ELEMENT's width, not the window's. The editor renders the
      // template in a ~735px split pane inside a 1512px window: a window-based
      // check said "wide screen, fit to one page" and squeezed the content into
      // two narrow columns until it clipped. Its own width is the honest signal
      // for whether the one-page layout is even active.
      if (el.clientWidth < minWidth) {
        set(1);
        return;
      }
      set(MAX);
      if (!overflows()) return; // everything already fits at full size
      let lo = MIN;
      let hi = MAX;
      for (let i = 0; i < STEPS; i++) {
        const mid = (lo + hi) / 2;
        set(mid);
        if (overflows()) hi = mid;
        else lo = mid;
      }
      set(lo);
    };

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    };

    // Deferred a frame rather than run inline: the fit writes to this
    // element's inline style, and doing that while React is still hydrating
    // makes the DOM disagree with what the server sent, which surfaces as a
    // hydration warning. A frame later, hydration is done and the write is
    // React's business no longer.
    schedule();
    // Refit when the box changes size. Only the box is observed, never its
    // contents, so scaling the type cannot retrigger the observer.
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    window.addEventListener("resize", schedule);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    };
  });

  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}
