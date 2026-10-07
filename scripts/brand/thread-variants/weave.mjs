/**
 * The woven thread of thread-woven: the bowl as a loop of thread that runs
 * once round and laps over its own start, and the tail laid over the bowl
 * low on the right. Wherever one run lies on another, the run on top cuts a
 * gap (in the ground colour, by a clip) out of the run beneath, so the
 * over-under reads in mono too. The bowl's closing run passes under the
 * tail, then over its own start, and all of it stays inside the letter: the
 * closing run's end narrows against the bowl's outer edge as it lies along
 * the opening run, so it shows as a tongue with a round tip, parted from the
 * run beneath by one gap line, within the stroke.
 */
import {
  crossingsOf,
  gapCutout,
  gapReach,
  lappedBowlStrand,
  outlineShape,
  smoothStep,
  strandBetween,
  strandFrom,
  tailStrand,
} from "./strands.mjs";

/**
 * Builds the woven line. Options:
 * - `loop`: lappedBowlStrand options (where the bowl laps itself).
 * - `halfWidth`: the line's even half width.
 * - `tipHalfWidth`: the half width the closing run narrows to at its tip.
 * - `tailFrom`: where the tail starts inside the counter (distance along it).
 * - `gap`: the ground left round a run on top; 0 draws the line solid (for
 *   the small cut, where a gap would break the letter).
 * Returns the line shapes (to which beads add their own cutouts) and the
 * strands, for placing beads.
 */
export function wovenLine({ loop, halfWidth, tipHalfWidth, tailFrom, gap }) {
  const width = () => halfWidth;
  const bowl = lappedBowlStrand(loop);
  const tail = strandBetween(tailStrand, tailFrom, tailStrand.total);
  const [tailCrossing] = crossingsOf(tail, bowl);
  if (!tailCrossing) throw new Error("The tail no longer crosses the bowl");
  const lapLength = bowl.total * (loop.lap / (Math.PI * 2 + loop.lap));
  const lapFrom = bowl.total - lapLength;
  // Over the lap the closing run narrows to its tip, done three quarters of
  // the way along, so the tip runs on at an even width.
  const closingWidth = (distance) =>
    distance <= lapFrom
      ? halfWidth
      : halfWidth -
        (halfWidth - tipHalfWidth) *
          smoothStep((distance - lapFrom) / (lapLength * 0.75));
  // As it narrows, the closing run keeps its outer edge on the bowl's outer
  // edge, so the outline of the letter stays whole and the lap shows only
  // inside it: one gap line, and the tip.
  const closingRun = strandFrom(
    bowl.points.map((point, pointIndex) => {
      const distance = bowl.lengths[pointIndex];
      const shift = halfWidth - closingWidth(distance);
      if (shift === 0) return point;
      const normal = bowl.normalAt(distance);
      const outward = normal.x * point.x + normal.y * point.y > 0 ? 1 : -1;
      return {
        x: point.x + normal.x * shift * outward,
        y: point.y + normal.y * shift * outward,
      };
    }),
  );
  // The loop is drawn as two pieces, so its closing run can cut a gap out of
  // its opening run. They meet halfway round, overlapping a little so no
  // seam shows.
  const splitDistance = bowl.total / 2;
  const seamOverlap = 3;
  const bowlOpening = outlineShape(
    bowl,
    { halfWidthAt: width, to: splitDistance + seamOverlap, endCap: "flat" },
    "ink",
    { cutouts: [] },
  );
  const bowlClosing = outlineShape(
    closingRun,
    {
      halfWidthAt: closingWidth,
      from: splitDistance - seamOverlap,
      startCap: "flat",
    },
    "ink",
    { cutouts: [] },
  );
  const tailShape = outlineShape(tail, { halfWidthAt: width }, "ink", {
    cutouts: [],
  });
  const lineShapes = [bowlOpening, bowlClosing, tailShape];
  if (gap <= 0) return { bowl, tail, lineShapes };
  // The lap: the gap beside the closing run opens as the run narrows,
  // taking at most half the room it leaves, so a rim of the opening run
  // always shows and the stroke keeps its full width.
  bowlOpening.cutouts.push(
    gapCutout(closingRun, closingRun.total, {
      halfWidthAt: (distance) => {
        const closing = closingWidth(distance);
        return closing + Math.min(gap, halfWidth - closing);
      },
      gap: 0,
      reach: 0,
      reachBack: lapLength,
    }),
  );
  // The tail passes over the bowl. Back toward the counter the gap may run
  // long (nothing else lies there); ahead it stops short of the tail's
  // sweep, which hugs the bowl.
  const tailReach = gapReach({
    overStrand: tail,
    overDistance: tailCrossing.firstDistance,
    underStrand: bowl,
    underDistance: tailCrossing.secondDistance,
    overHalfWidth: halfWidth,
    underHalfWidth: halfWidth,
    gap,
  });
  const tailGap = gapCutout(tail, tailCrossing.firstDistance, {
    halfWidthAt: width,
    gap,
    reach: tailReach,
    reachBack: tailReach * 2,
  });
  bowlOpening.cutouts.push(tailGap);
  bowlClosing.cutouts.push(tailGap);
  return { bowl, tail, lineShapes };
}
