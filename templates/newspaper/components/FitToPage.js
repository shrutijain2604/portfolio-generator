"use client";

// Scales a block of type until it exactly fills the height it has been given.
//
// Front Page is one no-scroll page, so its body has a fixed height budget.
// Predicting type size from the data alone (character counts, vh curves)
// failed in both directions, because how much copy there is and how large the
// window is interact in a way no static heuristic tracked. So measure instead:
// binary-search the largest multiplier at which the content still fits, ~11
// synchronous reflows of one element, once per resize.
//
// The overflow test matters. A constrained multi-column box does not grow
// taller when it runs out of room, it adds columns beside the existing ones,
// so scrollHeight stays equal to clientHeight while content is being lost. The
// real signal is scrollWidth.

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
