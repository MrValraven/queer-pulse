# QueerPulse Messaging — Codebase Map & Roadmap

Read this **before** you touch messaging. It tells you exactly what exists, where, and what's genuinely missing — so you extend the real code instead of reinventing it or duplicating a path. QueerPulse messaging is already substantial; treat it as a strong base to elevate, not a blank slate.

> Paths are relative to the two sibling repos: the frontend `queerpulse/` and the backend `queerpulse-backend/`.

## Frontend — `queerpulse/src/features/messages/`

**Orchestration / state**
- `useMessagesController.ts` — the brain (~460 lines): page state, demo/live wiring, optimistic send, live-conversation reconciliation (slug→UUID), deep-links (`?c=<id>` from a push tap, "Message <member>"), read-watermark tracking, delete handling. Ephemeral UI state (draft, reply-draft, optimistic sends, active thread, watermarks) lives here. Optimistic messages tracked by a module-scoped `localId`.
- `MessagesPage.tsx` — thin route component. `MessagesSkeleton.tsx`, `MessagesEmptyPanel.tsx`.

**Inbox (conversation list)**
- `MessagesThreadList.tsx`, `MessagesThreadRow.tsx`, `ThreadRowMenu.tsx`.

**Conversation pane**
- `ConversationPanel.tsx` (~258) — orchestrator: header + message area + composer + overlays.
- `ConversationHeader.tsx` — name, online/presence dot.
- `MessageArea.tsx` — the scrolling log (renders flattened infinite-query pages directly; **not virtualized** yet).
- `MessageRun.tsx` (~310) — grouped bubbles: reactions, reply quote, "Seen", edited/deleted state, sender avatars. The biggest presentational unit.
- `Composer.tsx` (~149) — auto-growing textarea, Enter-to-send (desktop), reply-preview banner, emits throttled typing frames, severed to a notice bar for official/blocked threads.

**Actions / overlays**
- `MessageActionOverlay.tsx` (~183) — WhatsApp-style full-screen long-press/right-click overlay: lifted bubble clone, reaction row, permission-gated menu (Reply/Edit/Copy/Delete/Report). Portals to body, scroll-locked, Escape-to-close, focus-managed.
- `ConversationOverlays.tsx`, `MessageActions.tsx`, `ReactionPicker.tsx`, `ReactionChips.tsx`, `reactionKeys.ts` (6 keys: love/laugh/like/wow/sad/thanks), `InlineEditField.tsx`, `DeleteMessageDialog.tsx`, `DeleteConversationDialog.tsx`, `MessageReportModal.tsx`, `NewMessageModal.tsx`.

**Behavior hooks**
- `useTypingIndicator.ts` — counterpart typing state from live frames (auto-clears ~4s).
- `useMessageScroll.ts` / `useStickToBottom.ts` — stick-to-bottom, jump-to-latest pill, load-older on scroll-up.
- `useUnreadDivider.ts`, `useLongPress.ts`, `linkify.tsx`, `messageRuns.ts` (grouping), `recipient.ts`.

**Data layer — `features/messages/api/`**
- `messages.api.ts` — raw REST calls. `messages.adapters.ts` — DTO→view-model (day grouping, time labels, `from: me/them`).
- `useConversations.ts` — inbox `useQuery` + `useUnreadMessages` badge (shared cache via `select`).
- `useMessageThread.ts` — `useInfiniteQuery`, cursor-paginated `(created_at, id)`, newest-first pages flattened oldest→newest.
- `useMessageMutations.ts` — send / mark-read / start. `useMessageActions.ts` — react / delete / edit / delete-conversation.

**Realtime transport (shared)**
- `shared/api/realtime.ts` (~493) — `RealtimeProvider` + `RealtimeClient`: demand-driven single socket to `/chat`, funnels frames into React Query invalidation, exposes `useRealtimeConnection`, `useJoinConversation`, `useTypingFrames`, `useReadFrames`, `usePresenceOnline`, `useEmitTyping`.
- `shared/contracts/realtime.ts` — typed `ClientToServerEvents` / `ServerToClientEvents`. `shared/contracts/contracts.ts` — shared DTO shapes.

