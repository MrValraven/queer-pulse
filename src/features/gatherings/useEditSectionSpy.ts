import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { EDIT_SECTION_KEYS, type EditSectionKey } from "./editDetailsSections";

/** How far down the form column the reading line sits, as a share of its
 *  height. A section becomes the active one once its top crosses it. */
const READING_LINE_SHARE = 0.3;

/** The pointer and key events that mean the host is moving the column
 *  themselves, which ends a jump's hold on the active section. */
const HAND_SCROLL_EVENTS = ["wheel", "touchstart", "pointerdown", "keydown"];

/**
 * Which section of the edit-details modal the host is reading, for the rail
 * and the phone strip.
 *
 * The form column is the observer's root, and its root margin cuts the root
 * down to the band above the reading line, so the observer fires whenever a
 * section's top crosses that line in either direction. Each firing measures
 * the sections afresh: the active one is the last whose top sits at or above
 * the line, and the last section once the column is scrolled to its end
 * (seen by a sentinel at the bottom of the form), since a short last section
 * can never reach the line.
 *
 * A jump from the rail holds its section active while the smooth scroll
 * passes the others, and keeps holding it when the column cannot scroll that
 * section up to the line (one near the end). The hold lets go the moment the
 * host wheels, touches, clicks or types in the column, or moves focus into it
 * by any other path (Tab from the rail or the footer, a screen reader's
 * virtual cursor). The focus the jump itself places is told apart by timing:
 * it lands in the same task as the hold, before the microtask that closes
 * that window.
 */
export function useEditSectionSpy(
  columnRef: RefObject<HTMLElement | null>,
  bottomSentinelRef: RefObject<HTMLElement | null>,
) {
  const [activeKey, setActiveKey] = useState<EditSectionKey>(
    EDIT_SECTION_KEYS[0],
  );
  const sectionElementsRef = useRef(new Map<EditSectionKey, HTMLElement>());
  const sectionObserverRef = useRef<IntersectionObserver | null>(null);
  const heldKeyRef = useRef<EditSectionKey | null>(null);
  const isJumpFocusPendingRef = useRef(false);
  const jumpFocusTargetRef = useRef<EventTarget | null>(null);
  const isAtBottomRef = useRef(false);

  const measureActiveKey = useCallback(() => {
    const column = columnRef.current;
    if (!column || heldKeyRef.current !== null) return;
    const sectionElements = sectionElementsRef.current;
    const placedKeys = EDIT_SECTION_KEYS.filter((key) =>
      sectionElements.has(key),
    );
    const lastKey = placedKeys[placedKeys.length - 1];
    if (isAtBottomRef.current && column.scrollTop > 0 && lastKey) {
      setActiveKey(lastKey);
      return;
    }
    const readingLine =
      column.getBoundingClientRect().top +
      column.clientHeight * READING_LINE_SHARE;
    let nextKey: EditSectionKey = placedKeys[0] ?? EDIT_SECTION_KEYS[0];
    for (const key of placedKeys) {
      const sectionTop = sectionElements.get(key)?.getBoundingClientRect().top;
      if (sectionTop !== undefined && sectionTop <= readingLine) nextKey = key;
    }
    setActiveKey(nextKey);
  }, [columnRef]);

  const registerSection = useCallback(
    (key: EditSectionKey, element: HTMLElement | null) => {
      const sectionElements = sectionElementsRef.current;
      const previous = sectionElements.get(key);
      if (previous) sectionObserverRef.current?.unobserve(previous);
      if (element) {
        sectionElements.set(key, element);
        sectionObserverRef.current?.observe(element);
      } else {
        sectionElements.delete(key);
      }
    },
    [],
  );

  const holdActiveKey = useCallback((key: EditSectionKey) => {
    heldKeyRef.current = key;
    jumpFocusTargetRef.current = null;
    isJumpFocusPendingRef.current = true;
    queueMicrotask(() => {
      isJumpFocusPendingRef.current = false;
    });
    setActiveKey(key);
  }, []);

  useEffect(() => {
    const column = columnRef.current;
    const sentinel = bottomSentinelRef.current;
    if (!column) return;
    const sectionObserver = new IntersectionObserver(measureActiveKey, {
      root: column,
      rootMargin: `0px 0px -${(1 - READING_LINE_SHARE) * 100}% 0px`,
      threshold: 0,
    });
    sectionObserverRef.current = sectionObserver;
    sectionElementsRef.current.forEach((element) =>
      sectionObserver.observe(element),
    );
    const bottomObserver = new IntersectionObserver(
      (entries) => {
        const latestEntry = entries[entries.length - 1];
        isAtBottomRef.current = latestEntry?.isIntersecting ?? false;
        measureActiveKey();
      },
      { root: column, threshold: 0 },
    );
    if (sentinel) bottomObserver.observe(sentinel);
    const releaseHold = () => {
      if (heldKeyRef.current === null) return;
      heldKeyRef.current = null;
      measureActiveKey();
    };
    const releaseHoldOnHostFocus = (event: FocusEvent) => {
      if (isJumpFocusPendingRef.current) {
        jumpFocusTargetRef.current = event.target;
        return;
      }
      if (event.target !== jumpFocusTargetRef.current) releaseHold();
    };
    HAND_SCROLL_EVENTS.forEach((eventName) =>
      column.addEventListener(eventName, releaseHold, { passive: true }),
    );
    column.addEventListener("focusin", releaseHoldOnHostFocus);
    return () => {
      column.removeEventListener("focusin", releaseHoldOnHostFocus);
      sectionObserver.disconnect();
      bottomObserver.disconnect();
      sectionObserverRef.current = null;
      HAND_SCROLL_EVENTS.forEach((eventName) =>
        column.removeEventListener(eventName, releaseHold),
      );
    };
  }, [columnRef, bottomSentinelRef, measureActiveKey]);

  return { activeKey, registerSection, holdActiveKey };
}
