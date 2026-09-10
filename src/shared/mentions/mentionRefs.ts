import { parseMentions } from "./parseMentions";
import { mentionNameKey } from "./mentionNameKey";

/** Matches the backend's `MAX_MENTION_NAME_REFS`. A bio that somehow names more
 *  than this resolves its first 50 and leaves the rest as raw `sigil + slug`,
 *  rather than sending a request the server would reject outright. */
const MAX_REFS = 50;

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
  const refs = new Set<string>();
  for (const segment of parseMentions(text)) {
    if (segment.kind === "text" || segment.kind === "topic") continue;
    refs.add(mentionNameKey(segment.kind, segment.slug));
  }
  return Array.from(refs).sort().slice(0, MAX_REFS);
}
