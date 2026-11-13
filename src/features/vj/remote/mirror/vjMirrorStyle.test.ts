import { describe, expect, it } from "vitest";
import {
  createVjStageState,
  type VjClipDTO,
  type VjEffectSetting,
} from "../../../../shared/contracts/vj";
import {
  vjMirrorClipFor,
  vjMirrorLiveOf,
  vjMirrorNextCopy,
  vjMirrorPendingOf,
  vjMirrorQuantizeKey,
  vjMirrorRingCopy,
  vjMirrorRingWithinStep,
  vjMirrorSequenceCopy,
  vjMirrorUndrawnCount,
  vjStrobeSecondsLeft,
} from "./vjMirrorStyle";

const ON: VjEffectSetting = { isOn: true, amount: 1, variant: null };
const OFF: VjEffectSetting = { isOn: false, amount: 1, variant: null };

const CLIP = { id: "clip-a", title: "Sunset loop" } as VjClipDTO;

describe("vjMirrorUndrawnCount", () => {
  it("counts the effects that only the WebGL engine draws", () => {
    expect(
      vjMirrorUndrawnCount({
        monochrome: ON,
        vhs: ON,
        kaleidoscope: ON,
        glitch: OFF,
      }),
    ).toBe(2);
  });

  it("counts nothing when every effect on is DOM-capable", () => {
    expect(
      vjMirrorUndrawnCount({
        monochrome: ON,
        mirror: { isOn: true, amount: 1, variant: "horizontal" },
        vignette: ON,
        vhs: OFF,
      }),
    ).toBe(0);
    expect(vjMirrorUndrawnCount({})).toBe(0);
  });
});

describe("vjStrobeSecondsLeft", () => {
  it("counts down whole seconds from the strobe's start", () => {
    const effects = { isStrobing: true, strobeStartedAt: 1000 };
    expect(vjStrobeSecondsLeft(effects, 1000)).toBe(10);
    expect(vjStrobeSecondsLeft(effects, 3500)).toBe(8);
    expect(vjStrobeSecondsLeft(effects, 20_000)).toBe(0);
  });

  it("reads zero while the strobe is off and never more than ten", () => {
    expect(
      vjStrobeSecondsLeft({ isStrobing: false, strobeStartedAt: 1000 }, 1000),
    ).toBe(0);
    expect(
      vjStrobeSecondsLeft({ isStrobing: true, strobeStartedAt: 9000 }, 1000),
    ).toBe(10);
  });
});

describe("vjMirrorClipFor and vjMirrorLiveOf", () => {
  it("keeps a clip only when the state names it", () => {
    expect(vjMirrorClipFor(CLIP, "clip-a")).toBe(CLIP);
    expect(vjMirrorClipFor(CLIP, "clip-b")).toBeNull();
    expect(vjMirrorClipFor(CLIP, null)).toBeNull();
  });

  it("names the shown clip, the shown generator or a black screen", () => {
    const state = createVjStageState("epoch", 0);
    expect(vjMirrorLiveOf({ ...state, liveClipId: "clip-a" }, CLIP)).toEqual({
      kind: "clip",
      title: "Sunset loop",
    });
    expect(
      vjMirrorLiveOf({ ...state, liveGeneratorId: "plasma" }, null),
    ).toEqual({ kind: "generator", nameKey: "vj:generator.name.plasma" });
    expect(vjMirrorLiveOf({ ...state, liveClipId: "clip-b" }, CLIP)).toEqual({
      kind: "black",
    });
    expect(vjMirrorLiveOf(null, CLIP)).toEqual({ kind: "black" });
  });
});

describe("vjMirrorPendingOf", () => {
  const state = createVjStageState("epoch", 0);
  const shownState = { ...state, liveClipId: "clip-b" };

  it("names the waiting clip once the page knows its title", () => {
    const pendingState = { ...state, liveClipId: "clip-a" };
    expect(vjMirrorPendingOf(shownState, pendingState, CLIP)).toEqual({
      kind: "clip",
      title: "Sunset loop",
    });
    expect(vjMirrorPendingOf(shownState, pendingState, null)).toBeNull();
  });

  it("names a waiting generator by its catalog key", () => {
    const pendingState = { ...state, liveGeneratorId: "plasma" as const };
    expect(vjMirrorPendingOf(shownState, pendingState, null)).toEqual({
      kind: "generator",
      nameKey: "vj:generator.name.plasma",
    });
  });

  it("names nothing with no change waiting, the same clip waiting or black waiting", () => {
    expect(vjMirrorPendingOf(shownState, null, CLIP)).toBeNull();
    expect(
      vjMirrorPendingOf(
        shownState,
        { ...shownState, tempo: state.tempo },
        CLIP,
      ),
    ).toBeNull();
    expect(
      vjMirrorPendingOf(shownState, { ...state, liveClipId: null }, CLIP),
    ).toBeNull();
  });
});

