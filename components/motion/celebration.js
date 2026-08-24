// celebration.js

export function createCelebration(container) {
  if (!container) {
    throw new Error("Celebration animation container not found.");
  }

  const NS = "http://www.w3.org/2000/svg";

  // --------------------------------------------------
  // SVG helpers
  // --------------------------------------------------

  function createSVGElement(tag, attributes = {}) {
    const element = document.createElementNS(NS, tag);

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    return element;
  }

  // --------------------------------------------------
  // Container
  // --------------------------------------------------

  container.innerHTML = "";

  container.style.width = "100%";
  container.style.height = "180px";
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.overflow = "hidden";

  // --------------------------------------------------
  // SVG
  // --------------------------------------------------

  const svg = createSVGElement("svg", {
    viewBox: "0 0 900 180",
    width: "100%",
    height: "100%",
    preserveAspectRatio: "xMidYMid meet",
    "aria-label":
      "Celebration animation with a heart and the words ship it, celebrate it, keep going."
  });

  // --------------------------------------------------
  // Styles
  // --------------------------------------------------

  const style = document.createElementNS(NS, "style");

  style.textContent = `
    .celebration-heart {
      fill: none;
      stroke: #a64f4f;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;

      transform-origin: 450px 78px;
      animation:
        heartAppear 1.2s cubic-bezier(.22,1,.36,1) forwards,
        heartBeat 3.2s ease-in-out 1.2s infinite;
    }

    .celebration-spark {
      fill: none;
      stroke: #292929;
      stroke-width: 1.6;
      stroke-linecap: round;

      opacity: 0;

      animation:
        sparkAppear 1s ease-out forwards,
        sparkPulse 3.2s ease-in-out infinite;
    }

    .spark-1 {
      animation-delay: .15s, 1.8s;
    }

    .spark-2 {
      animation-delay: .25s, 2s;
    }

    .spark-3 {
      animation-delay: .35s, 2.2s;
    }

    .spark-4 {
      animation-delay: .45s, 2.4s;
    }

    .spark-5 {
      animation-delay: .55s, 2.6s;
    }

    .spark-6 {
      animation-delay: .65s, 2.8s;
    }

    .celebration-dot {
      fill: #b59458;
      opacity: 0;

      animation:
        dotAppear .8s ease-out forwards,
        dotFloat 3s ease-in-out infinite;
    }

    .dot-1 {
      animation-delay: .2s, 1.7s;
    }

    .dot-2 {
      animation-delay: .35s, 1.9s;
    }

    .dot-3 {
      animation-delay: .5s, 2.1s;
    }

    .dot-4 {
      animation-delay: .65s, 2.3s;
    }

    .celebration-text {
      fill: #77736c;
      font-family:
        Inter,
        Helvetica,
        Arial,
        sans-serif;

      font-size: 10px;
      letter-spacing: 4px;

      opacity: 0;

      animation: textAppear 1.4s ease-out 1s forwards;
    }

    .celebration-small-text {
      fill: #aaa59d;
      font-family:
        Inter,
        Helvetica,
        Arial,
        sans-serif;

      font-size: 7px;
      letter-spacing: 2.5px;

      opacity: 0;

      animation: textAppear 1.4s ease-out 1.25s forwards;
    }

    @keyframes heartAppear {
      0% {
        opacity: 0;
        transform: scale(.45);
      }

      70% {
        opacity: 1;
        transform: scale(1.08);
      }

      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes heartBeat {
      0%,
      100% {
        transform: scale(1);
      }

      8% {
        transform: scale(1.08);
      }

      16% {
        transform: scale(1);
      }

      24% {
        transform: scale(1.05);
      }

      32% {
        transform: scale(1);
      }
    }

    @keyframes sparkAppear {
      0% {
        opacity: 0;
        transform: scale(.2);
      }

      100% {
        opacity: .75;
        transform: scale(1);
      }
    }

    @keyframes sparkPulse {
      0%,
      100% {
        opacity: .25;
      }

      50% {
        opacity: .9;
      }
    }

    @keyframes dotAppear {
      0% {
        opacity: 0;
        transform: scale(0);
      }

      100% {
        opacity: .55;
        transform: scale(1);
      }
    }

    @keyframes dotFloat {
      0%,
      100% {
        transform: translateY(0);
      }

      50% {
        transform: translateY(-5px);
      }
    }

    @keyframes textAppear {
      0% {
        opacity: 0;
        transform: translateY(8px);
      }

      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .celebration-heart,
      .celebration-spark,
      .celebration-dot,
      .celebration-text,
      .celebration-small-text {
        animation: none;
        opacity: 1;
        transform: none;
      }
    }
  `;

  svg.appendChild(style);

  // --------------------------------------------------
  // Decorative sparks
  // --------------------------------------------------

  const sparks = [
    // Left upper
    {
      x: 375,
      y: 55,
      x2: 383,
      y2: 63,
      className: "spark-1"
    },
    {
      x: 383,
      y: 55,
      x2: 375,
      y2: 63,
      className: "spark-2"
    },

    // Right upper
    {
      x: 517,
      y: 55,
      x2: 525,
      y2: 63,
      className: "spark-3"
    },
    {
      x: 525,
      y: 55,
      x2: 517,
      y2: 63,
      className: "spark-4"
    },

    // Left high
    {
      x: 400,
      y: 30,
      x2: 405,
      y2: 40,
      className: "spark-5"
    },
    {
      x: 405,
      y: 30,
      x2: 400,
      y2: 40,
      className: "spark-6"
    }
  ];

  sparks.forEach((spark) => {
    const line = createSVGElement("line", {
      x1: spark.x,
      y1: spark.y,
      x2: spark.x2,
      y2: spark.y2,
      class: `celebration-spark ${spark.className}`
    });

    svg.appendChild(line);
  });

  // --------------------------------------------------
  // Small floating dots
  // --------------------------------------------------

  const dots = [
    {
      cx: 365,
      cy: 82,
      r: 2
    },
    {
      cx: 535,
      cy: 82,
      r: 2
    },
    {
      cx: 410,
      cy: 25,
      r: 1.8
    },
    {
      cx: 490,
      cy: 25,
      r: 1.8
    }
  ];

  dots.forEach((dot, index) => {
    const circle = createSVGElement("circle", {
      cx: dot.cx,
      cy: dot.cy,
      r: dot.r,
      class: `celebration-dot dot-${index + 1}`
    });

    svg.appendChild(circle);
  });

  // --------------------------------------------------
  // Heart
  // --------------------------------------------------

  const heart = createSVGElement("path", {
    class: "celebration-heart",

    /*
      Hand-drawn heart.
    */
    d: `
      M 450 83

      C 424 64,
        410 45,
        421 37

      C 431 30,
        444 35,
        450 45

      C 456 35,
        469 30,
        479 37

      C 490 45,
        476 64,
        450 83
    `
  });

  svg.appendChild(heart);

  // --------------------------------------------------
  // Main message
  // --------------------------------------------------

  const text = createSVGElement("text", {
    x: 450,
    y: 124,
    "text-anchor": "middle",
    class: "celebration-text"
  });

  text.textContent = "SHIP IT · CELEBRATE IT · KEEP GOING";

  svg.appendChild(text);

  // --------------------------------------------------
  // Tiny secondary line
  // --------------------------------------------------

  const secondaryText = createSVGElement("text", {
    x: 450,
    y: 142,
    "text-anchor": "middle",
    class: "celebration-small-text"
  });

  secondaryText.textContent = "SMALL WINS COUNT";

  svg.appendChild(secondaryText);

  // --------------------------------------------------
  // Add SVG to page
  // --------------------------------------------------

  container.appendChild(svg);

  return svg;
}
