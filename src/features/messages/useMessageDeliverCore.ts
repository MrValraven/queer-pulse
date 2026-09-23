import { useCallback, useRef, type Dispatch, type SetStateAction } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChatMessage } from "./data";
import { isServerConversationId } from "./useMessagesController.helpers";
import type { useSendMessage } from "./api/useMessageMutations";
import { sendDocumentMessage, wasMessageReplayed } from "./api/messages.api";
import { ApiError } from "../../shared/api/client";
import type { GifAttachment } from "../../shared/api/gifs";
import {
  isDocumentAttachment,
  type DocumentAttachment,
} from "../../shared/api/documentAttachment";
import type { MessageResponse } from "../../shared/contracts/contracts";
import {
  patchConversationPreview,
  upsertMessage,
} from "../../shared/api/messageCache";
import { revokeBlobPreview, type MediaKind } from "./messageSending.helpers";
import { PERMANENT_FAILURE_STATUS_CODES } from "./outboxReplay.helpers";
import { MAILBOXES_QUERY_KEY_PREFIX } from "../../shared/api/mailboxViewer";

/**
 * The live mutation behind a `kind:"document"` send (PRD-226), a standalone
 * `useMutation` rather than a `useMessageMutations.useSendMessage` widening,
 * since that hook's file is owned by a parallel build pass. Mirrors
 * `useSendMessage`'s own demo/live cache-patch contract exactly: on success,
 * the server row replaces the optimistic bubble in place (deduped by
 * `clientMessageId`) and the inbox preview is patched, never invalidated.
 */
function useSendDocumentMessage() {
  const queryClient = useQueryClient();
  return useMutation<
    MessageResponse,
    Error,
    {
      conversationId: string;
      body: string;
      attachment: DocumentAttachment;
      replyToId?: string;
      clientMessageId?: string;
      forwarded?: boolean;
      asIdentityId?: string;
    }
  >({
    mutationFn: ({
      conversationId,
      body,
      attachment,
      replyToId,
      clientMessageId,
      forwarded,
      asIdentityId,
    }) =>
      sendDocumentMessage(
        conversationId,
        body,
        attachment,
        replyToId,
        clientMessageId,
        forwarded,
        asIdentityId,
      ),
    onSuccess: (message, { conversationId }) => {
      upsertMessage(queryClient, conversationId, message);
      patchConversationPreview(queryClient, conversationId, message);
    },
  });
}

/** Wrap one live send mutation call as a `Promise<boolean>`, built on
 *  `mutateAsync` so its own promise settles independently for THIS call
 *  alone: in @tanstack/query-core 5, a LATER `mutate` call on the same
 *  mutation object can supersede an earlier call's per-call
 *  `onSuccess`/`onError` (they may never fire, and never fire after unmount
 *  either), which silently stranded an earlier send's optimistic bubble in
 *  `"sending"` forever whenever two sends overlapped on the same mutation
 *  object. `onSettled` always runs via `.finally`, regardless of outcome, so
 *  the caller's in-flight bookkeeping (see `isDeliveryInFlight`) never
 *  leaks. `onSuccess` receives the mutation's resolved value (ENG-222: so the
 *  caller can read `wasMessageReplayed` off it). `mutateAsync` resolves the
 *  exact object its `mutationFn` produced, never a clone, so this is safe
 *  even though `useMessageMutations.ts#useSendMessage`'s own `onSuccess`
 *  (outside this file) already ran against the same reference first. */
function settleDelivery<TVariables, TResult>(
  mutateAsync: (variables: TVariables) => Promise<TResult>,
  variables: TVariables,
  onSuccess: (result: TResult) => void,
  onError: (error: unknown) => void,
  onSettled: () => void,
): Promise<boolean> {
  return mutateAsync(variables)
    .then(
      (result) => {
        onSuccess(result);
        return true;
      },
      (error: unknown) => {
        onError(error);
        return false;
      },
    )
    .finally(onSettled);
}

