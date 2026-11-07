import { describe, expect, it } from "vitest";
import {
  VJ_LIMITS,
  canonicalVjStageState,
  createVjStageState,
  type VjEffectId,
  type VjStageState,
} from "../../../shared/contracts/vj";
import type { VjDemoLibraryLookup } from "./vjDemoCommandKit";
import { restoreVjDemoStage } from "./vjDemoStageRestore";

const STAGE_EPOCH = "11111111-1111-4111-8111-111111111111";
const OLD_STAGE_EPOCH = "99999999-9999-4999-8999-999999999999";
const NOW = 1_800_000_000_000;
const HOUR_MS = 3_600_000;
const PACK_ID = "44444444-4444-4444-8444-444444444444";
const EVENT_ID = "55555555-5555-4555-8555-555555555555";
const CLIP_ID = "22222222-2222-4222-8222-222222222222";
const MIX_CLIP_ID = "33333333-3333-4333-8333-333333333333";
const EXCLUDED_CLIP_ID = "66666666-6666-4666-8666-666666666666";
const OUTSIDE_CLIP_ID = "88888888-8888-4888-8888-888888888888";
const SETLIST_ID = "77777777-7777-4777-8777-777777777777";

interface DemoLibraryParts {
  packs?: Map<string, { eventId: string | null }>;
  clipIds?: string[];
  packClipIds?: string[];
  setlistItemCount?: number | null;
}

/** A library that knows only the given packs, clips and set list. */
function demoLibrary(parts: DemoLibraryParts = {}): VjDemoLibraryLookup {
  const packs = parts.packs ?? new Map<string, { eventId: string | null }>();
  const clipIds = new Set(parts.clipIds ?? []);
  const packClipIds = new Set(parts.packClipIds ?? []);
  return {
    hasPack: (packId) => packs.has(packId),
    hasClip: (clipId) => clipIds.has(clipId),
    isClipInPack: (packId, clipId) =>
      packs.has(packId) && packClipIds.has(clipId),
    readPackForStage: (packId) => packs.get(packId) ?? null,
    existingClipIds: (wantedIds) =>
      new Set(wantedIds.filter((clipId) => clipIds.has(clipId))),
    clipIdsInPack: (packId, wantedIds) =>
      packs.has(packId)
        ? new Set(wantedIds.filter((clipId) => packClipIds.has(clipId)))
        : new Set<string>(),
    readPackClipForAdvance: () => null,
    readSceneLook: () => null,
    readSetlistItem: () => null,
    setlistItemCount: (setlistId) =>
      setlistId === SETLIST_ID ? (parts.setlistItemCount ?? null) : null,
  };
}

/** A library where every id a v2Restore names is found. */
function allFoundLibrary(
  eventId: string | null = EVENT_ID,
): VjDemoLibraryLookup {
  return demoLibrary({
    packs: new Map([[PACK_ID, { eventId }]]),
    clipIds: [CLIP_ID, MIX_CLIP_ID],
    packClipIds: [EXCLUDED_CLIP_ID],
    setlistItemCount: 4,
  });
}

/** The fresh stage the demo server holds when the first screen attaches. */
function freshStage(): VjStageState {
  return createVjStageState(STAGE_EPOCH, NOW - 5_000);
}

/** A v2 restore payload with every field at a non-default, valid value. */
function v2Restore(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const defaults = createVjStageState(OLD_STAGE_EPOCH, NOW);
  return {
    stageEpoch: OLD_STAGE_EPOCH,
    revision: 42,
    activePackId: PACK_ID,
    liveClipId: CLIP_ID,
    liveGeneratorId: null,
    liveGeneratorVariant: null,
    transition: { mode: "cut", length: { unit: "beats", value: 4 } },
    overlay: defaults.overlay,
    countdown: defaults.countdown,
    logo: { isVisible: true, corner: "topLeft" },
    eventCard: { isVisible: true, kind: "nextEvent" },
    effects: defaults.effects,
    mix: { clipId: MIX_CLIP_ID, amount: 0.4, blendMode: "screen" },
    tempo: {
      bpm: 128,
      downbeatAt: NOW - 90_000,
      quantize: "bar",
      source: "tap",
    },
    shuffle: {
      ...defaults.shuffle,
      excludedClipIds: [EXCLUDED_CLIP_ID, OUTSIDE_CLIP_ID],
    },
    activeSetlistId: SETLIST_ID,
    setlistIndex: 2,
    ...overrides,
  };
}

