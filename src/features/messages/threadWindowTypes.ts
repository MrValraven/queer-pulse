// src/features/messages/threadWindowTypes.ts

/**
 * How a request to load history around a message ended (PRD-401): `ready`
 * means the window is loaded and `showWindow` may show it, `notFound` means
 * the server (or the demo store) does not hold that message for this reader,
 * `cancelled` means a newer request or a return to the latest message
 * superseded it, `failed` covers every other failure.
 */
export type ThreadWindowOutcome = "ready" | "notFound" | "cancelled" | "failed";

/**
 * PRD-401: the open thread's detached history window, as the scroll layer and
 * the jump hunter see it. A window is a stretch of history centred on an older
 * message, shown in place of the live tail until the reader pages newer back
 * to the tail or taps the jump-to-latest pill.
 */
export interface ThreadWindowControls {
  /** The message the shown window was opened around, or null while the
   *  thread shows its live tail. */
  anchorMessageId: string | null;
  /** The window ends before the newest message: newer pages remain. */
  hasMoreNewer: boolean;
  isLoadingNewer: boolean;
  /** Requests the next newer page of the window. */
  onLoadNewer: () => void;
  /** Drops the window and shows the live tail again. Also cancels a window
   *  request still loading and bumps `readCancelCount`, on every call. */
  onReturnToLatest: () => void;
  /** Bumps when `onReturnToLatest` drops a shown window. It stays put when the
   *  window rejoins the tail by paging newer, and on a call made while the
   *  live tail is shown, so the scroll layer pins to the bottom exactly when
   *  the reader left a window for the latest message. */
  returnToLatestGeneration: number;
  /** How many times `onReturnToLatest` has run (each send, each pill tap),
   *  read from a ref so it never causes a render. A jump hunt notes it at the
   *  start and ends quietly once it moves: the reader has chosen the latest
   *  message over the jump. */
  readCancelCount: () => number;
  /** Loads a window around `messageId` without showing it. Never rejects. */
  openWindowAround: (messageId: string) => Promise<ThreadWindowOutcome>;
  /** Shows the window `openWindowAround` loaded for `messageId`, when that
   *  request is still the current one. True when the thread now shows it. */
  showWindow: (messageId: string) => boolean;
}
