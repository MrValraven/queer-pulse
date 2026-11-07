import {
  isVjMidiContinuousTarget,
  type VjMidiMapping,
  type VjMidiTarget,
} from "./vjMidiMappings";
import { vjMidiControlKeyOf, type VjMidiEvent } from "./vjMidiMessage";

/**
 * MIDI learn: pick a target on screen, then move a control. A continuous
 * target (crossfader, transition length) waits in `needsContinuous` until a CC
 * arrives.
 */
export type VjMidiLearnState =
  | { kind: "idle" }
  | { kind: "pickTarget" }
  | { kind: "waitControl"; target: VjMidiTarget }
  | { kind: "needsContinuous"; target: VjMidiTarget };

export type VjMidiLearnEvent =
  | { kind: "start" }
  | { kind: "cancel" }
  | { kind: "targetPicked"; target: VjMidiTarget }
  | { kind: "midi"; event: VjMidiEvent };

type VjMidiLearnStep = {
  state: VjMidiLearnState;
  mapping: VjMidiMapping | null;
};

const IDLE: VjMidiLearnState = { kind: "idle" };

function unchanged(state: VjMidiLearnState): VjMidiLearnStep {
  return { state, mapping: null };
}

function midiStep(
  state: VjMidiLearnState,
  event: VjMidiEvent,
): VjMidiLearnStep {
  if (state.kind !== "waitControl" && state.kind !== "needsContinuous") {
    return unchanged(state);
  }
  const controlKey = vjMidiControlKeyOf(event);
  if (controlKey === null) return unchanged(state);
  const { target } = state;
  if (isVjMidiContinuousTarget(target)) {
    if (event.kind !== "cc") {
      return state.kind === "needsContinuous"
        ? unchanged(state)
        : { state: { kind: "needsContinuous", target }, mapping: null };
    }
    return { state: IDLE, mapping: { controlKey, target } };
  }
  // A key release left over from before the pick maps nothing; a note on or a CC does.
  if (event.kind === "noteOff") return unchanged(state);
  return { state: IDLE, mapping: { controlKey, target } };
}

/** One learn step: the next state and, when a control was just learned, its mapping. */
export function vjMidiLearnReduce(
  state: VjMidiLearnState,
  event: VjMidiLearnEvent,
): VjMidiLearnStep {
  switch (event.kind) {
    case "start":
      return { state: { kind: "pickTarget" }, mapping: null };
    case "cancel":
      return { state: IDLE, mapping: null };
    case "targetPicked":
      return state.kind === "idle"
        ? unchanged(state)
        : {
            state: { kind: "waitControl", target: event.target },
            mapping: null,
          };
    case "midi":
      return midiStep(state, event.event);
  }
}
