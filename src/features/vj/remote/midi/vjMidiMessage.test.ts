import { describe, expect, it } from "vitest";
import {
  parseVjMidiMessage,
  vjMidiControlKeyOf,
  vjMidiNormalized,
} from "./vjMidiMessage";

describe("parseVjMidiMessage", () => {
  it("reads a note on", () => {
    expect(parseVjMidiMessage([0x90, 60, 100])).toEqual({
      kind: "noteOn",
      channel: 1,
      note: 60,
      velocity: 100,
    });
  });

  it("note on with velocity 0 is note off", () => {
    expect(parseVjMidiMessage([0x90, 60, 0])).toEqual({
      kind: "noteOff",
      channel: 1,
      note: 60,
    });
  });

  it("reads a note off", () => {
    expect(parseVjMidiMessage([0x80, 61, 64])).toEqual({
      kind: "noteOff",
      channel: 1,
      note: 61,
    });
  });

  it("reads the channel 1-based", () => {
    expect(parseVjMidiMessage([0x9f, 36, 90])).toMatchObject({ channel: 16 });
    expect(parseVjMidiMessage([0x83, 36, 0])).toMatchObject({ channel: 4 });
    expect(parseVjMidiMessage([0xb0, 7, 1])).toMatchObject({ channel: 1 });
  });

  it("control change", () => {
    expect(parseVjMidiMessage(new Uint8Array([0xb2, 21, 127]))).toEqual({
      kind: "cc",
      channel: 3,
      controller: 21,
      value: 127,
    });
  });

  it("ignores clock and sysex bytes", () => {
    expect(parseVjMidiMessage([0xf8, 0, 0])).toEqual({ kind: "ignored" });
    expect(parseVjMidiMessage([0xf0, 0x7e, 0x7f, 0x06, 0x01, 0xf7])).toEqual({
      kind: "ignored",
    });
    expect(parseVjMidiMessage([0xe0, 0, 64])).toEqual({ kind: "ignored" });
    expect(parseVjMidiMessage([0x40, 60, 100])).toEqual({ kind: "ignored" });
  });

  it("ignores a short message", () => {
    expect(parseVjMidiMessage([])).toEqual({ kind: "ignored" });
    expect(parseVjMidiMessage([0xf8])).toEqual({ kind: "ignored" });
    expect(parseVjMidiMessage([0x90, 60])).toEqual({ kind: "ignored" });
  });

  it("ignores a data byte above 127", () => {
    expect(parseVjMidiMessage([0x90, 200, 100])).toEqual({ kind: "ignored" });
  });
});

describe("vjMidiControlKeyOf", () => {
  it("names a note by channel and note for on and off", () => {
    expect(
      vjMidiControlKeyOf({ kind: "noteOn", channel: 2, note: 40, velocity: 9 }),
    ).toBe("note:2:40");
    expect(vjMidiControlKeyOf({ kind: "noteOff", channel: 2, note: 40 })).toBe(
      "note:2:40",
    );
  });

  it("names a control change by channel and controller", () => {
    expect(
      vjMidiControlKeyOf({ kind: "cc", channel: 1, controller: 7, value: 3 }),
    ).toBe("cc:1:7");
  });

  it("an ignored message has no control", () => {
    expect(vjMidiControlKeyOf({ kind: "ignored" })).toBeNull();
  });
});

describe("vjMidiNormalized", () => {
  it("maps 0..127 to 0..1 and clamps", () => {
    expect(vjMidiNormalized(0)).toBe(0);
    expect(vjMidiNormalized(127)).toBe(1);
    expect(vjMidiNormalized(64)).toBeCloseTo(64 / 127);
    expect(vjMidiNormalized(300)).toBe(1);
    expect(vjMidiNormalized(-4)).toBe(0);
  });
});
