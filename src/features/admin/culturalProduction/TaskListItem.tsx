import { useLayoutEffect, useRef, type ReactNode } from "react";
import { m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { keepOnFrameLoop } from "../../gatherings/checkin/checkinMotion";
import styles from "./Tasks.module.css";

/** The shared `Collapse` curve and a touch under its length, so a row
 *  settles as the frame around it does. */
const ITEM_EASE = [0.22, 0.68, 0.16, 1] as const;
const ITEM_SECONDS = 0.24;
const STATUS_TRIGGER = '[aria-haspopup="menu"]:not(:disabled)';

/** Whether focus is in this entry, or last sat here and then fell to the
 *  body (an inert fold or a whole view swap leaves it nowhere). */
function isHoldingFocus(item: HTMLElement, hasHeldFocus: boolean): boolean {
  const activeElement = document.activeElement;
  if (item.contains(activeElement)) return true;
  return (
    hasHeldFocus && (activeElement === null || activeElement === document.body)
  );
}

/** The status trigger of the nearest entry still in the list, looking
 *  down first and then up. Entries on their way out are inert. */
function neighbourTriggerOf(item: HTMLElement): HTMLElement | null {
  const directions = ["nextElementSibling", "previousElementSibling"] as const;
  for (const direction of directions) {
    let sibling = item[direction];
    while (sibling !== null) {
      const trigger = sibling.hasAttribute("inert")
        ? null
        : sibling.querySelector<HTMLElement>(STATUS_TRIGGER);
      if (trigger !== null) return trigger;
      sibling = sibling[direction];
    }
  }
  return null;
}

/** The first button of the empty or error state showing in the list's
 *  place, once it is up. */
function listStateActionNear(item: HTMLElement): HTMLElement | null {
  const stage = item.closest(`.${styles.viewStage}`);
  if (stage === null) return null;
  const states = stage.querySelectorAll<HTMLElement>(`.${styles.listState}`);
  for (const state of states) {
    if (state.closest("[inert]") !== null) continue;
    const action = state.querySelector<HTMLElement>("button:not(:disabled)");
    if (action !== null) return action;
  }
  return null;
}

/**
 * One entry of the task list (a row or a status group's heading), the
 * `CollapseListItem` motion with a glide added: it grows in, and on removal
 * it fades and folds its height away so the entries below rise into the gap.
 * An entry whose place in the list changes (a task moved to another status
 * group) glides there from where it was (`layout="position"`), and stays
 * mounted on the way. Entries present when the list's
 * `AnimatePresence initial={false}` first renders appear at rest. Keep
 * padding and borders on a child, so they fold with it. While it folds it is
 * `inert`. `keepOnFrameLoop` keeps the last opacity frame from flashing
 * back. Reduced motion places and removes entries at once.
 *
 * When an entry that holds focus leaves, focus moves to the status trigger
 * of the next entry still in the list, else the one above, else the button
 * of the empty or error state that takes the list's place.
 */
export function TaskListItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { reducedMotion: isReducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const itemRef = useRef<HTMLLIElement>(null);
  const hasHeldFocusRef = useRef(false);
  const duration = isReducedMotion ? 0 : ITEM_SECONDS;

  useLayoutEffect(() => {
    const item = itemRef.current;
    if (isPresent || item === null) return;
    if (!isHoldingFocus(item, hasHeldFocusRef.current)) return;
    const trigger = neighbourTriggerOf(item);
    if (trigger !== null) {
      trigger.focus({ preventScroll: true });
      return;
    }
    // The empty state can mount a frame or more after the fold starts.
    let frameId = 0;
    const focusListState = () => {
      if (!isHoldingFocus(item, hasHeldFocusRef.current)) return;
      const action = listStateActionNear(item);
      if (action !== null) action.focus({ preventScroll: true });
      else frameId = requestAnimationFrame(focusListState);
    };
    focusListState();
    return () => cancelAnimationFrame(frameId);
  }, [isPresent]);

  // A whole view swap (the last row gone, the empty state in) unmounts the
  // entry without folding it, so the hand over happens on the way out.
  useLayoutEffect(() => {
    const item = itemRef.current;
    const focusMemory = hasHeldFocusRef;
    return () => {
      if (item === null || !isHoldingFocus(item, focusMemory.current)) return;
      listStateActionNear(item)?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <m.li
      ref={itemRef}
      className={className}
      inert={!isPresent}
      layout={isReducedMotion ? false : "position"}
      style={{ display: "flow-root" }}
      onUpdate={keepOnFrameLoop}
      onFocus={() => {
        hasHeldFocusRef.current = true;
      }}
      onBlur={(event) => {
        // A blur with nowhere to go keeps the memory, so a fold can hand on.
        const nextFocus = event.relatedTarget;
        if (nextFocus !== null) {
          hasHeldFocusRef.current = event.currentTarget.contains(nextFocus);
        }
      }}
      initial={{ height: 0, opacity: 0, overflow: "hidden" }}
      animate={{ height: "auto", opacity: 1, overflow: "visible" }}
      exit={{
        height: 0,
        opacity: 0,
        overflow: "hidden",
        transition: { duration, ease: ITEM_EASE, overflow: { duration: 0 } },
      }}
      transition={{
        duration,
        ease: ITEM_EASE,
        overflow: { duration: 0, delay: duration },
        layout: { duration, ease: ITEM_EASE },
      }}
    >
      {children}
    </m.li>
  );
}
