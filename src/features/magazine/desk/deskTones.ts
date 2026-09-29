import type { Stage } from "../data/desk.data";

/**
 * The desk's state colours, one job each. The values live in
 * `styles/tokens/colors.css` as `--desk-tone-<tone>` (text and dots) and
 * `--desk-tone-<tone>-soft` (the wash behind that text):
 * - `late`: late pieces and over-capacity editors only
 * - `you`: waiting on you, your turn
 * - `writer`: with the writer
 * - `ready`: ready, published, a new voice
 * - `neutral`: nothing to flag
 * Coral stays the primary action and has no tone here.
 */
export type DeskTone = "late" | "you" | "writer" | "ready" | "neutral";

/**
 * Each stage's 1-based position in the pipeline, the `N` in the
 * `--desk-stage-N` colour token. The stage pill, StageProgress, the board
 * columns and the rail's stacked bar all read this one mapping so a stage
 * keeps the same colour everywhere. Same order as `DEMO_STAGES`.
 */
export const STAGE_STEP: Record<Stage, number> = {
  Commissioned: 1,
  Drafting: 2,
  "In review": 3,
  Edit: 4,
  "Sensitivity read": 5,
  Layout: 6,
  Ready: 7,
  Published: 8,
};

/** How many steps the pipeline has, the `total` in "step 3 of 8". */
export const STAGE_STEP_COUNT = Object.keys(STAGE_STEP).length;

/** The stage colour token for a stage, for inline `style` custom properties. */
export function stageColorVar(stage: Stage): string {
  return `var(--desk-stage-${STAGE_STEP[stage]})`;
}
