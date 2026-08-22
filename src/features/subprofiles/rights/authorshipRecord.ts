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
 * The record's own wording, resolved by the caller through `t` so a PT owner
 * gets a Portuguese document. Passed in rather than resolved here: this module
 * is a pure, testable string builder with no React or i18n dependency of its
 * own, and the values it labels (title, author, timestamp, hash) are data that
 * never translates.
 */
export interface AuthorshipRecordLabels {
  /** The record's own title line. */
  heading: string;
  work: string;
  author: string;
  firstPublished: string;
  contentHash: string;
  /** One full sentence describing what exactly was hashed. */
  canonicalForm: string;
}

/**
 * Builds the full downloadable/copyable authorship record: a dated, hashed
 * provenance statement an owner can keep as their own evidence of first
 * publication on QueerPulse. The content hash is computed over
 * `canonicalContent`, not the record text itself, so verifying a saved copy
 * of the work against a later re-generated record only requires re-hashing
 * the work's own text (and so a translated record verifies just the same).
 */
export async function buildAuthorshipRecord(args: {
  item: SubprofileItemView;
  authorName: string;
  labels: AuthorshipRecordLabels;
}): Promise<string> {
  const { item, authorName, labels } = args;
  const content = canonicalContent(item);
  const hash = await sha256Hex(content);
  return [
    labels.heading,
    `${labels.work}: "${item.title ?? ""}"`,
    `${labels.author}: ${authorName}`,
    `${labels.firstPublished}: ${item.createdAt}`,
    `${labels.contentHash}: ${hash}`,
    labels.canonicalForm,
    "",
    content,
  ].join("\n");
}
