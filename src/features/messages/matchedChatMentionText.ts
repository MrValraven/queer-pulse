import type { QueryClient } from "@tanstack/react-query";

/**
 * PRD-423: a stored `@<member key>` token at a mention boundary, the same
 * boundary the backend's `renderMatchedChatMentions` and the mention
 * tokenizer apply. Group 1 is the boundary, group 2 the key. Global, so use
 * it with `String.replace`/`matchAll`; `hasMatchedChatMentions` tests a
 * fresh copy so no `lastIndex` state carries between calls.
 */
export const MATCHED_MEMBER_MENTION =
  /(^|\s)@(m-[0-9a-f]{24})(?=[^a-z0-9-]|$)/g;

/** Whether `text` carries any `@<member key>` token. */
export function hasMatchedChatMentions(text: string | null | undefined) {
  return !!text && new RegExp(MATCHED_MEMBER_MENTION.source).test(text);
}

/**
 * PRD-423: `text` with every stored `@<member key>` token spelled for a
 * reader outside the open chat's mention rendering (an inbox preview, a
 * search hit, a banner): `@FirstName` for a key `nameByKey` knows, and
 * `unnamedLabel` (which carries its own `@`, e.g.
 * `t("messages:mention.member")`) for one it does not. Every other part of
 * the text is left exactly as typed.
 */
export function withMatchedChatMentionNames(
  text: string,
  nameByKey: ReadonlyMap<string, string>,
  unnamedLabel: string,
): string {
  if (!hasMatchedChatMentions(text)) return text;
  return text.replace(
    MATCHED_MEMBER_MENTION,
    (_token, boundary: string, memberKey: string) => {
      const name = nameByKey.get(memberKey)?.trim();
      return `${boundary}${name ? `@${name.split(/\s+/)[0]}` : unnamedLabel}`;
    },
  );
}

/** The first names a matched chat's cached row knows, keyed by member key:
 *  the avatar-stack preview a list row carries and the full roster a detail
 *  read carries. */
export function matchedChatNamesByKey(row: {
  memberPreview?: ReadonlyArray<{ handle: string; name: string }>;
  members?: ReadonlyArray<{ slug?: string; name: string }>;
}): Map<string, string> {
  const nameByKey = new Map<string, string>();
  for (const member of row.memberPreview ?? []) {
    if (member.handle) nameByKey.set(member.handle, member.name);
  }
  for (const member of row.members ?? []) {
    if (member.slug) nameByKey.set(member.slug, member.name);
  }
  return nameByKey;
}

/** The cached query prefixes that hold conversation rows (inbox lists and
 *  single-conversation reads). */
const CONVERSATION_ROW_QUERY_PREFIXES = [
  ["conversations"],
  ["conversation-detail"],
] as const;

interface CachedMatchedChatRow {
  id?: string;
  isGoTogetherChat?: boolean;
  memberPreview?: ReadonlyArray<{ handle: string; name: string }>;
  members?: ReadonlyArray<{ slug?: string; name: string }>;
}

/**
 * PRD-423: the first names a cached matched chat row knows, keyed by member
 * key, for `conversationId`; null when no cached row says the conversation
 * is a matched Go together chat. Reads the cache alone.
 */
export function cachedMatchedChatNames(
  queryClient: Pick<QueryClient, "getQueriesData">,
  conversationId: string,
): Map<string, string> | null {
  for (const queryKey of CONVERSATION_ROW_QUERY_PREFIXES) {
    for (const [, data] of queryClient.getQueriesData<unknown>({ queryKey })) {
      const rows = (Array.isArray(data) ? data : [data]) as Array<
        CachedMatchedChatRow | null | undefined
      >;
      const row = rows.find((candidate) => candidate?.id === conversationId);
      if (row) return row.isGoTogetherChat ? matchedChatNamesByKey(row) : null;
    }
  }
  return null;
}
