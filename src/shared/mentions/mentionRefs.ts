import { parseMarkdownLite } from "../markdown/markdownLiteParser";
import { parseMentions } from "./parseMentions";
import { mentionNameKey } from "./mentionNameKey";

/** Matches the backend's `MAX_MENTION_NAME_REFS`: the most refs one
 *  `GET /mentions/names` request may carry. `mentionRefsIn` caps a single text
 *  at this, so a bio that somehow names more resolves its first 50 and leaves
 *  the rest as raw `sigil + slug` rather than sending a request the server
 *  would reject outright. A caller resolving a whole page of texts takes the
 *  uncapped `mentionRefsInAll` and splits it into requests of this size. */
export const MAX_MENTION_NAME_REFS = 50;

/**
 * The `kind:slug` refs a piece of text mentions, in the shape
 * `GET /mentions/names?refs=` takes — de-duplicated and sorted, so the same bio
 * always produces the same list and therefore the same react-query key.
 *
 * Topics are excluded: a `#tag` mention keeps its tag as its own label and is
 * never resolved to a name (see `MentionText`), so asking about one would be a
 * request whose answer is never read.
 */
export function mentionRefsIn(text: string): string[] {
  return mentionRefsInAll([text]).slice(0, MAX_MENTION_NAME_REFS);
}

/** The refs across every text in `texts`, de-duplicated and sorted the same way
 *  as `mentionRefsIn`, with no cap: a thread page can name more people than one
 *  request carries, and the caller chunks the list itself. */
export function mentionRefsInAll(texts: readonly string[]): string[] {
  const refs = new Set<string>();
  for (const text of texts) {
    for (const segment of parseMentions(text)) {
      if (segment.kind === "text" || segment.kind === "topic") continue;
      refs.add(mentionNameKey(segment.kind, segment.slug));
    }
  }
  return Array.from(refs).sort();
}

/** The refs a markdown-lite body can render as mentions: everything
 *  `mentionRefsInAll` finds in the raw text, plus the refs inside each parsed
 *  span (bold, italic and link text). `MarkdownLite` hands every span to
 *  `MentionText` on its own, so `**@ana**` or a mention flush against a link
 *  is a mention there while the raw body, with no whitespace before the
 *  sigil, shows none. Always a superset of `mentionRefsInAll`. */
export function mentionRefsInMarkdownAll(texts: readonly string[]): string[] {
  const spanTexts: string[] = [];
  for (const text of texts) {
    for (const block of parseMarkdownLite(text)) {
      const spanRuns = block.type === "list" ? block.items : [block.spans];
      for (const spans of spanRuns) {
        for (const span of spans) spanTexts.push(span.text);
      }
    }
  }
  return mentionRefsInAll([...texts, ...spanTexts]);
}