**Push** — `features/push/usePushSubscription.ts`, `urlBase64ToUint8Array.ts`, `src/sw.ts` (handles `push` + `notificationclick` → opens `/messages?c=<id>`).

**State model in one line:** React Query owns server state; `RealtimeProvider` owns the socket and pushes updates by **invalidating query keys** (`["messages", convId]`, `["conversations"]`, `["notifications"]`) rather than hand-merging; ephemeral UI state lives in `useMessagesController`.

## Backend — `queerpulse-backend/src/`

**`messaging/` (REST + domain)**
- Entities (`messaging/entities/`):
  - `conversation.entity.ts` — `id`, `isOfficial`, `pairKey` (canonical sorted `userA:userB`, UNIQUE — dedupe guard), `createdAt`.
  - `conversation-participant.entity.ts` — `conversationId`, `userId`, `lastReadAt` (read receipts), `clearedAt` (delete-for-me floor), `muted`. UNIQUE (conversation, user).
  - `message.entity.ts` — `conversationId`, `senderId`, `body` (text), `replyToId`, `createdAt`, `editedAt`, `deletedAt` (`@DeleteDateColumn` soft-delete/tombstone).
  - `message-reaction.entity.ts` — `messageId`, `userId`, `key` (enum). UNIQUE (message, user, key).
- `messaging.service.ts` (~985) — batched queries avoid N+1 (`DISTINCT ON` last message per convo, grouped unread counts, `IN`-batched reactions/profiles); keyset cursor paging on `(created_at, id)`; connection-gating on send, block filtering, staff-delete, server-enforced 15-min edit window; emits `MESSAGE_CREATED/UPDATED/READ/REACTION/DELETED` via EventEmitter2; auto-creates the DM `@OnEvent(CONNECTION_ACCEPTED)`; `deliverEnquiry` for cold cross-domain contact.
- `messaging.controller.ts` — under `ActiveMemberGuard`, throttled. Endpoints: `GET /conversations`, `POST /conversations {recipientHandle}`, `GET /conversations/:id/messages?cursor=`, `POST /conversations/:id/messages {body, replyToId?}`, `POST /conversations/:id/read`, `DELETE /conversations/:id` (clear for-me), `PATCH /conversations/:id {muted}`, reactions add/remove, `DELETE .../messages/:mid` (soft-delete), `PATCH .../messages/:mid {body}` (edit), `POST /messages/request {toSlug, body}`.
- DTO mapping: internal `MessageView` vs frontend-contract `MessageResponse`/`ConversationResponse`/`AuthorSummary`/`ReactionSummary` in `message-response.ts` — field names mirror the frontend contract (`handle`/`displayName`, not `slug`/`firstName`). Tombstones keep id/sender/createdAt, blank body/reactions. **No global serializer — every endpoint hand-maps or it leaks columns.**

**`chat/` (socket.io gateway)**
- `chat.gateway.ts` (~500) — `/chat` namespace, `transports: ['websocket']`. Auth at handshake via httpOnly `access_token` cookie; enforces active membership + lockdown; drops socket at token expiry to force reconnect with a refreshed cookie. Rooms: `user:<id>` + per-conversation. Client→server: `conversation:join`, `message:send`, `typing`, `read`, `presence:snapshot` (per-user token-bucket rate limits). Server→client: `message:new`, `message:updated`, `message:deleted`, `read`, `reaction`, `typing`, `presence`, `presence:snapshot`, `notification:new`, `exception`. **Delivery model:** HTTP is source of truth; gateway relays domain events to rooms; client invalidates React Query caches (not payload-merge). Two send write-paths (HTTP POST + WS `message:send`) both funnel through `MessagingService.sendMessage`.
- `presence.service.ts` (in-memory), `ws-rate-limiter.ts`, `ws-exception.filter.ts`, `session.events.ts`, `dto/chat-payloads.ts`.
- **Documented limit:** single-replica — no Redis adapter, so cross-instance fan-out / `disconnectSockets` only reach the local node.

