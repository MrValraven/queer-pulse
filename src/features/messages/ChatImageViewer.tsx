import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDismiss, useScrimDismiss } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ChatImageViewerTopBar,
  ChatImageViewerBottomBar,
} from "./ChatImageViewerChrome";
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
 */
export function ChatImageViewer({
  photos,
  startIndex,
  onClose,
  onReply,
  onForward,
  onToggleStar,
}: {
  photos: ViewerPhoto[];
  startIndex: number;
  onClose: () => void;
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
  const dialogRef = useDismiss(onClose);
  const scrimWashRef = useRef<HTMLDivElement>(null);
  const scrimProps = useScrimDismiss(onClose);
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
  // Hidden bars stay visually and pointer-wise gone (`barHidden` in
  // `ChatImageViewerChrome`: opacity 0, pointer-events none) but stay in the
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
    onClose();
  };

  return createPortal(
    <div className={styles.scrim} role="presentation" {...scrimProps}>
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
          isChromeVisible={isChromeVisible && !isGestureActive}
          onClose={onClose}
        />
        <ChatImageViewerStage
          photo={photo}
          hasSiblings={total > 1}
          isChromeVisible={isChromeVisible && !isGestureActive}
          scrimWashRef={scrimWashRef}
          onPrev={goPrev}
          onNext={goNext}
          onDismiss={onClose}
          onToggleChrome={toggleChrome}
          onGestureActive={setIsGestureActive}
        />
        <ChatImageViewerBottomBar
          photo={photo}
          isChromeVisible={isChromeVisible && !isGestureActive}
          isSaving={isSaving}
          canAct={canAct}
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
        />
      </div>
    </div>,
    document.body,
  );
}