describe("restoreVjDemoStage upgrade and library reads", () => {
  it("a v1-shaped restore seeds a v2 stage", () => {
    const v1Snapshot = {
      stageEpoch: OLD_STAGE_EPOCH,
      revision: 7,
      activePackId: PACK_ID,
      liveClipId: CLIP_ID,
      transition: { mode: "cut", fadeMs: 400 },
      overlay: { text: "Hello", style: "ticker", isVisible: true },
      effects: {
        speed: 2,
        isMonochrome: true,
        isMirrored: false,
        isHueCycling: true,
        isStrobing: true,
        isBlackout: false,
        strobeStartedAt: NOW - 1_000,
      },
      shuffle: {
        isOn: true,
        intervalKind: "seconds",
        intervalValue: 10,
        bpm: 128,
      },
    };
    const restored = restoreVjDemoStage(
      freshStage(),
      v1Snapshot,
      demoLibrary({
        packs: new Map([[PACK_ID, { eventId: null }]]),
        clipIds: [CLIP_ID],
      }),
      NOW,
    );
    expect(restored).toMatchObject({
      stageEpoch: STAGE_EPOCH,
      revision: 1,
      clipSequence: 1,
      activePackId: PACK_ID,
      liveClipId: CLIP_ID,
      liveSince: NOW,
      transition: { mode: "cut", length: { unit: "ms", value: 400 } },
      overlay: {
        text: "Hello",
        style: "ticker",
        isVisible: true,
        position: "bottom",
        size: "l",
        colorToken: "cream",
        hideAt: null,
      },
      effects: {
        speed: 2,
        settings: {
          monochrome: { isOn: true, amount: 1, variant: null },
          hueCycle: { isOn: true, amount: 0.5, variant: null },
        },
        isStrobing: false,
        strobeStartedAt: null,
      },
      tempo: { bpm: 128, downbeatAt: NOW, quantize: "off", source: "manual" },
      shuffle: {
        isOn: true,
        intervalKind: "seconds",
        intervalValue: 10,
        source: "pack",
        excludedClipIds: [],
      },
      recentClipIds: [CLIP_ID],
      updatedAt: NOW,
    });
    expect(restored.shuffle).not.toHaveProperty("bpm");
  });

  it("seeds the default tempo from a v1 bpm that is not finite", () => {
    const restored = restoreVjDemoStage(
      freshStage(),
      {
        shuffle: {
          isOn: false,
          intervalKind: "seconds",
          intervalValue: 8,
          bpm: null,
        },
      },
      demoLibrary(),
      NOW,
    );
    expect(restored.tempo.bpm).toBe(VJ_LIMITS.bpmDefault);
  });

  it("drops a missing pack, live clip, mix clip or set list and clears the mix with its blend mode", () => {
    const restored = restoreVjDemoStage(
      freshStage(),
      v2Restore(),
      demoLibrary(),
      NOW,
    );
    expect(restored.activePackId).toBeNull();
    expect(restored.liveClipId).toBeNull();
    expect(restored.liveSince).toBeNull();
    expect(restored.mix).toEqual({
      clipId: null,
      amount: 0,
      blendMode: "screen",
    });
    expect(restored.activeSetlistId).toBeNull();
    expect(restored.setlistIndex).toBeNull();
  });

  it("keeps every id the library has", () => {
    const restored = restoreVjDemoStage(
      freshStage(),
      v2Restore(),
      allFoundLibrary(),
      NOW,
    );
    expect(restored.activePackId).toBe(PACK_ID);
    expect(restored.liveClipId).toBe(CLIP_ID);
    expect(restored.mix).toEqual({
      clipId: MIX_CLIP_ID,
      amount: 0.4,
      blendMode: "screen",
    });
    expect(restored.activeSetlistId).toBe(SETLIST_ID);
    expect(restored.setlistIndex).toBe(2);
    expect(restored.transition).toEqual({
      mode: "cut",
      length: { unit: "beats", value: 4 },
    });
    expect(restored.logo).toEqual({ isVisible: true, corner: "topLeft" });
  });

  it("keeps excluded clip ids only inside the restored pack", () => {
    const restored = restoreVjDemoStage(
      freshStage(),
      v2Restore(),
      allFoundLibrary(),
      NOW,
    );
    expect(restored.shuffle.excludedClipIds).toEqual([EXCLUDED_CLIP_ID]);
    const withoutPack = restoreVjDemoStage(
      freshStage(),
      v2Restore({ activePackId: null }),
      allFoundLibrary(),
      NOW,
    );
    expect(withoutPack.shuffle.excludedClipIds).toEqual([]);
  });
});

