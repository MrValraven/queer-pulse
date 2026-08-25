---
name: messaging-craft
description: Use when building, reviewing, designing, or debugging ANYTHING in QueerPulse messaging/DMs/chat — the message list, bubbles and grouping, the composer, reply/quote, reactions, edit/delete, typing indicators, delivery/read receipts, presence, scroll anchoring and virtualization, optimistic/pending/failed send states, gestures (swipe-to-reply, long-press overlay), the realtime socket layer, message ordering/idempotency/dedup, the offline outbox and reconnect sync, history pagination, push notifications for new messages, or rate limiting. Holds the senior designer + engineer standard for making QueerPulse chat feel and behave like WhatsApp / Telegram / Signal, grounded in this repo's actual messaging code. Use BEFORE you touch the messaging feature, not only after.
user-invocable: true
---

# Messaging Craft (QueerPulse)

The standard for building QueerPulse's messaging feature at the level of WhatsApp, Telegram, and Signal — **both** the interaction/visual craft (the front-end designer's job) **and** the realtime/reliability engineering (the systems engineer's job). Chat is where those two disciplines are inseparable: a beautiful bubble that shows the wrong delivery state, or a correct delivery protocol that jumps the scroll on every history load, both read as "broken." This skill holds the bar for both.

**QueerPulse already has a strong messaging base.** Real-time socket.io delivery, typing indicators, "Seen" read receipts, presence, reactions, reply/quote, edit (15-min window), soft-delete tombstones, mute, delete-for-me, web push, cursor-paginated history, and a WhatsApp-style long-press overlay all exist today. Your job is almost never a greenfield build — it is **elevating an already-good feature to best-in-class** and closing specific gaps. Read [references/queerpulse-messaging-map.md](references/queerpulse-messaging-map.md) FIRST to know exactly what exists and where, so you extend rather than reinvent.

**Companions — read them, don't duplicate them.** This skill is messaging-specific; the general craft lives elsewhere and if they diverge on a general point, the companion wins:

- **react-best-practices** — component structure, hooks/effects/keys correctness, the `<Button>`/token contract, accessibility. All of it applies to chat components.
- **web-animation-best-practices** — animate only transform/opacity, ease-out entrances, 150–400ms, `prefers-reduced-motion`, the `Reveal`/`FadeIn` primitives. Chat motion obeys this.
- **design-best-practices** — spacing scale, hierarchy through contrast, the token system, `--cream`/`--paper`/plum-panel rules.
- **nestjs-expert** (backend repo) — the authority on the socket.io gateway, guards, DTO mapping, TypeORM entities and migrations. This skill tells you _what messaging needs_; nestjs-expert tells you _how to build it the Nest way_.
- **queer-community-copywriting** — every empty state, system message, and error string.

**Encryption is out of scope for now.** QueerPulse DMs are server-readable plaintext by design (moderation, safety, message-request gating all depend on it). Do not add E2E encryption without an explicit product decision — it would break moderation, search, and cross-device sync. [references/realtime-delivery-and-reliability.md](references/realtime-delivery-and-reliability.md) documents the E2EE frontier as a _future_ option, not a mandate.

## Reference map — route the task to a file

| Your task touches…                                                                                                                                                                                                 | Read                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Message list, bubbles, grouping, date separators, virtualization, scroll anchoring, jump-to-bottom, history-load-without-jump, unread divider                                                                      | [references/message-list-and-scroll.md](references/message-list-and-scroll.md)                     |
| Composer, send/Enter behavior, reply/quote, reactions, edit/delete, long-press overlay, swipe-to-reply, micro-animations, haptics, screen-reader/keyboard a11y, empty states                                       | [references/composer-interactions-a11y.md](references/composer-interactions-a11y.md)               |
| Socket transport, message ordering, client-generated IDs, idempotency/dedup, delivery vs read receipts, presence/typing signal design, offline outbox, reconnect + history sync, push notifications, rate limiting | [references/realtime-delivery-and-reliability.md](references/realtime-delivery-and-reliability.md) |
| Where the actual code lives, what exists vs. what's missing, the prioritized upgrade roadmap, migration/dual-mode rules                                                                                            | [references/queerpulse-messaging-map.md](references/queerpulse-messaging-map.md)                   |

## The checklist — the eight dimensions of great chat

Every messaging change is judged on these. Not all apply to every task; the ones that touch your change are non-negotiable.

### 1. Correct delivery state, always visible

A message has exactly one truthful status at any moment: **pending** (client-only, not yet acked) → **sent** (server has it) → **read** (counterpart's watermark passed it) → or **failed** (retryable). Render it only on the current user's own outgoing bubbles, as the last thing in the bubble's meta row. Never show "sent" for a message the server hasn't acknowledged, and never let a failed message look sent. QueerPulse today conflates "sent" and "delivered" — if you touch send status, keep the states distinct and honest. See message-list ref (status ticks) and realtime ref (receipts).

### 2. The scroll never betrays the reader

Loading older history must not move the message the user is looking at — anchor to a stable message ID and compensate for prepended height. New incoming messages auto-scroll to bottom **only when the user is already near the bottom** (gate behind a ~150px buffer); otherwise show a "jump to latest" pill with an unread count. Stick-to-bottom must survive a bubble _resizing_ (image load, reaction added), not just new messages. QueerPulse has `useMessageScroll`/`useStickToBottom` — extend them, and verify against a real long thread.

### 3. Consecutive messages breathe

Group runs from the same author within a short window (~5 min): one avatar and name at the top of the run, tight spacing inside, generous spacing between runs and between authors. Insert sticky **date separators** ("Today", "Yesterday", then the date) at day boundaries. This is already `messageRuns.ts` / `MessageRun.tsx` — match its grouping semantics; don't hand-roll a second grouping path.

### 4. The composer disappears (in the good way)

Auto-grow the textarea from one line to a capped max (then scroll internally). Enter sends on desktop, Shift+Enter is a newline; on touch, Enter is a newline and send is the button. Preserve the draft while the reply-preview banner is open. Keep the composer's send affordance reachable and never let a long draft push the send button off-screen. Optimistic-send must clear the input instantly and show the pending bubble in the same frame.

### 5. Every action is reversible and gated by real permissions

Reply, react, edit, delete, copy, report — surfaced via the long-press/right-click overlay (touch + desktop parity). Edit and delete are permission-gated **server-side** (author-only edit inside the 15-min window; delete = author or staff) and the client must reflect the same `canEdit`/`canDelete`/`canReport` flags the DTO sends — never compute permissions client-only. Deletes are soft tombstones that keep their slot ("This message was deleted"), not holes in the timeline.

### 6. Realtime is a fast path over a correct one

The socket makes things _feel_ instant; HTTP + the database are the source of truth. Never trust a socket frame as the only record of a message. Client-generated message IDs make sends idempotent so a retry or a double-path (HTTP + WS) can't duplicate. On reconnect you **cannot** assume the transport redelivered everything you missed (this is a verified pitfall) — reconcile by fetching history since your last known message. See realtime ref.

### 7. Signals are cheap, ephemeral, and rate-limited

Typing and presence are hints, not records: debounce/throttle them (typing "start" at most every ~2s, auto-clear after ~3–4s of silence; presence via heartbeat), never persist them, and rate-limit them at the gateway (QueerPulse already token-buckets typing + send — respect it). A typing indicator that lies (stuck "typing…") is worse than none.

### 8. It works for everyone, in both languages, in both modes

Screen-reader users hear new messages via a polite `aria-live` region, can reach every action by keyboard, and land focus sensibly when the overlay opens/closes. Every string is bilingual EN/PT via `useTranslation()`. Every data path honors **demo/live dual-mode** — a live socket/query path keeps its colocated `*.data.ts` mock as the demo fallback (see queerpulse map ref). `prefers-reduced-motion` collapses bubble/overlay motion to a fade.

## QueerPulse messaging toolkit

| Need                                     | Use                                                                                                                      | Where                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Message thread data (paged history)      | `useMessageThread` (`useInfiniteQuery`, cursor `(created_at, id)`)                                                       | `features/messages/api/useMessageThread.ts`    |
| Inbox list + unread badge                | `useConversations` / `useUnreadMessages`                                                                                 | `features/messages/api/useConversations.ts`    |
| Send / mark-read / start                 | `useMessageMutations`                                                                                                    | `features/messages/api/useMessageMutations.ts` |
| React / edit / delete                    | `useMessageActions`                                                                                                      | `features/messages/api/useMessageActions.ts`   |
| Live socket frames                       | `useRealtimeConnection`, `useJoinConversation`, `useTypingFrames`, `useReadFrames`, `usePresenceOnline`, `useEmitTyping` | `shared/api/realtime.ts`                       |
| Stick-to-bottom / jump pill / load-older | `useMessageScroll`, `useStickToBottom`                                                                                   | `features/messages/`                           |
| Counterpart typing state                 | `useTypingIndicator`                                                                                                     | `features/messages/useTypingIndicator.ts`      |
| Unread "new messages" divider            | `useUnreadDivider`                                                                                                       | `features/messages/`                           |
| Long-press gesture                       | `useLongPress`                                                                                                           | `features/messages/useLongPress.ts`            |
| Grouped bubble rendering                 | `MessageRun` + `messageRuns.ts`                                                                                          | `features/messages/`                           |
| Composer                                 | `Composer.tsx` (autogrow, Enter-to-send, typing frames)                                                                  | `features/messages/Composer.tsx`               |
| Action overlay                           | `MessageActionOverlay.tsx` (portal, scroll-lock, Escape, focus)                                                          | `features/messages/`                           |
| Web push                                 | `usePushSubscription`, `src/sw.ts`                                                                                       | `features/push/`, `src/sw.ts`                  |
| Backend socket gateway                   | `chat.gateway.ts` (`/chat` ns, rooms, rate limits)                                                                       | backend `src/chat/`                            |
| Backend messaging domain                 | `messaging.service.ts` (batched queries, keyset paging, gating)                                                          | backend `src/messaging/`                       |

## Quick self-review — before you say it's done

1. Loaded a long thread, scrolled up, and confirmed loading older messages did **not** jump the viewport?
2. Received a new message while scrolled up — did it show a jump pill with a count instead of yanking you down?
3. Sent a message on a throttled/slow network — pending → sent transition truthful, and a failed send is retryable (not silently lost)?
4. Killed and restored the socket mid-conversation — did missed messages reconcile via history, and did no message duplicate?
5. Edit/delete permissions match the server DTO flags, and a deleted message keeps its slot as a tombstone?
6. Typing indicator starts fast, clears on its own, and never sticks?
7. Screen reader announces new messages; every overlay action is keyboard-reachable; focus returns cleanly on close?
8. Demo mode still works (mock fallback present) and copy is EN + PT?
9. `prefers-reduced-motion` respected; motion uses transform/opacity only?
10. No component over 200 lines; mock data in a colocated `*.data.ts`?

## Common mistakes

- **Using array index as the message key.** Prepending history re-indexes every row and destroys scroll restoration + bubble identity. Key by stable message ID (client-generated `localId` for optimistic, server ID once acked).
- **Trusting the socket as the record.** A dropped frame = a lost message forever if HTTP isn't the source of truth. Socket invalidates/patches cache; the DB is truth.
- **Assuming reconnect replays everything.** Verified false in general — after a drop, fetch history since your last message. Don't rely on the transport's buffer.
- **No client message ID → duplicates.** HTTP + WS dual write paths, or a retry, will double-insert without an idempotency key generated on the client.
- **Auto-scrolling unconditionally.** Yanks the reader away from history they're reading. Gate on the near-bottom buffer.
- **Stick-to-bottom that only reacts to new messages.** Breaks when a visible bubble resizes (late image, added reaction). React to size changes too.
- **Computing edit/delete permission on the client.** Authoritative permission is server-side; the client mirrors DTO flags. Client-only gating is a security bug.
- **Persisting or un-throttling typing/presence.** They're ephemeral hints. Persisting them or spamming frames wastes the socket and can leak activity.
- **Optimistic send that clears input only after the round-trip.** Feels laggy. Clear input and show the pending bubble in the same frame; reconcile on ack.
- **Forgetting dual-mode.** A new live path without a demo mock breaks demo mode. Every hook branches.
- **A second grouping/scroll implementation.** `messageRuns.ts`, `useMessageScroll`, `useStickToBottom` already exist. Extend them.

## Sources

Grounded in a verified research pass (WhatsApp/Telegram/Signal/Slack + platform docs). Key primary sources:

- TanStack Virtual — chat virtualization & end-anchored scroll: https://tanstack.com/virtual/latest/docs/chat
- MUI X Chat — grouping window, auto-scroll buffer: https://mui.com/x/react-chat/material/message-list/
- Socket.IO — delivery guarantees (ordering, at-most-once default, retries): https://socket.io/docs/v4/delivery-guarantees
- Ably — message ordering, timeserials, connection recovery: https://ably.com/docs/platform/architecture/message-ordering
- Slack Engineering — real-time WebSocket fan-out: https://slack.engineering/real-time-messaging/
- "Careless Whisper" (arXiv) — delivery/read receipts on reactions, edits, deletes: https://arxiv.org/html/2411.11194v4
- websocket.org — reconnection backoff, outbox, at-least-once + dedup: https://websocket.org/guides/reconnection/
- Rocket.Chat PR #40105 — production message-list virtualization + scroll persistence: https://github.com/RocketChat/Rocket.Chat/pull/40105
