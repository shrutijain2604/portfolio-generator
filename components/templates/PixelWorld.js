// The parallax world Level Up is set in, split into the part behind the
// content (PixelSky) and the part in front (PixelGround, carrying terrain and
// runner). Both are plain server components shipping no JavaScript: panning is
// done entirely by CSS scroll-driven animations in the template's stylesheet.
//
// Every layer is one repeating tile emitted as a data-URI SVG background
// rather than SVG elements, because background-size controls the pixel grid,
// repeat-x tiles for free, and one composited transform pans the layer. Colors
// are baked into each tile at render time, since a data URI cannot read a
// custom property, so switching palette re-renders the tiles.
//
// Art is drawn on an integer grid in art units (one unit is one pixel-art
// pixel) and scaled by --lu-px, so every layer height is an exact multiple of
// one art pixel. That plus shape-rendering="crispEdges" is the difference
// between pixel art and vector art with a retro palette applied.

// --- tile construction -------------------------------------------------

// rects: [x, y, width, height, fill] in art units.
function tile(width, height, rects) {
  const body = rects
    .map(([x, y, w, h, fill]) => `<rect x='${x}' y='${y}' width='${w}' height='${h}' fill='${fill}'/>`)
    .join("");
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' ` +
    `shape-rendering='crispEdges'>${body}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// A terrain silhouette as one rect per column, grown from the bottom of the
// tile, so a height profile reads as stepped pixel terrain instead of a
// curve. `lit` draws a narrow highlight down each rising edge, which is what
// makes a flat silhouette read as a face catching light.
function ridge(step, heights, tileHeight, fill, lit) {
  const rects = heights.map((h, i) => [i * step, tileHeight - h, step, h, fill]);
  heights.forEach((h, i) => {
    const previous = i === 0 ? 0 : heights[i - 1];
    if (h > previous) rects.push([i * step, tileHeight - h, 3, h - previous, lit]);
  });
  return rects;
}

// A circle drawn row by row, each row as wide as fits inside the radius. A
// border-radius circle would be anti-aliased and read as a modern UI dot;
// this reads as an 8-bit sun.
function disc(radius, fill) {
  const rects = [];
  for (let y = -radius; y < radius; y++) {
    const half = Math.floor(Math.sqrt(Math.max(radius * radius - (y + 0.5) * (y + 0.5), 0)));
    if (half > 0) rects.push([radius - half, radius + y, half * 2, 1, fill]);
  }
  return rects;
}

// --- layer art ---------------------------------------------------------

const MOUNTAINS = [18, 44, 82, 98, 66, 34, 58, 90];
const HILLS = [14, 28, 42, 32, 18, 30, 44, 24];

function mountainTile(fill, lit) {
  return tile(128, 104, ridge(16, MOUNTAINS, 104, fill, lit));
}

function hillTile(fill, lit) {
  return tile(128, 48, ridge(16, HILLS, 48, fill, lit));
}

// A blocky cloud: stacked runs offset from each other, never a smooth
// outline. Three clouds of different sizes spread across a wide tile, so the
// sky stays sparse and the repeat is hard to read as a repeat.
function cloudTile(fill, lit) {
  return tile(440, 32, [
    [16, 12, 56, 12, fill],
    [24, 6, 32, 6, fill],
    [8, 18, 76, 8, fill],
    [24, 6, 24, 3, lit],
    [188, 20, 40, 8, fill],
    [196, 14, 20, 6, fill],
    [196, 14, 12, 3, lit],
    [320, 14, 48, 10, fill],
    [332, 8, 24, 6, fill],
    [332, 8, 16, 3, lit],
    [312, 22, 64, 6, fill],
  ]);
}

// Platformer furniture standing on the horizon: a pipe, a crate stack and a
// floating block. Three different objects in one 320-unit tile, so the row
// reads as level geometry rather than one shape stamped over and over.
function structureTile(body, lit, deep, accent) {
  return tile(320, 40, [
    // pipe
    [10, 14, 44, 6, body],
    [10, 14, 44, 2, lit],
    [16, 20, 32, 20, body],
    [16, 20, 3, 20, lit],
    [44, 20, 4, 20, deep],
    // crate stack
    [136, 24, 24, 16, body],
    [136, 24, 24, 2, lit],
    [139, 27, 18, 10, deep],
    [145, 30, 6, 4, accent],
    [160, 30, 14, 10, body],
    [160, 30, 14, 2, lit],
    // floating block
    [248, 2, 24, 16, body],
    [248, 2, 24, 2, lit],
    [251, 5, 18, 10, deep],
    [251, 5, 3, 3, lit],
    [258, 8, 4, 4, accent],
  ]);
}

// Sparse pixel stars, only used where the sky is actually night. Fixed
// positions rather than random ones, so the sky does not reshuffle between
// the server's render and the client's.
function starTile(bright, dim) {
  const star = (x, y, c) => [
    [x + 1, y, 2, 4, c],
    [x, y + 1, 4, 2, c],
  ];
  return tile(360, 200, [
    ...star(28, 22, bright),
    ...star(196, 58, dim),
    ...star(288, 16, dim),
    [96, 92, 2, 2, bright],
    [244, 126, 2, 2, dim],
    [40, 150, 2, 2, dim],
    [330, 104, 2, 2, dim],
  ]);
}

// The terrain the runner runs on: a lit top surface, a band of soil, then
// two brick courses whose vertical joints are offset from each other, since
// the offset is what makes a repeating grid read as masonry. Exactly 24
// units tall, matching --lu-ground-h, so the courses land on whole pixels.
function groundTile(lit, soil, rock, mortar) {
  return tile(32, 24, [
    [0, 0, 32, 1, lit],
    [0, 1, 32, 3, soil],
    [0, 4, 32, 20, rock],
    [0, 4, 32, 2, mortar],
    [15, 6, 2, 8, mortar],
    [0, 14, 32, 2, mortar],
    [7, 16, 2, 8, mortar],
    [23, 16, 2, 8, mortar],
  ]);
}

// The fringe standing on the terrain's top surface, in front of everything,
// so the foreground has a silhouette of its own.
function fringeTile(fill) {
  return tile(28, 4, [
    [2, 2, 2, 2, fill],
    [6, 0, 2, 4, fill],
    [10, 3, 2, 1, fill],
    [15, 1, 2, 3, fill],
    [19, 3, 2, 1, fill],
    [24, 0, 2, 4, fill],
  ]);
}

// The runner, in two frames. Frame A has the legs split mid-stride, frame B
// has them passing under the body; the stylesheet swaps between them on a
// scroll-driven step animation, so the figure runs exactly as far as the
// visitor scrolls and stands still the moment they stop. Helmeted and
// visored on purpose: it is a player character, and nothing about it claims
// to depict the person whose portfolio this is.
function runnerFrame(frame, { suit, suitDeep, visor, boot }) {
  const torso = [
    [5, 1, 8, 5, suitDeep],
    [6, 4, 6, 3, visor],
    [4, 7, 8, 7, suit],
    [4, 14, 8, 2, suitDeep],
    [2, 8, 2, 5, suitDeep],
  ];
  const limbs =
    frame === 0
      ? [
          [12, 8, 3, 5, suit],
          [12, 12, 3, 2, suitDeep],
          [4, 16, 3, 4, suitDeep],
          [2, 20, 5, 3, boot],
          [9, 16, 3, 3, suitDeep],
          [11, 18, 3, 2, suitDeep],
          [11, 20, 5, 3, boot],
        ]
      : [
          [12, 11, 3, 4, suit],
          [1, 9, 3, 4, suit],
          [5, 16, 3, 5, suitDeep],
          [4, 21, 5, 2, boot],
          [9, 16, 3, 3, suitDeep],
          [10, 19, 3, 2, suitDeep],
          [10, 21, 5, 2, boot],
        ];
  return tile(16, 24, [...torso, ...limbs]);
}

// A flat oval under the runner's feet, exactly as wide as the sprite so it
// cannot reach outside the lane the runner is given. Pixel-art shadows are
// three stacked runs, not a blurred ellipse, so it stays in the same visual
// language as everything else here.
function shadowTile(fill) {
  return tile(16, 4, [
    [3, 0, 10, 1, fill],
    [0, 1, 16, 2, fill],
    [3, 3, 10, 1, fill],
  ]);
}

// --- components --------------------------------------------------------

// Every layer takes the same four knobs. --lu-tile is the tile's width in
// art units and --lu-art its height, both scaled to the screen by --lu-px.
// --lu-loop is how many whole tiles the layer travels over one full page
// scroll, and because a cycle is exactly one tile, the pan repeats
// seamlessly however many cycles it runs; that number alone sets a layer's
// apparent distance. --lu-z places it in real depth inside the scene's
// perspective, whose origin sits on the horizon, so a layer pushed back
// shrinks toward the horizon exactly as receding ground does.
function Layer({ art, tileWidth, artHeight, loop, z, className }) {
  return (
    <div
      className={`lu-layer ${className}`}
      style={{
        backgroundImage: art,
        "--lu-tile": tileWidth,
        "--lu-art": artHeight,
        "--lu-loop": loop,
        "--lu-z": `${z}px`,
      }}
    />
  );
}

export function PixelSky({ colors, night }) {
  const { SKY_HI, SKY_LO, LAND, LAND_DEEP, ACCENT, INK, PALETTE } = colors;
  const GOLD = PALETTE[3];

  // The scene's own tones are mixed from the terrain and the sky rather than
  // taken from the text palette, and which way the mix goes depends on the
  // hour. Under a bright sky, distance means haze, so the far range takes
  // sky *into* it and pales out. At night the horizon is the lightest part of
  // the sky, so distance means silhouette, and the far range has to go darker
  // instead: mixing it toward the sky there just made it vanish.
  const farFill = night
    ? `color-mix(in srgb, ${LAND_DEEP}, black 34%)`
    : `color-mix(in srgb, ${LAND_DEEP}, ${SKY_LO} 48%)`;
  const farLit = night
    ? `color-mix(in srgb, ${LAND}, ${SKY_LO} 30%)`
    : `color-mix(in srgb, ${LAND}, ${SKY_LO} 40%)`;
  const midFill = night ? `color-mix(in srgb, ${LAND_DEEP}, black 52%)` : `color-mix(in srgb, ${LAND_DEEP}, ${SKY_LO} 14%)`;
  const midLit = `color-mix(in srgb, ${LAND}, ${SKY_LO} 8%)`;
  // The nearest scenery is the most solid thing in the sky half of the
  // scene: a near-black body with one lit top edge, which is how a
  // platformer draws a block you could stand on.
  const nearFill = night ? `color-mix(in srgb, ${LAND_DEEP}, black 68%)` : `color-mix(in srgb, ${LAND_DEEP}, black 12%)`;
  const nearLit = `color-mix(in srgb, ${LAND}, white 22%)`;
  const nearDeep = night ? "#000000" : `color-mix(in srgb, ${LAND_DEEP}, black 46%)`;
  const cloudFill = night ? `color-mix(in srgb, ${SKY_LO}, ${INK} 22%)` : `color-mix(in srgb, ${SKY_HI}, white 70%)`;
  const cloudLit = night ? `color-mix(in srgb, ${SKY_LO}, ${INK} 40%)` : "#ffffff";
  const sunFill = night ? `color-mix(in srgb, ${INK}, ${SKY_LO} 22%)` : `color-mix(in srgb, ${GOLD}, white 26%)`;

  return (
    <div className="lu-world-slot" aria-hidden="true">
      <div className="lu-world">
        <div className="lu-sky" />

        {/* One sun or moon, at the very back of the scene, so it barely
            moves against everything else. Its own layer rather than part of
            a tiled one, because there is exactly one of it. */}
        <div className="lu-sun" style={{ backgroundImage: tile(24, 24, disc(12, sunFill)) }} />

        {night && (
          <Layer
            art={starTile(
              `color-mix(in srgb, ${INK}, ${SKY_LO} 18%)`,
              `color-mix(in srgb, ${INK}, ${SKY_LO} 56%)`
            )}
            tileWidth={360}
            artHeight={200}
            loop={1}
            z={0}
            className="lu-stars"
          />
        )}

        <Layer art={mountainTile(farFill, farLit)} tileWidth={128} artHeight={104} loop={3} z={-520} className="lu-range" />
        <Layer art={cloudTile(cloudFill, cloudLit)} tileWidth={440} artHeight={32} loop={3} z={0} className="lu-cloud-far" />
        <Layer art={hillTile(midFill, midLit)} tileWidth={128} artHeight={48} loop={6} z={-300} className="lu-hills" />
        <Layer art={cloudTile(cloudFill, cloudLit)} tileWidth={440} artHeight={32} loop={5} z={0} className="lu-cloud-near" />
        <Layer
          art={structureTile(nearFill, nearLit, nearDeep, ACCENT)}
          tileWidth={320}
          artHeight={40}
          loop={4}
          z={-100}
          className="lu-structures"
        />

        {/* Haze on the horizon, so the far layers settle into the sky
            instead of ending on a hard edge against it. */}
        <div className="lu-haze" />
      </div>
    </div>
  );
}

export function PixelGround({ colors }) {
  const { LAND, LAND_DEEP, ACCENT, POP } = colors;

  const lit = `color-mix(in srgb, ${LAND}, white 14%)`;
  const mortar = `color-mix(in srgb, ${LAND_DEEP}, black 32%)`;
  const runner = {
    suit: ACCENT,
    suitDeep: `color-mix(in srgb, ${ACCENT}, black 44%)`,
    visor: POP,
    boot: `color-mix(in srgb, ${ACCENT}, black 64%)`,
  };

  // Terrain and runner both sit in front of the content: content being cut
  // off by the floor is the composition, and the runner is the one thing on
  // the page that has to stay visible the whole way down. The content column
  // keeps a lane clear on the left for it to run in, so being in front never
  // means being on top of a sentence. See --lu-lane in LevelUpTemplate.js.
  return (
    <div className="lu-fg-slot" aria-hidden="true">
      <div className="lu-fg">
        <Layer
          art={groundTile(lit, LAND, LAND_DEEP, mortar)}
          tileWidth={32}
          artHeight={24}
          loop={44}
          z={0}
          className="lu-ground"
        />
        <Layer art={fringeTile(lit)} tileWidth={28} artHeight={4} loop={68} z={0} className="lu-fringe" />

        <div className="lu-runner">
          <div className="lu-runner-shadow" style={{ backgroundImage: shadowTile(mortar) }} />
          <div className="lu-runner-frame lu-runner-a" style={{ backgroundImage: runnerFrame(0, runner) }} />
          <div className="lu-runner-frame lu-runner-b" style={{ backgroundImage: runnerFrame(1, runner) }} />
        </div>
      </div>
    </div>
  );
}