describe("restoreVjDemoStage live source and effects", () => {
  it("restores a generator with its variant and the default variant for a bad one", () => {
    const generatorRestore = v2Restore({
      liveClipId: null,
      liveGeneratorId: "prideFlagWave",
      liveGeneratorVariant: "trans",
    });
    const restored = restoreVjDemoStage(
      freshStage(),
      generatorRestore,
      demoLibrary(),
      NOW,
    );
    expect(restored.liveGeneratorId).toBe("prideFlagWave");
    expect(restored.liveGeneratorVariant).toBe("trans");
    expect(restored.liveSince).toBe(NOW);
    expect(restored.recentClipIds).toEqual([]);
    const badVariant = restoreVjDemoStage(
      freshStage(),
      { ...generatorRestore, liveGeneratorVariant: "unknown" },
      demoLibrary(),
      NOW,
    );
    expect(badVariant.liveGeneratorVariant).toBe("rainbow");
    const badGenerator = restoreVjDemoStage(
      freshStage(),
      { ...generatorRestore, liveGeneratorId: "lava" },
      demoLibrary(),
      NOW,
    );
    expect(badGenerator.liveGeneratorId).toBeNull();
    expect(badGenerator.liveSince).toBeNull();
  });

  it("keeps the first 8 effects on in catalog order", () => {
    const nineOn: VjEffectId[] = [
      "monochrome",
      "saturate",
      "contrast",
      "thermal",
      "hueCycle",
      "hueShift",
      "vhs",
      "filmGrain",
      "scanlines",
    ];
    const settings: Record<string, unknown> = {};
    for (const effectId of nineOn) {
      settings[effectId] = { isOn: true, amount: 0.7, variant: null };
    }
    const restored = restoreVjDemoStage(
      freshStage(),
      v2Restore({
        effects: {
          speed: 1,
          settings,
          isStrobing: false,
          isBlackout: false,
          strobeStartedAt: null,
        },
      }),
      demoLibrary(),
      NOW,
    );
    const onIds = Object.entries(restored.effects.settings)
      .filter(([, setting]) => setting?.isOn === true)
      .map(([effectId]) => effectId);
    expect(onIds).toEqual(nineOn.slice(0, 8));
    expect(restored.effects.settings.scanlines?.isOn).toBe(false);
  });

  it("keeps the first playhead effect, drops a bad entry, turns the strobe off and keeps blackout", () => {
    const restored = restoreVjDemoStage(
      freshStage(),
      v2Restore({
        effects: {
          speed: 1,
          settings: {
            freeze: { isOn: true, amount: 1, variant: null },
            reverse: { isOn: true, amount: 1, variant: null },
            monochrome: "broken",
          },
          isStrobing: true,
          isBlackout: true,
          strobeStartedAt: NOW,
        },
      }),
      demoLibrary(),
      NOW,
    );
    expect(restored.effects.settings.freeze?.isOn).toBe(true);
    expect(restored.effects.settings.reverse?.isOn ?? false).toBe(false);
    expect(restored.effects.settings.monochrome).toBeUndefined();
    expect(restored.effects.isStrobing).toBe(false);
    expect(restored.effects.strobeStartedAt).toBeNull();
    expect(restored.effects.isBlackout).toBe(true);
  });
});

