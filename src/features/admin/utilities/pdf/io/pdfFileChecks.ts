export const LARGE_FILE_WARNING_MEGABYTES = 100;
export const MAX_FILE_MEGABYTES = 400;

const BYTES_PER_MEGABYTE = 1024 * 1024;

export const LARGE_FILE_WARNING_BYTES =
  LARGE_FILE_WARNING_MEGABYTES * BYTES_PER_MEGABYTE;
export const MAX_FILE_BYTES = MAX_FILE_MEGABYTES * BYTES_PER_MEGABYTE;

/** Readers accept junk ahead of the header, so the sniff looks this far in. */
const HEADER_SEARCH_BYTES = 1024;
const PDF_HEADER = [0x25, 0x50, 0x44, 0x46, 0x2d]; // "%PDF-"

/** True when "%PDF-" starts within the first 1024 bytes. */
export function hasPdfHeader(bytes: Uint8Array): boolean {
  const lastStart = Math.min(HEADER_SEARCH_BYTES, bytes.length) - 1;
  for (let start = 0; start <= lastStart; start += 1) {
    if (start + PDF_HEADER.length > bytes.length) return false;
    const isMatch = PDF_HEADER.every(
      (headerByte, offset) => bytes[start + offset] === headerByte,
    );
    if (isMatch) return true;
  }
  return false;
}

export function classifyFileSize(
  byteCount: number,
): "ok" | "large" | "too-large" {
  if (byteCount > MAX_FILE_BYTES) return "too-large";
  if (byteCount >= LARGE_FILE_WARNING_BYTES) return "large";
  return "ok";
}

const ENCRYPT_KEY = Array.from("/Encrypt", (character) =>
  character.charCodeAt(0),
);

/**
 * True when the bytes name an `/Encrypt` entry. The trailer and cross-reference
 * stream dictionaries stay readable in an encrypted file, so the key shows up
 * even when every object stream is scrambled.
 */
export function hasEncryptEntry(bytes: Uint8Array): boolean {
  const [firstByte] = ENCRYPT_KEY;
  if (firstByte === undefined) return false;
  let start = bytes.indexOf(firstByte);
  while (start !== -1 && start + ENCRYPT_KEY.length <= bytes.length) {
    const candidateStart = start;
    const isMatch = ENCRYPT_KEY.every(
      (keyByte, offset) => bytes[candidateStart + offset] === keyByte,
    );
    if (isMatch) return true;
    start = bytes.indexOf(firstByte, start + 1);
  }
  return false;
}
