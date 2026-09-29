// src/features/messages/useReturnToLatestFirst.ts
import { useCallback } from "react";

/**
 * PRD-401: a send or a retry made while a detached history window is shown
 * (see `useThreadWindowSends`) returns the thread to its live tail first, so
 * the new bubble lands where the reader can see it, the way WhatsApp and
 * Telegram jump to the latest message on send.
 * While the live tail is already shown, `returnToLatest` leaves the scroll
 * alone and still cancels a window request that is loading, along with any
 * jump hunt on its way to one, so the fresh bubble stays in view. Keeps the
 * wrapped send's identity stable for as long as both inputs are.
 */
export function useReturnToLatestFirst<Arguments extends unknown[], Result>(
  sendFunction: (...args: Arguments) => Result,
  returnToLatest: () => void,
): (...args: Arguments) => Result {
  return useCallback(
    (...args: Arguments) => {
      returnToLatest();
      return sendFunction(...args);
    },
    [sendFunction, returnToLatest],
  );
}
