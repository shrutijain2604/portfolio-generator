// orbit.js

export function createOrbit(container) {
  if (!container) {
    throw new Error("Orbit animation container not found.");
  }

  const style = document.createElement("style");

  style.textContent = `
    .orbit-motion {
      width: 100%;
      min-height: 190px;
      display: grid;
      place-items: center;
      overflow: hidden;
      background: transparent;
    }

    .orbit-motion svg {
      width: min(900px, 94%);
      height: 180px;
      overflow: visible;
    }

    .orbit-motion .orbit-path {
      fill: none;
      stroke: #d4d0c8;
      stroke-width: 1.2;
    }

    .orbit-motion .orbit-path.secondary {
      transform-origin: 450px 90px;
      transform: rotate(-28deg);
    }

    .orbit-motion .orbiting-dot {
      transform-origin: 450px 90px;
      animation: orbitMotion 8s linear infinite;
    }

    .orbit-motion .orbiting-dot circle {
      fill: #7697ad;
    }

    .orbit-motion .orbiting-dot line {
      stroke: #ffffff;
      stroke-width: 2;
      stroke-linecap: round;
    }

    .orbit-motion .center {
      fill: #fdfcf9;
      stroke: #a64f4f;
      stroke-width: 1.8;

      transform-box: fill-box;
      transform-origin: center;

      animation: orbitBreathing 3s ease-in-out infinite;
    }

    .orbit-motion .center-title {
      fill: #252525;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 18px;
      font-weight: 500;
      letter-spacing: 5px;
    }

    .orbit-motion .center-subtitle {
      fill: #85827c;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8px;
      letter-spacing: 2.5px;
    }

    .orbit-motion .pulse-dot {
      transform-box: fill-box;
      transform-origin: center;

      animation: orbitPulse 2.4s ease-in-out infinite;
    }

    .orbit-motion .pulse-blue {
      fill: #7697ad;
    }

    .orbit-motion .pulse-red {
      fill: #a64f4f;
      animation-delay: .4s;
    }

    .orbit-motion .pulse-gold {
      fill: #b28b4b;
      animation-delay: .8s;
    }

    .orbit-motion .spark {
      fill: none;
      stroke: #252525;
      stroke-width: 1.2;
      stroke-linecap: round;

      transform-box: fill-box;
      transform-origin: center;

      animation: orbitSpark 2.8s ease-in-out infinite;
    }

    .orbit-motion .spark.second {
      animation-delay: 1.2s;
    }

    .orbit-motion .tiny-text {
      fill: #77736c;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9px;
      letter-spacing: 3px;
    }

    @keyframes orbitMotion {
      from {
        transform: rotate(0deg);
      }

      to {
        transform: rotate(360deg);
      }
    }

    @keyframes orbitBreathing {
      0%,
      100% {
        transform: scale(.94);
      }

      50% {
        transform: scale(1.05);
      }
    }

    @keyframes orbitPulse {
      0%,
      100% {
        transform: scale(.7);
        opacity: .35;
      }

      50% {
        transform: scale(1.35);
        opacity: 1;
      }
    }

    @keyframes orbitSpark {
      0%,
      100% {
        opacity: .15;
        transform: scale(.7);
      }

      50% {
        opacity: 1;
        transform: scale(1.25);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .orbit-motion .orbiting-dot,
      .orbit-motion .center,
      .orbit-motion .pulse-dot,
      .orbit-motion .spark {
        animation: none;
      }
    }
  `;

  const wrapper = document.createElement("div");

  wrapper.className = "orbit-motion";

  wrapper.innerHTML = `
    <svg
      viewBox="0 0 900 180"
      role="img"
      aria-label="Creative orbit animation"
    >

      <!-- Main orbit -->

      <ellipse
        class="orbit-path"
        cx="450"
        cy="90"
        rx="300"
        ry="55"
      />

      <!-- Secondary tilted orbit -->

      <ellipse
        class="orbit-path secondary"
        cx="450"
        cy="90"
        rx="210"
        ry="38"
      />

      <!-- Orbiting creative cursor -->

      <g class="orbiting-dot">

        <circle
          cx="750"
          cy="90"
          r="9"
        />

        <line
          x1="743"
          y1="90"
          x2="757"
          y2="90"
        />

        <line
          x1="750"
          y1="83"
          x2="750"
          y2="97"
        />

      </g>


      <!-- Small creative nodes -->

      <circle
        class="pulse-dot pulse-blue"
        cx="150"
        cy="90"
        r="4"
      />

      <circle
        class="pulse-dot pulse-red"
        cx="450"
        cy="35"
        r="4"
      />

      <circle
        class="pulse-dot pulse-gold"
        cx="750"
        cy="90"
        r="4"
      />


      <!-- Central identity -->

      <circle
        class="center"
        cx="450"
        cy="90"
        r="37"
      />

      <text
        class="center-title"
        x="450"
        y="87"
        text-anchor="middle"
      >
        CREATE
      </text>

      <text
        class="center-subtitle"
        x="450"
        y="106"
        text-anchor="middle"
      >
        BUILD · MOVE · CAPTURE
      </text>


      <!-- Decorative sparks -->

      <path
        class="spark"
        d="M92 48 L98 54 M98 48 L92 54"
      />

      <path
        class="spark second"
        d="M802 128 L808 134 M808 128 L802 134"
      />


      <!-- Bottom caption -->

      <text
        class="tiny-text"
        x="450"
        y="160"
        text-anchor="middle"
      >
        ALWAYS CURIOUS · ALWAYS CREATING
      </text>

    </svg>
  `;

  container.appendChild(style);
  container.appendChild(wrapper);

  return wrapper;
}
