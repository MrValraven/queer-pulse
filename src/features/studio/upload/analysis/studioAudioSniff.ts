import type { StudioByteSource } from "./studioByteSource";
import { findFrameBoundary, id3v2Length } from "./studioMp3Frames";

/** MP3 or M4A from the first bytes, for a stored track whose upload type is
 *  not on the owner row. */
export async function sniffAudioKind(
  source: StudioByteSource,
): Promise<"mp3" | "m4a" | null> {
  const head = new Uint8Array(
    await source.read(0, Math.min(source.size, 4096)),
  );
  const isFtyp =
    head[4] === 0x66 &&
    head[5] === 0x74 &&
    head[6] === 0x79 &&
    head[7] === 0x70;
  if (isFtyp) return "m4a";
  if (id3v2Length(head) > 0) return "mp3";
  return findFrameBoundary(head, 0) === 0 ? "mp3" : null;
}
