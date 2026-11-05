import { describe, expect, it } from "vitest";
import { UPLOAD_LIMITS, sanitizeGif } from "./uploadProcessing";

const NETSCAPE_LOOP_BLOCK = [
  0x21,
  0xff,
  0x0b,
  ...Array.from("NETSCAPE2.0", (c) => c.charCodeAt(0)),
  0x03,
  0x01,
  0x00,
  0x00,
  0x00,
];
const COMMENT_BLOCK = [0x21, 0xfe, 0x03, 0x61, 0x62, 0x63, 0x00];

/** A hand-built GIF89a: 1x1, two-colour global table, a loop block, a comment and one image. */
function buildGifBytes(): Uint8Array {
  return Uint8Array.from([
    ...Array.from("GIF89a", (c) => c.charCodeAt(0)),
    0x01,
    0x00,
    0x01,
    0x00,
    0x80,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0xff,
    0xff,
    0xff,
    ...NETSCAPE_LOOP_BLOCK,
    ...COMMENT_BLOCK,
    0x2c,
    0x00,
    0x00,
    0x00,
    0x00,
    0x01,
    0x00,
    0x01,
    0x00,
    0x00,
    0x02,
    0x02,
    0x4c,
    0x01,
    0x00,
    0x3b,
  ]);
}

function containsPair(
  bytes: Uint8Array,
  first: number,
  second: number,
): boolean {
  for (let byteIndex = 0; byteIndex < bytes.length - 1; byteIndex += 1) {
    if (bytes[byteIndex] === first && bytes[byteIndex + 1] === second) {
      return true;
    }
  }
  return false;
}

describe("VJ upload limits and GIF sanitizing", () => {
  it("caps a VJ clip at 100 MB and a thumbnail at 256 KB", () => {
    expect(UPLOAD_LIMITS.vj_clip).toEqual({
      maxBytes: 104857600,
      maxLabel: "100 MB",
    });
    expect(UPLOAD_LIMITS.vj_thumbnail).toEqual({
      maxBytes: 262144,
      maxLabel: "256 KB",
    });
  });

  it("keeps a GIF's loop block and drops its comment", () => {
    const sourceBytes = buildGifBytes();
    expect(containsPair(sourceBytes, 0x21, 0xfe)).toBe(true);
    const cleanBytes = sanitizeGif(sourceBytes);
    const cleanText = String.fromCharCode(...cleanBytes);
    expect(cleanText).toContain("NETSCAPE2.0");
    expect(containsPair(cleanBytes, 0x21, 0xfe)).toBe(false);
    expect(cleanBytes[cleanBytes.length - 1]).toBe(0x3b);
  });

  it("throws on a cut-off GIF", () => {
    const sourceBytes = buildGifBytes();
    const cutBytes = sourceBytes.subarray(0, sourceBytes.length - 3);
    expect(() => sanitizeGif(cutBytes)).toThrow();
  });
});
