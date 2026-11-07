/**
 * The crossfader's send: it holds the dragged amount as a draft until the
 * newest received state reaches the revision of the last send, so the fader
 * never jumps back to the old amount between release and echo. A refusal of
 * the last send drops the draft (the fader shows the stage amount again).
 *
 * `VjCrossfader` already throttles its own `onChange` to one value per
 * VJ_DRAG_THROTTLE_MS and sends the final value on release (contract 7.12),
 * so `change` sends every value it gets at once: wire the fader's
 * `onChange` straight to `change` and its `onRelease` to `release`.
 */
import { useCallback } from "react";
import {
  roundVjAmount,
  type VjBlendMode,
  type VjMix,
} from "../../../../../shared/contracts/vj";
import type { VjCommandOutcome } from "../../../live/vjStageCommands";
import { useVjThrottledDraft } from "../../hooks/useVjThrottledDraft";

/** The fader upstream already spaces its values; the draft sends each one. */
const VJ_CROSSFADER_PASS_THROUGH_MS = 0;

export interface VjMixPatch {
  clipId?: string | null;
  amount?: number;
  blendMode?: VjBlendMode;
}

export interface UseVjCrossfaderSendOptions {
  /** `stage.latestState.mix`; null before the first state lands. */
  mix: VjMix | null;
  /** `stage.latestState?.revision ?? null`. */
  stateRevision: number | null;
  /** Offline or held: nothing goes out and the fader shows the stage amount. */
  isBlocked: boolean;
  setMix: (patch: VjMixPatch) => Promise<VjCommandOutcome>;
}

export function useVjCrossfaderSend({
  mix,
  stateRevision,
  isBlocked,
  setMix,
}: UseVjCrossfaderSendOptions): {
  value: number;
  change: (amount: number) => void;
  release: () => void;
} {
  const sendAmount = useCallback(
    (amount: number) => setMix({ amount }),
    [setMix],
  );
  const draft = useVjThrottledDraft<number>({
    serverValue: mix?.amount ?? 0,
    stateRevision,
    throttleMs: VJ_CROSSFADER_PASS_THROUGH_MS,
    send: sendAmount,
    isBlocked,
  });
  const { change: changeDraft, release } = draft;
  const change = useCallback(
    (amount: number) => changeDraft(roundVjAmount(amount)),
    [changeDraft],
  );
  return { value: draft.value, change, release };
}
