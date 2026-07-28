/** One run of a reply body: literal text, a member mention, or a community mention. */
export type MentionSegment =
  | { kind: "text"; value: string }
  | { kind: "member"; slug: string }
  | { kind: "community"; slug: string };

// A token is `@slug` or `c/slug`, and only counts at a boundary: start of the
// string, or right after whitespace (captured in group 1). That boundary guard
// is what keeps `me@host.com` (word char before `@`) and `.../c/y` (`/` before
// `c`) as plain text. Slugs are lowercase/digits/hyphen, matching how member
// and community slugs are formed across the app.
const MENTION_TOKEN = /(^|\s)(@|c\/)([a-z0-9][a-z0-9-]*)/g;

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
    segments.push(
      sigil! === "@"
        ? { kind: "member", slug: slug! }
        : { kind: "community", slug: slug! },
    );
    cursor = tokenStart + sigil!.length + slug!.length;
  }
  if (cursor < text.length) {
    segments.push({ kind: "text", value: text.slice(cursor) });
  }
  return segments;
}