describe("restoreVjDemoStage overlay, countdown, event card and set list", () => {
  it("hides an overlay whose hideAt is at or before now and keeps a later one", () => {
    const overlay = {
      text: "Doors close soon",
      style: "big",
      isVisible: true,
      position: "top",
      size: "m",
      colorToken: "cream",
    };
    const stale = restoreVjDemoStage(
      freshStage(),
      v2Restore({ overlay: { ...overlay, hideAt: NOW } }),
      allFoundLibrary(),
      NOW,
    );
    expect(stale.overlay.isVisible).toBe(false);
    expect(stale.overlay.hideAt).toBeNull();
    expect(stale.overlay.position).toBe("top");
    const running = restoreVjDemoStage(
      freshStage(),
      v2Restore({ overlay: { ...overlay, hideAt: NOW + 1_000 } }),
      allFoundLibrary(),
      NOW,
    );
    expect(running.overlay.isVisible).toBe(true);
    expect(running.overlay.hideAt).toBe(NOW + 1_000);
  });

  it("shows a countdown only while targetAt plus the hold is after now", () => {
    const finished = restoreVjDemoStage(
      freshStage(),
      v2Restore({
        countdown: {
          isVisible: true,
          targetAt: NOW - VJ_LIMITS.countdownHoldMs,
          label: "Show",
        },
      }),
      allFoundLibrary(),
      NOW,
    );
    expect(finished.countdown).toEqual({
      isVisible: false,
      targetAt: NOW - VJ_LIMITS.countdownHoldMs,
      label: "Show",
    });
    const holding = restoreVjDemoStage(
      freshStage(),
      v2Restore({
        countdown: { isVisible: true, targetAt: NOW - 1_000, label: "Show" },
      }),
      allFoundLibrary(),
      NOW,
    );
    expect(holding.countdown.isVisible).toBe(true);
  });

  it("shows the event card only when the restored pack links an event", () => {
    const linked = restoreVjDemoStage(
      freshStage(),
      v2Restore(),
      allFoundLibrary(),
      NOW,
    );
    expect(linked.eventCard).toEqual({ isVisible: true, kind: "nextEvent" });
    const unlinked = restoreVjDemoStage(
      freshStage(),
      v2Restore(),
      allFoundLibrary(null),
      NOW,
    );
    expect(unlinked.eventCard).toEqual({ isVisible: false, kind: "nextEvent" });
  });

  it("nulls a set list index at or past the count", () => {
    const atCount = restoreVjDemoStage(
      freshStage(),
      v2Restore({ setlistIndex: 4 }),
      allFoundLibrary(),
      NOW,
    );
    expect(atCount.activeSetlistId).toBe(SETLIST_ID);
    expect(atCount.setlistIndex).toBeNull();
    const lastItem = restoreVjDemoStage(
      freshStage(),
      v2Restore({ setlistIndex: 3 }),
      allFoundLibrary(),
      NOW,
    );
    expect(lastItem.setlistIndex).toBe(3);
  });
});

describe("restoreVjDemoStage adoption", () => {
  it("leaves overrides out and seeds history with the live clip", () => {
    const restored = restoreVjDemoStage(
      freshStage(),
      v2Restore({
        screenOverrides: {
          [EXCLUDED_CLIP_ID]: {
            clipId: MIX_CLIP_ID,
            generatorId: null,
            generatorVariant: null,
          },
        },
        recentClipIds: [MIX_CLIP_ID, CLIP_ID],
        liveSince: NOW - 60_000,
        clipSequence: 99,
      }),
      allFoundLibrary(),
      NOW,
    );
    expect(restored.screenOverrides).toEqual({});
    expect(restored.recentClipIds).toEqual([CLIP_ID]);
    expect(restored.liveSince).toBe(NOW);
  });

  it("stamps revision 1, clipSequence 1, the fresh stageEpoch and updatedAt now", () => {
    const restored = restoreVjDemoStage(
      freshStage(),
      v2Restore(),
      allFoundLibrary(),
      NOW,
    );
    expect(restored.revision).toBe(1);
    expect(restored.clipSequence).toBe(1);
    expect(restored.stageEpoch).toBe(STAGE_EPOCH);
    expect(restored.updatedAt).toBe(NOW);
  });

  it("keeps the tempo as sent", () => {
    const restored = restoreVjDemoStage(
      freshStage(),
      v2Restore(),
      allFoundLibrary(),
      NOW,
    );
    expect(restored.tempo).toEqual({
      bpm: 128,
      downbeatAt: NOW - 90_000,
      quantize: "bar",
      source: "tap",
    });
  });

  it("a downbeat from an hour ago is kept", () => {
    const restored = restoreVjDemoStage(
      freshStage(),
      v2Restore({
        tempo: {
          bpm: 124,
          downbeatAt: NOW - HOUR_MS,
          quantize: "beat",
          source: "manual",
        },
      }),
      allFoundLibrary(),
      NOW,
    );
    expect(restored.tempo.downbeatAt).toBe(NOW - HOUR_MS);
  });

  it("answers a canonical state with uppercase ids lowercased", () => {
    const restored = restoreVjDemoStage(
      freshStage(),
      v2Restore({
        activePackId: PACK_ID.toUpperCase(),
        liveClipId: CLIP_ID.toUpperCase(),
      }),
      allFoundLibrary(),
      NOW,
    );
    expect(restored.activePackId).toBe(PACK_ID);
    expect(restored.liveClipId).toBe(CLIP_ID);
    expect(restored).toEqual(canonicalVjStageState(restored));
  });

  it("answers the fresh stage for a payload that is not an object", () => {
    const fresh = freshStage();
    expect(restoreVjDemoStage(fresh, "state", demoLibrary(), NOW)).toBe(fresh);
  });
});
