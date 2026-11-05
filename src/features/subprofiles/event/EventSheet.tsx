import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { useMediaQuery, useScrollLock } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useLightboxDialog } from "../useLightboxDialog";
import { usePoemReaderSwipe } from "../poem/usePoemReaderSwipe";
import type { SubprofileItemView } from "../api/subprofiles.adapters";
import { EventSheetContent } from "./EventSheetContent";
import { EventSheetPager } from "./EventSheetPager";
import { useEventSheetDismiss } from "./useEventSheetDismiss";
import styles from "./EventSheet.module.css";

/** Where the sheet becomes a bottom sheet. Matches EventSheet.module.css. */
const PHONE_QUERY = "(max-width: 600px)";

export interface EventSheetProps {
  item: SubprofileItemView;
  /** The open event's section oldest to newest, and where `item` sits in
   *  it (-1 hides Previous and Next). */
  events: SubprofileItemView[];
  eventIndex: number;
  /** Swap the sheet to `events[index]`. */
  onGoTo: (index: number) => void;
  onClose: () => void;
  /** The persona's accent (`--sk-tint`, `--sk-on`). The sheet is portaled
   *  out of `.pp`, so the inline accent the page sets never reaches it. */
  accentStyle: CSSProperties;
}

/**
 * The event detail sheet on a Poster (collective) persona page: a bottom
 * sheet on phones (grabber, drag down to close) and a centred two-column
 * modal on wider screens. Portaled `role="dialog"` with the shared focus
 * trap (`useLightboxDialog`): Escape closes, the arrow keys and a sideways
 * swipe move to the previous or next event. `data-persona-skin` takes the
 * poster's paper and ink from persona-skins.css in both themes.
 */
export function EventSheet({
  item,
  events,
  eventIndex,
  onGoTo,
  onClose,
  accentStyle,
}: EventSheetProps) {
  useScrollLock();
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isPhone = useMediaQuery(PHONE_QUERY);
  const { isClosing, dragOffset, requestClose, swipeHandlers } =
    useEventSheetDismiss(onClose, isPhone);

  const move = useCallback(
    (delta: number) => {
      if (eventIndex < 0) return;
      const targetIndex = eventIndex + delta;
      if (targetIndex >= 0 && targetIndex < events.length) onGoTo(targetIndex);
    },
    [eventIndex, events.length, onGoTo],
  );
  useLightboxDialog(dialogRef, { onClose: requestClose, onMove: move });
  usePoemReaderSwipe(scrollerRef, move);

  // The shared trap focuses Close on open, which draws its ring when the
  // sheet arrives from a shared `?event=` link. The dialog takes focus
  // instead (this effect runs after the trap's), so a screen reader names
  // the event and the first Tab still lands on Close.
  useEffect(() => {
    dialogRef.current?.focus({ preventScroll: true });
  }, []);

  // A new event starts at its top, before the browser paints it.
  useLayoutEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0 });
  }, [item.id]);

  // Paging can unmount the focused control (Next on reaching the last
  // event). Hand focus back to the dialog so the trap keeps holding it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.contains(document.activeElement)) dialog.focus();
  }, [item.id]);

  // The drag starts anywhere on the bar except the Close button, which must
  // keep its own tap (pointer capture would retarget the click to the bar).
  function handleBarPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if ((event.target as Element).closest("button")) return;
    swipeHandlers.onPointerDown(event);
  }

  return createPortal(
    <div
      className={styles.scrim}
      role="presentation"
      data-closing={isClosing || undefined}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t("subprofiles:event.sheet.dialogLabel", {
          title: item.title,
        })}
        data-persona-skin="collective"
        data-closing={isClosing || undefined}
        data-dragging={dragOffset > 0 || undefined}
        style={{
          ...accentStyle,
          ...(dragOffset > 0
            ? { transform: `translateY(${dragOffset}px)` }
            : null),
        }}
      >
        <div
          className={styles.bar}
          {...swipeHandlers}
          onPointerDown={handleBarPointerDown}
        >
          <span className={styles.grabber} aria-hidden />
          <button
            type="button"
            className={styles.close}
            onClick={requestClose}
            aria-label={t("subprofiles:event.sheet.close")}
          >
            <FiX aria-hidden />
          </button>
        </div>
        <div ref={scrollerRef} className={styles.scroller}>
          <div key={item.id} className={styles.fade}>
            <EventSheetContent item={item} />
          </div>
          <EventSheetPager
            events={events}
            eventIndex={eventIndex}
            onGoTo={onGoTo}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
