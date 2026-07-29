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
// The store is cleared when demo mode flips (its fiction must not bleed into a
// real session, and vice-versa) — see `useMessagesController`.

const STORAGE_KEY = "qp.messages.outbox.v1";

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

/** Read the persisted outbox, tolerating a corrupt / absent / foreign payload. */
export function loadOutbox(): OutboxMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
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

/** Persist the current outbox. Empty conversations are dropped so the store
 *  doesn't accumulate empty keys as threads drain. */
export function saveOutbox(map: OutboxMap): void {
  try {
    const trimmed: OutboxMap = {};
    for (const [conversationId, messages] of Object.entries(map)) {
      if (messages.length > 0) trimmed[conversationId] = messages;
    }
    if (Object.keys(trimmed).length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore storage failures (private mode / quota)
  }
}

/** Wipe the outbox (called when demo mode flips). */
export function clearOutbox(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage failures
  }
}
