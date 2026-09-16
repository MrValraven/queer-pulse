// src/features/messages/demoSignalSimulation.ts
import { DEMO_LONG_THREAD_CONVERSATION_ID } from "./demoLongThread.data";

// ── DEMO typing, presence and inbound-message simulation (pure half) ────────
// Demo mode has no socket, so no `typing`, `presence` or `message:new` frame
// ever arrives. These constants and clock functions drive a small,
// deterministic stand-in: one DM whose counterpart types back after the
// viewer sends, one connection that flips online and offline on a slow
// cycle, and one long thread that receives a genuine inbound message a fixed
// delay after it opens. The React half lives in `useDemoSignalSimulation.ts`;
// this file stays free of React so the demo seed can read
// `isDemoPresenceOnline` directly.

/** The demo DM whose counterpart shows as typing after the viewer sends. */
export const DEMO_TYPING_CONVERSATION_ID = "anika";

/** Synthetic user id the simulated typing frames carry. */
export const DEMO_TYPING_USER_ID = "demo-user-anika";

/** Pause between the viewer's send and the counterpart starting to type,
 *  roughly when the demo send ladder reaches "delivered". */
export const DEMO_TYPING_START_DELAY_MS = 900;

/** How long the simulated counterpart types before going quiet. */
export const DEMO_TYPING_DURATION_MS = 2500;

/** The demo connection whose presence flips online and offline. */
export const DEMO_PRESENCE_CONVERSATION_ID = "noah";

/** Length of each online or offline phase of the presence cycle. */
export const DEMO_PRESENCE_PHASE_MS = 45_000;

const PRESENCE_EPOCH_MS = Date.now();

/** Whether the simulated connection is online at `nowMs`: online for the
 *  first phase after load, offline for the next, and so on. */
export function isDemoPresenceOnline(nowMs: number = Date.now()): boolean {
  const phaseIndex = Math.floor(
    (nowMs - PRESENCE_EPOCH_MS) / DEMO_PRESENCE_PHASE_MS,
  );
  return phaseIndex % 2 === 0;
}

/** Milliseconds from `nowMs` until the presence cycle next flips. */
export function msUntilNextPresenceFlip(nowMs: number = Date.now()): number {
  const elapsedMs = nowMs - PRESENCE_EPOCH_MS;
  return DEMO_PRESENCE_PHASE_MS - (elapsedMs % DEMO_PRESENCE_PHASE_MS);
}

// ── DEMO inbound-message simulation ──────────────────────────────────────────
// Neither the typing nor the presence stand-in above ever adds a message to a
// thread's history, so `useMessageLogState`'s `inboundCount` (and therefore
// `useMessageScroll`'s jump-pill delta, `inboundArrived = inboundCount -
// previousInbound`) can never move in demo mode without this: one seeded
// thread that receives a single genuine inbound message a fixed delay after
// it opens.

/** The demo DM the inbound-message simulation targets: deliberately the LONG
 *  thread, the only seeded thread with enough messages to overflow the
 *  viewport, which is exactly what "scrolled away from the bottom" needs
 *  something to scroll through. `DEMO_TYPING_CONVERSATION_ID`'s "anika" is
 *  far too short for that. */
export const DEMO_INBOUND_MESSAGE_CONVERSATION_ID =
  DEMO_LONG_THREAD_CONVERSATION_ID;

/** Delay from the thread opening to the simulated inbound message landing.
 *  A single fixed, deterministic one-shot timer, so a Playwright wait for it
 *  is bounded and repeatable rather than flaky. */
export const DEMO_INBOUND_MESSAGE_DELAY_MS = 1500;
