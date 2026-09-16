// ── Persistent per-conversation composer drafts ─────────────────────────────
// A typed-but-unsent message used to live only in the controller's in-memory
// `draft` state, so switching threads, or reloading the tab, silently lost it.
// This persists each conversation's current draft to localStorage, keyed by
// conversation id, so unsent text survives a thread switch or a reload, exactly
// like the offline outbox next door (see `outbox.ts`) and equally local-only in
// both modes:
//   - LIVE mode: purely a client convenience: no draft is ever sent to the
//     server until the member actually sends the message.
//   - DEMO mode: same, there is no server at all.
// A conversation's stored draft is cleared the moment its message is sent (the
// composer empties in the same frame), and the whole store is wiped when demo
// mode flips, so demo fiction can't bleed into a real session, and vice-versa
// (mirrors `clearOutbox`; see `useMessagesController`).

const STORAGE_KEY = "qp.messages.drafts.v1";

// The authenticated member this device's composer drafts belong to (mirrors the
// per-user cache scoping in `app/providers/useStorageScope`). Set by
// `DraftsProvider` so a shared device never surfaces one member's unsent
// composer text to the next: a live user id gets a per-user key suffix, while
// "demo" (single mock persona) and the signed-out/unset state keep the base
// key: the messages UI is unreachable while signed out, so the base key there
// only ever holds demo data.
let activeScope: string | null = null;

/** Point the composer-draft store at a given member's bucket (see `activeScope`). */
export function setMessageDraftsScope(scopeId: string | null): void {
  activeScope = scopeId;
}

function storageKey(): string {
  if (!activeScope || activeScope === "demo") return STORAGE_KEY;
  return `${STORAGE_KEY}.u.${activeScope}`;
}

/** Per-conversation composer text, keyed by conversation id. */
export type DraftMap = Record<string, string>;

/** Read the persisted drafts, tolerating a corrupt / absent / foreign payload. */
export function loadDrafts(): DraftMap {
  try {
    const raw = window.localStorage.getItem(storageKey());
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const result: DraftMap = {};
    for (const [conversationId, text] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (typeof text === "string" && text.length > 0)
        result[conversationId] = text;
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

/**
 * The draft to SEED a freshly-mounted composer with (SOC-16): this device's
 * own LOCAL copy if it has one (always freshest here: every keystroke writes
 * through immediately), else the server's cross-device copy (synced by
 * `useDraftSync`, carried on the fetched `Conversation.draft`) so a draft
 * started on another device still shows up. Never the other way around: a
 * stale server value must not clobber text this device already has.
 */
export function loadDraftOrServerFallback(
  conversationId: string,
  serverDraft: string | null | undefined,
): string {
  return loadDraft(conversationId) || serverDraft || "";
}

/**
 * Whether a server draft that resolves AFTER a composer has already mounted
 * (ENG-253: the inbox list row no longer carries it, so `useMessagesController`
 * fetches it from a separate, slower `GET /conversations/:id` call that
 * `loadDraftOrServerFallback`'s mount-time seed above can't wait for) should
 * now be seeded into that already-open composer. Every one of these must
 * hold, ordered by how badly getting it wrong would cost the member:
 *   - the member hasn't typed anything in this composer since it mounted:
 *     losing typed text to a late-arriving draft is worse than a missing one.
 *     Tracked separately from `currentDraft` being empty, since a member who
 *     typed something and deleted it back to "" must read exactly like one
 *     who never typed at all.
 *   - this composer hasn't already applied a late seed for this thread: a
 *     second application (a refetch, a window refocus, any other
 *     revalidation of the same query) must stay a silent no-op.
 *   - the composer's current text is empty: a local draft (always seeded
 *     first, see `loadDraftOrServerFallback`) keeps winning over the server
 *     copy exactly as it does at mount.
 *   - the server actually has a draft to offer.
 */
export function shouldSeedLateServerDraft(check: {
  hasAlreadySeeded: boolean;
  hasMemberTyped: boolean;
  currentDraft: string;
  serverDraft: string | null | undefined;
}): boolean {
  if (check.hasAlreadySeeded || check.hasMemberTyped) return false;
  if (check.currentDraft.length > 0) return false;
  return !!check.serverDraft;
}

/** Persist (or, for empty text, clear) one conversation's draft. Empty drafts
 *  are dropped so the store doesn't accumulate empty keys as threads drain. */
export function saveDraft(conversationId: string, text: string): void {
  try {
    const map = loadDrafts();
    if (text.length > 0) map[conversationId] = text;
    else delete map[conversationId];
    if (Object.keys(map).length === 0) {
      window.localStorage.removeItem(storageKey());
      return;
    }
    window.localStorage.setItem(storageKey(), JSON.stringify(map));
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
    window.localStorage.removeItem(storageKey());
  } catch {
    // ignore storage failures
  }
}
