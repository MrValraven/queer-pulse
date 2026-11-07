/** One MIDI message read into what the remote cares about. Channels are 1-based (1 to 16). */
export type VjMidiEvent =
  | { kind: "noteOn"; channel: number; note: number; velocity: number }
  | { kind: "noteOff"; channel: number; note: number }
  | { kind: "cc"; channel: number; controller: number; value: number }
  | { kind: "ignored" };

const IGNORED: VjMidiEvent = { kind: "ignored" };

const STATUS_NOTE_OFF = 0x80;
const STATUS_NOTE_ON = 0x90;
const STATUS_CONTROL_CHANGE = 0xb0;
/** 0xF0 and above are system messages: sysex, clock, start, stop, active sensing. */
const STATUS_SYSTEM_FIRST = 0xf0;
const DATA_BYTE_MAX = 0x7f;

function isDataByte(value: number | undefined): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= DATA_BYTE_MAX
  );
}

/**
 * 0x9n note on (velocity 0 reads as note off), 0x8n note off, 0xBn control
 * change; channel 1-based; everything else ignored, including clock and sysex
 * bytes and a message shorter than three bytes.
 */
export function parseVjMidiMessage(data: ArrayLike<number>): VjMidiEvent {
  if (data.length < 3) return IGNORED;
  const status = data[0];
  const firstData = data[1];
  const secondData = data[2];
  if (typeof status !== "number" || !Number.isInteger(status)) return IGNORED;
  if (status < STATUS_NOTE_OFF || status >= STATUS_SYSTEM_FIRST) return IGNORED;
  if (!isDataByte(firstData) || !isDataByte(secondData)) return IGNORED;
  const messageType = status & 0xf0;
  const channel = (status & 0x0f) + 1;
  if (messageType === STATUS_NOTE_ON) {
    if (secondData === 0) return { kind: "noteOff", channel, note: firstData };
    return { kind: "noteOn", channel, note: firstData, velocity: secondData };
  }
  if (messageType === STATUS_NOTE_OFF) {
    return { kind: "noteOff", channel, note: firstData };
  }
  if (messageType === STATUS_CONTROL_CHANGE) {
    return { kind: "cc", channel, controller: firstData, value: secondData };
  }
  return IGNORED;
}

/** The control a message came from: "note:<channel>:<note>" or "cc:<channel>:<controller>". */
export function vjMidiControlKeyOf(event: VjMidiEvent): string | null {
  if (event.kind === "noteOn" || event.kind === "noteOff") {
    return `note:${event.channel}:${event.note}`;
  }
  if (event.kind === "cc") return `cc:${event.channel}:${event.controller}`;
  return null;
}

/** A 0..127 data value as 0..1, clamped. */
export function vjMidiNormalized(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value / DATA_BYTE_MAX));
}
