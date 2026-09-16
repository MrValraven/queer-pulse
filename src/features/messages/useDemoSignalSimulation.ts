// src/features/messages/useDemoSignalSimulation.ts
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { upsertMessage } from "../../shared/api/messageCache";
import {
  demoMessageToResponse,
  findDemoConversation,
} from "./api/demoThreadCache";
import {
  DEMO_INBOUND_SIMULATION_MESSAGE_BODY,
  type ChatMessage,
  type Conversation,
} from "./data";
import {
  DEMO_INBOUND_MESSAGE_CONVERSATION_ID,
  DEMO_INBOUND_MESSAGE_DELAY_MS,
  DEMO_PRESENCE_CONVERSATION_ID,
  DEMO_TYPING_CONVERSATION_ID,
  DEMO_TYPING_DURATION_MS,
  DEMO_TYPING_START_DELAY_MS,
  DEMO_TYPING_USER_ID,
  isDemoPresenceOnline,
  msUntilNextPresenceFlip,
} from "./demoSignalSimulation";
import { peekOutbox } from "./outbox";

/** How often the typing simulation checks the demo outbox for a new send. */
const SEND_POLL_INTERVAL_MS = 400;

interface DemoTypingFrame {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

/** The viewer's own sends currently held for `conversationId`. Demo sends
 *  never leave the outbox (there is no server ack to drop them), so this
 *  count only grows when the viewer sends. `peekOutbox` reads without
 *  marking anything known, so polling it never disturbs the outbox merge. */
function countOwnQueuedSends(conversationId: string): number {
  const queued = peekOutbox()[conversationId] ?? [];
  return queued.filter((message) => message.from === "me").length;
}

/**
 * DEMO ONLY: delivers ONE genuine inbound message into the seeded long thread
 * (`DEMO_INBOUND_MESSAGE_CONVERSATION_ID`, "maria"; see that constant's own
 * doc for why it is the chosen target) a fixed delay after that thread opens,
 * through `upsertMessage`, the SAME cache patch a real inbound `message:new`
 * socket frame uses. Neither the typing nor the presence stand-in ever adds a
 * message to a thread's history, so this is the only demo-mode path that
 * grows `useMessageLogState`'s `inboundCount` for an already-open thread,
 * which is what `useMessageScroll`'s jump-pill counter needs to ever move in
 * demo. Built from `demoThreadCache.ts`'s own `findDemoConversation`/
 * `demoMessageToResponse`, the exact pair the seeded history itself is built
 * from, so the synthetic message is shaped exactly like a real one. Inert
 * when `isEnabled` is false (live mode) or any other thread is open; a
 * one-shot timer, cleared on thread switch or unmount so leaving and
 * reopening the thread re-arms it rather than stacking timers.
 */
export function useDemoInboundMessageSimulation(
  conversationId: string,
  isEnabled: boolean,
): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!isEnabled || conversationId !== DEMO_INBOUND_MESSAGE_CONVERSATION_ID) {
      return;
    }
    const conversation = findDemoConversation(conversationId);
    if (!conversation) return;
    const deliverTimer = window.setTimeout(() => {
      const seed: ChatMessage & { id: string } = {
        id: `demo-msg-maria-inbound-${Date.now()}`,
        from: "them",
        text: DEMO_INBOUND_SIMULATION_MESSAGE_BODY,
        at: new Date().toISOString(),
        canPin: true,
        canReport: true,
      };
      upsertMessage(
        queryClient,
        conversationId,
        demoMessageToResponse(seed, conversation),
      );
    }, DEMO_INBOUND_MESSAGE_DELAY_MS);
    return () => window.clearTimeout(deliverTimer);
  }, [conversationId, isEnabled, queryClient]);
}

