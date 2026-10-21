import { useCallback, useLayoutEffect, useRef } from "react";
import type { PlaylistEntryControl } from "./StudioPlaylistEntryRow";

export type PlaylistFocusTarget =
  { entryId: string; control: PlaylistEntryControl } | "heading";

export interface PlaylistFocusRequest {
  target: PlaylistFocusTarget;
  /** The pressed button, recorded at click time. */
  fromElement: Element | null;
  /** The row order the last commit showed: a commit that changes it is one
   *  where React moved or dropped rows, the only time focus can fall to the
   *  page body on its own. */
  orderKey: string;
  /** A removal waits for the server before focus goes anywhere. */
  isReady: boolean;
  /** The write settled: the next commit applies the request and drops it. */
  isSettled: boolean;
}

/** Keeps focus on the pressed Move button while its row moves (each commit
 *  that moves the row puts focus back, until the save settles), and sends
 *  it to a neighbour's Remove, or the list heading, once a row goes. Focus
 *  the member put somewhere else, the page body included, stays there. */
export function useStudioPlaylistEntryFocus(orderKey: string) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const controlsRef = useRef(new Map<string, HTMLButtonElement>());
  const focusRequestRef = useRef<PlaylistFocusRequest | null>(null);
  useLayoutEffect(() => {
    const request = focusRequestRef.current;
    if (!request?.isReady) return;
    const target =
      request.target === "heading"
        ? headingRef.current
        : controlsRef.current.get(
            `${request.target.entryId}:${request.target.control}`,
          );
    if (!target) return;
    const hasOrderChanged = request.orderKey !== orderKey;
    request.orderKey = orderKey;
    const activeElement = document.activeElement;
    const isFocusOnBody =
      activeElement === null || activeElement === document.body;
    const isFocusStillOurs =
      activeElement === request.fromElement ||
      activeElement === target ||
      (hasOrderChanged && isFocusOnBody);
    if (isFocusStillOurs && activeElement !== target) target.focus();
    if (!isFocusStillOurs || request.isSettled) focusRequestRef.current = null;
  });
  // Stable, so a memoised row's controls keep their refs between renders.
  const registerControl = useCallback(
    (
      entryId: string,
      control: PlaylistEntryControl,
      element: HTMLButtonElement | null,
    ) => {
      const key = `${entryId}:${control}`;
      if (element) controlsRef.current.set(key, element);
      else controlsRef.current.delete(key);
    },
    [],
  );
  return {
    headingRef,
    registerControl,
    /** Call at click time, so the pressed button is what holds focus. */
    requestFocus: (
      target: PlaylistFocusTarget,
      isReady: boolean,
    ): PlaylistFocusRequest => {
      const request = {
        target,
        fromElement: document.activeElement,
        orderKey,
        isReady,
        isSettled: false,
      };
      focusRequestRef.current = request;
      return request;
    },
    dropRequest: (request: PlaylistFocusRequest) => {
      if (focusRequestRef.current === request) focusRequestRef.current = null;
    },
  };
}
