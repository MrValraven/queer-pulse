import { useCallback, useSyncExternalStore } from "react";

/**
 * Which blurred photos the viewer has uncovered this visit.
 *
 * Memory only: no storage, nothing survives a reload. The key is the image
 * URL, so every copy of one photo on screen (tile, spotlight, lightbox,
 * preview) reveals together.
 */
const revealedKeys = new Set<string>();
const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setRevealed(revealKey: string, isRevealed: boolean): void {
  if (revealedKeys.has(revealKey) === isRevealed) return;
  if (isRevealed) revealedKeys.add(revealKey);
  else revealedKeys.delete(revealKey);
  notifyListeners();
}

export function usePhotoReveal(revealKey: string): {
  isRevealed: boolean;
  reveal: () => void;
  conceal: () => void;
} {
  const isRevealed = useSyncExternalStore(
    subscribe,
    () => revealedKeys.has(revealKey),
    () => false,
  );
  const reveal = useCallback(() => setRevealed(revealKey, true), [revealKey]);
  const conceal = useCallback(() => setRevealed(revealKey, false), [revealKey]);
  return { isRevealed, reveal, conceal };
}

/** Tests only. */
export function resetPhotoReveals(): void {
  if (revealedKeys.size === 0) return;
  revealedKeys.clear();
  notifyListeners();
}