/** ENG-208: true exactly when `convId` is about to have a real delivery
 *  attempt fired against it, the only moment stamping `lastAttemptAt` is
 *  meaningful. Live only (`demoMode` never attempts anything over the
 *  network, so demo entries must never carry this field: `saveOutbox`
 *  persists whatever `sent` holds verbatim, and a stray field there would be
 *  a real, if harmless, change to demo's persisted shape). Restricted to a
 *  real server conversation id: a still-placeholder `convId` means
 *  `runDeliver`'s own UUID guard will no-op without attempting anything, so
 *  stamping it anyway only delayed that conversation's first real attempt,
 *  once `migrateOutboxConversation` resolved it, by a full backoff window. */
function isDeliveryAttemptImminent(convId: string, demoMode: boolean): boolean {
  return !demoMode && isServerConversationId(convId);
}

/** Stamp `lastAttemptAt` on `localId` when (see `isDeliveryAttemptImminent`)
 *  an attempt is actually about to fire, so the ENG-208 backoff timer can
 *  never read this entry as already due again before this very attempt has
 *  had a chance to settle. */
function stampAttemptIfImminent(
  setSent: Dispatch<SetStateAction<Record<string, ChatMessage[]>>>,
  convId: string,
  localId: string,
  demoMode: boolean,
): void {
  if (!isDeliveryAttemptImminent(convId, demoMode)) return;
  setSent((prev) => ({
    ...prev,
    [convId]: (prev[convId] ?? []).map((item) =>
      item.localId === localId ? { ...item, lastAttemptAt: Date.now() } : item,
    ),
  }));
}

// Shared by both mutations `runDeliver` calls below (the ordinary text/gif/
// image send and the document send) so their success handling can never
// drift apart. Module-level (not a `useCallback` inside the hook) to keep
// `useMessageDeliverCore` itself under the 200-line cap.
//
// ENG-222: `wasReplayed` is true when the server answered this POST with
// `Idempotent-Replayed: true`. It already had this `clientMessageId` from an
// earlier attempt (a resend, or the HTTP+WS dual path), so THIS attempt
// never created anything new. Clearing the optimistic bubble still has to
// run either way: the message genuinely exists server-side now, replay or
// fresh, and every field on it is already idempotent-safe to reapply (see
// `patchConversationPreview`'s own doc). `wasReplayed` is the gate any
// future genuine-first-create-only side effect (a "sent" sound, a haptic
// buzz on delivery, etc.) must be added behind, so a retried/replayed send
// can never fire it twice. None exists in this file today; see this build's
// report for why.
function handleDeliverSuccessEffect(
  setSent: Dispatch<SetStateAction<Record<string, ChatMessage[]>>>,
  convId: string,
  localId: string,
  wasReplayed: boolean,
): void {
  setSent((prev) => {
    const current = prev[convId] ?? [];
    // The server row has landed: its own resolved URL now renders the
    // bubble, so this tab's local blob preview (if any) is safe to release.
    revokeBlobPreview(current.find((item) => item.localId === localId));
    const remaining = current.filter((item) => item.localId !== localId);
    const next = { ...prev };
    if (remaining.length > 0) next[convId] = remaining;
    else delete next[convId];
    return next;
  });
  if (wasReplayed) {
    // No first-create-only effect to skip today (see the doc above). This
    // branch is the gate point, kept explicit rather than silently absent,
    // so the next one added here doesn't have to rediscover this.
    return;
  }
}

// Module-level, kept out of `runDeliver`'s own body for the same reason as
// `handleDeliverSuccessEffect` above: it keeps `useMessageDeliverCore` under
// the 200-line cap. Resolves the kind EXPLICITLY from `stickerId`/`mediaKind`:
// `stickerId` alone decides a sticker send, since the server reads the
// catalogue row and bakes its own attachment, so a sticker send always
// arrives here with no attachment of its own to key a kind off of.
function resolveSendKind(
  attachment: GifAttachment | DocumentAttachment | undefined,
  mediaKind: MediaKind | undefined,
  stickerId: string | undefined,
): "user" | "gif" | "image" | "sticker" | undefined {
  if (stickerId) return "sticker";
  if (attachment && (mediaKind === "gif" || mediaKind === "image")) {
    return mediaKind;
  }
  return undefined;
}

