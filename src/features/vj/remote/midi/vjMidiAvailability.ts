/** Where Web MIDI stands on this device, from support through permission to connected controllers. */
export type VjMidiAvailability =
  | "unsupported"
  | "idle"
  | "requesting"
  | "ready"
  | "noDevices"
  | "denied"
  | "failed";

/** iOS and Safari have no requestMIDIAccess. */
export function vjMidiSupportOf(target: {
  requestMIDIAccess?: unknown;
}): "supported" | "unsupported" {
  return typeof target.requestMIDIAccess === "function"
    ? "supported"
    : "unsupported";
}

const DENIED_ERROR_NAMES: ReadonlySet<string> = new Set([
  "NotAllowedError",
  "SecurityError",
]);

/** A refused permission (DOMException NotAllowedError or SecurityError) is denied; any other cause failed. */
export function vjMidiFailureOf(cause: unknown): "denied" | "failed" {
  if (typeof cause !== "object" || cause === null) return "failed";
  const { name } = cause as { name?: unknown };
  return typeof name === "string" && DENIED_ERROR_NAMES.has(name)
    ? "denied"
    : "failed";
}

/** The line the MIDI sheet shows for each state that explains itself. */
export const VJ_MIDI_AVAILABILITY_KEY: Readonly<
  Record<Exclude<VjMidiAvailability, "idle" | "ready">, string>
> = {
  unsupported: "vj:midi.unavailableNoWebMidi",
  requesting: "vj:midi.requesting",
  noDevices: "vj:midi.noDevices",
  denied: "vj:midi.denied",
  failed: "vj:midi.failed",
};
