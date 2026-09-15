import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { useDismiss, useScrimDismiss } from "../../shared/components/ui";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  getViewerMotionVariant,
  subscribeViewerMotionVariant,
} from "./chatViewerMotion";
import { useViewerClose } from "./useViewerClose";
import { ChatImageViewerTopBar } from "./ChatImageViewerChrome";
import { ChatImageViewerFilmstrip } from "./ChatImageViewerFilmstrip";
import { ChatImageViewerStage } from "./ChatImageViewerStage";
import { useChatImageSave } from "./useChatImageSave";
import type { ViewerPhoto } from "./useThreadImageGallery";
import type { ChatMessage } from "./data";
import styles from "./chatImageViewer.module.css";

/**
 * Full screen photo viewer for a conversation: opens on the tapped photo and
 * pages through every other photo already loaded in that thread. Mounted only
 * while open, portalled to the body so it escapes the scrollable message log,
 * and locked to the viewport while it is up.
 *
 * Dialog behaviour (focus trap, initial focus, focus restore, scroll lock,
 * and Escape that only fires while this is the topmost dialog on the shared
 * modal stack) comes from the shared `useDismiss`, the same hook the
 * conversation's other overlays use. That modal-stack awareness matters here:
 * the chat viewer can open over a conversation that also raises the
 * long-press action overlay and the report modal, so Escape must not close
 * this viewer unless it is actually on top. Arrow key navigation is not part
 * of `useDismiss`, so it is handled locally below.
 *
 * Opening and closing are animated, which is why nothing here calls `onClose`
 * directly any more: `onClose` is what unmounts this component, so it has to
 * come LAST. Every close path goes through `beginClose` instead, which flips a
 * closing phase on, lets the exit play, and only then reports up. See
 * `useViewerClose` and `useViewerPhotoMotion`.
 */
