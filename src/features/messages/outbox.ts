import type { ChatMessage } from "./data";

// ── Persistent offline outbox ────────────────────────────────────────────────
// Optimistic sends used to live only in the controller's in-memory `sent` state
// with a module-scoped counter, so a message typed offline (or one whose send
// was still in flight) VANISHED on a tab reload. This persists that per-thread
// outbox to localStorage, keyed by conversation id, so unsent messages survive a
// reload and can be replayed. Because every send now carries a client-generated
// idempotency id (`localId` === the server's `clientMessageId`), replaying is
// always safe: the server dedupes a message it already stored.
//
// The persisted map IS the controller's `sent` map:
//   - LIVE mode: entries are transient, a message sits here as `sending` /
//     `failed` until the server acks it, then the controller drops it. On reload
//     any surviving `sending`/`failed` entry is resent (idempotently).
//   - DEMO mode: there is no server, so an optimistic send becomes `sent` and
//     stays as the only record; persisting it keeps demo threads intact across a
//     reload (WhatsApp-like), and nothing is ever replayed over the network.
//
// The store is cleared whenever the storage SCOPE changes (a demo↔live flip, a
// sign-out, or switching accounts on the same device, see
// `useMessagesController`), and is itself scoped per authenticated member,
// mirroring the composer-drafts store next door (`drafts.ts`'s
// `setMessageDraftsScope`) and the same per-user cache scoping `SavedProvider`/
// `VouchProvider` use (`useStorageScope`). Un-scoped, a member's unsent message
// body (and any pending image's storage key) would sit in localStorage after
// they sign out and REPLAY against a different member's session the next time
// Messages is opened on a shared device.
//
// Each entry carries the identity it was composed as (`sendAsIdentityId`, a
// business, persona or company mailbox seat), and replay sends that identity.

const STORAGE_KEY = "qp.messages.outbox.v1";

// The authenticated member this device's outbox belongs to. Set by
// `useMessagesController` (via `useStorageScope`) so a shared device never
// replays one member's unsent send in the next member's session: "demo" (the
// single mock persona) and the signed-out/unset state keep the base key (the
// Messages page is unreachable while signed out, so the base key there only
// ever holds demo data), and a live user id gets a per-user key suffix.
let activeScope: string | null = null;

/** Point the outbox store at a given member's bucket (see `activeScope`). */
export function setMessageOutboxScope(scopeId: string | null): void {
  activeScope = scopeId;
}

/** The storage key for `scopeId`, or the current `activeScope` when omitted:
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

/** Parse a raw outbox JSON payload (a `localStorage` value, or a `storage`
 *  event's `newValue`), tolerating a corrupt / absent / foreign shape. Pure,
 *  no `localStorage` access, so it doubles as the parser for a cross-tab
 *  `storage` event (see `readUnseenOutboxEntries`), which hands us the new
 *  value directly rather than a key to re-read. */
