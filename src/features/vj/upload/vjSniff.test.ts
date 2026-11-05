import { describe, expect, it } from "vitest";
import {
  VJ_SNIFFED_CONTENT_TYPE,
  hasHevcMarker,
  vjSniffClipFormat,
} from "./vjSniff";

function asciiBytes(text: string): number[] {
  return Array.from(text, (letter) => letter.charCodeAt(0));
}

/** A Blob of `size` zero bytes with `marker` written at `offset`. */
function blobWithMarker(size: number, marker: string, offset: number): Blob {
  const bytes = new Uint8Array(size);
  bytes.set(asciiBytes(marker), offset);
  return new Blob([bytes]);
}

describe("vjSniffClipFormat", () => {
  it.each([
    ["mp4", [0, 0, 0, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]],
    ["webm", [0x1a, 0x45, 0xdf, 0xa3]],
    ["gif", asciiBytes("GIF89a")],
    ["gif", asciiBytes("GIF87a")],
    ["unknown", [0x89, 0x50, 0x4e, 0x47]],
    ["unknown", [0x00, 0x01]],
  ])("reads %s", (expectedFormat, bytes) => {
    expect(vjSniffClipFormat(new Uint8Array(bytes))).toBe(expectedFormat);
  });

  it("reads a QuickTime brand as mov", () => {
    const bytes = new Uint8Array([
      0,
      0,
      0,
      0x14,
      ...asciiBytes("ftyp"),
      ...asciiBytes("qt  "),
      0,
      0,
      0,
      0,
    ]);
    expect(vjSniffClipFormat(bytes)).toBe("mov");
  });

  it.each(["heic", "heix", "mif1", "avif"])(
    "reads a still-image %s brand as unknown",
    (brand) => {
      const bytes = new Uint8Array([
        0,
        0,
        0,
        0x18,
        ...asciiBytes("ftyp"),
        ...asciiBytes(brand),
        0,
        0,
        0,
        0,
      ]);
      expect(vjSniffClipFormat(bytes)).toBe("unknown");
    },
  );

  it("maps each playable format to the content type it uploads as", () => {
    expect(VJ_SNIFFED_CONTENT_TYPE).toEqual({
      mp4: "video/mp4",
      webm: "video/webm",
      gif: "image/gif",
    });
  });
});

describe("hasHevcMarker", () => {
  it("finds an HEVC marker at either end of a file", async () => {
    await expect(
      hasHevcMarker(blobWithMarker(1000, "hvc1", 950)),
    ).resolves.toBe(true);
    await expect(hasHevcMarker(blobWithMarker(1000, "hev1", 0))).resolves.toBe(
      true,
    );
    await expect(hasHevcMarker(new Blob([new Uint8Array(1000)]))).resolves.toBe(
      false,
    );
  });

  it("scans only the first and last bytes of a large file", async () => {
    // With a 64-byte window, the head and the tail are read and the middle is skipped.
    await expect(
      hasHevcMarker(blobWithMarker(1000, "hvc1", 10), 64),
    ).resolves.toBe(true);
    await expect(
      hasHevcMarker(blobWithMarker(1000, "hvc1", 980), 64),
    ).resolves.toBe(true);
    await expect(
      hasHevcMarker(blobWithMarker(1000, "hvc1", 500), 64),
    ).resolves.toBe(false);
  });
});