export function ChatImageViewer({
  photos,
  startIndex,
  onClose,
  onReply,
  onForward,
  onToggleStar,
  originRef,
}: {
  photos: ViewerPhoto[];
  startIndex: number;
  onClose: () => void;
  /** The bubble thumbnail this viewer was opened from, held live so the close
   *  can re-measure it. Only the `?photoAnim=zoom` variant uses it, and it is
   *  optional so a surface that opens the viewer without a bubble behind it
   *  (and every test) still gets the scale-and-fade. */
  originRef?: RefObject<HTMLElement | null>;
  onReply?: (message: ChatMessage) => void;
  onForward?: (message: ChatMessage) => void;
  onToggleStar?: (message: ChatMessage) => void;
}) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(startIndex);
  const [isChromeVisible, setIsChromeVisible] = useState(true);
  // True while any gesture (a scale-1 drag, a pinch, or a pan above scale 1)
  // is in progress, so the chrome hides while a member is actively
  // manipulating the photo, not only while dragging it. Kept separate from
  // `isChromeVisible` so the bars come back by themselves when a gesture ends
  // without dismissing, rather than the gesture having to remember and
  // restore whatever the member had chosen.
  const [isGestureActive, setIsGestureActive] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  // Live, so flipping the toggle in the top bar takes effect on THIS close and
  // on every open after it. The entrance is snapshotted separately, on mount,
  // inside `useViewerPhotoMotion`: a mid-viewing flip must not leave an exit
  // reversing an entrance that never played.
  const motionVariant = useSyncExternalStore(
    subscribeViewerMotionVariant,
    getViewerMotionVariant,
  );
  const { closing, beginClose } = useViewerClose(onClose, reducedMotion);
  // Stable identities. `dismissByDrag` in particular is handed to the gesture
  // layer, which memoizes its drag controller on the callbacks it receives.
  const requestClose = useCallback(() => beginClose("default"), [beginClose]);
  const dismissByDrag = useCallback(() => beginClose("drag"), [beginClose]);
  const dialogRef = useDismiss(requestClose);
  const scrimWashRef = useRef<HTMLDivElement>(null);
  const fallbackOriginRef = useRef<HTMLElement | null>(null);
  const scrimProps = useScrimDismiss(requestClose);
  const { saveImage, isSaving } = useChatImageSave();

  const total = photos.length;
  // Held in a latest-value ref so `move` keeps one identity for the life of the
  // viewer. It is read by the gesture layer, which memoizes its drag controller
  // on the callbacks it is handed, and that controller is a dependency of a
  // layout effect that resets zoom and pan. With `total` as a dependency, a
  // second photo arriving in a one-photo thread would snap a zoomed member back
  // to 1 and silently abandon a drag in flight.
  const totalRef = useRef(total);
  useEffect(() => {
    totalRef.current = total;
  });
  const move = useCallback((delta: number) => {
    const count = totalRef.current;
    if (count === 0) return;
    setIndex((current) => (current + delta + count) % count);
  }, []);
  // Stable identities, because the gesture layer memoizes its drag controller
  // on the callbacks it is handed and that controller is a dependency of a
  // layout effect. Inline arrows here would make it fresh on every render and
  // re-run that effect constantly, resetting the zoom out from under a pinch.
  const goPrev = useCallback(() => move(-1), [move]);
  const goNext = useCallback(() => move(1), [move]);
  const toggleChrome = useCallback(
    () => setIsChromeVisible((visible) => !visible),
    [],
  );

  // Escape is owned by `useDismiss` (which also respects the modal stack), so
  // this handler is arrow keys plus one more thing: re-showing the chrome.
  // The hidden top bar stays visually and pointer-wise gone (`barHidden` in
  // `ChatImageViewerChrome`: opacity 0, pointer-events none) but stays in the
  // focus trap `useDismiss` builds, since that trap collects focusables by
  // layout alone. Re-showing the chrome on every keydown is what keeps a
  // Tab press from landing focus on a control the keyboard user can't see:
  // without this, a mixed-input user (mouse plus keyboard, or a touchscreen
  // with an external keyboard) who taps the photo to hide the chrome would
  // have no visible path back to Close, Save, Reply, Forward or Star.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      setIsChromeVisible(true);
      if (event.key === "ArrowRight") move(1);
      else if (event.key === "ArrowLeft") move(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [move]);

  const photo = photos[index];

  // `useDismiss` above locks scroll and pushes onto the modal stack
  // unconditionally, before this component knows whether it has anything to
  // show, so those two effects are already live by the time we would render
  // nothing below. Reachable in live mode when the last photo in a thread is
  // deleted while the viewer is open, shrinking `photos` below `index`. Close
  // rather than leave the page scroll-locked with no visible dialog and no
  // target for a mouse-only user to dismiss it.
  useEffect(() => {
    if (!photo) onClose();
  }, [photo, onClose]);

  if (!photo) return null;

  const canAct = !!photo.message.id;
  const closeAfter = (act: () => void) => () => {
    act();
    requestClose();
  };
  // The chrome stays out of the way of a photo a member has just flung off the
  // bottom of the screen: `useDragFeedback` announces the drag ended the
  // moment it commits, and without this the bar and the filmstrip would fade
  // back in over a viewer that is already leaving.
  const showChrome = isChromeVisible && !isGestureActive && closing !== "drag";

  return createPortal(
    <div
      className={[styles.scrim, closing && styles.closing]
        .filter(Boolean)
        .join(" ")}
      role="presentation"
      {...scrimProps}
    >
      {/* The plum ground, as its own layer rather than a background on the
          scrim: a downward drag fades it so the conversation reads through,
          and fading the scrim itself would take the photo and the chrome with
          it. Inert to pointers, so it never intercepts a backdrop click. */}
      <div ref={scrimWashRef} className={styles.scrimWash} aria-hidden="true" />
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={t("messages:viewer.dialogLabel", {
          sender: photo.senderName,
          time: `${photo.dayLabel} ${photo.timeLabel}`,
        })}
        tabIndex={-1}
      >
        <ChatImageViewerTopBar
          photo={photo}
          index={index}
          total={total}
          isChromeVisible={showChrome}
          isSaving={isSaving}
          canAct={canAct}
          onClose={requestClose}
          onSave={() => void saveImage(photo.url)}
          onReply={
            onReply ? closeAfter(() => onReply(photo.message)) : undefined
          }
          onForward={
            onForward ? closeAfter(() => onForward(photo.message)) : undefined
          }
          onToggleStar={
            onToggleStar ? () => onToggleStar(photo.message) : undefined
          }
          motionVariant={motionVariant}
        />
        <ChatImageViewerStage
          photo={photo}
          hasSiblings={total > 1}
          isChromeVisible={showChrome}
          scrimWashRef={scrimWashRef}
          onPrev={goPrev}
          onNext={goNext}
          onDismiss={dismissByDrag}
          onToggleChrome={toggleChrome}
          onGestureActive={setIsGestureActive}
          motionVariant={motionVariant}
          closing={closing}
          originRef={originRef ?? fallbackOriginRef}
          canFlipBack={index === startIndex}
        />
        {/* Row three of the grid, where the labelled action bar used to sit.
            The filmstrip returns null for a single-photo gallery and hides
            itself on touch, where the swipe gesture pages instead, so it is
            mounted unconditionally rather than gated from here. `setIndex` is
            this component's own setter, so it is already stable. */}
        <ChatImageViewerFilmstrip
          photos={photos}
          index={index}
          isChromeVisible={showChrome}
          onSelect={setIndex}
        />
      </div>
    </div>,
    document.body,
  );
}
