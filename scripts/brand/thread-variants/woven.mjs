/** thread-woven: the bowl as a loop of thread that laps over its own
 *  start, and the tail laid over the bowl, all inside the letter. */
import { HEARTH_CENTRE, circle } from "../logo-geometry.mjs";
import { placeBeads, threadBeads } from "./beads.mjs";
import { wovenLine } from "./weave.mjs";

export const WOVEN_DEFAULTS = {
  halfWidth: 38,
  tipHalfWidth: 18,
  gap: 17,
  beadGap: 11,
  loop: { endParameter: 4.5, lap: 0.6 },
  tailFrom: 26,
  beads: [
    { at: "tip", radius: 52, tone: "accent" },
    { at: 2.45, radius: 47, tone: "ink" },
    { at: 5.75, radius: 47, tone: "ink" },
  ],
  hearthRadius: 64,
};

export function buildWoven(options = WOVEN_DEFAULTS) {
  const line = wovenLine({
    loop: options.loop,
    halfWidth: options.halfWidth,
    tipHalfWidth: options.tipHalfWidth,
    tailFrom: options.tailFrom,
    gap: options.gap,
  });
  const beads = placeBeads(options.beads, line.tail);
  return [
    ...line.lineShapes,
    ...threadBeads(line.lineShapes, beads, options.beadGap),
    circle(HEARTH_CENTRE, options.hearthRadius, "hearth"),
  ];
}

export const woven = {
  id: "thread-woven",
  centring: "enclosing",
  build: () => buildWoven(),
  buildSmall: () =>
    buildWoven({
      ...WOVEN_DEFAULTS,
      halfWidth: 56,
      gap: 0,
      beadGap: 0,
      tailFrom: 80,
      beads: [{ at: "tip", radius: 84, tone: "accent" }],
      hearthRadius: 62,
    }),
};
