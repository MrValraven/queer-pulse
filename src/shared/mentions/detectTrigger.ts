/** An in-progress mention at the caret: which kind, the text typed after the
 *  sigil, and the index where the sigil begins (for replacement). */
export type MentionTrigger =
  | {
      kind: "member" | "community" | "topic" | "business" | "event" | "thread";
      query: string;
      start: number;
    }
  | null;

// Same boundary rule as the renderer: the sigil must sit at string start or
// after whitespace, so `me@ho` (email) yields no trigger.
const MEMBER_TRIGGER = /(?:^|\s)@([a-zA-Z0-9-]*)$/;
const COMMUNITY_TRIGGER = /(?:^|\s)c\/([a-zA-Z0-9-]*)$/;
const HASH_TRIGGER = /(?:^|\s)#([a-zA-Z0-9-]*)$/;
const BUSINESS_TRIGGER = /(?:^|\s)b\/([a-zA-Z0-9-]*)$/;
const EVENT_TRIGGER = /(?:^|\s)e\/([a-zA-Z0-9-]*)$/;
const THREAD_TRIGGER = /(?:^|\s)t\/([a-zA-Z0-9-]*)$/;

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
  const business = BUSINESS_TRIGGER.exec(textBeforeCaret);
  if (business) {
    const query = business[1] ?? "";
    return {
      kind: "business",
      query,
      start: textBeforeCaret.length - query.length - 2, // 2 = "b/"
    };
  }
  const event = EVENT_TRIGGER.exec(textBeforeCaret);
  if (event) {
    const query = event[1] ?? "";
    return {
      kind: "event",
      query,
      start: textBeforeCaret.length - query.length - 2, // 2 = "e/"
    };
  }
  const thread = THREAD_TRIGGER.exec(textBeforeCaret);
  if (thread) {
    const query = thread[1] ?? "";
    return {
      kind: "thread",
      query,
      start: textBeforeCaret.length - query.length - 2, // 2 = "t/"
    };
  }
  const topic = HASH_TRIGGER.exec(textBeforeCaret);
  if (topic) {
    const query = topic[1] ?? "";
    return {
      kind: "topic",
      query,
      start: textBeforeCaret.length - query.length - 1, // 1 = "#"
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
