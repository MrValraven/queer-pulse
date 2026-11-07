import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  forgetVjDemoPreviewUrl,
  setVjDemoPreviewUrl,
  vjDemoPreviewUrlOf,
} from "./vjDemoStoreDto";

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
