import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useRealtime } from "../../shared/api/realtime";
import type { ChatMessage } from "./data";
import {
  getActiveOutboxStorageKey,
  readUnseenOutboxEntries,
  saveOutbox,
} from "./outbox";
import type { GifAttachment } from "../../shared/api/gifs";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";
import {
  mediaKindOf,
  revokeBlobPreview,
  type MediaKind,
} from "./messageSending.helpers";
import { isServerConversationId } from "./useMessagesController.helpers";
import {
  isDueForAutoReplay,
  markAutoReplayAttempt,
  markMessagesPageOutboxMounted,
  markMessagesPageOutboxUnmounted,
  replayConversationInOrder,
} from "./outboxReplay.helpers";
import { useOutboxReplayTimer } from "./useOutboxReplayTimer";

type DeliverFunction = (
  convId: string,
  body: string,
  localId: string,
  replyToId?: string,
  forwarded?: boolean,
  attachment?: GifAttachment | DocumentAttachment,
  mediaKind?: MediaKind,
) => void;

type DeliverAsyncFunction = (
  convId: string,
  body: string,
  localId: string,
  replyToId?: string,
  forwarded?: boolean,
  attachment?: GifAttachment | DocumentAttachment,
  mediaKind?: MediaKind,
) => Promise<boolean>;

interface OutboxDeps {
  sent: Record<string, ChatMessage[]>;
  setSent: Dispatch<SetStateAction<Record<string, ChatMessage[]>>>;
  demoMode: boolean;
  /** From `useMessageDeliverCore`. */
  deliver: DeliverFunction;
  /** From `useMessageDeliverCore` (ENG-213), the awaitable twin of `deliver`,
   *  used by the sequential replay loop below so it can tell success from
   *  failure without changing `deliver`'s own fire-and-forget contract. */
  deliverAsync: DeliverAsyncFunction;
  /** From `useMessageDeliverCore` (ENG-208): true while a delivery for a
   *  given localId is already underway, so the replay loop below stops on
   *  an entry a delivery is already in progress for, giving it exclusive
   *  claim to that POST until it settles. */
  isDeliveryInFlight: (localId: string) => boolean;
}

export interface MessageOutbox {
  /** Re-key every optimistic send queued under a just-picked recipient's
   *  placeholder id (see `recipient.ts`) to the real server conversation id,
   *  and re-drive `deliver` for anything still `sending`/`failed`. `deliver`
   *  never actually reached the server for those while the id was a
   *  placeholder (see its own UUID guard), so without this call they'd stay
   *  orphaned once `activeId` flips to the real id. Called from
   *  `useMessageCreation`'s `startConversation.onSuccess`. A no-op if nothing
   *  was queued under `oldConvId`. */
  migrateOutboxConversation: (oldConvId: string, newConvId: string) => void;
}

/**
 * The offline outbox: persisting `sent` on every change, replaying anything
 * still `sending`/`failed` on mount / network-online / socket-reconnect / an
 * ENG-208 backoff timer, and migrating a placeholder conversation's queued
 * sends onto its real id once the server materializes it. Extracted from
 * `useMessageSending`, with the ENG-208/213/214/215 fixes documented at each
 * effect below layered on top. Mounting/unmounting this hook also toggles
 * `outboxReplay.helpers.ts`'s page-mount counter, which is what keeps
 * `useBackgroundOutboxReplay` (mounted app-wide from `AppChrome`) inert while
 * THIS hook already owns the outbox.
 */
