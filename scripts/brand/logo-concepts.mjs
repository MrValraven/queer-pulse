/**
 * The three Q logo concepts shown on /admin/logo-concepts, as static SVGs.
 *
 * Each concept turns the Q of the sign-in network art into a flat mark for
 * social avatars: people (round nodes) along the letter, a coral hearth in
 * its counter. The letter is the brand serif's own Q (Fraunces Variable,
 * weight 600), traced once in Chromium at a 700px font size and reduced to a
 * centre line: an ellipse through the middle of the bowl's stroke and a
 * two-segment curve through the middle of the tail. Those numbers live below
 * as constants, so this script needs no browser and no font.
 *
 * Output: public/brand/logo-concepts/<concept>-<colorway>.svg, nine files,
 * each a 1024 square with literal hex colours (a logo keeps its colours in
 * both themes). Every mark is scaled to sit inside the circle-crop safe zone,
 * and the script stops with an error if any shape would leave it.
 *
 * The shared geometry, placement and SVG writer live in logo-geometry.mjs.
 *
 * Run: node scripts/brand/logo-concepts.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import {
  COLORWAYS,
  HEARTH_CENTRE,
  OUTPUT_DIRECTORY,
  TRACED_Q,
  assertInsideSafeZone,
  bowlPointsFromCrossing,
  circle,
  crossing,
  markSvg,
  placement,
  ring,
  stressAt,
  tailCubicsBetween,
  tailLine,
  tailPointAt,
} from "./logo-geometry.mjs";

/* -------------------------------------------------------------------------- */
/* The three concepts (in letter coordinates; placed on the canvas later)     */
/* -------------------------------------------------------------------------- */

/** Constellation: the sign-in art made flat. Small people along the whole
 *  letter, threaded node to node, sized by the serif's stress. */
function buildConstellation() {
  const bowlCount = 13;
  const sizes = { small: 27, medium: 33, large: 40 };
  const bowlNodes = bowlPointsFromCrossing(bowlCount).map((point) => {
    const stress = stressAt(point);
    const radius =
      stress > 0.66 ? sizes.large : stress > 0.3 ? sizes.medium : sizes.small;
    return { ...point, radius, tone: "ink" };
  });
  bowlNodes[0].radius = sizes.medium;
  // One person inside the counter and three out along the tail, spaced by
  // eye for even gaps (the tail's upturn bunches the last two).
  const innerNodes = [
    {
      ...tailPointAt(crossing.tailDistance - 90),
      radius: sizes.medium,
      tone: "ink",
    },
  ];
  const outerLength = tailLine.total - crossing.tailDistance;
  const outerNodes = [
    { fraction: 0.35, radius: sizes.small },
    { fraction: 0.66, radius: sizes.small },
    { fraction: 1, radius: sizes.small },
  ].map(({ fraction, radius }) => ({
    ...tailPointAt(crossing.tailDistance + fraction * outerLength),
    radius,
    tone: "ink",
  }));
  // A few people take the accent, as in the art: coral at the tail's tip and
  // two on the bowl, jade on one bowl node and one inside the counter. The
  // two bowl corals sit off any line through the hearth, so no coral bar
  // forms across the letter.
  outerNodes[2].tone = "accent";
  bowlNodes[3].tone = "accent";
  bowlNodes[8].tone = "accent";
  bowlNodes[5].tone = "jade";
  innerNodes[0].tone = "jade";
  const threadWidth = 18;
  // Thinner than the threads, so ring and dot stay apart at avatar sizes.
  const hearthRingWidth = 12;
  const threads = [
    // The bowl's thread follows the letter's smooth curve; the tail's runs
    // straight from person to person.
    {
      kind: "ellipse",
      ...TRACED_Q.bowl,
      x: 0,
      y: 0,
      strokeWidth: threadWidth,
      tone: "ink",
    },
    {
      kind: "polyline",
      points: [...innerNodes, bowlNodes[0], ...outerNodes],
      strokeWidth: threadWidth,
      tone: "ink",
    },
  ];
  const nodes = [...bowlNodes, ...innerNodes, ...outerNodes].map((node) =>
    circle(node, node.radius, node.tone),
  );
  return [
    ...threads,
    ...nodes,
    ring(HEARTH_CENTRE, 66, hearthRingWidth, "hearth"),
    circle(HEARTH_CENTRE, 42, "hearth"),
  ];
}

