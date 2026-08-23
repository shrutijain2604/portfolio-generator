// thoughts.js

export function createThoughts(container) {
  if (!container) {
    throw new Error("Thoughts animation container not found.");
  }

  const style = document.createElement("style");

  style.textContent = `
    .thoughts-motion {
      width: 100%;
      min-height: 210px;
      display: grid;
      place-items: center;
      overflow: hidden;
      background: transparent;
      font-family: Arial, Helvetica, sans-serif;
    }

    .thoughts-motion svg {
      width: min(900px, 94%);
      height: 200px;
      overflow: visible;
    }

    /* --------------------------------
       Connecting dotted path
    -------------------------------- */

    .thoughts-motion .connection {
      fill: none;
      stroke: #d6d1c8;
      stroke-width: 1.2;
      stroke-dasharray: 4 9;

      animation:
        connectionMove 5s linear infinite;
    }

    /* --------------------------------
       Thought bubbles
    -------------------------------- */

    .thoughts-motion .bubble {
      cursor: pointer;

      transform-box: fill-box;
      transform-origin: center;

      animation:
        bubbleFloat 5s ease-in-out infinite;

      transition:
        transform .35s ease;
    }

    .thoughts-motion .bubble:nth-of-type(2) {
      animation-delay: .8s;
    }

    .thoughts-motion .bubble:nth-of-type(3) {
      animation-delay: 1.6s;
    }

    /* Bubble circles */

    .thoughts-motion .bubble-circle {
      fill: #fdfcf9;
      stroke-width: 1.7;

      transition:
        fill .3s ease,
        stroke-width .3s ease;
    }

    .thoughts-motion .idea .bubble-circle {
      stroke: #b59458;
    }

    .thoughts-motion .make .bubble-circle {
      stroke: #7697ad;
    }

    .thoughts-motion .play .bubble-circle {
      stroke: #a64f4f;
    }

    /* --------------------------------
       Bubble hover
    -------------------------------- */

    @media (hover: hover) {

      .thoughts-motion .bubble:hover {
        animation-play-state: paused;
        transform: scale(1.12);
      }

      .thoughts-motion .bubble:hover .bubble-circle {
        stroke-width: 2.5;
      }

      .thoughts-motion .bubble:hover .bubble-text {
        letter-spacing: 5px;
      }
    }

    /* --------------------------------
       Bubble tails
    -------------------------------- */

    .thoughts-motion .tail {
      fill: #fdfcf9;
      stroke-width: 1.5;
    }

    .thoughts-motion .idea .tail {
      stroke: #b59458;
    }

    .thoughts-motion .make .tail {
      stroke: #7697ad;
    }

    .thoughts-motion .play .tail {
      stroke: #a64f4f;
    }

    /* --------------------------------
       Bubble text
    -------------------------------- */

    .thoughts-motion .bubble-text {
      fill: #252525;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 3px;

      transition:
        letter-spacing .3s ease;
    }

    .thoughts-motion .small-text {
      fill: #85817a;
      font-size: 8px;
      letter-spacing: 2px;
    }

    /* --------------------------------
       Tiny dots inside bubbles
    -------------------------------- */

    .thoughts-motion .bubble-dot {
      transform-box: fill-box;
      transform-origin: center;

      animation:
        bubbleDot 2.5s ease-in-out infinite;
    }

    .thoughts-motion .bubble-dot:nth-child(2) {
      animation-delay: .4s;
    }

    .thoughts-motion .bubble-dot:nth-child(3) {
      animation-delay: .8s;
    }

    .thoughts-motion .bubble-dot.blue {
      fill: #7697ad;
    }

    .thoughts-motion .bubble-dot.red {
      fill: #a64f4f;
    }

    .thoughts-motion .bubble-dot.gold {
      fill: #b59458;
    }

    /* --------------------------------
       Decorative sparkles
    -------------------------------- */

    .thoughts-motion .spark {
      fill: none;
      stroke: #252525;
      stroke-width: 1.2;
      stroke-linecap: round;

      transform-box: fill-box;
      transform-origin: center;

      animation:
        sparkle 3s ease-in-out infinite;
    }

    .thoughts-motion .spark.two {
      animation-delay: 1s;
    }

    .thoughts-motion .spark.three {
      animation-delay: 1.8s;
    }

    /* --------------------------------
       Floating particles
    -------------------------------- */

    .thoughts-motion .particle {
      animation:
        particleFloat 4s ease-in-out infinite;
    }

    .thoughts-motion .particle.blue {
      fill: #7697ad;
    }

    .thoughts-motion .particle.red {
      fill: #a64f4f;
    }

    .thoughts-motion .particle.gold {
      fill: #b59458;
    }

    /* --------------------------------
       Bottom statement
    -------------------------------- */

    .thoughts-motion .caption {
      fill: #77736c;
      font-size: 9px;
      letter-spacing: 3px;
    }

    /* --------------------------------
       Animations
    -------------------------------- */

    @keyframes bubbleFloat {
      0%,
      100% {
        transform: translateY(5px) rotate(-1deg);
      }

      50% {
        transform: translateY(-9px) rotate(1deg);
      }
    }

    @keyframes connectionMove {
      from {
        stroke-dashoffset: 0;
      }

      to {
        stroke-dashoffset: -100;
      }
    }

    @keyframes bubbleDot {
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
        transform: scale(.6) rotate(0deg);
        opacity: .15;
      }

      50% {
        transform: scale(1.3) rotate(20deg);
        opacity: 1;
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
        opacity: .7;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .thoughts-motion .connection,
      .thoughts-motion .bubble,
      .thoughts-motion .bubble-dot,
      .thoughts-motion .spark,
      .thoughts-motion .particle {
        animation: none;
      }
    }
  `;

  const wrapper = document.createElement("div");

  wrapper.className = "thoughts-motion";

  wrapper.innerHTML = `
    <svg
      viewBox="0 0 900 200"
      role="img"
      aria-label="Floating ideas animation"
    >

      <!-- =================================
           Connecting path
      ================================== -->

      <path
        class="connection"
        d="
          M210 93
          C300 40 350 145 450 82
          C550 25 610 150 690 93
        "
      />


      <!-- =================================
           IDEA
      ================================== -->

      <g class="bubble idea">

        <circle
          class="bubble-circle"
          cx="210"
          cy="82"
          r="42"
        />

        <!-- Tail -->

        <path
          class="tail"
          d="
            M182 111
            L169 128
            L195 118
          "
        />

        <!-- Text -->

        <text
          class="bubble-text"
          x="210"
          y="86"
          text-anchor="middle"
        >
          IDEA
        </text>

        <!-- Small dots -->

        <circle
          class="bubble-dot gold"
          cx="187"
          cy="62"
          r="2.5"
        />

        <circle
          class="bubble-dot gold"
          cx="232"
          cy="104"
          r="2.5"
        />

        <circle
          class="bubble-dot gold"
          cx="238"
          cy="60"
          r="2.5"
        />

      </g>


      <!-- =================================
           MAKE
      ================================== -->

      <g class="bubble make">

        <circle
          class="bubble-circle"
          cx="450"
          cy="72"
          r="51"
        />

        <!-- Tail -->

        <path
          class="tail"
          d="
            M414 110
            L398 132
            L429 119
          "
        />

        <!-- Text -->

        <text
          class="bubble-text"
          x="450"
          y="77"
          text-anchor="middle"
        >
          MAKE
        </text>

        <!-- Small dots -->

        <circle
          class="bubble-dot blue"
          cx="416"
          cy="48"
          r="2.5"
        />

        <circle
          class="bubble-dot blue"
          cx="486"
          cy="52"
          r="2.5"
        />

        <circle
          class="bubble-dot blue"
          cx="480"
          cy="101"
          r="2.5"
        />

      </g>


      <!-- =================================
           PLAY
      ================================== -->

      <g class="bubble play">

        <circle
          class="bubble-circle"
          cx="690"
          cy="92"
          r="38"
        />

        <!-- Tail -->

        <path
          class="tail"
          d="
            M714 119
            L728 135
            L701 127
          "
        />

        <!-- Text -->

        <text
          class="bubble-text"
          x="690"
          y="96"
          text-anchor="middle"
        >
          PLAY
        </text>

        <!-- Small dots -->

        <circle
          class="bubble-dot red"
          cx="667"
          cy="72"
          r="2.5"
        />

        <circle
          class="bubble-dot red"
          cx="712"
          cy="109"
          r="2.5"
        />

        <circle
          class="bubble-dot red"
          cx="716"
          cy="72"
          r="2.5"
        />

      </g>


      <!-- =================================
           Decorative sparkles
      ================================== -->

      <path
        class="spark"
        d="
          M105 53
          L111 59
          M111 53
          L105 59
        "
      />

      <path
        class="spark two"
        d="
          M355 128
          L361 134
          M361 128
          L355 134
        "
      />

      <path
        class="spark three"
        d="
          M790 53
          L796 59
          M796 53
          L790 59
        "
      />


      <!-- =================================
           Floating particles
      ================================== -->

      <circle
        class="particle gold"
        cx="145"
        cy="112"
        r="3"
      />

      <circle
        class="particle blue"
        cx="570"
        cy="42"
        r="3"
        style="animation-delay: 1s"
      />

      <circle
        class="particle red"
        cx="770"
        cy="135"
        r="3"
        style="animation-delay: 2s"
      />


      <!-- =================================
           Caption
      ================================== -->

      <text
        class="caption"
        x="450"
        y="180"
        text-anchor="middle"
      >
        ALWAYS MAKING SOMETHING
      </text>

    </svg>
  `;

  container.appendChild(style);
  container.appendChild(wrapper);

  return wrapper;
}
