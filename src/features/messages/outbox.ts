import type { ChatMessage } from "./data";

// ── Persistent offline outbox ────────────────────────────────────────────────
// Optimistic sends used to live only in the controller's in-memory `sent` state
// with a module-scoped counter — so a message typed offline (or one whose send
// was still in flight) VANISHED on a tab reload. This persists that per-thread
// outbox to localStorage, keyed by conversation id, so unsent messages survive a
// reload and can be replayed. Because every send now carries a client-generated
// idempotency id (`localId` === the server's `clientMessageId`), replaying is
// always safe — the server dedupes a message it already stored.
//
// The persisted map IS the controller's `sent` map:
//   - LIVE mode: entries are transient — a message sits here as `sending` /
//     `failed` until the server acks it, then the controller drops it. On reload
//     any surviving `sending`/`failed` entry is resent (idempotently).
//   - DEMO mode: there is no server, so an optimistic send becomes `sent` and
//     stays as the only record; persisting it keeps demo threads intact across a
//     reload (WhatsApp-like), and nothing is ever replayed over the network.
//
// The store is cleared whenever the storage SCOPE changes (a demo↔live flip, a
// sign-out, or switching accounts on the same device — see
// `useMessagesController`), and is itself scoped per authenticated member,
// mirroring the composer-drafts store next door (`drafts.ts`'s
// `setMessageDraftsScope`) and the same per-user cache scoping `SavedProvider`/
// `VouchProvider` use (`useStorageScope`). Un-scoped, a member's unsent message
// body (and any pending image's storage key) would sit in localStorage after
// they sign out and REPLAY against a different member's session the next time
// Messages is opened on a shared device.

const STORAGE_KEY = "qp.messages.outbox.v1";

// The authenticated member this device's outbox belongs to. Set by
// `useMessagesController` (via `useStorageScope`) so a shared device never
// replays one member's unsent send in the next member's session: "demo" (the
// single mock persona) and the signed-out/unset state keep the base key — the
// Messages page is unreachable while signed out, so the base key there only
// ever holds demo data — and a live user id gets a per-user key suffix.
let activeScope: string | null = null;

/** Point the outbox store at a given member's bucket (see `activeScope`). */
export function setMessageOutboxScope(scopeId: string | null): void {
  activeScope = scopeId;
}

/** The storage key for `scopeId`, or the current `activeScope` when omitted —
 *  callers that already resolved the scope synchronously (the initial
 *  `sent` hydration, which can't wait for an effect to push it) pass it
 *  explicitly; everything else (save/clear, always running after mount) can
 *  rely on the module-level scope already being current. */
function storageKey(scopeId: string | null = activeScope): string {
  if (!scopeId || scopeId === "demo") return STORAGE_KEY;
  return `${STORAGE_KEY}.u.${scopeId}`;
}

/** Optimistic messages awaiting (or, in demo, standing in for) a server row,
 *  keyed by conversation id. */
export type OutboxMap = Record<string, ChatMessage[]>;

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.from === "me" || candidate.from === "them") &&
    typeof candidate.text === "string" &&
    typeof candidate.localId === "string"
  );
}

/** Read the persisted outbox, tolerating a corrupt / absent / foreign payload.
 *  Pass the resolved scope explicitly for the initial hydration (see
 *  `storageKey`'s doc) — omit it to read the current `activeScope`. */
export function loadOutbox(scopeId: string | null = activeScope): OutboxMap {
  try {
    const raw = window.localStorage.getItem(storageKey(scopeId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const result: OutboxMap = {};
    for (const [conversationId, messages] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (!Array.isArray(messages)) continue;
      const valid = messages.filter(isChatMessage);
      if (valid.length > 0) result[conversationId] = valid;
    }
    return result;
  } catch {
    return {};
  }
}

/** An in-flight image send's optimistic `attachment` is a local `blob:` object
 *  URL (see `ImageComposerButton`/`useMessageSending.sendImage`) — valid only
 *  for this tab's lifetime. Persisting it would leave a reloaded session
 *  pointing `<img>` at a dead reference (the URL is gone, whether or not it
 *  was ever explicitly revoked). Strip it at serialisation time and keep
 *  `sendAttachment` (the real storage key) untouched, so a restored
 *  `sending`/`failed` image entry can still replay its network payload;
 *  `MessageBubbleBody` renders a neutral placeholder when `attachment` is
 *  missing but `sendAttachment` is present. */
function stripDeadBlobPreview(message: ChatMessage): ChatMessage {
  if (message.attachment?.url.startsWith("blob:")) {
    return { ...message, attachment: undefined };
  }
  return message;
}

/** Persist the current outbox. Empty conversations are dropped so the store
 *  doesn't accumulate empty keys as threads drain. */
export function saveOutbox(map: OutboxMap): void {
  try {
    const trimmed: OutboxMap = {};
    for (const [conversationId, messages] of Object.entries(map)) {
      if (messages.length === 0) continue;
      trimmed[conversationId] = messages.map(stripDeadBlobPreview);
    }
    if (Object.keys(trimmed).length === 0) {
      window.localStorage.removeItem(storageKey());
      return;
    }
    window.localStorage.setItem(storageKey(), JSON.stringify(trimmed));
  } catch {
    // ignore storage failures (private mode / quota)
  }
}

/** Wipe the outbox — called whenever the storage scope changes (a demo↔live
 *  flip, sign-out, or switching accounts on the same device). */
export function clearOutbox(): void {
  try {
    window.localStorage.removeItem(storageKey());
  } catch {
    // ignore storage failures
  }
}
