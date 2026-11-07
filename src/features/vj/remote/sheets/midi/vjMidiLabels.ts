import type { TFunction } from "../../../../../shared/i18n/types";
import type { VjMidiTarget } from "../../midi/vjMidiMappings";

/** The translate function the labels read (`t` from `useTranslation`). */
export type Translate = TFunction;

const CONTROL_KEY_PATTERN = /^(note|cc):(\d{1,2}):(\d{1,3})$/;

/** What a mapping drives, as the MIDI sheet and the learn banner name it ("Clip 3", "Pad: Invert"). */
export function vjMidiTargetLabel(
  target: VjMidiTarget,
  translate: Translate,
): string {
  switch (target.kind) {
    case "clipSlot":
      return translate("vj:midi.target.clipSlot", { number: target.index + 1 });
    case "pad": {
      const effectName =
        target.padId === "strobe"
          ? translate("vj:effects.strobe")
          : translate(`vj:effect.name.${target.padId}`);
      return translate("vj:midi.target.pad", { effect: effectName });
    }
    case "crossfader":
    case "transitionLength":
    case "tapTempo":
    case "go":
    case "blackout":
      return translate(`vj:midi.target.${target.kind}`);
  }
}

/**
 * The controller key or knob a mapping listens to, from its control key
 * ("note:1:36" reads "Note 36, channel 1"). A key the store never writes
 * shows as it is.
 */
export function vjMidiControlLabel(
  controlKey: string,
  translate: Translate,
): string {
  const match = CONTROL_KEY_PATTERN.exec(controlKey);
  if (match === null) return controlKey;
  const [, kind, channel, number] = match;
  if (kind === "note") {
    return translate("vj:midi.control.note", { note: number, channel });
  }
  return translate("vj:midi.control.cc", { controller: number, channel });
}
