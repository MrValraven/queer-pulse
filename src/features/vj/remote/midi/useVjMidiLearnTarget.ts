/**
 * Makes a tile, pad or control pickable during MIDI learn. While learn runs, a
 * press on the element picks its target and sends nothing: the capture phase
 * stops the press before the element's own handlers see it, so a tile in pick
 * mode never sends `goClip`. A second tap before the controller moves picks
 * again, which fixes a mis-tap. Outside learn the props are empty.
 */
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useVjMidiLearn } from "./VjMidiLearnContext";
import type { VjMidiTarget } from "./vjMidiMappings";

export interface VjMidiLearnTargetProps {
  "data-vj-midi-pickable"?: "";
  onClickCapture?: (event: ReactMouseEvent) => void;
  onPointerDownCapture?: (event: ReactPointerEvent) => void;
}

export interface UseVjMidiLearnTargetResult {
  isPickable: boolean;
  learnProps: VjMidiLearnTargetProps;
}

const NO_LEARN_PROPS: VjMidiLearnTargetProps = {};

export function useVjMidiLearnTarget(
  target: VjMidiTarget,
): UseVjMidiLearnTargetResult {
  const { state, pickTarget } = useVjMidiLearn();
  const isPickable = state.kind !== "idle";
  if (!isPickable) return { isPickable, learnProps: NO_LEARN_PROPS };
  const learnProps: VjMidiLearnTargetProps = {
    "data-vj-midi-pickable": "",
    onPointerDownCapture: (event) => {
      // Keeps press hooks (pads, long press) from starting a send.
      event.preventDefault();
      event.stopPropagation();
    },
    onClickCapture: (event) => {
      event.preventDefault();
      event.stopPropagation();
      pickTarget(target);
    },
  };
  return { isPickable, learnProps };
}
