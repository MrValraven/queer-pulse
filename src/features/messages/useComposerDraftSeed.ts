import { useCallback, useMemo } from "react";
import { loadDraftOrServerFallback } from "./drafts";
import { useMatchedChatComposerMentions } from "./matchedChatComposerMentions";

export interface ComposerDraftSeed {
  /** The lazy `useState` seed: local-first, server-fallback (SOC-16,
   *  `loadDraftOrServerFallback`), shown as the composer types it. */
  seed: () => string;
  /** A server draft that arrives after mount, shown as the composer types
   *  it. */
  decode: (storedDraft: string) => string;
}

/**
 * The composer's draft seeding. Minor 6 (PRD-423): in a matched Go together
 * chat a restored draft, local or from the server, that still carries stored
 * `@<member key>` tokens is shown as `@FirstName`, the spelling the composer
 * types and sends from. Every other chat reads the draft unchanged.
 */
export function useComposerDraftSeed(
  conversationId: string,
  serverDraft: string | null | undefined,
): ComposerDraftSeed {
  const composerMentions = useMatchedChatComposerMentions();
  const decode = useCallback(
    (storedDraft: string) =>
      composerMentions ? composerMentions.decode(storedDraft) : storedDraft,
    [composerMentions],
  );
  return useMemo(
    () => ({
      seed: () =>
        decode(loadDraftOrServerFallback(conversationId, serverDraft)),
      decode,
    }),
    [conversationId, serverDraft, decode],
  );
}
