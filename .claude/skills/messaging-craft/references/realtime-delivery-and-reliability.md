# Realtime, Delivery & Reliability

The systems-engineering core. The mental model that separates world-class messaging from a toy: **the socket is a fast path over a correct one.** HTTP + the database are the source of truth; the socket makes updates _feel_ instant. Every reliability property below exists because the wire itself guarantees almost nothing. Backend specifics (gateway structure, guards, DTO mapping, TypeORM, migrations) are **nestjs-expert**'s domain — this file is the messaging protocol design; build it the Nest way.

## Transport: WebSocket, and why

Persistent **WebSocket** is the right transport for chat and what the best apps use — Slack keeps a persistent WebSocket per client and fans each channel message out to all online subscribers, targeting ~500ms global latency. QueerPulse already runs socket.io on the `/chat` namespace (websocket-only, polling disabled). The alternatives and when they'd matter:

- **SSE (server-sent events):** one-directional (server→client) only; you'd still need HTTP POST for sending. Simpler, but you lose the symmetric channel. Not worth switching from an established socket.io setup.
- **Long-poll:** a fallback for hostile networks; socket.io can degrade to it, but QueerPulse disabled polling for a cleaner model. Leave it unless you see real connectivity failures in the field.

Don't change transport without a measured reason. The hard problems below are transport-independent.

## What the wire does and does NOT guarantee (design from here)

Verified from Socket.IO's own docs:

- **Ordering:** guaranteed within a connection (TCP + careful upgrade). Good — you can rely on in-order delivery over a live socket.
- **Delivery:** **at-most-once by default.** If the connection breaks mid-send, there's no guarantee the peer received it, there's no automatic retry, and **there's no server-side buffer** — events a disconnected client missed are **not** retransmitted on reconnect.
- **At-least-once** is opt-in (the socket.io `retries` option resends until acked), but pending events are still lost on a tab refresh, and retries create duplicates you must dedupe.

Two consequences drive the whole design:

1. **You cannot assume reconnect redelivered what you missed.** (This exact over-strong claim was _refuted_ in research — do not build on it.) Reconcile via history sync instead (below).
2. **At-least-once + dedup, not exactly-once.** True exactly-once is impossible over a lossy link (Two Generals). The industry answer, used everywhere from Stripe to Kafka: make the operation **idempotent** with a **client-generated ID**, so a resend/duplicate is harmless.

## Client-generated message IDs & idempotency (the keystone)