describe("vjMirrorNextCopy", () => {
  it("words each kind of next-up", () => {
    expect(vjMirrorNextCopy({ kind: "cue", clipId: "c" }, "Neon")).toEqual({
      key: "vj:mirror.nextCue",
      values: { title: "Neon" },
    });
    expect(
      vjMirrorNextCopy(
        {
          kind: "setlist",
          item: {
            id: "i",
            position: 2,
            kind: "scene",
            sceneId: "s",
            clipId: null,
            duration: null,
          },
          position: 3,
          total: 8,
        },
        "Peak",
      ),
    ).toEqual({
      key: "vj:mirror.nextSetlist",
      values: { position: 3, total: 8, name: "Peak" },
    });
    expect(vjMirrorNextCopy({ kind: "shuffle", clipId: "c" }, "Neon")).toEqual({
      key: "vj:mirror.nextShuffle",
      values: { title: "Neon" },
    });
    expect(vjMirrorNextCopy({ kind: "none" }, null)).toEqual({
      key: "vj:mirror.nextNone",
      values: {},
    });
  });

  it("reads Last step on the last step of a sequence without Loop", () => {
    expect(vjMirrorNextCopy({ kind: "setlistLast" }, null)).toEqual({
      key: "vj:mirror.nextSetlistLast",
      values: {},
    });
  });
});

describe("vjMirrorQuantizeKey and vjMirrorRingCopy", () => {
  it("names the beat or the bar a waiting change lands on", () => {
    expect(vjMirrorQuantizeKey("beat")).toBe("vj:mirror.onNextBeat");
    expect(vjMirrorQuantizeKey("bar")).toBe("vj:mirror.onNextBar");
    expect(vjMirrorQuantizeKey("off")).toBeNull();
  });

  it("rounds the ring's time left up to whole seconds", () => {
    expect(
      vjMirrorRingCopy({ kind: "applyAt", progress: 0.5, msLeft: 1200 }),
    ).toEqual({ key: "vj:mirror.ringApply", values: { seconds: 2 } });
    expect(
      vjMirrorRingCopy({ kind: "shuffle", progress: 0.1, msLeft: 7000 }),
    ).toEqual({ key: "vj:mirror.ringShuffle", values: { seconds: 7 } });
    expect(vjMirrorRingCopy({ kind: "none" })).toBeNull();
  });

  it("counts a playing sequence's step down to the next step", () => {
    expect(
      vjMirrorRingCopy({
        kind: "setlist",
        progress: 0.25,
        msLeft: 6100,
        isPaused: false,
      }),
    ).toEqual({ key: "vj:mirror.ringSetlist", values: { seconds: 7 } });
  });

  it("names the time a paused sequence's step has left", () => {
    expect(
      vjMirrorRingCopy({
        kind: "setlist",
        progress: 0.5,
        msLeft: 4000,
        isPaused: true,
      }),
    ).toEqual({ key: "vj:mirror.ringSetlistPaused", values: { seconds: 4 } });
  });
});

describe("vjMirrorSequenceCopy", () => {
  it("names why the sequence stopped moving", () => {
    expect(vjMirrorSequenceCopy({ kind: "paused" })).toEqual({
      key: "vj:mirror.sequencePaused",
      values: {},
    });
    expect(vjMirrorSequenceCopy({ kind: "takenOver" })).toEqual({
      key: "vj:mirror.sequenceTakenOver",
      values: {},
    });
    expect(
      vjMirrorSequenceCopy({ kind: "waitingFlash", stepName: "Strobe drop" }),
    ).toEqual({
      key: "vj:mirror.sequenceWaitingFlash",
      values: { step: "Strobe drop" },
    });
    expect(vjMirrorSequenceCopy({ kind: "finished" })).toEqual({
      key: "vj:mirror.sequenceFinished",
      values: {},
    });
  });
});

describe("vjMirrorRingWithinStep", () => {
  it("never counts a playing step past its own length", () => {
    const ring = vjMirrorRingWithinStep(
      { kind: "setlist", progress: 0, msLeft: 8_300, isPaused: false },
      8_000,
    );
    expect(ring).toEqual({
      kind: "setlist",
      progress: 0,
      msLeft: 8_000,
      isPaused: false,
    });
    expect(vjMirrorRingCopy(ring)).toEqual({
      key: "vj:mirror.ringSetlist",
      values: { seconds: 8 },
    });
  });

  it("leaves other rings and an unknown length alone", () => {
    const shuffleRing = {
      kind: "shuffle",
      progress: 0.1,
      msLeft: 9_000,
    } as const;
    expect(vjMirrorRingWithinStep(shuffleRing, 8_000)).toBe(shuffleRing);
    const setlistRing = {
      kind: "setlist",
      progress: 0,
      msLeft: 8_300,
      isPaused: false,
    } as const;
    expect(vjMirrorRingWithinStep(setlistRing, null)).toBe(setlistRing);
  });
});