interface DeliverCoreDeps {
  setSent: Dispatch<SetStateAction<Record<string, ChatMessage[]>>>;
  demoMode: boolean;
  sendMessage: ReturnType<typeof useSendMessage>;
}

export interface MessageDeliverCore {
  /** Append an optimistic bubble to a conversation's session sends. */
  appendOptimistic: (convId: string, message: ChatMessage) => void;
  setStatus: (
    convId: string,
    localId: string,
    status: ChatMessage["status"],
  ) => void;
  /** Drive a message down the send ladder (demo-simulated, or the live
   *  mutation). `mediaKind` is required whenever `attachment` is set: it's
   *  what tells the server (and a resend/outbox-replay) a `gif`/`image`
   *  message (both carry a `GifAttachment`) from a `document` one (carries a
   *  `DocumentAttachment`, routed to its own mutation below). `stickerId` is
   *  the sticker send's ENTIRE payload: a sticker carries no attachment at
   *  all (the server reads the catalogue row and bakes one), so the send kind
   *  is resolved from `stickerId`/`mediaKind` explicitly rather than from
   *  whether `attachment` is present, which a sticker send never has (see
   *  `runDeliver`'s own doc). Fire-and-forget: existing callers
   *  (`send`/`sendGif`/`sendImage`/`sendDocument`/`sendSticker`/`retrySend`)
   *  never awaited a result and still don't; see `deliverAsync` for a caller
   *  that needs to know the outcome. `asIdentityId` is the identity the
   *  message was composed as (see `runDeliver`). */
  deliver: (
    convId: string,
    body: string,
    localId: string,
    replyToId?: string,
    forwarded?: boolean,
    attachment?: GifAttachment | DocumentAttachment,
    mediaKind?: MediaKind,
    stickerId?: string,
    asIdentityId?: string,
  ) => void;
  /** ENG-213: the same send primitive as `deliver`, but resolving `true` on
   *  success and `false` on failure (demo mode always resolves `true`; the
   *  "conversation doesn't exist server-side yet" no-op resolves `false`,
   *  since nothing was attempted) instead of firing and forgetting. Lets a
   *  sequential replay loop (`useMessageOutbox`, `useBackgroundOutboxReplay`)
   *  `await` one entry's settlement before sending the next in the same
   *  conversation, so offline sends can never land out of order. Built on
   *  `mutateAsync` (see `settleDelivery`) so its outcome can never be dropped
   *  by a concurrent second send in the same thread superseding it. */
  deliverAsync: (
    convId: string,
    body: string,
    localId: string,
    replyToId?: string,
    forwarded?: boolean,
    attachment?: GifAttachment | DocumentAttachment,
    mediaKind?: MediaKind,
    stickerId?: string,
    asIdentityId?: string,
  ) => Promise<boolean>;
  /** ENG-208: true while a delivery for `localId` is already underway (added
   *  the instant `deliver`/`deliverAsync` starts it, removed the instant it
   *  settles). Both replay loops check this first, before treating an entry
   *  as due, so a send already in progress is never fired a second time. */
  isDeliveryInFlight: (localId: string) => boolean;
}

/**
 * The core send-to-server primitive: optimistic append, status transitions,
 * and `deliver`/`deliverAsync` (the demo-simulated ladder or the live
 * idempotent mutation, via `settleDelivery`). Extracted from
 * `useMessageSending`; also owns the in-flight bookkeeping
 * (`isDeliveryInFlight`) and the `lastAttemptAt` stamping both replay loops
 * rely on, so a fresh or manually retried send is never treated as already
 * due for automatic replay during its own first backoff window (ENG-208).
 */
