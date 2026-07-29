// ── Persistent per-conversation composer drafts ─────────────────────────────
// A typed-but-unsent message used to live only in the controller's in-memory
// `draft` state — so switching threads, or reloading the tab, silently LOST it.
// This persists each conversation's current draft to localStorage, keyed by
// conversation id, so unsent text survives a thread switch or a reload, exactly
// like the offline outbox next door (see `outbox.ts`) and equally local-only in
// both modes:
//   - LIVE mode: purely a client convenience — no draft is ever sent to the
//     server until the member actually sends the message.
//   - DEMO mode: same, there is no server at all.
// A conversation's stored draft is cleared the moment its message is sent (the
// composer empties in the same frame), and the whole store is wiped when demo
// mode flips — so demo fiction can't bleed into a real session, and vice-versa
// (mirrors `clearOutbox`; see `useMessagesController`).

const STORAGE_KEY = "qp.messages.drafts.v1";

/** Per-conversation composer text, keyed by conversation id. */
export type DraftMap = Record<string, string>;

/** Read the persisted drafts, tolerating a corrupt / absent / foreign payload. */
export function loadDrafts(): DraftMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const result: DraftMap = {};
    for (const [conversationId, text] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (typeof text === "string" && text.length > 0) result[conversationId] = text;
    }
    return result;
  } catch {
    return {};
  }
}

/** The stored draft for one conversation, or "" when none is persisted. */
export function loadDraft(conversationId: string): string {
  return loadDrafts()[conversationId] ?? "";
}

/** Persist (or, for empty text, clear) one conversation's draft. Empty drafts
 *  are dropped so the store doesn't accumulate empty keys as threads drain. */
export function saveDraft(conversationId: string, text: string): void {
  try {
    const map = loadDrafts();
    if (text.length > 0) map[conversationId] = text;
    else delete map[conversationId];
    if (Object.keys(map).length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage failures (private mode / quota)
  }
}

/** Drop one conversation's stored draft (called once its message is sent). */
export function clearDraft(conversationId: string): void {
  saveDraft(conversationId, "");
}

/** Wipe every stored draft (called when demo mode flips). */
export function clearDrafts(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage failures
  }
}
