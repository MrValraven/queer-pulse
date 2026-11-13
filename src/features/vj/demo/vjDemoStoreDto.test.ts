import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  forgetVjDemoPreviewUrl,
  setVjDemoPreviewUrl,
  toVjDemoClipDto,
  toVjDemoSetlistDto,
  toVjDemoSetlistItemDto,
  vjDemoPreviewUrlOf,
} from "./vjDemoStoreDto";
import {
  buildVjDemoSeedLibrary,
  configureVjDemoStore,
  type StoredVjDemoLibrary,
} from "./vjDemoStorePersistence";

const CLIP_ID = "6f1f3c1e-0d6b-4b8e-9a51-1f0c2b7d9e10";

describe("demo preview blob URLs", () => {
  const revokeObjectURL = vi.fn<(url: string) => void>();

  beforeEach(() => {
    revokeObjectURL.mockClear();
    // jsdom has no revokeObjectURL, so the test puts one in for the run.
    vi.stubGlobal(
      "URL",
      Object.assign(class extends URL {}, { revokeObjectURL }),
    );
  });

  afterEach(() => {
    forgetVjDemoPreviewUrl(CLIP_ID);
    vi.unstubAllGlobals();
  });

  it("revokes the replaced blob when a clip gets a new preview", () => {
    setVjDemoPreviewUrl(CLIP_ID, "blob:first");
    setVjDemoPreviewUrl(CLIP_ID, "blob:second");

    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:first");
    expect(vjDemoPreviewUrlOf(CLIP_ID)).toBe("blob:second");
  });

  it("keeps the blob when the same preview is set again", () => {
    setVjDemoPreviewUrl(CLIP_ID, "blob:same");
    setVjDemoPreviewUrl(CLIP_ID, "blob:same");

    expect(revokeObjectURL).not.toHaveBeenCalled();
  });

  it("revokes the blob when the clip's preview is forgotten", () => {
    setVjDemoPreviewUrl(CLIP_ID, "blob:gone");
    forgetVjDemoPreviewUrl(CLIP_ID);

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:gone");
    expect(vjDemoPreviewUrlOf(CLIP_ID)).toBeNull();
  });
});

describe("demo set list DTOs", () => {
  const FIXED_NOW = Date.parse("2026-11-13T20:00:00.000Z");
  const PINK_TUNNEL_ID = "00000000-0000-4000-8000-0000000000c4";
  let library: StoredVjDemoLibrary;

  beforeEach(() => {
    configureVjDemoStore({
      storage: null,
      channel: null,
      now: () => FIXED_NOW,
    });
    library = buildVjDemoSeedLibrary();
  });

  it("projects a step with its kind, both targets and its own length", () => {
    expect(
      toVjDemoSetlistItemDto(
        {
          id: "item-1",
          kind: "clip",
          sceneId: null,
          clipId: PINK_TUNNEL_ID,
          duration: { kind: "beats", value: 8 },
        },
        3,
      ),
    ).toEqual({
      id: "item-1",
      position: 3,
      kind: "clip",
      sceneId: null,
      clipId: PINK_TUNNEL_ID,
      duration: { kind: "beats", value: 8 },
    });
  });

  it("carries Loop and the default length and numbers the steps by index", () => {
    const setlist = library.setlists[0];
    if (setlist === undefined) throw new Error("expected the seed set list");
    const dto = toVjDemoSetlistDto(library, setlist);
    expect(dto).toMatchObject({
      position: 0,
      isLooping: true,
      stepDuration: { kind: "seconds", value: 8 },
    });
    expect(dto.items.map((item) => item.position)).toEqual([0, 1, 2, 3]);
    dto.stepDuration.value = 99;
    expect(setlist.stepDuration.value).toBe(8);
  });

  it("counts the steps that play a clip on its DTO", () => {
    const clip = library.clips.find(
      (candidate) => candidate.id === PINK_TUNNEL_ID,
    );
    if (clip === undefined) throw new Error("expected the seed clip");
    expect(toVjDemoClipDto(library, clip).setlistItemCount).toBe(1);
    library.setlists[0]?.items.push({
      id: "item-extra",
      kind: "clip",
      sceneId: null,
      clipId: PINK_TUNNEL_ID,
      duration: null,
    });
    expect(toVjDemoClipDto(library, clip).setlistItemCount).toBe(2);
  });
});
