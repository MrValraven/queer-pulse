/**
 * The one action vocabulary every remote input speaks. Touch, the keyboard
 * and a MIDI controller each turn what the operator did into a
 * `VjRemoteAction` and hand it to the shared dispatcher with a phase.
 */
import type { VjGeneratorId } from "../../../../shared/contracts/vj";
import type { VjPadId } from "../rules/vjDockPads";

export type VjRemoteAction =
  /** 0-based index into the grid's visible order. */
  | { kind: "goClipAt"; index: number }
  | { kind: "goClip"; clipId: string }
  | {
      kind: "goGenerator";
      generatorId: VjGeneratorId;
      variant: string | null;
    }
  /** Sends the cued clip. */
  | { kind: "go" }
  | { kind: "blackout" }
  | { kind: "resetLook" }
  | { kind: "tapTempo" }
  | { kind: "downbeat" }
  | { kind: "cycleQuantize" }
  /** 0-based slot in the dock list (the strobe sits outside the list). */
  | { kind: "padSlot"; slot: number }
  | { kind: "pad"; padId: VjPadId }
  /** 0..1 */
  | { kind: "crossfader"; amount: number }
  /** 0..1 across the allowed range. */
  | { kind: "transitionLength"; normalized: number }
  | { kind: "previous" }
  | { kind: "setlistNext" }
  | { kind: "setlistPrevious" }
  /** A sequence row's Play sequence: step 1, playing by itself. */
  | { kind: "setlistPlay"; setlistId: string }
  /** A sequence row's Step through: step 1, moved on by hand. */
  | { kind: "setlistStepThrough"; setlistId: string }
  /** The active sequence's Play, Pause, Resume or Play again, by its status. */
  | { kind: "setlistTogglePlaying" }
  | { kind: "setlistSetLooping"; isLooping: boolean }
  /** Stop sequence: clears the selection. */
  | { kind: "setlistStop" }
  /** From needsFlashConsent: plays the step the timer held back. */
  | { kind: "setlistPlayFlashing" }
  /** From needsFlashConsent: plays on from the next step that does not flash. */
  | { kind: "setlistSkipFlashing" }
  | { kind: "openShortcuts" };

/**
 * `press` and `release` frame a held control (a pad); `value` carries a
 * continuous position (the crossfader, the transition length).
 */
export type VjActionPhase = "press" | "release" | "value";

export type VjActionDispatch = (
  action: VjRemoteAction,
  phase: VjActionPhase,
) => void;