export function useMessageDeliverCore({
  setSent,
  demoMode,
  sendMessage,
}: DeliverCoreDeps): MessageDeliverCore {
  // A `kind:"document"` send routes to its own mutation (see
  // `useSendDocumentMessage`'s own doc for why this isn't a widened
  // `sendMessage` instead), same idempotent-on-`clientMessageId` endpoint,
  // same cache-patch contract, just a separate react-query mutation object.
  const sendDocumentMessageMutation = useSendDocumentMessage();
  // Read only by `handleDeliverError`'s `IDENTITY_REMOVED` branch below.
  const queryClient = useQueryClient();

  // ENG-208: stamp `lastAttemptAt` the moment the bubble is created, when
  // (`isDeliveryAttemptImminent`) the `deliver`/`deliverAsync` call that
  // follows immediately IS about to be the first real attempt. Without this,
  // a brand-new entry (no `lastAttemptAt` yet) read as already due the
  // instant the backoff timer's `sent`-change effect fired, moments after
  // this same append, which spun the timer at 0 ms for the whole round-trip
  // of every live send before `isDeliveryInFlight` caught it.
  const appendOptimistic = useCallback(
    (convId: string, message: ChatMessage) => {
      const stampedMessage = isDeliveryAttemptImminent(convId, demoMode)
        ? { ...message, lastAttemptAt: Date.now() }
        : message;
      setSent((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] ?? []), stampedMessage],
      }));
    },
    [setSent, demoMode],
  );

  const setStatus = useCallback(
    (convId: string, localId: string, status: ChatMessage["status"]) => {
      setSent((prev) => ({
        ...prev,
        [convId]: (prev[convId] ?? []).map((item) =>
          item.localId === localId ? { ...item, status } : item,
        ),
      }));
    },
    [setSent],
  );

  // See `handleDeliverSuccessEffect`'s own doc (module-level, above) for the
  // ENG-222 replay gate this wraps.
  const handleDeliverSuccess = useCallback(
    (convId: string, localId: string, wasReplayed: boolean) =>
      handleDeliverSuccessEffect(setSent, convId, localId, wasReplayed),
    [setSent],
  );

  // ENG-208: localIds with a delivery currently underway. Read via
  // `isDeliveryInFlight`, written only inside `runDeliver` below.
  const inFlightLocalIdsRef = useRef<Set<string>>(new Set());
  const isDeliveryInFlight = useCallback(
    (localId: string) => inFlightLocalIdsRef.current.has(localId),
    [],
  );

  const handleDeliverError = useCallback(
    (convId: string, localId: string, error: unknown) => {
      // Classify right where the failure actually happens, see
      // `PERMANENT_FAILURE_STATUS_CODES`. `isRetryable` is written fresh
      // from THIS attempt's outcome (not merged with any prior value),
      // so a manual retry that now fails only transiently (the
      // underlying cause resolved) clears an earlier permanent flag
      // rather than staying stuck.
      const isPermanentFailure =
        error instanceof ApiError &&
        PERMANENT_FAILURE_STATUS_CODES.has(error.status);
      // ENG-242: lift the error body's machine-readable `code` (e.g. a
      // moderator `restrict` action's `"ACCOUNT_RESTRICTED"`), when the
      // server sent one, so the failed-send row can show a specific reason
      // instead of a generic one. Absent for a plain network/timeout
      // failure, which is not an `ApiError` at all.
      const failureCode =
        error instanceof ApiError &&
        error.data &&
        typeof error.data === "object" &&
        "code" in error.data &&
        typeof (error.data as { code?: unknown }).code === "string"
          ? (error.data as { code: string }).code
          : undefined;
      // Moderation removed the persona this message was composed as, mid-
      // flight: refresh the mailbox list so `isReadOnly` lands and the
      // composer turns itself off, the same invalidation
      // `useConversationClaim`'s own `IDENTITY_REMOVED` catch runs for a
      // claim/release/take-over refused the same way.
      if (failureCode === "IDENTITY_REMOVED") {
        void queryClient.invalidateQueries({
          queryKey: MAILBOXES_QUERY_KEY_PREFIX,
        });
      }
      setSent((prev) => ({
        ...prev,
        [convId]: (prev[convId] ?? []).map((item) =>
          item.localId === localId
            ? {
                ...item,
                status: "failed",
                isRetryable: !isPermanentFailure,
                failureCode,
                lastAttemptAt: Date.now(),
              }
            : item,
        ),
      }));
    },
    [setSent, queryClient],
  );

  // The shared implementation behind BOTH `deliver` (fire-and-forget) and
  // `deliverAsync` (ENG-213, awaitable) below, so the two can never drift:
  // exactly one place decides demo-simulation vs. the live idempotent
  // mutation, and every caller sees the same success/failure classification.
  // `asIdentityId` is always the identity stamped on the message being
  // delivered (`ChatMessage.sendAsIdentityId`, fixed at compose time), so a
  // retry or replay after a mailbox switch still sends as the mailbox the
  // message was written in. Undefined sends as the member's own profile.
  const runDeliver = useCallback(
    (
      convId: string,
      body: string,
      localId: string,
      replyToId?: string,
      forwarded?: boolean,
      attachment?: GifAttachment | DocumentAttachment,
      mediaKind?: MediaKind,
      stickerId?: string,
      asIdentityId?: string,
    ): Promise<boolean> => {
      // ENG-208: mark this localId in flight for the WHOLE attempt (every
      // branch below), cleared on every exit path. A replay loop racing this
      // same call sees it via `isDeliveryInFlight` and stops its chain there,
      // giving a still-in-progress send exclusive claim to that POST for as
      // long as it takes to settle.
      inFlightLocalIdsRef.current.add(localId);
      const settle = (): void => {
        inFlightLocalIdsRef.current.delete(localId);
      };
      // `appendOptimistic` already stamps `lastAttemptAt` for a brand-new
      // send; this additionally covers a manual retry, which re-drives
      // `runDeliver` without going through `appendOptimistic` again.
      stampAttemptIfImminent(setSent, convId, localId, demoMode);
      if (demoMode) {
        // Simulate the honest ladder locally, no network: sent, delivered, seen
        // on a short timer, exactly the three rungs live mode drives from the
        // server ack + delivered/read watermarks. `setStatus` is a no-op once the
        // message is gone (thread switched/deleted), so stale timers are harmless.
        setStatus(convId, localId, "sent");
        window.setTimeout(() => setStatus(convId, localId, "delivered"), 700);
        window.setTimeout(() => setStatus(convId, localId, "seen"), 1900);
        return Promise.resolve(true).finally(settle);
      }
      if (!isServerConversationId(convId)) {
        // The conversation doesn't exist server-side yet: `convId` is still a
        // just-picked recipient's placeholder id (its handle, not a UUID; see
        // `recipient.ts`). POSTing here would 400 against
        // `/conversations/<handle>/messages` (`ParseUUIDPipe`). Leave the
        // bubble exactly as `sending` (never `failed`, since nothing was
        // actually attempted) rather than firing the doomed request: once
        // `startConversation` resolves, `migrateOutboxConversation` re-keys
        // this outbox entry to the real UUID and re-drives it through THIS
        // same function. Resolves `false`, an honest "nothing to report" for
        // an attempt that never happened, so a sequential replay loop stops
        // this "conversation"'s chain rather than firing later
        // placeholder-id entries too.
        return Promise.resolve(false).finally(settle);
      }
      // `localId` IS the client idempotency id (`clientMessageId`): a resend
      // from the offline outbox or the dual HTTP+WS path can't duplicate
      // server-side. `forwarded` rides the same idempotent send path (never a
      // bypass).
      //
      // Narrowed on the ATTACHMENT's own shape (`isDocumentAttachment`), never
      // on `mediaKind` alone: `attachment`/`mediaKind` are independent
      // parameters, so only a real type-guard check on `attachment` itself
      // lets TypeScript (and a reader) know which mutation's payload shape is
      // actually safe to build, with no `as` cast standing in for that proof.
      if (attachment && isDocumentAttachment(attachment)) {
        return settleDelivery(
          sendDocumentMessageMutation.mutateAsync,
          {
            conversationId: convId,
            body,
            attachment,
            replyToId,
            clientMessageId: localId,
            forwarded,
            asIdentityId,
          },
          (message) =>
            handleDeliverSuccess(convId, localId, wasMessageReplayed(message)),
          (error) => handleDeliverError(convId, localId, error),
          settle,
        );
      }
      // `attachment` is narrowed to `GifAttachment | undefined` here (the
      // `DocumentAttachment` case returned above). See `resolveSendKind`'s
      // own doc for why the kind is resolved from `stickerId`/`mediaKind`.
      const sendKind = resolveSendKind(attachment, mediaKind, stickerId);
      // Drop only THIS optimistic message (matched by localId) on success: a
      // concurrent second send in the same thread survives independently,
      // since `settleDelivery`'s `mutateAsync`-based promise settles on its
      // own for THIS call alone, so a later call on the same mutation object
      // can never supersede it (see `settleDelivery`'s own doc). The mutation
      // patches the authoritative server copy into the thread cache (deduped
      // by the same client id), so it takes over the bubble's slot as this
      // one clears.
      return settleDelivery(
        sendMessage.mutateAsync,
        {
          conversationId: convId,
          body,
          replyToId,
          clientMessageId: localId,
          forwarded,
          attachment,
          kind: sendKind,
          stickerId,
          asIdentityId,
        },
        // ENG-222: `sendMessage.mutateAsync` resolves `MessageResponse | null`
        // (`useMessageMutations.ts#useSendMessage`'s demo-mode branch resolves
        // `null`; unreachable here since `runDeliver`'s own `demoMode` branch
        // above already returned before this call). `wasMessageReplayed` reads
        // the same object `messages.api.ts#sendMessage` resolved, untouched
        // by `useSendMessage`'s own `onSuccess`, which never clones it, so
        // this needs no change on that file's side to work.
        (message) =>
          handleDeliverSuccess(
            convId,
            localId,
            !!message && wasMessageReplayed(message),
          ),
        (error) => handleDeliverError(convId, localId, error),
        settle,
      );
    },
    // `sendMessage.mutateAsync`/`sendDocumentMessageMutation.mutateAsync` are
    // stable references: each is a bound method on react-query's internal
    // mutation observer, so it keeps the same identity across renders. That
    // stability is exactly what lets this callback depend on them directly
    // and stay stable itself across an isPending/isError flip on the whole
    // mutation result object.
    [
      demoMode,
      sendMessage.mutateAsync,
      sendDocumentMessageMutation.mutateAsync,
      setSent,
      setStatus,
      handleDeliverSuccess,
      handleDeliverError,
    ],
  );

  // Fire-and-forget wrapper: every existing caller (`send`/`sendGif`/
  // `sendImage`/`sendDocument`/`retrySend`/`migrateOutboxConversation`)
  // already ignores a return value, so `void`-ing the promise here keeps
  // their behaviour byte-for-byte unchanged (and satisfies
  // `no-floating-promises` without touching any of those call sites). Demo
  // mode in particular stays byte-for-byte unchanged end to end: every
  // `lastAttemptAt` stamp this file adds is gated on `isDeliveryAttemptImminent`,
  // which is never true in demo mode, so a demo entry's persisted shape gains
  // no new field. Built on the same `runDeliver`/`settleDelivery` path as
  // `deliverAsync`, so its callbacks can no longer be dropped either.
  const deliver = useCallback(
    (
      convId: string,
      body: string,
      localId: string,
      replyToId?: string,
      forwarded?: boolean,
      attachment?: GifAttachment | DocumentAttachment,
      mediaKind?: MediaKind,
      stickerId?: string,
      asIdentityId?: string,
    ) => {
      void runDeliver(
        convId,
        body,
        localId,
        replyToId,
        forwarded,
        attachment,
        mediaKind,
        stickerId,
        asIdentityId,
      );
    },
    [runDeliver],
  );

  // The awaitable twin takes exactly `runDeliver`'s parameters, spread
  // through unchanged, so the two can never disagree on their order.
  const deliverAsync = useCallback(
    (...args: Parameters<typeof runDeliver>): Promise<boolean> =>
      runDeliver(...args),
    [runDeliver],
  );

  return {
    appendOptimistic,
    setStatus,
    deliver,
    deliverAsync,
    isDeliveryInFlight,
  };
}