function parseOutboxPayload(raw: string | null): OutboxMap {
  try {
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

// Multi-tab bookkeeping (ENG-215).
// Every localId this TAB has ever loaded or saved into the outbox store, across
// every scope it has touched this session. `saveOutbox`'s merge below uses this
// to tell "an entry this tab has never seen, so it must be another tab's
// still-queued send" from "an entry this tab has already seen before" (it may
// have delivered, permanently failed, migrated to a real conversation id, or
// simply left this tab's own copy some other way), which must NOT be
// resurrected from a stale snapshot another tab wrote before this tab's own
// write lands. Never reset for the life of the tab, so a once-seen id stays
// seen even long after this tab stopped holding it.
const knownLocalIds = new Set<string>();

function rememberLocalIds(map: OutboxMap): void {
  for (const messages of Object.values(map)) {
    for (const message of messages) {
      if (message.localId) knownLocalIds.add(message.localId);
    }
  }
}

/** Mark ONE localId as known without touching storage. For a caller (the
 *  background replayer) whose reads never mark anything known (`peekOutbox`)
 *  but that is about to OMIT an entry from its next write because it just
 *  delivered and removed it: kept as a defensive record for this tab even
 *  though `writeOutboxRaw` (the background's own write path) never consults
 *  `knownLocalIds` itself, so a future `saveOutbox` call from this same tab
 *  (the Messages page mounting moments later, say) still recognizes the
 *  absence as a deliberate drop instead of misreading it as never having
 *  been seen and resurrecting it from whatever is still on disk. */
export function rememberDeliveredLocalId(localId: string): void {
  knownLocalIds.add(localId);
}

/** Read the persisted outbox, tolerating a corrupt / absent / foreign payload.
 *  Pass the resolved scope explicitly for the initial hydration (see
 *  `storageKey`'s doc); omit it to read the current `activeScope`. */
export function loadOutbox(scopeId: string | null = activeScope): OutboxMap {
  const result = parseOutboxPayload(
    window.localStorage.getItem(storageKey(scopeId)),
  );
  rememberLocalIds(result);
  return result;
}

/** `loadOutbox`, without marking any of it known. `useBackgroundOutboxReplay`
 *  uses this everywhere it reads storage (its work list, an eligibility
 *  re-check, or the read half of a per-entry read-modify-write): its reads
 *  are transient, never a durably-adopted state the way the Messages page's
 *  `sent` is, so they must never feed `saveOutbox`'s cross-tab merge the
 *  false signal that this tab has "seen" (and could therefore safely omit)
 *  an entry it only ever passed through. `writeOutboxRaw` is the matching
 *  write-side rule: the background's own writes don't mark anything known
 *  either, for the same reason. */
export function peekOutbox(scopeId: string | null = activeScope): OutboxMap {
  return parseOutboxPayload(window.localStorage.getItem(storageKey(scopeId)));
}

/** The `localStorage` key the CURRENT `activeScope` reads/writes, exported so
 *  `useMessageOutbox`'s cross-tab `storage` listener (ENG-215) can tell a
 *  same-scope write (another tab queuing/dropping a send under the SAME
 *  member's outbox) from an unrelated key changing elsewhere in the tab. */
export function getActiveOutboxStorageKey(): string {
  return storageKey();
}

/** ENG-215: given a `storage` event's raw `newValue` for THIS scope's key,
 *  return only the entries this tab has never known about (another tab's
 *  still-queued send that just landed), oldest-first by `at` so a caller that
 *  merges them in preserves send order, which `useMessageOutbox` merges into
 *  its own `sent` state so it renders and replays here too. Marks every id in
 *  `raw` (pulled or not) as now known, mirroring `loadOutbox`. Only a NEWLY
 *  queued send crosses this way; a DROP (another tab's successful ack, or an
 *  entry it removed) is left for `saveOutbox`'s own merge to reconcile: a tab
 *  that still holds its own copy of a dropped entry keeps offering it on its
 *  next save, and a tab that re-attempts a still-eligible entry is safe
 *  either way, since the server dedupes by `clientMessageId`. A permanently
 *  failed or retry-budget-exhausted entry needs a manual retry to surface
 *  again, the same as it would without any cross-tab sync at all. */
export function readUnseenOutboxEntries(raw: string | null): OutboxMap {
  const parsed = parseOutboxPayload(raw);
  const unseen: OutboxMap = {};
  for (const [conversationId, messages] of Object.entries(parsed)) {
    const newMessages = messages.filter(
      (message) => message.localId && !knownLocalIds.has(message.localId),
    );
    if (newMessages.length > 0) {
      unseen[conversationId] = sortOutboxMessagesByTime(newMessages);
    }
  }
  rememberLocalIds(parsed);
  return unseen;
}

/** An in-flight image send's optimistic `attachment` is a local `blob:` object
 *  URL (see `ImageComposerButton`/`useMessageSending.sendImage`), valid only
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

/** Sort messages oldest-first by `at` (ISO, lexically sortable), leaving the
 *  existing relative order alone when `at` is missing on either side (a demo
 *  entry, or one written before `at` existed on this shape), so merging in a
 *  cross-tab entry (ENG-215) never scrambles same-tab entries that carry no
 *  timestamp to compare against. */
function sortOutboxMessagesByTime(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort((a, b) => {
    if (!a.at || !b.at) return 0;
    if (a.at < b.at) return -1;
    if (a.at > b.at) return 1;
    return 0;
  });
}

/** Strip dead blob previews from every message in `map`, dropping any
 *  conversation left empty. Shared by `saveOutbox` and `writeOutboxRaw`. */
function trimOutboxMap(map: OutboxMap): OutboxMap {
  const trimmed: OutboxMap = {};
  for (const [conversationId, messages] of Object.entries(map)) {
    if (messages.length === 0) continue;
    trimmed[conversationId] = messages.map(stripDeadBlobPreview);
  }
  return trimmed;
}

/** Write `trimmed` to `key`, or remove the key entirely once it's empty, so
 *  the store doesn't accumulate empty keys as threads drain. Shared by
 *  `saveOutbox` and `writeOutboxRaw`. */
function writeTrimmedMapToStorage(key: string, trimmed: OutboxMap): void {
  if (Object.keys(trimmed).length === 0) {
    window.localStorage.removeItem(key);
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(trimmed));
}

/** Persist the current outbox, MERGING with whatever is currently on disk
 *  (ENG-215) rather than last-writer-wins overwriting it: a second tab may
 *  have queued (or just acked) its own send under the SAME scope since this
 *  tab last read the store, and a plain overwrite would silently drop it.
 *  Pass the resolved scope explicitly when writing OUTSIDE the
 *  currently-active scope; omit it to write under the current `activeScope`.
 *  Used by the Messages page's own persist effect, writing its full,
 *  durably-adopted `sent` state; `useBackgroundOutboxReplay` writes through
 *  `writeOutboxRaw` instead (see that function's own doc for why the merge
 *  here would be redundant, and wrong, for its per-entry writes).
 *
 * Any stored entry this tab has never known (`knownLocalIds`) is kept and
 * the merged bucket is re-sorted oldest-first by `at` so cross-tab replay
 * order still follows send time; an entry this tab HAS known and no longer
 * holds left this tab's own copy for a reason (delivered, migrated,
 * replaced) and is not resurrected. Accepted self-healing edge case: if that
 * departure happened to race another tab's OWN ack of the exact same entry,
 * this tab can rewrite it back into storage once; the server dedupes the
 * eventual replay by `clientMessageId`, so no duplicate message ever
 * results, only a stray extra replay attempt against an already-delivered
 * send.
 *
 * Marks only the CALLER's own map as known, before the merge below pulls in
 * anything foreign, never the merged result: a freshly-adopted foreign entry
 * only becomes "known" once this tab's own authoritative state genuinely
 * incorporates it (for the Messages page, that's the `storage` listener
 * merging it into `sent`, which flows back through here on the next save).
 * Marking it known immediately, before that, is what let a later save from
 * this tab silently drop it if its own state hadn't caught up yet. */
export function saveOutbox(
  map: OutboxMap,
  scopeId: string | null = activeScope,
): void {
  try {
    const trimmed = trimOutboxMap(map);
    rememberLocalIds(trimmed);
    const key = storageKey(scopeId);
    const stored = parseOutboxPayload(window.localStorage.getItem(key));
    const touchedConversationIds = new Set<string>();
    for (const [conversationId, messages] of Object.entries(stored)) {
      for (const message of messages) {
        if (!message.localId || knownLocalIds.has(message.localId)) continue;
        const bucket = trimmed[conversationId] ?? [];
        bucket.push(message);
        trimmed[conversationId] = bucket;
        touchedConversationIds.add(conversationId);
      }
    }
    for (const conversationId of touchedConversationIds) {
      trimmed[conversationId] = sortOutboxMessagesByTime(
        trimmed[conversationId]!,
      );
    }
    writeTrimmedMapToStorage(key, trimmed);
  } catch {
    // ignore storage failures (private mode / quota)
  }
}

/** Write `map` to `scopeId`'s storage EXACTLY as given: no cross-tab merge,
 *  and never marks anything in `map` known. Safe only for a caller that just
 *  read storage fresh, synchronously, immediately before, with no `await` in
 *  between. `useBackgroundOutboxReplay`'s `writeOutboxEntryOutcome` is the
 *  one caller: its own `peekOutbox` read moments earlier already IS the
 *  full, current on-disk truth, so re-running `saveOutbox`'s merge here
 *  would just re-read that SAME storage and duplicate every entry `map`
 *  already contains. Marking `map`'s ids known would be equally wrong here:
 *  this hook never durably adopts anything the way the Messages page's
 *  `sent` does, so a foreign entry it merely passed through must stay
 *  genuinely unknown to this tab, ready for `saveOutbox` (a later
 *  Messages-page save in this same tab, or another tab's own save) to pick
 *  up correctly instead of treating it as already seen. */
export function writeOutboxRaw(
  map: OutboxMap,
  scopeId: string | null = activeScope,
): void {
  try {
    writeTrimmedMapToStorage(storageKey(scopeId), trimOutboxMap(map));
  } catch {
    // ignore storage failures (private mode / quota)
  }
}

/** Wipe the outbox, called whenever the storage scope changes (a demo↔live
 *  flip, sign-out, or switching accounts on the same device). */
export function clearOutbox(): void {
  try {
    window.localStorage.removeItem(storageKey());
  } catch {
    // ignore storage failures
  }
}
