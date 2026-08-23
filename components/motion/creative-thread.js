// creative-thread.js

export function createCreativeThread(container) {
  if (!container) {
    throw new Error("Creative Thread container not found.");
  }

  const style = document.createElement("style");

  style.textContent = `
    .creative-thread-motion {
      width: 100%;
      min-height: 190px;
      display: grid;
      place-items: center;
      overflow: hidden;
      background: transparent;
      font-family: Arial, Helvetica, sans-serif;
    }

    .creative-thread-motion svg {
      width: min(900px, 94%);
      height: 180px;
      overflow: visible;
    }

    /* --------------------------------
       Main hand-drawn connecting line
    -------------------------------- */

    .creative-thread-motion .thread-line {
      fill: none;
      stroke: #252525;
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;

      stroke-dasharray: 920;
      stroke-dashoffset: 920;

      animation:
        threadDraw 6s ease-in-out infinite;
    }

    /* Faint background version */

    .creative-thread-motion .ghost-line {
      fill: none;
      stroke: #ddd8cf;
      stroke-width: 1;
      stroke-linecap: round;

      stroke-dasharray: 6 10;

      animation:
        ghostFloat 5s ease-in-out infinite;
    }

    /* --------------------------------
       Nodes
    -------------------------------- */

    .creative-thread-motion .node {
      fill: #fdfcf9;
      stroke-width: 1.8;

      transform-box: fill-box;
      transform-origin: center;

      animation:
        nodePulse 3s ease-in-out infinite;
    }

    .creative-thread-motion .build-node {
      stroke: #7697ad;
    }

    .creative-thread-motion .move-node {
      stroke: #a64f4f;
      animation-delay: .8s;
    }

    .creative-thread-motion .frame-node {
      stroke: #b59458;
      animation-delay: 1.6s;
    }

    /* --------------------------------
       Icons
    -------------------------------- */

    .creative-thread-motion .icon {
      fill: none;
      stroke: #252525;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    /* --------------------------------
       Labels
    -------------------------------- */

    .creative-thread-motion .role-label {
      fill: #77736c;

      font-size: 10px;
      letter-spacing: 3px;
      text-transform: uppercase;

      transition:
        letter-spacing .3s ease,
        fill .3s ease;
    }

    .creative-thread-motion .main-label {
      fill: #252525;

      font-size: 17px;
      font-weight: 500;

      letter-spacing: 4px;
    }

    .creative-thread-motion .sub-label {
      fill: #99958d;

      font-size: 8px;
      letter-spacing: 2.5px;
    }

    /* --------------------------------
       Floating creative particles
    -------------------------------- */

    .creative-thread-motion .particle {
      transform-box: fill-box;
      transform-origin: center;

      animation:
        particleFloat 4s ease-in-out infinite;
    }

    .creative-thread-motion .particle.blue {
      fill: #7697ad;
    }

    .creative-thread-motion .particle.red {
      fill: #a64f4f;
    }

    .creative-thread-motion .particle.gold {
      fill: #b59458;
    }

    /* --------------------------------
       Decorative sparks
    -------------------------------- */

    .creative-thread-motion .spark {
      fill: none;
      stroke: #252525;
      stroke-width: 1.2;
      stroke-linecap: round;

      transform-box: fill-box;
      transform-origin: center;

      animation:
        sparkle 2.8s ease-in-out infinite;
    }

    .creative-thread-motion .spark.two {
      animation-delay: 1s;
    }

    .creative-thread-motion .spark.three {
      animation-delay: 1.8s;
    }

    /* --------------------------------
       BUILD icon animation
    -------------------------------- */

    .creative-thread-motion .build-icon {
      animation:
        buildFloat 3s ease-in-out infinite;
    }

    /* --------------------------------
       MOVE icon animation
    -------------------------------- */

    .creative-thread-motion .move-icon {
      transform-box: fill-box;
      transform-origin: center;

      animation:
        dancerMove 3.5s ease-in-out infinite;
    }

    /* --------------------------------
       FRAME icon animation
    -------------------------------- */

    .creative-thread-motion .frame-icon {
      transform-box: fill-box;
      transform-origin: center;

      animation:
        shutterSpin 5s linear infinite;
    }

    /* --------------------------------
       BUILD → MOVE → FRAME
    -------------------------------- */

    @keyframes threadDraw {
      0% {
        stroke-dashoffset: 920;
      }

      12% {
        stroke-dashoffset: 920;
      }

      50% {
        stroke-dashoffset: 0;
      }

      72% {
        stroke-dashoffset: 0;
      }

      100% {
        stroke-dashoffset: -920;
      }
    }

    @keyframes ghostFloat {
      0%,
      100% {
        transform: translateY(0);
      }

      50% {
        transform: translateY(-5px);
      }
    }

    @keyframes nodePulse {
      0%,
      100% {
        transform: scale(.92);
      }

      50% {
        transform: scale(1.08);
      }
    }

    @keyframes particleFloat {
      0%,
      100% {
        transform: translateY(5px);
        opacity: .2;
      }

      50% {
        transform: translateY(-10px);
        opacity: .8;
      }
    }

    @keyframes sparkle {
      0%,
      100% {
        transform: scale(.6);
        opacity: .15;
      }

      50% {
        transform: scale(1.35);
        opacity: 1;
      }
    }

    @keyframes buildFloat {
      0%,
      100% {
        transform: translateY(2px);
      }

      50% {
        transform: translateY(-4px);
      }
    }

    @keyframes dancerMove {
      0%,
      100% {
        transform: rotate(-4deg) translateY(2px);
      }

      50% {
        transform: rotate(4deg) translateY(-4px);
      }
    }

    @keyframes shutterSpin {
      from {
        transform: rotate(0deg);
      }

      to {
        transform: rotate(360deg);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .creative-thread-motion .thread-line,
      .creative-thread-motion .ghost-line,
      .creative-thread-motion .node,
      .creative-thread-motion .particle,
      .creative-thread-motion .spark,
      .creative-thread-motion .build-icon,
      .creative-thread-motion .move-icon,
      .creative-thread-motion .frame-icon {
        animation: none;
      }

      .creative-thread-motion .thread-line {
        stroke-dashoffset: 0;
      }
    }
  `;

  const wrapper = document.createElement("div");

  wrapper.className = "creative-thread-motion";

  wrapper.innerHTML = `
    <svg
      viewBox="0 0 900 190"
      role="img"
      aria-label="Animated creative thread connecting build, move and frame"
    >

      <!-- ==================================
           Background ghost line
      =================================== -->

      <path
        class="ghost-line"
        d="
          M45 93
          C135 25
          210 155
          300 83
          S435 35
          510 94
          S625 150
          710 78
          S830 38
          855 92
        "
      />


      <!-- ==================================
           Main connecting thread
      =================================== -->

      <path
        class="thread-line"
        d="
          M45 93
          C135 25
          210 155
          300 83
          S435 35
          510 94
          S625 150
          710 78
          S830 38
          855 92
        "
      />


      <!-- ==================================
           BUILD
      =================================== -->

      <g class="build-icon">

        <circle
          class="node build-node"
          cx="300"
          cy="83"
          r="29"
        />

        <!-- Code brackets -->

        <path
          class="icon"
          d="
            M291 70
            L280 83
            L291 96
          "
        />

        <path
          class="icon"
          d="
            M309 70
            L320 83
            L309 96
          "
        />

        <!-- Slash -->

        <path
          class="icon"
          d="
            M304 68
            L296 98
          "
        />

      </g>


      <text
        class="role-label"
        x="300"
        y="128"
        text-anchor="middle"
      >
        BUILD
      </text>


      <!-- ==================================
           MOVE
      =================================== -->

      <g class="move-icon">

        <circle
          class="node move-node"
          cx="510"
          cy="94"
          r="29"
        />

        <!-- Head -->

        <circle
          class="icon"
          cx="510"
          cy="77"
          r="5"
        />

        <!-- Body -->

        <path
          class="icon"
          d="
            M510 82
            C505 91
            499 98
            490 103
          "
        />

        <!-- Other leg -->

        <path
          class="icon"
          d="
            M510 82
            C516 91
            523 98
            532 103
          "
        />

        <!-- Left arm -->

        <path
          class="icon"
          d="
            M506 87
            C496 84
            490 79
            486 73
          "
        />

        <!-- Right arm -->

        <path
          class="icon"
          d="
            M514 87
            C524 85
            531 80
            535 73
          "
        />

      </g>


      <text
        class="role-label"
        x="510"
        y="139"
        text-anchor="middle"
      >
        MOVE
      </text>


      <!-- ==================================
           FRAME
      =================================== -->

      <g class="frame-icon">

        <circle
          class="node frame-node"
          cx="710"
          cy="78"
          r="29"
        />

        <!-- Camera shutter -->

        <circle
          class="icon"
          cx="710"
          cy="78"
          r="20"
        />

        <path
          class="icon"
          d="
            M710 62
            L720 75
            L708 79
            L700 67
            Z
          "
        />

        <path
          class="icon"
          d="
            M725 78
            L713 88
            L710 76
            L720 69
            Z
          "
        />

        <path
          class="icon"
          d="
            M710 94
            L700 81
            L712 78
            L720 90
            Z
          "
        />

        <circle
          class="icon"
          cx="710"
          cy="78"
          r="4"
        />

      </g>


      <text
        class="role-label"
        x="710"
        y="123"
        text-anchor="middle"
      >
        FRAME
      </text>


      <!-- ==================================
           Floating particles
      =================================== -->

      <circle
        class="particle blue"
        cx="145"
        cy="58"
        r="3"
      />

      <circle
        class="particle red"
        cx="405"
        cy="48"
        r="3"
        style="animation-delay:.8s"
      />

      <circle
        class="particle gold"
        cx="610"
        cy="53"
        r="3"
        style="animation-delay:1.5s"
      />

      <circle
        class="particle blue"
        cx="825"
        cy="125"
        r="3"
        style="animation-delay:2.2s"
      />


      <!-- ==================================
           Decorative sparks
      =================================== -->

      <path
        class="spark"
        d="
          M100 135
          L106 141
          M106 135
          L100 141
        "
      />

      <path
        class="spark two"
        d="
          M420 125
          L426 131
          M426 125
          L420 131
        "
      />

      <path
        class="spark three"
        d="
          M805 48
          L811 54
          M811 48
          L805 54
        "
      />


      <!-- ==================================
           Main statement
      =================================== -->

      <text
        class="main-label"
        x="450"
        y="174"
        text-anchor="middle"
      >
        BUILD → MOVE → FRAME
      </text>

      <text
        class="sub-label"
        x="450"
        y="187"
        text-anchor="middle"
      >
        MANY SIDES · ONE STORY
      </text>

    </svg>
  `;

  container.appendChild(style);
  container.appendChild(wrapper);

  return wrapper;
}
