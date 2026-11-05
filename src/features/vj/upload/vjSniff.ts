import type { VjClipUploadContentType } from "../../members/api/uploads.api";
import { VJ_HEVC_SCAN_BYTES } from "../vj.constants";

/** What the first bytes of a picked file say it is (contract 3.4 and 8.4). */
export type VjSniffedFormat = "mp4" | "webm" | "gif" | "mov" | "unknown";

/** The content type a sniffed format presigns and uploads as; `file.type` is never read. */
export const VJ_SNIFFED_CONTENT_TYPE: Record<
  "mp4" | "webm" | "gif",
  VjClipUploadContentType
> = {
  mp4: "video/mp4",
  webm: "video/webm",
  gif: "image/gif",
};

const FTYP_BYTES = [0x66, 0x74, 0x79, 0x70];
const QUICKTIME_BRAND_BYTES = [0x71, 0x74, 0x20, 0x20];
/** Still-image ISO-BMFF brands (HEIF, HEIC and AVIF photos). They share the
 *  `ftyp` box with MP4, so they read as an unsupported type before any decode
 *  could name them HEVC. */
const STILL_IMAGE_BRANDS = ["heic", "heix", "mif1", "avif"].map((brand) =>
  Array.from(brand, (letter) => letter.charCodeAt(0)),
);
const EBML_HEADER_BYTES = [0x1a, 0x45, 0xdf, 0xa3];
const GIF87_BYTES = Array.from("GIF87a", (letter) => letter.charCodeAt(0));
const GIF89_BYTES = Array.from("GIF89a", (letter) => letter.charCodeAt(0));
const HEVC_MARKERS = [
  Array.from("hvc1", (letter) => letter.charCodeAt(0)),
  Array.from("hev1", (letter) => letter.charCodeAt(0)),
];

function hasBytesAt(
  bytes: Uint8Array,
  offset: number,
  expected: readonly number[],
): boolean {
  if (bytes.length < offset + expected.length) return false;
  return expected.every(
    (expectedByte, byteIndex) => bytes[offset + byteIndex] === expectedByte,
  );
}

/** Reads the format from the first 16 bytes of a file. */
export function vjSniffClipFormat(firstBytes: Uint8Array): VjSniffedFormat {
  if (
    hasBytesAt(firstBytes, 0, GIF87_BYTES) ||
    hasBytesAt(firstBytes, 0, GIF89_BYTES)
  ) {
    return "gif";
  }
  if (hasBytesAt(firstBytes, 0, EBML_HEADER_BYTES)) return "webm";
  if (hasBytesAt(firstBytes, 4, FTYP_BYTES) && firstBytes.length >= 12) {
    if (STILL_IMAGE_BRANDS.some((brand) => hasBytesAt(firstBytes, 8, brand))) {
      return "unknown";
    }
    return hasBytesAt(firstBytes, 8, QUICKTIME_BRAND_BYTES) ? "mov" : "mp4";
  }
  return "unknown";
}

/**
 * The bytes of a Blob. Uses `Blob.arrayBuffer` where the runtime has it and a
 * FileReader where it does not (jsdom).
 */
export async function readVjBlobBytes(blob: Blob): Promise<Uint8Array> {
  if (typeof blob.arrayBuffer === "function") {
    return new Uint8Array(await blob.arrayBuffer());
  }
  return await new Promise<Uint8Array>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (result instanceof ArrayBuffer) resolve(new Uint8Array(result));
      else reject(new Error("vj-read-failed"));
    };
    reader.onerror = () => reject(new Error("vj-read-failed"));
    reader.readAsArrayBuffer(blob);
  });
}

function holdsHevcMarker(bytes: Uint8Array): boolean {
  for (let byteIndex = 0; byteIndex + 4 <= bytes.length; byteIndex += 1) {
    if (bytes[byteIndex] !== 0x68) continue;
    if (HEVC_MARKERS.some((marker) => hasBytesAt(bytes, byteIndex, marker))) {
      return true;
    }
  }
  return false;
}

/**
 * Whether the ASCII fourcc `hvc1` or `hev1` sits in the first or last
 * `scanBytes` of the file (contract 8.4 step 3). Only asked after a decode
 * failure, to tell an HEVC file from an unplayable one.
 */
export async function hasHevcMarker(
  file: Blob,
  scanBytes: number = VJ_HEVC_SCAN_BYTES,
): Promise<boolean> {
  const firstBytes = await readVjBlobBytes(
    file.slice(0, Math.min(file.size, scanBytes)),
  );
  if (holdsHevcMarker(firstBytes)) return true;
  if (file.size <= scanBytes) return false;
  const lastStart = Math.max(scanBytes, file.size - scanBytes);
  // The tail read starts a few bytes early so a marker across the seam is found.
  const tailBytes = await readVjBlobBytes(
    file.slice(Math.max(0, lastStart - 3), file.size),
  );
  return holdsHevcMarker(tailBytes);
}
