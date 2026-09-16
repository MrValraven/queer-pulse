import { useSyncExternalStore } from "react";

/**
 * Jump-to-message UI state that has to outlive any one DOM node: which message
 * is flashing its highlight ring, and the status the hunt for an unloaded
 * message is showing over the log.
 *
 * The log is virtualized, so the bubble a jump lands on can unmount and
 * remount while it settles (overscan edges, a late row measurement). Holding
 * the highlighted id here, read by `MessageBubble` when it renders, keeps the
 * ring on whichever node currently represents that message. A module store
 * (the `wallpaper.ts` shape) instead of context, because only one conversation
 * panel is mounted at a time and the readers sit deep inside memoized rows.
 * Message ids are server UUIDs, so the highlight needs no conversation scope;
 * the status carries one so a thread switch never shows another chat's notice.
 */

/** Matches `.messageHighlight::after`'s 1.2s flash in MessagesPage.module.css. */
const HIGHLIGHT_DURATION_MS = 1200;
/** How long a "could not find it" outcome stays on screen. Long enough to read
 *  a sentence, short enough that it never lingers over the next message. */
const OUTCOME_VISIBLE_MS = 4000;

/** `finding`: older pages are loading while we look. The rest are outcomes. */
export type MessageJumpPhase = "finding" | "notFound" | "tooFar" | "loadFailed";

interface MessageJumpStatus {
  conversationId: string;
  phase: MessageJumpPhase;
}

interface MessageJumpState {
  highlightedMessageId: string | null;
  status: MessageJumpStatus | null;
  /** Bumped by every `jump()` call in `messageJumpHunt.ts`, whatever it
   *  starts (an immediate reveal or a hunt) and however it ends. A caller
   *  that hands its own intent off to a jump (the media gallery's photo
   *  hand-off) can compare the generation it captured right after starting
   *  its jump against the current one to tell a later jump has superseded
   *  it, even when that jump ends without publishing an outcome of its own
   *  (a reader takeover, a row that leaves the loaded rows mid-settle). */
  jumpGeneration: number;
}

let state: MessageJumpState = {
  highlightedMessageId: null,
  status: null,
  jumpGeneration: 0,
};
const listeners = new Set<() => void>();
let highlightTimer: number | undefined;
let highlightFrame: number | undefined;
let statusTimer: number | undefined;

function update(next: Partial<MessageJumpState>): void {
  state = { ...state, ...next };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Flashes the highlight ring on `messageId` for ~1.2s. Re-flashing the same
 *  message clears it for a frame first, so the CSS animation restarts. */
export function flashMessageHighlight(messageId: string): void {
  window.clearTimeout(highlightTimer);
  if (highlightFrame !== undefined) cancelAnimationFrame(highlightFrame);
  const apply = () => {
    highlightFrame = undefined;
    update({ highlightedMessageId: messageId });
    highlightTimer = window.setTimeout(() => {
      if (state.highlightedMessageId === messageId) {
        update({ highlightedMessageId: null });
      }
    }, HIGHLIGHT_DURATION_MS);
  };
  if (state.highlightedMessageId === messageId) {
    update({ highlightedMessageId: null });
    highlightFrame = requestAnimationFrame(apply);
    return;
  }
  apply();
}

/** Shows `phase` over `conversationId`'s log. Outcomes clear themselves. */
export function showMessageJumpStatus(
  conversationId: string,
  phase: MessageJumpPhase,
): void {
  window.clearTimeout(statusTimer);
  update({ status: { conversationId, phase } });
  if (phase === "finding") return;
  statusTimer = window.setTimeout(() => {
    if (state.status?.conversationId === conversationId) {
      update({ status: null });
    }
  }, OUTCOME_VISIBLE_MS);
}

/** Clears whatever status `conversationId` is showing, if any. */
export function clearMessageJumpStatus(conversationId: string): void {
  if (state.status?.conversationId !== conversationId) return;
  window.clearTimeout(statusTimer);
  update({ status: null });
}

/** Mints a fresh jump generation and returns it. Called once at the start of
 *  every `messageJumpHunt.ts` `jump()`. */
export function bumpJumpGeneration(): number {
  const next = state.jumpGeneration + 1;
  update({ jumpGeneration: next });
  return next;
}

/** The current jump generation, as a plain synchronous function a caller can
 *  call right after starting a jump to capture the value that call just
 *  minted, inside the same event handler. */
export function getJumpGeneration(): number {
  return state.jumpGeneration;
}

/** Reactive read of the current jump generation, for a caller watching for a
 *  later jump superseding one it started (see `MessageJumpState.jumpGeneration`). */
export function useJumpGeneration(): number {
  return useSyncExternalStore(
    subscribe,
    () => state.jumpGeneration,
    () => 0,
  );
}

/** True while `messageId`'s bubble should wear the highlight ring. */
export function useIsMessageHighlighted(
  messageId: string | undefined,
): boolean {
  return useSyncExternalStore(
    subscribe,
    () => messageId !== undefined && state.highlightedMessageId === messageId,
    () => false,
  );
}

/** True while any of `messageIds` should wear the highlight ring. For a node
 *  that stands in for messages it does not render, such as an album's "+N"
 *  tile, which rings when a jump lands on one of the photos it hides. The
 *  snapshot is a boolean, so a fresh `messageIds` array each render is fine. */
export function useIsAnyMessageHighlighted(
  messageIds: readonly string[],
): boolean {
  return useSyncExternalStore(
    subscribe,
    () =>
      state.highlightedMessageId !== null &&
      messageIds.includes(state.highlightedMessageId),
    () => false,
  );
}

/** The jump status to show over `conversationId`'s log, or null. */
export function useMessageJumpPhase(
  conversationId: string,
): MessageJumpPhase | null {
  return useSyncExternalStore(
    subscribe,
    () =>
      state.status?.conversationId === conversationId
        ? state.status.phase
        : null,
    () => null,
  );
}
