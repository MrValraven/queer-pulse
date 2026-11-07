import { describe, expect, it } from "vitest";
import {
  createVjStageState,
  vjSceneLookOf,
  type VjClipDTO,
  type VjSceneLook,
} from "../../../../shared/contracts/vj";
import { vjSceneSummaryOf } from "./vjSceneSummary";

const BASE_LOOK: VjSceneLook = vjSceneLookOf(createVjStageState("epoch", 0));

const lookWith = (patch: Partial<VjSceneLook>): VjSceneLook => ({
  ...BASE_LOOK,
  ...patch,
});

const CLIP: VjClipDTO = {
  id: "clip-1",
  title: "Disco ball",
  mediaKind: "video",
  mimeType: "video/mp4",
  byteSize: 1024,
  width: 1280,
  height: 720,
  durationMs: 4000,
  fitMode: "fill",
  thumbnailUrl: "https://files.example/thumb-1.webp",
  mediaUrl: "https://files.example/clip-1.mp4",
  packIds: [],
  packCount: 0,
  createdBy: null,
  createdAt: "2026-11-06T10:00:00.000Z",
  updatedAt: "2026-11-06T10:00:00.000Z",
  isFavorite: false,
  defaultSpeed: 1,
  loopInMs: null,
  loopOutMs: null,
  loopMode: "loop",
  previewUrl: null,
};

const CLIPS_BY_ID: ReadonlyMap<string, VjClipDTO> = new Map([[CLIP.id, CLIP]]);
const NO_CLIPS: ReadonlyMap<string, VjClipDTO> = new Map();

describe("vjSceneSummaryOf", () => {
  it("names a clip source with its title and thumbnail", () => {
    const look = lookWith({ source: { kind: "clip", clipId: CLIP.id } });
    expect(vjSceneSummaryOf(look, CLIPS_BY_ID).source).toEqual({
      kind: "clip",
      clipId: CLIP.id,
      title: "Disco ball",
      thumbnailUrl: "https://files.example/thumb-1.webp",
    });
  });

  it("names a generator source", () => {
    const look = lookWith({
      source: {
        kind: "generator",
        generatorId: "plasma",
        generatorVariant: null,
      },
    });
    expect(vjSceneSummaryOf(look, NO_CLIPS).source).toEqual({
      kind: "generator",
      generatorId: "plasma",
    });
  });

  it("reads a null source as keeping what plays", () => {
    const look = lookWith({ source: null });
    expect(vjSceneSummaryOf(look, CLIPS_BY_ID).source).toEqual({
      kind: "keepsLive",
    });
  });

  it("lists effects that are on in catalog order", () => {
    const look = lookWith({
      effects: {
        speed: BASE_LOOK.effects.speed,
        settings: {
          // Written out of catalog order on purpose.
          echo: { isOn: true, amount: 0.5, variant: null },
          kaleidoscope: { isOn: false, amount: 1, variant: "4" },
          monochrome: { isOn: true, amount: 1, variant: null },
        },
      },
    });
    expect(vjSceneSummaryOf(look, NO_CLIPS).effectIds).toEqual([
      "monochrome",
      "echo",
    ]);
  });

  it("flags visible text and a mix clip", () => {
    const plain = vjSceneSummaryOf(BASE_LOOK, NO_CLIPS);
    expect(plain.hasText).toBe(false);
    expect(plain.hasMix).toBe(false);

    const look = lookWith({
      overlay: { ...BASE_LOOK.overlay, text: "Welcome", isVisible: true },
      mix: { ...BASE_LOOK.mix, clipId: CLIP.id, amount: 0.4 },
    });
    const summary = vjSceneSummaryOf(look, CLIPS_BY_ID);
    expect(summary.hasText).toBe(true);
    expect(summary.hasMix).toBe(true);
  });

  it("copes with a clip that left the library", () => {
    const look = lookWith({ source: { kind: "clip", clipId: "clip-gone" } });
    expect(vjSceneSummaryOf(look, CLIPS_BY_ID).source).toEqual({
      kind: "clip",
      clipId: "clip-gone",
      title: null,
      thumbnailUrl: null,
    });
  });
});