Generate a message ID **on the client** (a UUID / the existing `localId`) _before_ sending. Send it with the message. The server treats `(conversationId, clientMessageId)` as an idempotency key: first write inserts; a duplicate (from a retry, or from QueerPulse's two write paths — HTTP `POST` and WS `message:send`) returns the **same** stored message instead of inserting a second. This single mechanism gives you:

- Safe retries (the outbox can resend freely).
- Safe dual-path sends (HTTP and socket can't double-insert).
- A stable key for the optimistic bubble to reconcile against when the server row arrives (same ID → replace in place, no flicker, no duplicate).

**QueerPulse gap:** the server currently dedupes conversations by `pairKey` but messages don't carry a client-supplied idempotency key end-to-end. Adding one (a nullable, unique-per-conversation `client_message_id` column via a **new** migration — never rename an applied one) is the highest-leverage reliability upgrade and unblocks a persistent outbox.

## Ordering & monotonic IDs

Within a conversation, order by a **monotonic** key. Ably's model is instructive: each message gets a "timeserial" — a timestamp plus a sequence component to disambiguate same-millisecond messages — which both orders the stream and enables exact resume. QueerPulse already keyset-paginates on `(created_at, id)`, which is monotonic enough for a single Postgres writer. Keep ordering **server-assigned**; never trust client clocks for ordering (they're skewed and spoofable — client time is fine for display, never for sort). Beware: publishing via independent stateless requests can arrive out of order — order is only guaranteed over an ordered channel, which the socket + single DB writer gives you.

## The offline outbox (client-side retry queue)

The pattern behind "your message sends the moment you're back online":

1. On send, write the message to a **local outbox** (in memory _and_, ideally, persisted — IndexedDB/localStorage) with status `pending` and its client ID.
2. Render it optimistically from the outbox immediately.
3. Attempt to send (HTTP or WS). On server ack (matching client ID), mark `sent` and drop it from the pending set.
4. On failure/timeout, keep it `pending`/`failed` and **resend on reconnect** (and offer a manual retry on a `failed` bubble).
5. Because sends are idempotent, resending is always safe.

**QueerPulse gap:** optimistic sends are tracked in module-scoped memory and **lost on reload** — a message typed offline and not yet acked disappears if the tab refreshes. A persisted outbox (keyed by client message ID, honoring dual-mode) fixes this and is the natural partner to idempotency keys above.

## Reconnect & history sync

On reconnect you must reconcile, because the socket did not buffer what you missed:

1. **Reconnect with capped exponential backoff + jitter.** Start ~500ms, double each attempt, cap ~30s, randomize each delay (e.g. 50–100% of the computed value) so a mass reconnect doesn't stampede the recovering server (thundering herd). socket.io does backoff by default — confirm jitter is on.
2. **Re-join** the active conversation room and the user room.
3. **History sync:** fetch messages since your **last known message ID / timestamp** for the open conversation (and refresh the inbox for unread counts). This is the reliable substitute for transport redelivery. QueerPulse's current model — invalidate the React Query cache on reconnect so it refetches — achieves this for the open thread; make sure a _long_ offline gap still reconciles (fetch-since, not just "refetch latest page").
4. **Dedupe on merge** using client/server message IDs so anything the socket _did_ deliver plus anything history returns collapses to one row each.

(Managed platforms auto-recover short drops — Ably restores continuity for gaps under ~2 min — but that's a vendor convenience, not something socket.io gives you for free. Design for explicit history sync.)

## Delivery vs read receipts (keep them distinct)

Three distinct states, three distinct signals — WhatsApp's model:

- **Sent** — server has persisted it (you got an ack). One check.
- **Delivered** — the _recipient's device_ received it. Second check. **QueerPulse gap:** there is no delivered signal today — only sent (client-optimistic) and read. Adding a delivered receipt means the recipient's client (or its socket/push handler) acks receipt back, and that ack propagates to the sender as a per-message event.
- **Read** — the recipient's read watermark passed it. Blue/filled. QueerPulse has this via per-participant `lastReadAt` + live `read` frames.

Design notes:

- Receipts are **per-event, first-class** — mature apps ack not just text but reactions, edits, and deletes (some silently; "Careless Whisper" documents WhatsApp/Signal doing this, and that removing a reaction is a silent event). Model receipts as their own acked events, not a bolt-on.
- Read receipts are often a watermark (`lastReadAt`) rather than per-message flags — cheaper and enough to render "Seen". Keep it that way unless per-message read is a product requirement.
- **Privacy:** read receipts are sensitive (they reveal when someone read you). Consider making them mutually disable-able (Signal/WhatsApp/Telegram all let you turn them off) as a settings toggle — if you disable sending yours, you shouldn't see theirs. Out of scope until product asks, but design the data model so it's addable.

## Presence & typing signals

Ephemeral hints, never records:

- **Typing:** emit a throttled `typing:start` (at most ~every 2s while actively typing), and stop after ~3–4s of silence or on send; the receiver auto-clears a stale indicator after a few seconds even if the stop frame is lost (never let it stick — a stuck "typing…" is worse than none). QueerPulse's `Composer` + `useTypingIndicator` already do exactly this.
- **Presence:** online/offline (and optionally "last seen") via heartbeat/connection state; QueerPulse tracks it in-memory in `PresenceService`. Presence is per-connection truth — see the scaling caveat below.
- **Rate-limit both at the gateway** — QueerPulse already token-buckets typing and send per user. Respect and preserve those limits; signals are cheap individually but easy to abuse in aggregate.
- **Never persist** typing/presence and never let them gate correctness — they decorate, they don't record.

## Push notifications for new messages

QueerPulse has Web Push (VAPID) that fires **only** for member DMs, **only** to recipients who are **offline and unmuted**, and deep-links the tap to the thread (`/messages?c=<id>`). That "offline + unmuted only" gate is exactly right — never push to someone who's actively in the conversation. Standards to hold:

- **Dedupe in-app vs push:** if the socket already delivered it, don't also badge a redundant push (the offline gate handles most of this).
- **Collapse** multiple messages from one conversation into one notification (tag/`renotify`) rather than N notifications.
- **Deep-link precisely** to the conversation and the right message; the service worker (`src/sw.ts`) already opens/focuses the thread on `notificationclick`.
- **Mute is honored** at send time server-side (per-participant `muted`), not just client-side.

## Rate limiting & abuse

- Gateway-level token buckets on `message:send` and `typing` (present), plus HTTP throttling (present, via the Throttler→CSRF→JWT chain).
- Connection-gating on send (present — 403 if not connected; message-request seeds a connection) — preserve this; it's a safety feature, not just anti-spam.
- Block filtering severs the DM (present). Keep block checks server-side and authoritative.

## Scaling caveat (know the ceiling)

The socket layer is **single-replica**: no Redis adapter, so cross-instance fan-out, presence, and `disconnectSockets` (for session revoke/lockdown) only reach the local node. This is documented in the gateway code and is fine at current scale. **Before horizontal scaling**, add the socket.io Redis adapter (or equivalent pub/sub) so rooms, presence, and forced-disconnects work across replicas — coordinate with **nestjs-expert**. Don't silently assume multi-replica correctness.

## Encryption frontier (documented, not mandated)

QueerPulse DMs are plaintext in Postgres **by design** — moderation, safety review, message-request gating, and search all read message bodies. Full E2E encryption (Signal Protocol / Double Ratchet) would break every one of those and require multi-device key management the app doesn't have. **Do not add E2EE without an explicit product decision** that accepts those trade-offs. If it's ever pursued, it's a ground-up architecture project, not an incremental change — treat this paragraph as the boundary marker, not a to-do.

## The prioritized reliability upgrade path (for QueerPulse specifically)

In leverage order, each a self-contained slice:

1. **Client message IDs + server idempotency** (new migration, dual write-path dedup) — unblocks everything below.
2. **Persistent offline outbox** (survives reload; resends on reconnect) — the biggest correctness win users will feel.
3. **Delivered receipt** (distinct from sent/read) — the visible "double check."
4. **Robust long-gap history sync** (fetch-since, not just refetch-latest) on reconnect.
5. **Incremental cache patches** instead of broad invalidations for reactions/read/edits — lower latency, less refetch.
6. **Redis adapter** — only when you actually scale past one replica.

Each is buildable without the others; do them as separate, verifiable changes with the backend via **nestjs-expert**.
