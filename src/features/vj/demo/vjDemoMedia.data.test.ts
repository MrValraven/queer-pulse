import { existsSync, readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { VJ_DEMO_MEDIA } from "./vjDemoMedia.data";

/** Vitest runs from the repo root, so public files resolve from cwd. */
const PUBLIC_DIRECTORY = "public";
const MAX_TOTAL_BYTES = 1_500_000;
const MAX_GIF_BYTES = 225_280;

function readAscii(bytes: Buffer, start: number, end: number): string {
  return bytes.subarray(start, end).toString("latin1");
}

describe("VJ demo media", () => {
  it("ships every listed file at its listed size", () => {
    for (const entry of VJ_DEMO_MEDIA) {
      expect(statSync(`${PUBLIC_DIRECTORY}${entry.mediaPath}`).size).toBe(
        entry.byteSize,
      );
      expect(existsSync(`${PUBLIC_DIRECTORY}${entry.thumbnailPath}`)).toBe(
        true,
      );
    }
  });

  it("ships looping GIFs and WebP stills", () => {
    for (const entry of VJ_DEMO_MEDIA) {
      const gifBytes = readFileSync(`${PUBLIC_DIRECTORY}${entry.mediaPath}`);
      expect(readAscii(gifBytes, 0, 6)).toBe("GIF89a");
      expect(gifBytes.includes("NETSCAPE2.0")).toBe(true);
      const thumbnailBytes = readFileSync(
        `${PUBLIC_DIRECTORY}${entry.thumbnailPath}`,
      );
      expect(readAscii(thumbnailBytes, 0, 4)).toBe("RIFF");
      expect(readAscii(thumbnailBytes, 8, 12)).toBe("WEBP");
    }
  });

  it("keeps the demo media small", () => {
    const totalBytes = VJ_DEMO_MEDIA.reduce(
      (sum, entry) => sum + entry.byteSize,
      0,
    );
    expect(totalBytes).toBeLessThan(MAX_TOTAL_BYTES);
    for (const entry of VJ_DEMO_MEDIA) {
      expect(entry.byteSize).toBeLessThan(MAX_GIF_BYTES);
    }
  });

  it("covers the pixelated and the portrait cases", () => {
    expect(VJ_DEMO_MEDIA.some((entry) => entry.width <= 96)).toBe(true);
    expect(VJ_DEMO_MEDIA.some((entry) => entry.height > entry.width)).toBe(
      true,
    );
  });

  it("names eight distinct clips", () => {
    expect(VJ_DEMO_MEDIA).toHaveLength(8);
    expect(new Set(VJ_DEMO_MEDIA.map((entry) => entry.slug)).size).toBe(8);
    expect(new Set(VJ_DEMO_MEDIA.map((entry) => entry.title)).size).toBe(8);
  });
});
