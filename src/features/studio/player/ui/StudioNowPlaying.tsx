import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiChevronDown } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useInertWhileCovered } from "../../../../shared/components/ui/modalStack";
import { useDismiss } from "../../../../shared/components/ui/useDismiss";
import { useHistoryBackDismiss } from "../../../../shared/hooks/useHistoryBackDismiss";
import { useMediaQuery } from "../../../../shared/hooks/useMediaQuery";
import { useVerticalSwipe } from "../../../../shared/hooks/useVerticalSwipe";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { mediaMax } from "../../../../shared/theme/breakpoints";
import { useStudioPlayer } from "../studioPlayerContext";
import { useStudioPlayerSurface } from "../studioPlayerSurface";
import { radioFilterLabelKey } from "../studioQueue";
import { StudioNowPlayingPanes } from "./StudioNowPlayingPanes";
import { StudioNowPlayingStage } from "./StudioNowPlayingStage";
import styles from "./StudioNowPlaying.module.css";

const SHEET_EASE = [0.22, 0.68, 0.16, 1] as const;

/** "Playing from {source}". A radio is named from its filter in the
 *  language on screen now; a ready-made list reads as the queue. */
function useSourceLine(): string {
  const { t } = useTranslation();
  const { queue, radio } = useStudioPlayer();
  const source = queue.source;
  if (!source || source.kind === "tracks")
    return t("studio:nowPlaying.playingFromQueue");
  const radioFilter = source.radioFilter ?? radio?.filter;
  const sourceName =
    source.kind === "radio" && radioFilter
      ? t(radioFilterLabelKey(radioFilter))
      : source.label;
  return sourceName
    ? t("studio:nowPlaying.playingFrom", { source: sourceName })
    : t("studio:nowPlaying.playingFromQueue");
}

/** The phone head's swipe down. While the finger is down the inner frame
 *  follows it (written directly, off the render path, as ModalSheet does);
 *  under the threshold it clears the transform and springs back over the
 *  frame's `--dur-base` transform transition, so no transform outlives the
 *  drag. A press on the close button or a link starts no drag: capturing
 *  the pointer on the head would retarget that button's click. The sticky
 *  head stays on screen at every scroll position, so a drag closes the sheet
 *  only when it starts with the sheet scrolled to the top. */
function useSheetSwipe(
  isPhone: boolean,
  sheetRef: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  const frameRef = useRef<HTMLDivElement>(null);
  const swipe = useVerticalSwipe({
    direction: "down",
    isEnabled: isPhone,
    onSwipe: onClose,
    onDrag: (offset) => {
      const frame = frameRef.current;
      if (!frame) return;
      frame.style.transition = offset === 0 ? "" : "none";
      frame.style.transform = offset === 0 ? "" : `translateY(${offset}px)`;
    },
  });
  const swipeHandlers = {
    ...swipe,
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
      const target = event.target as Element;
      if (target.closest("button, a")) return;
      const isSheetAtTop = (sheetRef.current?.scrollTop ?? 0) <= 0;
      if (!isSheetAtTop) return;
      swipe.onPointerDown(event);
    },
  };
  return { frameRef, swipeHandlers };
}

function StudioNowPlayingOverlay({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const surface = useStudioPlayerSurface();
  const player = useStudioPlayer();
  const isPhone = useMediaQuery(mediaMax(880));
  const isPresent = useIsPresent();
  const layerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useDismiss<HTMLDivElement>(surface.closeNowPlaying);
  useInertWhileCovered(layerRef, !isPresent);
  const sourceLine = useSourceLine();
  const { frameRef, swipeHandlers } = useSheetSwipe(
    isPhone,
    dialogRef,
    surface.closeNowPlaying,
  );
  // The phone head turns frosted once content scrolls under it; at the top
  // it stays clear, so the tint wash runs unbroken behind it.
  const [isScrolled, setIsScrolled] = useState(false);
  const item = player.currentItem;
  const closeForLink = () => {
    onNavigate();
    surface.closeNowPlaying();
  };
  return (
    <m.div
      ref={layerRef}
      className={styles.layer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // Reduced motion keeps the fade; only the sheet's travel goes.
      transition={{ duration: reducedMotion ? 0.2 : 0.24 }}
    >
      <m.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("studio:nowPlaying.dialogLabel")}
        tabIndex={-1}
        inert={!isPresent || undefined}
        className={styles.sheet}
        data-tint={item?.tint ?? "default"}
        data-scrolled={isScrolled || undefined}
        onScroll={(event) => setIsScrolled(event.currentTarget.scrollTop > 0)}
        initial={{ y: reducedMotion ? 0 : 40 }}
        animate={{ y: 0 }}
        exit={{ y: reducedMotion ? 0 : 40 }}
        transition={{ duration: reducedMotion ? 0 : 0.28, ease: SHEET_EASE }}
      >
        <div ref={frameRef} className={styles.frame}>
          <div className={styles.wash} aria-hidden="true" />
          <header className={styles.head} {...swipeHandlers}>
            <span className={styles.grabber} aria-hidden="true" />
            <button
              type="button"
              className={styles.close}
              aria-label={t("studio:nowPlaying.close")}
              onClick={surface.closeNowPlaying}
            >
              <FiChevronDown aria-hidden />
            </button>
            <p className={styles.source}>{sourceLine}</p>
          </header>
          {item && (
            <div className={styles.columns}>
              <StudioNowPlayingStage
                item={item}
                isPhone={isPhone}
                onNavigate={closeForLink}
              />
              <StudioNowPlayingPanes item={item} isPhone={isPhone} />
            </div>
          )}
        </div>
      </m.div>
    </m.div>
  );
}

/** The full-screen player (spec 7.2). Mounted by the bar, portalled to body
 *  because the route slide transitions transform the page. */
export function StudioNowPlayingHost() {
  const surface = useStudioPlayerSurface();
  const history = useHistoryBackDismiss(
    surface.isNowPlayingOpen,
    surface.closeNowPlaying,
  );
  return createPortal(
    <AnimatePresence>
      {surface.isNowPlayingOpen && (
        <StudioNowPlayingOverlay
          key="now-playing"
          onNavigate={history.markNavigated}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}
