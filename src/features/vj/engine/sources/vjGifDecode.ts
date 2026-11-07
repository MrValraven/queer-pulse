/**
 * Decodes a whole GIF up front through the WebCodecs ImageDecoder API
 * (Chrome and Edge), so the engine plays it on its own playhead clock with
 * every time effect. Each decoded VideoFrame becomes an ImageBitmap and is
 * closed at once; a failure or an abort closes every bitmap made so far.
 *
 * Answers `unsupported` without ImageDecoder (or GIF support) and `tooLarge`
 * when the decoded frames would pass the byte budget; the source falls back
 * to an `<img>` for both. `decode_failed` means the file itself is broken.
 */

export const VJ_GIF_BUDGET_BYTES = 96 * 1024 * 1024;
/** Decoded GIF frames across every live source together. */
export const VJ_GIF_SHARED_BUDGET_BYTES = 192 * 1024 * 1024;

const BYTES_PER_PIXEL = 4;
const MICROSECONDS_PER_MS = 1000;

export type VjGifDecodeFailure = "unsupported" | "tooLarge" | "decode_failed";

export type VjGifDecodeResult =
  | { ok: true; frames: ImageBitmap[]; durationsMs: number[] }
  | { ok: false; reason: VjGifDecodeFailure };

export interface VjGifDecodeOptions {
  /** Defaults to VJ_GIF_BUDGET_BYTES; the source passes less when the shared budget holds less. */
  budgetBytes?: number;
}

export function isVjImageDecoderAvailable(): boolean {
  return (
    "ImageDecoder" in globalThis &&
    typeof globalThis.ImageDecoder === "function"
  );
}

async function isGifDecodable(): Promise<boolean> {
  try {
    return await ImageDecoder.isTypeSupported("image/gif");
  } catch {
    return false;
  }
}

async function fetchVjGifBytes(
  sourceUrl: string,
  signal: AbortSignal,
): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(sourceUrl, { signal });
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

function closeVjBitmaps(frames: readonly ImageBitmap[]): void {
  for (const frame of frames) frame.close();
}

/** Decodes frame after frame; answers a failure reason or null once every frame is in `frames`. */
async function decodeVjGifFrames(
  decoder: ImageDecoder,
  signal: AbortSignal,
  budgetBytes: number,
  frames: ImageBitmap[],
  durationsMs: number[],
): Promise<VjGifDecodeFailure | null> {
  await decoder.tracks.ready;
  await decoder.completed;
  const frameCount = decoder.tracks.selectedTrack?.frameCount ?? 0;
  if (frameCount < 1) return "decode_failed";
  let decodedBytes = 0;
  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    if (signal.aborted) return "decode_failed";
    const { image } = await decoder.decode({ frameIndex });
    try {
      const frameBytes =
        image.displayWidth * image.displayHeight * BYTES_PER_PIXEL;
      // The first frame's size times the count tells early that the GIF cannot fit.
      if (frameIndex === 0 && frameBytes * frameCount > budgetBytes) {
        return "tooLarge";
      }
      decodedBytes += frameBytes;
      if (decodedBytes > budgetBytes) return "tooLarge";
      durationsMs.push((image.duration ?? 0) / MICROSECONDS_PER_MS);
      frames.push(await createImageBitmap(image));
    } finally {
      image.close();
    }
  }
  return signal.aborted ? "decode_failed" : null;
}

export async function decodeVjGif(
  sourceUrl: string,
  signal: AbortSignal,
  options: VjGifDecodeOptions = {},
): Promise<VjGifDecodeResult> {
  if (!isVjImageDecoderAvailable() || !(await isGifDecodable())) {
    return { ok: false, reason: "unsupported" };
  }
  const budgetBytes = options.budgetBytes ?? VJ_GIF_BUDGET_BYTES;
  if (budgetBytes <= 0) return { ok: false, reason: "tooLarge" };
  const bytes = await fetchVjGifBytes(sourceUrl, signal);
  if (bytes === null || signal.aborted) {
    return { ok: false, reason: "decode_failed" };
  }
  const frames: ImageBitmap[] = [];
  const durationsMs: number[] = [];
  let failure: VjGifDecodeFailure | null;
  let decoder: ImageDecoder | null = null;
  try {
    decoder = new ImageDecoder({ data: bytes, type: "image/gif" });
    failure = await decodeVjGifFrames(
      decoder,
      signal,
      budgetBytes,
      frames,
      durationsMs,
    );
  } catch {
    failure = "decode_failed";
  } finally {
    decoder?.close();
  }
  if (failure !== null) {
    closeVjBitmaps(frames);
    return { ok: false, reason: failure };
  }
  return { ok: true, frames, durationsMs };
}
