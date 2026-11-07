// Where an applied demo change lands in time (contract 7.4 steps 2 to 6).
// Mirrors queerpulse-backend/src/vj/stage/vj-quantize.ts: `vjApplyAtFor`,
// `stampVjChangeTimes` and `vjAttachApplyAt`, so the demo stage puts every
// change on the same beat the live server would.

import {
  canonicalVjStageState,
  vjIsQuantizedChange,
  vjQuantizedApplyAt,
  type VjScreenOverride,
  type VjStageCause,
  type VjStageState,
} from "../../../shared/contracts/vj";
import type { VjDemoStamps } from "./vjDemoCommandKit";

/** The causes whose change may land on the tempo grid. Timer causes
 *  (`overlay_timeout`, `countdown_end`, `mic_tempo`) and `library` never
 *  compute a grid time; they only inherit a pending one. */
const VJ_DEMO_GRID_CAUSES: readonly VjStageCause[] = ["command", "shuffle"];

/** The causes that always land at once with every pending change: the 10 s
 *  strobe cap is absolute, so strobe-off never waits for a pending bar
 *  (C 7.4). */
const VJ_DEMO_IMMEDIATE_CAUSES: readonly VjStageCause[] = ["strobe_timeout"];

/** Whether a cause computes no grid time of its own (timer and library causes). */
export function isVjDemoTimerOrLibraryCause(cause: VjStageCause): boolean {
  return !VJ_DEMO_GRID_CAUSES.includes(cause);
}

export interface VjDemoSettleInput {
  previous: VjStageState;
  next: VjStageState;
  stamps: VjDemoStamps;
  now: number;
  pendingApplyAt: number | null;
  isLookSwitch: boolean;
  isImmediate: boolean;
  /** Why the change happens: only `command` and `shuffle` compute a grid
   *  time, and `strobe_timeout` always lands at once (C 7.4). */
  cause: VjStageCause;
  /** Screens the stage still lists; overrides naming others are dropped (C 7.10). */
  knownScreenIds: ReadonlySet<string>;
}

/** Steps 2 and 3: the server time every client applies this change at, or
 *  null to apply at once. A change never lands before a pending one, and an
 *  immediate change or a strobe timeout lands at once with every pending
 *  change. */
function vjDemoApplyAtFor(input: VjDemoSettleInput): number | null {
  if (input.isImmediate || VJ_DEMO_IMMEDIATE_CAUSES.includes(input.cause)) {
    return null;
  }
  const isOnGrid =
    !isVjDemoTimerOrLibraryCause(input.cause) &&
    (input.isLookSwitch || vjIsQuantizedChange(input.previous, input.next));
  const computed = isOnGrid
    ? vjQuantizedApplyAt(input.next.tempo, input.now)
    : null;
  const pending =
    input.pendingApplyAt !== null && input.pendingApplyAt > input.now
      ? input.pendingApplyAt
      : null;
  return pending === null ? computed : Math.max(pending, computed ?? pending);
}

function isVjSourceLive(state: VjStageState): boolean {
  return state.liveClipId !== null || state.liveGeneratorId !== null;
}

/** liveSince: stampAt when the live source changed, was set again, or
 *  clipSequence grew while a source is live; null when nothing is live;
 *  else kept. */
function stampedLiveSince(
  input: VjDemoSettleInput,
  stampAt: number,
): number | null {
  const { previous, next } = input;
  if (!isVjSourceLive(next)) return null;
  const isSourceChanged =
    input.stamps.isLiveSourceSet ||
    previous.liveClipId !== next.liveClipId ||
    previous.liveGeneratorId !== next.liveGeneratorId ||
    previous.liveGeneratorVariant !== next.liveGeneratorVariant ||
    next.clipSequence > previous.clipSequence;
  return isSourceChanged ? stampAt : (next.liveSince ?? stampAt);
}

/** strobeStartedAt: stampAt when the strobe goes on, kept while it stays on
 *  (the start is never extended), null while off. `isStrobeStarted` marks
 *  the same off to on edge this reads from the two states. */
function stampedStrobeStartedAt(
  previous: VjStageState,
  next: VjStageState,
  stampAt: number,
): number | null {
  if (!next.effects.isStrobing) return null;
  if (!previous.effects.isStrobing) return stampAt;
  return next.effects.strobeStartedAt ?? stampAt;
}

/** overlay.hideAt: null while hidden; otherwise undefined keeps it, null
 *  clears it and a number stamps stampAt plus it. */
function stampedOverlayHideAt(
  next: VjStageState,
  stampAt: number,
  overlayHideAfterMs: number | null | undefined,
): number | null {
  if (!next.overlay.isVisible) return null;
  if (overlayHideAfterMs === undefined) return next.overlay.hideAt;
  return overlayHideAfterMs === null ? null : stampAt + overlayHideAfterMs;
}

/** The overrides of screens the stage still lists. */
function knownVjScreenOverrides(
  screenOverrides: Record<string, VjScreenOverride>,
  knownScreenIds: ReadonlySet<string>,
): Record<string, VjScreenOverride> {
  return Object.fromEntries(
    Object.entries(screenOverrides).filter(
      ([screenId]) =>
        knownScreenIds.has(screenId) ||
        knownScreenIds.has(screenId.toLowerCase()),
    ),
  );
}

/** C 7.4 steps 2 to 6 for one applied change: its applyAt, the new
 *  pendingApplyAt, and the state stamped at applyAt ?? now with overrides of
 *  pruned screens dropped, revision + 1, updatedAt = now, canonical. Pruning
 *  runs after the quantize test, so dropping a gone screen's override never
 *  moves an unquantized change onto the grid. */
export function settleVjDemoChange(input: VjDemoSettleInput): {
  state: VjStageState;
  applyAt: number | null;
  pendingApplyAt: number | null;
} {
  const applyAt = vjDemoApplyAtFor(input);
  const stampAt = applyAt ?? input.now;
  const { previous, next } = input;
  const state = canonicalVjStageState({
    ...next,
    liveSince: stampedLiveSince(input, stampAt),
    effects: {
      ...next.effects,
      strobeStartedAt: stampedStrobeStartedAt(previous, next, stampAt),
    },
    overlay: {
      ...next.overlay,
      hideAt: stampedOverlayHideAt(
        next,
        stampAt,
        input.stamps.overlayHideAfterMs,
      ),
    },
    screenOverrides: knownVjScreenOverrides(
      next.screenOverrides,
      input.knownScreenIds,
    ),
    revision: previous.revision + 1,
    updatedAt: input.now,
  });
  return { state, applyAt, pendingApplyAt: applyAt };
}

/** The attach frame's applyAt: pendingApplyAt while it is after now, else null. */
export function vjDemoAttachApplyAt(
  pendingApplyAt: number | null,
  now: number,
): number | null {
  return pendingApplyAt !== null && pendingApplyAt > now
    ? pendingApplyAt
    : null;
}
