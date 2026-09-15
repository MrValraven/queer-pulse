// ── Reading the draft as text ───────────────────────────────────────────────
// The checklist, the word count, the similarity search and every nudge all ask
// questions of the same two strings. They ask them of the WORDS, so the
// markdown-lite markers have to come off first: a body of `**Who this is
// for**` is four words of context, and counting the asterisks as characters
// let an outline alone tick the "enough context" box.

/** Words too common to tell two threads apart, in both languages. */
const STOP_WORDS = new Set(
  (
    "a an the in on at for to of and or is are with my me i you we who what " +
    "how any anyone know good looking lisbon lisboa que de para com uma não"
  ).split(" "),
);

/**
 * The draft body as the plain prose a reader sees: bold and italic markers,
 * list bullets, numbering and quote carets removed, link syntax reduced to its
 * label, and runs of whitespace collapsed.
 */
export function toPlainText(source: string): string {
  return source
    .replace(/\*\*|__|^>\s?|^\s*[-*]\s+|^\s*\d+\.\s*/gm, "")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** How many words of prose the body carries. */
export function countWords(plainBody: string): number {
  if (!plainBody) return 0;
  return plainBody.split(/\s+/).filter(Boolean).length;
}

/**
 * The meaningful words of a string, lowercased and stripped of punctuation,
 * with the stop words and anything under three characters dropped. This is
 * what "these two titles are about the same thing" is measured on.
 */
export function tokenize(source: string): string[] {
  return source
    .toLowerCase()
    .replace(/[^a-zà-ú0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

/** A title reduced to lowercase words and single spaces, for comparing two. */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-zà-ú0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The first link in the body, or null. Drives the rail's unfurl placeholder. */
export function firstLinkIn(body: string): string | null {
  const match = /https?:\/\/[^\s)]+/.exec(body);
  return match ? match[0] : null;
}