/**
 * DEMO ONLY: while the seeded typing thread is open, answers each new send
 * from the viewer with a short "typing" burst from the counterpart, fed
 * through `onTypingFrame` (the same handler live `typing` frames use, so the
 * row, its fade and its self-clearing timer are the real ones). A send is
 * noticed by watching the persisted outbox, since the demo send ladder has no
 * other observable signal. Inert when `isEnabled` is false (live mode) or any
 * other thread is open, and clears every timer on thread switch or unmount.
 *
 * Also composes `useDemoInboundMessageSimulation` alongside the typing burst:
 * this hook already tracks exactly the signal an inbound-message simulation
 * needs (which thread is open, and whether demo mode is active), and it
 * mounts once per open thread already, so no second call site is needed.
 * The two target different seeded threads and never interact.
 */
export function useDemoTypingSimulation(
  conversationId: string,
  isEnabled: boolean,
  onTypingFrame: (frame: DemoTypingFrame) => void,
): void {
  useDemoInboundMessageSimulation(conversationId, isEnabled);

  useEffect(() => {
    if (!isEnabled || conversationId !== DEMO_TYPING_CONVERSATION_ID) return;
    let knownSendCount = countOwnQueuedSends(conversationId);
    let startTimer: number | undefined;
    let stopTimer: number | undefined;
    const emitTyping = (isTyping: boolean) =>
      onTypingFrame({ conversationId, userId: DEMO_TYPING_USER_ID, isTyping });
    const pollInterval = window.setInterval(() => {
      const sendCount = countOwnQueuedSends(conversationId);
      const hasNewSend = sendCount > knownSendCount;
      knownSendCount = sendCount;
      if (!hasNewSend) return;
      window.clearTimeout(startTimer);
      window.clearTimeout(stopTimer);
      startTimer = window.setTimeout(() => {
        emitTyping(true);
        stopTimer = window.setTimeout(
          () => emitTyping(false),
          DEMO_TYPING_DURATION_MS,
        );
      }, DEMO_TYPING_START_DELAY_MS);
    }, SEND_POLL_INTERVAL_MS);
    return () => {
      window.clearInterval(pollInterval);
      window.clearTimeout(startTimer);
      window.clearTimeout(stopTimer);
    };
  }, [conversationId, isEnabled, onTypingFrame]);
}

/** A copy of `row` that keeps every label getter the demo timeline defined
 *  (a plain spread would freeze them) with `online` set to `isOnline`. The
 *  new identity is what lets the memoized inbox row re-render. */
function withPresence(row: Conversation, isOnline: boolean): Conversation {
  const copy = Object.defineProperties(
    {},
    Object.getOwnPropertyDescriptors(row),
  ) as Conversation;
  Object.defineProperty(copy, "online", {
    value: isOnline,
    enumerable: true,
    configurable: true,
    writable: true,
  });
  return copy;
}

/**
 * DEMO ONLY: flips the seeded presence connection online and offline on the
 * slow cycle in `demoSignalSimulation.ts`, by patching that one row in the
 * demo inbox cache at each flip. The inbox row and the open conversation's
 * header both read `Conversation.online` for a thread with no participant id,
 * so they flip together. The seed's own `online` getter follows the same
 * clock, so a refetch between flips agrees. Inert when `isEnabled` is false
 * (live mode, where real `presence` frames drive `useIsOnline`), and clears
 * its timer on unmount.
 */
export function useDemoPresenceSimulation(isEnabled: boolean): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!isEnabled) return;
    let flipTimer: number | undefined;
    const publishPresence = () => {
      const isOnline = isDemoPresenceOnline();
      queryClient.setQueriesData<Conversation[]>(
        { queryKey: ["conversations", true] },
        (rows) =>
          rows?.map((row) =>
            row.id === DEMO_PRESENCE_CONVERSATION_ID
              ? withPresence(row, isOnline)
              : row,
          ),
      );
      flipTimer = window.setTimeout(publishPresence, msUntilNextPresenceFlip());
    };
    publishPresence();
    return () => window.clearTimeout(flipTimer);
  }, [isEnabled, queryClient]);
}
