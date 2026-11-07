import { describe, expect, it } from "vitest";
import { createVjStageState } from "./vj.state";
import { upgradeVjStageFieldsV1 } from "./vj.upgrade";

const NOW = 50_000;
const CLIP_ID = "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";

/** A stage record as the v1 contract wrote it. */
function buildV1StageRecord(): Record<string, unknown> {
  return {
    stageEpoch: "0d9c8b7a-6f5e-4d3c-8b2a-190817263544",
    revision: 4,
    clipSequence: 2,
    activePackId: null,
    liveClipId: null,
    transition: { mode: "fade", fadeMs: 1200 },
    overlay: { text: "Hello", style: "big", isVisible: true },
    effects: {
      speed: 1.5,
      isMonochrome: false,
      isMirrored: false,
      isHueCycling: false,
      isStrobing: false,
      isBlackout: false,
      strobeStartedAt: null,
    },
    shuffle: { isOn: true, intervalKind: "beats", intervalValue: 16, bpm: 128 },
    updatedAt: 500,
  };
}

function withEffectFlags(
  flags: Record<string, boolean>,
): Record<string, unknown> {
  const record = buildV1StageRecord();
  record.effects = { ...(record.effects as object), ...flags };
  return record;
}

describe("upgradeVjStageFieldsV1", () => {
  it("turns a fade length into an ms transition length", () => {
    expect(
      upgradeVjStageFieldsV1(buildV1StageRecord(), NOW).transition,
    ).toEqual({ mode: "fade", length: { unit: "ms", value: 1200 } });
  });

  it("places a big overlay in the centre at size l in cream with no auto-hide", () => {
    expect(upgradeVjStageFieldsV1(buildV1StageRecord(), NOW).overlay).toEqual({
      text: "Hello",
      style: "big",
      isVisible: true,
      position: "center",
      size: "l",
      colorToken: "cream",
      hideAt: null,
    });
  });

  it("places a ticker overlay at the bottom", () => {
    const record = buildV1StageRecord();
    record.overlay = { text: "News", style: "ticker", isVisible: false };
    const overlay = upgradeVjStageFieldsV1(record, NOW).overlay as Record<
      string,
      unknown
    >;
    expect(overlay.position).toBe("bottom");
  });

  it("maps monochrome to a full monochrome setting", () => {
    const effects = upgradeVjStageFieldsV1(
      withEffectFlags({ isMonochrome: true }),
      NOW,
    ).effects as Record<string, unknown>;
    expect(effects.settings).toEqual({
      monochrome: { isOn: true, amount: 1, variant: null },
    });
  });

  it("mirror maps to horizontal", () => {
    const effects = upgradeVjStageFieldsV1(
      withEffectFlags({ isMirrored: true }),
      NOW,
    ).effects as Record<string, unknown>;
    expect(effects.settings).toEqual({
      mirror: { isOn: true, amount: 1, variant: "horizontal" },
    });
  });

  it("maps hue cycling to hueCycle at half amount", () => {
    const effects = upgradeVjStageFieldsV1(
      withEffectFlags({ isHueCycling: true }),
      NOW,
    ).effects as Record<string, unknown>;
    expect(effects.settings).toEqual({
      hueCycle: { isOn: true, amount: 0.5, variant: null },
    });
  });

  it("keeps the three flags in catalog order when all were on", () => {
    const effects = upgradeVjStageFieldsV1(
      withEffectFlags({
        isMirrored: true,
        isMonochrome: true,
        isHueCycling: true,
      }),
      NOW,
    ).effects as Record<string, unknown>;
    expect(Object.keys(effects.settings as object)).toEqual([
      "monochrome",
      "hueCycle",
      "mirror",
    ]);
  });

  it("a v1 record with all flags off gets empty settings", () => {
    const effects = upgradeVjStageFieldsV1(buildV1StageRecord(), NOW)
      .effects as Record<string, unknown>;
    expect(effects).toEqual({
      speed: 1.5,
      settings: {},
      isStrobing: false,
      isBlackout: false,
      strobeStartedAt: null,
    });
  });

  it("moves the shuffle bpm into a fresh manual tempo", () => {
    const upgraded = upgradeVjStageFieldsV1(buildV1StageRecord(), NOW);
    expect(upgraded.tempo).toEqual({
      bpm: 128,
      downbeatAt: NOW,
      quantize: "off",
      source: "manual",
    });
    expect(upgraded.shuffle).not.toHaveProperty("bpm");
  });

  it("seeds the default bpm when the v1 bpm is not a finite number", () => {
    const record = buildV1StageRecord();
    record.shuffle = {
      isOn: false,
      intervalKind: "seconds",
      intervalValue: 8,
      bpm: "fast",
    };
    const tempo = upgradeVjStageFieldsV1(record, NOW).tempo as Record<
      string,
      unknown
    >;
    expect(tempo.bpm).toBe(124);
  });

  it("gives a shuffle without a source the pack source and no exclusions", () => {
    expect(upgradeVjStageFieldsV1(buildV1StageRecord(), NOW).shuffle).toEqual({
      isOn: true,
      intervalKind: "beats",
      intervalValue: 16,
      source: "pack",
      excludedClipIds: [],
    });
  });

  it("fills missing v2 fields from the defaults", () => {
    const upgraded = upgradeVjStageFieldsV1(buildV1StageRecord(), NOW);
    const defaults = createVjStageState("", NOW);
    expect(upgraded.liveGeneratorId).toBeNull();
    expect(upgraded.liveGeneratorVariant).toBeNull();
    expect(upgraded.countdown).toEqual(defaults.countdown);
    expect(upgraded.logo).toEqual(defaults.logo);
    expect(upgraded.eventCard).toEqual(defaults.eventCard);
    expect(upgraded.mix).toEqual(defaults.mix);
    expect(upgraded.recentClipIds).toEqual([]);
    expect(upgraded.screenOverrides).toEqual({});
    expect(upgraded.activeSetlistId).toBeNull();
    expect(upgraded.setlistIndex).toBeNull();
    expect(upgraded.liveSince).toBeNull();
    expect(upgraded.revision).toBe(4);
    expect(upgraded.updatedAt).toBe(500);
  });

  it("liveSince is now when a clip was live", () => {
    const record = buildV1StageRecord();
    record.liveClipId = CLIP_ID;
    expect(upgradeVjStageFieldsV1(record, NOW).liveSince).toBe(NOW);
  });

  it("keeps a v2 group untouched inside a v1 record", () => {
    const record = buildV1StageRecord();
    const tempo = { bpm: 140, downbeatAt: 10, quantize: "bar", source: "tap" };
    record.tempo = tempo;
    record.transition = { mode: "iris", length: { unit: "beats", value: 4 } };
    const upgraded = upgradeVjStageFieldsV1(record, NOW);
    expect(upgraded.tempo).toBe(tempo);
    expect(upgraded.transition).toEqual({
      mode: "iris",
      length: { unit: "beats", value: 4 },
    });
    expect(upgraded.shuffle).not.toHaveProperty("bpm");
  });

  it("a v2 record comes back unchanged", () => {
    const record = createVjStageState("epoch", 100) as unknown as Record<
      string,
      unknown
    >;
    expect(upgradeVjStageFieldsV1(record, NOW)).toBe(record);
  });

  it("returns a v2 restore payload without liveSince unchanged", () => {
    const {
      liveSince: _liveSince,
      recentClipIds: _recentClipIds,
      screenOverrides: _screenOverrides,
      clipSequence: _clipSequence,
      updatedAt: _updatedAt,
      ...restore
    } = createVjStageState("epoch", 100);
    const record = restore as unknown as Record<string, unknown>;
    expect(upgradeVjStageFieldsV1(record, NOW)).toBe(record);
    expect(record).not.toHaveProperty("liveSince");
  });

  it("leaves the input record as it was", () => {
    const record = buildV1StageRecord();
    const snapshot = JSON.stringify(record);
    upgradeVjStageFieldsV1(record, NOW);
    expect(JSON.stringify(record)).toBe(snapshot);
  });
});