export function useMessageOutbox({
  sent,
  setSent,
  demoMode,
  deliver,
  deliverAsync,
  isDeliveryInFlight,
}: OutboxDeps): MessageOutbox {
  // Persist the outbox on every change so an in-flight (or demo) send survives a
  // reload. Demo entries stay as `sent`; live `sending`/`failed` entries are
  // replayed below and then cleared as the server acks them.
  useEffect(() => {
    saveOutbox(sent);
  }, [sent]);

  // Latest `sent`/`deliver`/`deliverAsync` held in refs so the replay loop
  // below (fired from window/socket events, never from render) always reads
  // the CURRENT outbox and the current idempotent deliver functions, without
  // those event effects needing to resubscribe on every keystroke-driven
  // `sent` change.
  const sentRef = useRef(sent);
  useEffect(() => {
    sentRef.current = sent;
  }, [sent]);
  const deliverRef = useRef(deliver);
  useEffect(() => {
    deliverRef.current = deliver;
  }, [deliver]);
  const deliverAsyncRef = useRef(deliverAsync);
  useEffect(() => {
    deliverAsyncRef.current = deliverAsync;
  }, [deliverAsync]);
  const isDeliveryInFlightRef = useRef(isDeliveryInFlight);
  useEffect(() => {
    isDeliveryInFlightRef.current = isDeliveryInFlight;
  }, [isDeliveryInFlight]);

  // ENG-214: tell `useBackgroundOutboxReplay` (mounted app-wide) that THIS
  // hook already owns the outbox for as long as the Messages page stays
  // mounted, so the two replay loops share ownership of the outbox without
  // ever operating on the same entry at once. `useLayoutEffect`, not
  // `useEffect`: the increment must land in the SAME commit the page mounts
  // in, before the background hook's own (passive-effect-driven) mount
  // trigger can run and see a stale count. Runs regardless of demo mode: the
  // counter only gates the LIVE background hook, and staying accurate
  // through a demo↔live flip (which remounts neither hook) costs nothing.
  useLayoutEffect(() => {
    markMessagesPageOutboxMounted();
    return () => markMessagesPageOutboxUnmounted();
  }, []);

  // ENG-215: pull in another tab's still-QUEUED send the instant it writes to
  // the SAME scope's key. `storage` only fires for OTHER tabs' writes, never
  // this tab's own, so there's no risk of a loop with the persist effect
  // above. Ignoring every other key (a different scope, or an unrelated store
  // entirely) keeps this a no-op for the vast majority of `storage` events
  // any tab receives. A DROP (another tab acking or otherwise removing an
  // entry this tab still holds) is intentionally out of scope: this tab's own
  // copy keeps offering that entry on every save until its own attempt
  // genuinely settles, and the server dedupes a still-eligible attempt by
  // `clientMessageId`; a permanently failed or retry-budget-exhausted entry
  // needs a manual retry either way, cross-tab sync or not. Sorted
  // oldest-first by `at` so a pulled-in entry can't jump ahead of one already
  // queued here.
  useEffect(() => {
    if (demoMode) return;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== getActiveOutboxStorageKey()) return;
      const unseen = readUnseenOutboxEntries(event.newValue);
      if (Object.keys(unseen).length === 0) return;
      setSent((previous) => {
        const next = { ...previous };
        for (const [conversationId, messages] of Object.entries(unseen)) {
          next[conversationId] = [
            ...(next[conversationId] ?? []),
            ...messages,
          ].sort((a, b) => {
            if (!a.at || !b.at) return 0;
            return a.at < b.at ? -1 : a.at > b.at ? 1 : 0;
          });
        }
        return next;
      });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [demoMode, setSent]);

  // Safety net: release every remaining local blob preview when the Messages
  // page itself unmounts (the member navigates away entirely; a thread
  // switch does NOT unmount this hook, `sent` persists across those). Most
  // image sends resolve well before that, and `handleDeliverSuccess` (called
  // via `settleDelivery` inside `useMessageDeliverCore`) already revokes
  // theirs; this only catches whatever is still `sending`/`failed` (or a demo
  // send, which never resolves to a server copy) at the moment the page
  // closes, so the tab never accumulates leaked object URLs across repeated
  // visits to Messages.
  useEffect(() => {
    return () => {
      for (const messages of Object.values(sentRef.current)) {
        for (const message of messages) revokeBlobPreview(message);
      }
    };
  }, []);

  const migrateOutboxConversation = useCallback(
    (oldConvId: string, newConvId: string) => {
      if (oldConvId === newConvId) return;
      const pending = sentRef.current[oldConvId];
      if (!pending || pending.length === 0) return;
      setSent((previous) => {
        const stillPending = previous[oldConvId];
        if (!stillPending || stillPending.length === 0) return previous;
        const next = { ...previous };
        delete next[oldConvId];
        next[newConvId] = [...(next[newConvId] ?? []), ...stillPending];
        return next;
      });
      // Re-drive anything that never actually reached the server: `deliver`'s
      // UUID guard skipped the request while `oldConvId` was still a
      // placeholder, so a `sending` entry here was never attempted, and a
      // `failed` one (a genuine send error before the id even resolved,
      // effectively unreachable today but kept for safety) deserves the same
      // automatic retry `replayOutbox` gives every other failed send.
      // `isDueForAutoReplay` skips one already classified a PERMANENT failure
      // (`isRetryable === false`) or that exhausted its retry budget. This
      // loop stays fire-and-forget here, driving every due entry directly,
      // rather than through the sequential `replayConversation` below: a
      // placeholder conversation can only ever have accumulated its sends
      // while genuinely offline or erroring, a narrow enough case that
      // ENG-213's sequential-ordering fix targeted `replayOutbox` alone.
      // Noted as an adjacent gap this slice didn't extend to.
      for (const message of pending) {
        if (isDueForAutoReplay(message)) {
          markAutoReplayAttempt(setSent, newConvId, message.localId);
          deliver(
            newConvId,
            message.text,
            message.localId,
            message.replyTo?.id,
            message.forwarded,
            message.sendAttachment ?? message.attachment,
            mediaKindOf(message),
          );
        }
      }
    },
    [deliver, setSent],
  );

  // ENG-213: conversations this tab is CURRENTLY replaying. Guards against
  // two replay passes (e.g. `online` and a reconnect landing in the same
  // tick) both walking the SAME conversation's entries concurrently, which
  // would double-spend the retry budget and could fire two deliveries for
  // adjacent entries out of order.
  const inFlightConversationsRef = useRef<Set<string>>(new Set());

  /** Replay one conversation's due entries oldest-first, awaiting each
   *  delivery's settlement before starting the next: see
   *  `replayConversationInOrder`'s own doc for why. */
  const replayConversation = useCallback(
    async (conversationId: string, messages: ChatMessage[]) => {
      if (inFlightConversationsRef.current.has(conversationId)) return;
      inFlightConversationsRef.current.add(conversationId);
      try {
        await replayConversationInOrder(
          messages,
          // ENG-208: stop the chain on an entry a delivery is already
          // underway for (most commonly the very send that just created it).
          // `appendOptimistic`/`runDeliver` stamping `lastAttemptAt` the
          // instant an attempt starts only covers the entry's OWN backoff
          // window (2s the first time); this check is what keeps protecting
          // a genuinely slow request past that window too, for as long as it
          // takes to settle, so it stays load-bearing for any request slower
          // than one backoff window, not just a guard for the moment before
          // that stamp commits.
          (localId) => isDeliveryInFlightRef.current(localId),
          async (message) => {
            // Re-read the CURRENT entry from `sentRef` right before
            // attempting: this conversation's pass may have started from an
            // already-stale snapshot, since a manual retry or another
            // trigger can settle an entry while this chain is still working
            // through earlier ones. Respecting that fresher state here is
            // what keeps a just-settled entry from being resent.
            const current = sentRef.current[conversationId]?.find(
              (item) => item.localId === message.localId,
            );
            if (
              !current ||
              (current.status !== "sending" && current.status !== "failed")
            ) {
              return true;
            }
            markAutoReplayAttempt(setSent, conversationId, message.localId);
            return deliverAsyncRef.current(
              conversationId,
              current.text,
              message.localId,
              current.replyTo?.id,
              current.forwarded,
              // Same real-payload preference as `retrySend`/`migrateOutboxConversation`.
              current.sendAttachment ?? current.attachment,
              mediaKindOf(current),
            );
          },
        );
      } finally {
        inFlightConversationsRef.current.delete(conversationId);
      }
    },
    [setSent],
  );

  // Resend everything still `sending`/`failed` in the outbox (live mode only).
  // Idempotent: each entry keeps its original `clientMessageId` (== `localId`),
  // so a message the server already stored is deduped rather than duplicated,
  // safe to fire on every connectivity flap. A send that succeeds is cleared
  // from `sent` by `handleDeliverSuccess` (called via `settleDelivery` inside
  // `useMessageDeliverCore`), so a later replay simply skips it.
  // `isDueForAutoReplay` is what keeps this actually safe to call on every
  // flap: it skips a PERMANENT failure (never resent again) and bounds a
  // still-transient one to `MAX_AUTO_REPLAY_ATTEMPTS` with backoff between
  // tries, so a dead entry can't burn the 60/min send throttle forever.
  // Placeholder conversation ids (a just-picked recipient's slug, not yet a
  // real server id) are skipped entirely here: only `migrateOutboxConversation`
  // above drives those. Neither `appendOptimistic` nor `runDeliver` ever
  // stamps `lastAttemptAt` for one either (ENG-208), since nothing is
  // actually attempted there, so `migrateOutboxConversation`'s own
  // `isDueForAutoReplay` check sees it as immediately due once the real
  // conversation exists.
  //
  // ENG-213: each CONVERSATION replays sequentially (oldest due entry first,
  // stopping that conversation's chain the moment an eligible entry isn't yet
  // due) so three offline sends in the same thread can never land 2-3-1;
  // different conversations still replay independently, in parallel. Awaits
  // every conversation's pass before returning, so the caller can reschedule
  // the ENG-208 backoff timer from the freshly-settled state.
  //
  // `replayOutboxRef` lets `useOutboxReplayTimer`'s `onDue` callback (wired up
  // below, BEFORE `replayOutbox` itself exists) call the latest `replayOutbox`
  // without a circular `useCallback` dependency.
  const replayOutboxRef = useRef<() => Promise<void>>(() => Promise.resolve());

  // ENG-208: split out to `useOutboxReplayTimer` to keep this file from
  // growing further. Reschedules automatically whenever `sent` changes (a
  // replay attempt, a failed delivery, a fresh optimistic send, ...), and
  // `replayOutbox` below additionally calls `scheduleReplayTimer` explicitly
  // after every pass, so a pass that found nothing due yet still gets a
  // fresh timer regardless of whether `sent` itself changed.
  const onOutboxReplayTimerDue = useCallback(
    () => void replayOutboxRef.current(),
    [],
  );
  const isReplayTimerInFlight = useCallback(
    (localId: string) => isDeliveryInFlightRef.current(localId),
    [],
  );
  const { scheduleReplayTimer } = useOutboxReplayTimer({
    sent,
    demoMode,
    isInFlight: isReplayTimerInFlight,
    onDue: onOutboxReplayTimerDue,
  });

  const replayOutbox = useCallback(async () => {
    if (demoMode) return;
    const entries = Object.entries(sentRef.current).filter(([conversationId]) =>
      isServerConversationId(conversationId),
    );
    await Promise.all(
      entries.map(([conversationId, messages]) =>
        replayConversation(conversationId, messages),
      ),
    );
    scheduleReplayTimer();
  }, [demoMode, replayConversation, scheduleReplayTimer]);

  useEffect(() => {
    replayOutboxRef.current = replayOutbox;
  }, [replayOutbox]);

  // Replay once on mount: the persisted outbox may hold a send that was in
  // flight or failed when the tab last closed.
  const outboxReplayedRef = useRef(false);
  useEffect(() => {
    if (demoMode || outboxReplayedRef.current) return;
    outboxReplayedRef.current = true;
    void replayOutbox();
  }, [demoMode, replayOutbox]);

  // Re-flush whenever the browser regains network. A send that failed while the
  // tab stayed open (offline) now auto-recovers, WhatsApp/Signal style, instead
  // of sitting `failed` until a manual retry or reload.
  useEffect(() => {
    if (demoMode) return;
    const onOnline = () => void replayOutbox();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [demoMode, replayOutbox]);

  // Re-flush on socket reconnect. `connected` flips false→true after a drop; the
  // socket buffered nothing while it was down (see RealtimeClient), so anything
  // that failed mid-gap must be resent. Guarded on the false→true transition so
  // a steady connection never re-fires, and idempotent regardless.
  const { connected } = useRealtime();
  const wasConnectedRef = useRef(connected);
  useEffect(() => {
    if (!demoMode && connected && !wasConnectedRef.current) void replayOutbox();
    wasConnectedRef.current = connected;
  }, [connected, demoMode, replayOutbox]);

  return { migrateOutboxConversation };
}
