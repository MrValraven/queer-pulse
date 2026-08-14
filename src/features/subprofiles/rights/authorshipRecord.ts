import type { SubprofileItemView } from "../api/subprofiles.adapters";
import { normalizePoemVersions, poemToPlainText } from "../poem/poemModel";

/**
 * Deterministic plain-text rendering of an item's content, used as the input
 * to `sha256Hex` for the authorship record. Poems render every named
 * translation via `poemToPlainText` (the reader's own "copy poem" helper) so
 * the hash covers all the verse an owner published, each labelled version
 * prefixed with its name; every other item type falls back to title +
 * subtitle + description. LF-normalized (CRLF collapsed) and trimmed so the
 * same content always hashes the same regardless of platform line endings or
 * incidental whitespace.
 *
 * A single untitled version renders as bare `poemToPlainText(blocks)` (no
 * label prefix), so pre-translation poems hash exactly as they did before —
 * an owner's earlier saved record still verifies.
 */
export function canonicalContent(item: SubprofileItemView): string {
  const parts: string[] = [item.title ?? ""];
  if (
    item.section === "poems" &&
    (item.structured?.poemVersions || item.structured?.poem)
  ) {
    const versions = normalizePoemVersions(
      item.structured?.poemVersions ?? null,
      item.structured?.poem ?? null,
    );
    for (const version of versions) {
      const body = poemToPlainText(version.blocks);
      const label = version.label.trim();
      parts.push(label ? `[${label}]\n${body}` : body);
    }
  } else {
    if (item.subtitle) parts.push(item.subtitle);
    if (item.description) parts.push(item.description);
  }
  return parts
    .filter(Boolean)
    .join("\n")
    .replace(/\r\n/g, "\n")
    .trim();
}

/** Lowercase hex SHA-256 digest of `text`, via the Web Crypto API. */
export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Builds the full downloadable/copyable authorship record: a dated, hashed
 * provenance statement an owner can keep as their own evidence of first
 * publication on QueerPulse. The content hash is computed over
 * `canonicalContent`, not the record text itself, so verifying a saved copy
 * of the work against a later re-generated record only requires re-hashing
 * the work's own text.
 */
export async function buildAuthorshipRecord(args: {
  item: SubprofileItemView;
  authorName: string;
}): Promise<string> {
  const { item, authorName } = args;
  const content = canonicalContent(item);
  const hash = await sha256Hex(content);
  return [
    "AUTHORSHIP RECORD: QueerPulse",
    `Work: "${item.title ?? ""}"`,
    `Author: ${authorName}`,
    `First published: ${item.createdAt}`,
    `Content SHA-256: ${hash}`,
    "Canonical form: title + plain-text body, LF-normalized, trimmed",
    "",
    content,
  ].join("\n");
}
