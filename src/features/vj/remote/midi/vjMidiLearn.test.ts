import { describe, expect, it } from "vitest";
import { vjMidiLearnReduce, type VjMidiLearnState } from "./vjMidiLearn";
import type { VjMidiEvent } from "./vjMidiMessage";

const NOTE_ON: VjMidiEvent = {
  kind: "noteOn",
  channel: 1,
  note: 36,
  velocity: 100,
};
const NOTE_OFF: VjMidiEvent = { kind: "noteOff", channel: 1, note: 36 };
const KNOB: VjMidiEvent = { kind: "cc", channel: 1, controller: 7, value: 40 };

describe("vjMidiLearnReduce", () => {
  it("start, pick, move a control: one mapping", () => {
    const picking = vjMidiLearnReduce({ kind: "idle" }, { kind: "start" });
    expect(picking).toEqual({ state: { kind: "pickTarget" }, mapping: null });
    const waiting = vjMidiLearnReduce(picking.state, {
      kind: "targetPicked",
      target: { kind: "clipSlot", index: 2 },
    });
    expect(waiting.state).toEqual({
      kind: "waitControl",
      target: { kind: "clipSlot", index: 2 },
    });
    const learned = vjMidiLearnReduce(waiting.state, {
      kind: "midi",
      event: NOTE_ON,
    });
    expect(learned).toEqual({
      state: { kind: "idle" },
      mapping: {
        controlKey: "note:1:36",
        target: { kind: "clipSlot", index: 2 },
      },
    });
  });

  it("a continuous target waits for a CC", () => {
    const waiting: VjMidiLearnState = {
      kind: "waitControl",
      target: { kind: "crossfader" },
    };
    const afterNote = vjMidiLearnReduce(waiting, {
      kind: "midi",
      event: NOTE_ON,
    });
    expect(afterNote).toEqual({
      state: { kind: "needsContinuous", target: { kind: "crossfader" } },
      mapping: null,
    });
    const afterSecondNote = vjMidiLearnReduce(afterNote.state, {
      kind: "midi",
      event: NOTE_OFF,
    });
    expect(afterSecondNote.state).toBe(afterNote.state);
    expect(afterSecondNote.mapping).toBeNull();
    const learned = vjMidiLearnReduce(afterSecondNote.state, {
      kind: "midi",
      event: KNOB,
    });
    expect(learned).toEqual({
      state: { kind: "idle" },
      mapping: { controlKey: "cc:1:7", target: { kind: "crossfader" } },
    });
  });

  it("a key release maps nothing while waiting for a control", () => {
    const waiting: VjMidiLearnState = {
      kind: "waitControl",
      target: { kind: "go" },
    };
    const step = vjMidiLearnReduce(waiting, { kind: "midi", event: NOTE_OFF });
    expect(step).toEqual({ state: waiting, mapping: null });
  });

  it("ignored messages change nothing", () => {
    const waiting: VjMidiLearnState = {
      kind: "waitControl",
      target: { kind: "blackout" },
    };
    const step = vjMidiLearnReduce(waiting, {
      kind: "midi",
      event: { kind: "ignored" },
    });
    expect(step.state).toBe(waiting);
    expect(step.mapping).toBeNull();
  });

  it("MIDI before a target is picked changes nothing", () => {
    const picking: VjMidiLearnState = { kind: "pickTarget" };
    expect(vjMidiLearnReduce(picking, { kind: "midi", event: KNOB })).toEqual({
      state: picking,
      mapping: null,
    });
    const idle: VjMidiLearnState = { kind: "idle" };
    expect(vjMidiLearnReduce(idle, { kind: "midi", event: NOTE_ON })).toEqual({
      state: idle,
      mapping: null,
    });
  });

  it("a pick outside learn changes nothing", () => {
    const idle: VjMidiLearnState = { kind: "idle" };
    expect(
      vjMidiLearnReduce(idle, { kind: "targetPicked", target: { kind: "go" } })
        .state,
    ).toBe(idle);
  });

  it("cancel returns to idle", () => {
    const waiting: VjMidiLearnState = {
      kind: "needsContinuous",
      target: { kind: "transitionLength" },
    };
    expect(vjMidiLearnReduce(waiting, { kind: "cancel" })).toEqual({
      state: { kind: "idle" },
      mapping: null,
    });
    expect(
      vjMidiLearnReduce({ kind: "pickTarget" }, { kind: "cancel" }).state,
    ).toEqual({ kind: "idle" });
  });
});