**`push/`** — `push-subscription.entity.ts`, web-push (VAPID); pushes only member DMs, only to offline + unmuted recipients. **`notifications/notifications.listener.ts`** relays domain events to the general notification feed.

**Migrations** (`src/migrations/`, frozen history — never rename/renumber an applied one): `1782691800000-AddMessaging`, `1785000250000-AddMessageReactions`, `1785000340000-AddConversationClearedAt`, `1785000410000-AddMessageReplyTo`, `1785000400000-CreatePushSubscriptions`.

## What exists vs. what's missing

**Already built (strong base):** 1:1 DMs + official threads · realtime WebSocket delivery · optimistic send + failed/retry (client-only) · typing indicators (bidirectional, auto-clearing) · read receipts / "Seen" (watermark) · presence · reactions (6 keys, idempotent, live) · reply/quote (server-resolved, deleted-parent-safe) · edit (author, 15-min, server-enforced) · soft-delete tombstones · mute · delete-for-me (`clearedAt`) · unread counts + nav badge · Web Push (offline+unmuted, deep-link) · cursor-paginated infinite history · long-press overlay · unread divider · jump-to-latest · report + block-severs-DM · rate limiting (HTTP + WS) · connection-gated messaging + message-request flow · i18n EN/PT · focus mgmt + `aria-live` · reduced-motion.

**Genuine gaps (the roadmap):**
1. **No client message ID / server idempotency** — dual write-paths + retries can duplicate. *(Highest leverage — unblocks the outbox.)*
2. **No persistent offline outbox** — optimistic sends are in-memory, **lost on reload**.
3. **No delivered receipt** — only sent (client-optimistic) and read; no WhatsApp-style "double check."
4. **No media/attachments** — text-only (`body` text); no image/file/voice-note despite S3/Mux existing elsewhere.
5. **No group chats** — schema is multi-participant-capable but only official threads use it; no group create/manage.
6. **Broad invalidations, not incremental patches** — reactions/read/edits refetch rather than cache-patch (extra latency).
7. **No robust long-gap history sync** — reconnect refetches latest page; a long offline gap may not fully reconcile.
8. **No draft persistence** across reloads · **no message search** · **no link previews** (only linkify) · **no forwarding/pinning/starred** · **no disappearing messages** · **no voice/video** · **no custom emoji beyond the 6 keys**.
9. **No Redis adapter** — socket layer is single-replica (fine now; a ceiling for horizontal scale).

## Non-negotiable repo rules for any messaging change

- **Demo/live dual-mode:** every data hook branches `if (demoMode) return mock else callApi()`. Any new live path (query, mutation, socket) keeps a colocated `*.data.ts` mock as the demo fallback. Demo is forced on when `VITE_API_URL` is unset. Breaking demo mode is a broken change.
- **200-line cap per component.** Split before you cross it (see **component-decomposition**). Mock data in a colocated `*.data.ts(x)`; a `Record<…, styles.xxx>` class map may stay in the component.
- **Tokens only, no hardcoded hex.** Page bg `--cream`; cards `--paper` (#FFFFFF) with `1px solid rgba(45,27,61,.09)`. `<Button>` always; never nest `<button>` in `<Link>`. CSS Modules (no Tailwind).
- **Routing via `linkToPath()`** from `src/app/routeMap.ts` — never hardcode paths.
- **i18n:** `useTranslation()`, strings bilingual EN/PT; keep phrasing translatable.
- **Backend: schema is migration-owned.** `synchronize` never on; snake naming. **Never rename/renumber an applied migration** (TypeORM matches by class name — renaming re-runs `up()`). Add a *new* timestamped migration; duplicate timestamps are harmless.
- **Backend: hand-map every DTO** (no global serializer) or you leak columns. **Guard chain:** Throttler → CSRF → JWT; state-changing routes need a CSRF token; `@Public()` opts out.
- **Cross-feature reactions via `@nestjs/event-emitter`**, not direct calls.
- **Tests:** Vitest + RTL + jsdom + MSW (frontend), Jest + supertest (backend). Per the user's standing rule, **do not run the test suites unless explicitly asked** — verify statically or by driving the app.
