import { blossom, setCurve, tracePiece } from "./signInNetworkArt.curve";
import type { NetworkPalette } from "./signInNetworkArt.palette";
import { drawHandshakeLight } from "./signInNetworkArt.qRender";
import type { QPerson, QScene } from "./signInNetworkArt.qTypes";
import { easeInOutSine } from "./signInNetworkArt.random";

/** The Q hands off to its name. Once the letter has formed and the hearth
 *  blooms, one last handshake light leaves the tail tip (the Q's lowest
 *  person) and travels on a soft curve to the start of the wordmark, where
 *  the text takes over and writes itself in. It happens once per engine:
 *  a rebuild on resize re-forms the Q without sending it again. */

/** Where the light lands, in CSS pixels of the canvas. */
export interface TextAnchor {
  x: number;
  y: number;
}

/** The two moments the text listens for: the Q has formed (the light sets
 *  off, when there is a wordmark to go to), and the light has reached the
 *  wordmark. */
export interface TextHandoffCues {
  onFormed?: () => void;
  onLanded?: () => void;
}

export interface TextHandoff {
  stage: "waiting" | "flying" | "done";
  progress: number;
  anchor: TextAnchor | null;
  tip: QPerson | null;
}

/** A beat after the bloom starts, so the hearth lights up before the light
 *  sets off. */
const DEPARTURE_DELAY_SECONDS = 0.3;
const FLIGHT_SECONDS = 1;
/** Bows the path up and over, so the light swings out along the tail's
 *  height and then comes down onto the wordmark like a pen touching down. */
const FLIGHT_BEND = 0.3;
/** How much of the path the fading thread behind the light covers. */
const TRAIL_LENGTH = 0.34;

export function createTextHandoff(): TextHandoff {
  return { stage: "waiting", progress: 0, anchor: null, tip: null };
}

function lowestLetterPerson(scene: QScene): QPerson | null {
  let lowest: QPerson | null = null;
  for (const person of scene.people) {
    if (person.newcomer) continue;
    if (!lowest || person.view.screenY > lowest.view.screenY) lowest = person;
  }
  return lowest;
}

/** Ends the handoff. The text hears `onLanded` only when the light has a
 *  wordmark to land on; with no anchor (the text already showing, or no
 *  wordmark rendered) the Q simply lives on alone and the text's own
 *  failsafe decides. */
function finish(handoff: TextHandoff, cues: TextHandoffCues) {
  const hasAnchor = handoff.anchor !== null;
  handoff.stage = "done";
  handoff.tip = null;
  if (hasAnchor) cues.onLanded?.();
}

export function stepTextHandoff(
  handoff: TextHandoff,
  scene: QScene,
  deltaSeconds: number,
  cues: TextHandoffCues,
): void {
  if (handoff.stage === "waiting") {
    if (scene.time < scene.bloomStartsAt + DEPARTURE_DELAY_SECONDS) return;
    cues.onFormed?.();
    handoff.tip = lowestLetterPerson(scene);
    if (!handoff.anchor || !handoff.tip) {
      handoff.stage = "done";
      handoff.tip = null;
      return;
    }
    handoff.stage = "flying";
    handoff.progress = 0;
    return;
  }
  if (handoff.stage !== "flying") return;
  handoff.progress += deltaSeconds / FLIGHT_SECONDS;
  if (handoff.progress >= 1 || !handoff.anchor) finish(handoff, cues);
}

/** A new scene replaces the one the light was leaving from, so a flight in
 *  progress ends at once, and the text carries on if it still has a place. */
export function settleTextHandoff(
  handoff: TextHandoff,
  cues: TextHandoffCues,
): void {
  if (handoff.stage === "flying") finish(handoff, cues);
}

export function drawTextHandoff(
  context: CanvasRenderingContext2D,
  scene: QScene,
  palette: NetworkPalette,
  handoff: TextHandoff,
): void {
  const { tip, anchor } = handoff;
  if (handoff.stage !== "flying" || !tip || !anchor) return;
  setCurve(tip.view.screenX, tip.view.screenY, anchor.x, anchor.y, FLIGHT_BEND);
  const along = easeInOutSine(Math.min(1, handoff.progress));
  context.globalCompositeOperation = "lighter";
  // The thread it draws behind itself, thinning out towards the tail.
  const trailStart = Math.max(0, along - TRAIL_LENGTH);
  for (let segment = 0; segment < 3; segment += 1) {
    const segmentStart = trailStart + ((along - trailStart) * segment) / 3;
    tracePiece(context, segmentStart, along);
    context.strokeStyle = palette.solid.cream;
    context.lineWidth = (0.8 + 0.3 * segment) * scene.scale;
    context.globalAlpha = 0.12 + 0.1 * segment;
    context.stroke();
  }
  drawHandshakeLight(
    context,
    palette,
    "coral",
    blossom(along, along, true),
    blossom(along, along, false),
    1.15,
    scene.scale,
  );
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = 1;
}
