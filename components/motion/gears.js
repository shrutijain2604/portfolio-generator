// gears.js

export function createGears(container) {
  if (!container) {
    throw new Error("Gears animation container not found.");
  }

  const style = document.createElement("style");

  style.textContent = `
    .gears-motion {
      width: 100%;
      min-height: 210px;
      display: grid;
      place-items: center;
      overflow: hidden;
      background: transparent;
      font-family: Arial, Helvetica, sans-serif;
    }

    .gears-motion svg {
      width: min(900px, 94%);
      height: 200px;
      overflow: visible;
    }

    /* --------------------------------
       Gear styling
    -------------------------------- */

    .gears-motion .gear {
      fill: #fdfcf9;
      stroke-width: 1.7;

      transform-box: fill-box;
      transform-origin: center;
    }

    .gears-motion .gear-one {
      stroke: #7697ad;
      animation: gearClockwise 8s linear infinite;
    }

    .gears-motion .gear-two {
      stroke: #a64f4f;
      animation: gearCounterClockwise 6s linear infinite;
    }

    .gears-motion .gear-three {
      stroke: #b59458;
      animation: gearClockwise 10s linear infinite;
    }

    /* --------------------------------
       Gear teeth
    -------------------------------- */

    .gears-motion .tooth {
      fill: none;
      stroke-width: 1.7;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .gears-motion .gear-one .tooth {
      stroke: #7697ad;
    }

    .gears-motion .gear-two .tooth {
      stroke: #a64f4f;
    }

    .gears-motion .gear-three .tooth {
      stroke: #b59458;
    }

    /* --------------------------------
       Gear center
    -------------------------------- */

    .gears-motion .hub {
      fill: #fdfcf9;
      stroke-width: 1.5;
    }

    .gears-motion .gear-one .hub {
      stroke: #7697ad;
    }

    .gears-motion .gear-two .hub {
      stroke: #a64f4f;
    }

    .gears-motion .gear-three .hub {
      stroke: #b59458;
    }

    /* --------------------------------
       Connecting system lines
    -------------------------------- */

    .gears-motion .system-line {
      fill: none;
      stroke: #d7d2ca;
      stroke-width: 1;
      stroke-dasharray: 4 8;

      animation: systemFlow 5s linear infinite;
    }

    /* --------------------------------
       Small system nodes
    -------------------------------- */

    .gears-motion .node {
      transform-box: fill-box;
      transform-origin: center;

      animation: nodePulse 2.8s ease-in-out infinite;
    }

    .gears-motion .node.blue {
      fill: #7697ad;
    }

    .gears-motion .node.red {
      fill: #a64f4f;
      animation-delay: .7s;
    }

    .gears-motion .node.gold {
      fill: #b59458;
      animation-delay: 1.4s;
    }

    /* --------------------------------
       Center labels
    -------------------------------- */

    .gears-motion .gear-label {
      fill: #252525;
      font-size: 9px;
      letter-spacing: 2px;
      pointer-events: none;
    }

    .gears-motion .main-label {
      fill: #252525;
      font-size: 16px;
      letter-spacing: 5px;
      font-weight: 500;
    }

    .gears-motion .sub-label {
      fill: #85817a;
      font-size: 8px;
      letter-spacing: 2.5px;
    }

    /* --------------------------------
       Decorative sparks
    -------------------------------- */

    .gears-motion .spark {
      fill: none;
      stroke: #252525;
      stroke-width: 1.2;
      stroke-linecap: round;

      transform-box: fill-box;
      transform-origin: center;

      animation: sparkle 3s ease-in-out infinite;
    }

    .gears-motion .spark.two {
      animation-delay: 1s;
    }

    .gears-motion .spark.three {
      animation-delay: 1.8s;
    }

    /* --------------------------------
       Animations
    -------------------------------- */

    @keyframes gearClockwise {
      from {
        transform: rotate(0deg);
      }

      to {
        transform: rotate(360deg);
      }
    }

    @keyframes gearCounterClockwise {
      from {
        transform: rotate(0deg);
      }

      to {
        transform: rotate(-360deg);
      }
    }

    @keyframes systemFlow {
      from {
        stroke-dashoffset: 0;
      }

      to {
        stroke-dashoffset: -100;
      }
    }

    @keyframes nodePulse {
      0%,
      100% {
        transform: scale(.7);
        opacity: .35;
      }

      50% {
        transform: scale(1.3);
        opacity: 1;
      }
    }

    @keyframes sparkle {
      0%,
      100% {
        transform: scale(.6);
        opacity: .15;
      }

      50% {
        transform: scale(1.4);
        opacity: 1;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .gears-motion .gear,
      .gears-motion .system-line,
      .gears-motion .node,
      .gears-motion .spark {
        animation: none;
      }
    }
  `;

  const wrapper = document.createElement("div");

  wrapper.className = "gears-motion";

  wrapper.innerHTML = `
    <svg
      viewBox="0 0 900 200"
      role="img"
      aria-label="Abstract animated engineering gears"
    >

      <!-- =================================
           SYSTEM CONNECTIONS
      ================================= -->

      <path
        class="system-line"
        d="
          M180 100
          C260 45 300 45 365 100

          M365 100
          C430 155 470 155 535 100

          M535 100
          C600 45 650 45 720 100
        "
      />


      <!-- =================================
           GEAR ONE
      ================================= -->

      <g transform="translate(300 100)">

        <g class="gear gear-one">

        <!-- Outer gear -->

        <circle
          class="tooth"
          cx="0"
          cy="0"
          r="46"
        />

        <!-- Teeth -->

        <path
          class="tooth"
          d="
            M0 -57 L0 -46
            M0 46 L0 57

            M-57 0 L-46 0
            M46 0 L57 0

            M-40 -40 L-32 -32
            M32 32 L40 40

            M40 -40 L32 -32
            M-32 32 L-40 40
          "
        />

        <!-- Inner ring -->

        <circle
          class="tooth"
          cx="0"
          cy="0"
          r="30"
        />

        <!-- Hub -->

        <circle
          class="hub"
          cx="0"
          cy="0"
          r="11"
        />

        <!-- Spokes -->

        <path
          class="tooth"
          d="
            M0 -11 L0 -30
            M0 11 L0 30
            M-11 0 L-30 0
            M11 0 L30 0
          "
        />

        </g>

      </g>


      <!-- =================================
           GEAR TWO
      ================================= -->

      <g transform="translate(450 100)">

        <g class="gear gear-two">

        <circle
          class="tooth"
          cx="0"
          cy="0"
          r="34"
        />

        <path
          class="tooth"
          d="
            M0 -44 L0 -34
            M0 34 L0 44

            M-44 0 L-34 0
            M34 0 L44 0

            M-31 -31 L-24 -24
            M24 24 L31 31

            M31 -31 L24 -24
            M-24 24 L-31 31
          "
        />

        <circle
          class="tooth"
          cx="0"
          cy="0"
          r="21"
        />

        <circle
          class="hub"
          cx="0"
          cy="0"
          r="8"
        />

        <path
          class="tooth"
          d="
            M0 -8 L0 -21
            M0 8 L0 21
            M-8 0 L-21 0
            M8 0 L21 0
          "
        />

        </g>

      </g>


      <!-- =================================
           GEAR THREE
      ================================= -->

      <g transform="translate(610 100)">

        <g class="gear gear-three">

        <circle
          class="tooth"
          cx="0"
          cy="0"
          r="43"
        />

        <path
          class="tooth"
          d="
            M0 -53 L0 -43
            M0 43 L0 53

            M-53 0 L-43 0
            M43 0 L53 0

            M-37 -37 L-30 -30
            M30 30 L37 37

            M37 -37 L30 -30
            M-30 30 L-37 37
          "
        />

        <circle
          class="tooth"
          cx="0"
          cy="0"
          r="27"
        />

        <circle
          class="hub"
          cx="0"
          cy="0"
          r="10"
        />

        <path
          class="tooth"
          d="
            M0 -10 L0 -27
            M0 10 L0 27
            M-10 0 L-27 0
            M10 0 L27 0
          "
        />

        </g>

      </g>


      <!-- =================================
           SYSTEM NODES
      ================================= -->

      <circle
        class="node blue"
        cx="180"
        cy="100"
        r="4"
      />

      <circle
        class="node red"
        cx="450"
        cy="45"
        r="4"
      />

      <circle
        class="node gold"
        cx="720"
        cy="100"
        r="4"
      />


      <!-- =================================
           Gear labels
      ================================= -->

      <text
        class="gear-label"
        x="300"
        y="105"
        text-anchor="middle"
      >
        BUILD
      </text>

      <text
        class="gear-label"
        x="450"
        y="105"
        text-anchor="middle"
      >
        SOLVE
      </text>

      <text
        class="gear-label"
        x="610"
        y="105"
        text-anchor="middle"
      >
        SHIP
      </text>


      <!-- =================================
           Decorative sparks
      ================================= -->

      <path
        class="spark"
        d="
          M220 48
          L226 54
          M226 48
          L220 54
        "
      />

      <path
        class="spark two"
        d="
          M530 150
          L536 156
          M536 150
          L530 156
        "
      />

      <path
        class="spark three"
        d="
          M690 48
          L696 54
          M696 48
          L690 54
        "
      />


      <!-- =================================
           Caption
      ================================= -->

      <text
        class="main-label"
        x="450"
        y="178"
        text-anchor="middle"
      >
        SYSTEMS IN MOTION
      </text>

      <text
        class="sub-label"
        x="450"
        y="191"
        text-anchor="middle"
      >
        THINK · BUILD · ITERATE
      </text>

    </svg>
  `;

  container.appendChild(style);
  container.appendChild(wrapper);

  return wrapper;
}
