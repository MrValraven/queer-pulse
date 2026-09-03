import { useEffect, useState } from "react";

/**
 * Keep a surface mounted for `exitMs` after it closes, so it can play a leave
 * animation before it unmounts.
 *
 * Menus and panels in this app render as `{open && <Panel />}`, which unmounts
 * the moment `open` flips: there is nothing left on screen to animate, so an
 * entrance animation has no counterpart and the surface pops out of existence.
 * This hook is the missing half. `isMounted` stays true through the leave
 * window; `isExiting` is the flag the caller hangs its leave class on.
 *
 * The caller owns the duration on purpose, because the same surface wants
 * different ones on different close paths. Pass `0` to unmount on the spot,
 * with no extra frame at all: a click that navigates should not leave a fading
 * panel over a changing page, and a reduced-motion reader should not wait on
 * an animation the global `prefers-reduced-motion` rule has already flattened
 * to nothing.
 *
 * The leave window is timed rather than driven by `animationend`, matching
 * `ToastProvider`'s `leaving` flag. `animationend` bubbles from every child
 * animation and never fires at all where animations are disabled outright,
 * which would strand the surface open.
 *
 * @param isOpen The caller's own open state.
 * @param exitMs How long to stay mounted after `isOpen` goes false. MUST match
 *               the leave animation's duration in the caller's CSS module.
 */
export function useExitTransition(
  isOpen: boolean,
  exitMs: number,
): { isMounted: boolean; isExiting: boolean } {
  const [isLeaving, setIsLeaving] = useState(false);
  const [previousIsOpen, setPreviousIsOpen] = useState(isOpen);

  // Adjusted during render rather than in an effect, React's own pattern for
  // state that derives from a changed prop, and the reason the previous value
  // is state rather than a ref. An effect would paint one frame of the
  // unmounted panel first, and the `exitMs === 0` path would cost a wasted
  // commit on every navigating click.
  if (previousIsOpen !== isOpen) {
    setPreviousIsOpen(isOpen);
    setIsLeaving(!isOpen && exitMs > 0);
  }

  useEffect(() => {
    if (!isLeaving) return;
    const timeoutId = window.setTimeout(() => setIsLeaving(false), exitMs);
    return () => window.clearTimeout(timeoutId);
  }, [isLeaving, exitMs]);

  return { isMounted: isOpen || isLeaving, isExiting: isLeaving };
}
