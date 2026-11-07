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
