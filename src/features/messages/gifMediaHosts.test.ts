import { describe, expect, it } from "vitest";
import { DEMO_GIFS } from "./demoGifs.data";
import {
  isAllowedGifMediaUrl,
  renderableGifUrl,
  withRenderableGifThumbnail,
} from "./gifMediaHosts";

// SEC-24: a GIF bubble loads only from the GIF provider's hosts.
describe("isAllowedGifMediaUrl", () => {
  it("accepts KLIPY media", () => {
    expect(
      isAllowedGifMediaUrl("https://static.klipy.com/ii/abc/wave.gif"),
    ).toBe(true);
  });

  it("accepts every curated demo GIF", () => {
    for (const gif of DEMO_GIFS) {
      expect(isAllowedGifMediaUrl(gif.attachment.url)).toBe(true);
      expect(isAllowedGifMediaUrl(gif.attachment.previewUrl)).toBe(true);
    }
  });

  it.each([
    "https://tracker.example/pixel.gif",
    "https://static.klipy.com.evil.example/wave.gif",
    "http://static.klipy.com/wave.gif",
    "https://user:pass@static.klipy.com/wave.gif",
    "not a url",
  ])("refuses %s", (url) => {
    expect(isAllowedGifMediaUrl(url)).toBe(false);
  });
});

describe("renderableGifUrl", () => {
  it("drops a GIF url on a refused host and keeps every other kind", () => {
    expect(renderableGifUrl("gif", "https://tracker.example/pixel.gif")).toBe(
      null,
    );
    expect(
      renderableGifUrl("gif", "https://static.klipy.com/ii/abc/wave.gif"),
    ).toBe("https://static.klipy.com/ii/abc/wave.gif");
    expect(renderableGifUrl("image", "https://cdn.example/photo.jpg")).toBe(
      "https://cdn.example/photo.jpg",
    );
  });

  it("strips a refused GIF thumbnail from a reply quote", () => {
    const quote = {
      kind: "gif",
      thumbnailUrl: "https://tracker.example/pixel.gif",
    };
    expect(withRenderableGifThumbnail(quote).thumbnailUrl).toBe(null);
  });
});
