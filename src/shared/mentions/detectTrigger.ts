/** An in-progress mention at the caret: which kind, the text typed after the
 *  sigil, and the index where the sigil begins (for replacement). */
export type MentionTrigger =
  | { kind: "member" | "community"; query: string; start: number }
  | null;

// Same boundary rule as the renderer: the sigil must sit at string start or
// after whitespace, so `me@ho` (email) yields no trigger.
const MEMBER_TRIGGER = /(?:^|\s)@([a-zA-Z0-9-]*)$/;
const COMMUNITY_TRIGGER = /(?:^|\s)c\/([a-zA-Z0-9-]*)$/;

export function detectTrigger(textBeforeCaret: string): MentionTrigger {
  const community = COMMUNITY_TRIGGER.exec(textBeforeCaret);
  if (community) {
    const query = community[1] ?? "";
    return {
      kind: "community",
      query,
      start: textBeforeCaret.length - query.length - 2, // 2 = "c/"
    };
  }
  const member = MEMBER_TRIGGER.exec(textBeforeCaret);
  if (member) {
    const query = member[1] ?? "";
    return {
      kind: "member",
      query,
      start: textBeforeCaret.length - query.length - 1, // 1 = "@"
    };
  }
  return null;
}