/** Thread: one bold monoline Q, with a few people strung on it as beads.
 *  The line leads: five beads on the bowl, set so the crossing falls
 *  midway between two of them, leave long unbroken runs, and the tail runs
 *  unbroken from inside the counter, across the bowl, to a coral bead at
 *  its tip. A thin knockout ring parts each bead from the line. */
function buildThread() {
  const strokeWidth = 78;
  const beadRadius = 53;
  const knockoutGap = 11;
  const tailStartDistance = 26;
  const bowlBeads = bowlPointsFromCrossing(5, 0.5).map((point) =>
    circle(point, beadRadius, "ink"),
  );
  const tipBead = circle(tailPointAt(tailLine.total), beadRadius, "accent");
  // The coral bead sits upper right, off the line from the coral tip
  // through the hearth, so no coral slash crosses the letter.
  bowlBeads[3].tone = "accent";
  const beads = [...bowlBeads, tipBead];
  const knockouts = beads.map((bead) => ({
    x: bead.x,
    y: bead.y,
    radius: beadRadius + knockoutGap,
  }));
  return [
    {
      kind: "ellipse",
      ...TRACED_Q.bowl,
      x: 0,
      y: 0,
      strokeWidth,
      tone: "ink",
      knockouts,
    },
    {
      kind: "cubicPath",
      cubics: tailCubicsBetween(tailStartDistance, tailLine.total),
      strokeWidth,
      tone: "ink",
      knockouts,
    },
    ...beads,
    circle(HEARTH_CENTRE, 64, "hearth"),
  ];
}

/** Hearth: the boldest. A ring of nine large dots for the bowl, a coral
 *  hearth with open space round it, and the tail stepping out in two dots
 *  that carry on the ring's curve at four to five o'clock. */
function buildHearth() {
  const bowlDots = bowlPointsFromCrossing(9).map((point) => ({
    ...point,
    radius: 50 + 8 * stressAt(point),
  }));
  const [anchor] = bowlDots;
  const tailAngle = (30 * Math.PI) / 180;
  const tailPitch = 118;
  const tailDots = [
    { radius: 50, tone: "ink" },
    { radius: 44, tone: "accent" },
  ].map(({ radius, tone }, dotIndex) =>
    circle(
      {
        x: anchor.x + Math.cos(tailAngle) * tailPitch * (dotIndex + 1),
        y: anchor.y + Math.sin(tailAngle) * tailPitch * (dotIndex + 1),
      },
      radius,
      tone,
    ),
  );
  return [
    ...bowlDots.map((dot) => circle(dot, dot.radius, "ink")),
    ...tailDots,
    circle(HEARTH_CENTRE, 72, "hearth"),
  ];
}

/** Each concept and how it is centred. The dotted marks use "bounds" (the
 *  box round the ink): the smallest enclosing circle pushed their dots up
 *  and to the left. Thread uses "enclosing" (the smallest circle, pulled to
 *  the bowl): its ink balances about as well either way (centroid 4,-13
 *  against -4,14 from the box), and the circle lets it draw about 3% larger
 *  (scale 1.046 against 1.014). */
const CONCEPTS = {
  constellation: { build: buildConstellation, centring: "bounds" },
  thread: { build: buildThread, centring: "enclosing" },
  hearth: { build: buildHearth, centring: "bounds" },
};

await mkdir(OUTPUT_DIRECTORY, { recursive: true });
for (const [conceptId, { build, centring }] of Object.entries(CONCEPTS)) {
  const shapes = build();
  const placed = placement(shapes, centring);
  const reach = assertInsideSafeZone(conceptId, shapes, placed);
  for (const colorway of Object.keys(COLORWAYS)) {
    const fileName = `${conceptId}-${colorway}.svg`;
    await writeFile(
      new URL(fileName, OUTPUT_DIRECTORY),
      markSvg(conceptId, shapes, placed, colorway),
    );
  }
  console.log(
    `${conceptId}: scale ${placed.scale.toFixed(3)}, reach ${reach.toFixed(1)}px`,
  );
}
