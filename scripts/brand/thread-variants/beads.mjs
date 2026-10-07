/**
 * Beads: the people on the thread. A bead is a solid dot or a hollow ring;
 * either way it cuts a knockout round itself out of every line it sits on,
 * so a thin ring of ground parts bead from line in every colourway.
 */
import { bowlLine, circle, distanceBetween, ring } from "../logo-geometry.mjs";
import { bowlStrand, circleCutout } from "./strands.mjs";

/** How far along the bowl (clockwise from three o'clock) a parameter is.
 *  The traced bowl is sampled evenly in its parameter, so this is a lookup. */
function bowlDistanceOf(parameter) {
  const samples = bowlLine.points.length - 1;
  const turns = (((parameter / (Math.PI * 2)) % 1) + 1) % 1;
  return bowlLine.lengths[Math.round(turns * samples) % samples];
}

/**
 * Places beads from their specs, in order. A bead `at` a number sits on the
 * bowl at that parameter (clockwise on screen from three o'clock); a bead
 * with `after` sits that far further along the bowl than the bead before it
 * (centre to centre, measured along the line); a bead `at: "tip"` sits on
 * the end of `tail`. `kind` is "solid" (the default) or "ring".
 */
export function placeBeads(specs, tail) {
  let bowlDistance = 0;
  return specs.map(({ at, after, kind = "solid", radius, wall, tone }) => {
    let centre;
    if (at === "tip") {
      centre = tail.pointAt(tail.total);
    } else {
      bowlDistance =
        after === undefined ? bowlDistanceOf(at) : bowlDistance + after;
      centre = bowlStrand.pointAt(bowlDistance);
    }
    return kind === "ring"
      ? ringBead(centre, radius, wall, tone)
      : solidBead(centre, radius, tone);
  });
}

/** A solid bead: a dot of `radius`. */
export function solidBead(centre, radius, tone) {
  return {
    shapes: [circle(centre, radius, tone)],
    centre,
    outerRadius: radius,
  };
}

/** A hollow bead: a ring whose outer edge is at `radius`, `wall` thick.
 *  Its hole shows the ground, since the knockout clears the line inside. */
export function ringBead(centre, radius, wall, tone) {
  return {
    shapes: [ring(centre, radius - wall / 2, wall, tone)],
    centre,
    outerRadius: radius,
  };
}

/** Threads beads onto lines: each line loses a knockout round each bead,
 *  `gap` wider than the bead. A `gap` of 0 lays the beads straight on the
 *  line (the small cuts, where the coral bead caps the tail's end). Returns
 *  the beads' own shapes. */
export function threadBeads(lineShapes, beads, gap) {
  if (gap <= 0) return beads.flatMap((bead) => bead.shapes);
  const knockouts = beads.map((bead) =>
    circleCutout(bead.centre, bead.outerRadius + gap),
  );
  // Two beads whose knockouts overlap would leave a splinter of line at the
  // edges of the overlap; a third cutout between them clears it.
  beads.forEach((bead, beadIndex) => {
    beads.slice(beadIndex + 1).forEach((other) => {
      const reach = bead.outerRadius + other.outerRadius + 2 * gap;
      if (distanceBetween(bead.centre, other.centre) >= reach) return;
      knockouts.push(
        circleCutout(
          {
            x: (bead.centre.x + other.centre.x) / 2,
            y: (bead.centre.y + other.centre.y) / 2,
          },
          (Math.max(bead.outerRadius, other.outerRadius) + gap) * 1.25,
        ),
      );
    });
  });
  for (const line of lineShapes) {
    line.cutouts = line.cutouts ?? [];
    line.cutouts.push(...knockouts);
  }
  return beads.flatMap((bead) => bead.shapes);
}
