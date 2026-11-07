import { describe, expect, it } from "vitest";
import {
  VJ_MIDI_AVAILABILITY_KEY,
  vjMidiFailureOf,
  vjMidiSupportOf,
} from "./vjMidiAvailability";

describe("vjMidiSupportOf", () => {
  it("no requestMIDIAccess is unsupported", () => {
    expect(vjMidiSupportOf({})).toBe("unsupported");
    expect(vjMidiSupportOf({ requestMIDIAccess: undefined })).toBe(
      "unsupported",
    );
  });

  it("a requestMIDIAccess function is supported", () => {
    expect(
      vjMidiSupportOf({ requestMIDIAccess: () => Promise.resolve({}) }),
    ).toBe("supported");
  });
});

describe("vjMidiFailureOf", () => {
  it("NotAllowedError is denied", () => {
    expect(vjMidiFailureOf(new DOMException("no", "NotAllowedError"))).toBe(
      "denied",
    );
  });

  it("SecurityError is denied", () => {
    expect(vjMidiFailureOf(new DOMException("no", "SecurityError"))).toBe(
      "denied",
    );
  });

  it("any other error is failed", () => {
    expect(vjMidiFailureOf(new DOMException("gone", "AbortError"))).toBe(
      "failed",
    );
    expect(vjMidiFailureOf(new Error("boom"))).toBe("failed");
    expect(vjMidiFailureOf("boom")).toBe("failed");
    expect(vjMidiFailureOf(null)).toBe("failed");
  });
});

describe("VJ_MIDI_AVAILABILITY_KEY", () => {
  it("names a line for every state that explains itself", () => {
    expect(VJ_MIDI_AVAILABILITY_KEY).toEqual({
      unsupported: "vj:midi.unavailableNoWebMidi",
      requesting: "vj:midi.requesting",
      noDevices: "vj:midi.noDevices",
      denied: "vj:midi.denied",
      failed: "vj:midi.failed",
    });
  });
});
