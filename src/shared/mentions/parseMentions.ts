/** One run of a reply body: literal text, or one of the six mention kinds. */
export type MentionSegment =
  | { kind: "text"; value: string }
  | { kind: "member"; slug: string }
  | { kind: "community"; slug: string }
  | { kind: "topic"; slug: string }
  | { kind: "business"; slug: string }
  | { kind: "event"; slug: string }
  | { kind: "thread"; slug: string };

// A token is `@slug`, `c/slug`, `#slug`, `b/slug`, `e/slug`, or `t/slug`, and
// only counts at a boundary: start of the string, or right after whitespace
// (captured in group 1). That boundary guard is what keeps `me@host.com`
// (word char before `@`) and `.../c/y` (`/` before `c`) as plain text. Slugs
// are lowercase/digits/hyphen, matching how member/community/topic/business/
// event/thread slugs are formed across the app.
const MENTION_TOKEN = /(^|\s)(@|c\/|#|b\/|e\/|t\/)([a-z0-9][a-z0-9-]*)/g;

const KIND_BY_SIGIL: Record<string, MentionSegment["kind"]> = {
  "@": "member",
  "c/": "community",
  "#": "topic",
  "b/": "business",
  "e/": "event",
  "t/": "thread",
};

export function parseMentions(text: string): MentionSegment[] {
  const segments: MentionSegment[] = [];
  let cursor = 0;
  for (const match of text.matchAll(MENTION_TOKEN)) {
    const [, boundary, sigil, slug] = match;
    // The token itself begins after any boundary whitespace, which stays text.
    const tokenStart = (match.index ?? 0) + boundary!.length;
    if (tokenStart > cursor) {
      segments.push({ kind: "text", value: text.slice(cursor, tokenStart) });
    }
    segments.push({
      kind: KIND_BY_SIGIL[sigil!],
      slug: slug!,
    } as MentionSegment);
    cursor = tokenStart + sigil!.length + slug!.length;
  }
  if (cursor < text.length) {
    segments.push({ kind: "text", value: text.slice(cursor) });
  }
  return segments;
}
