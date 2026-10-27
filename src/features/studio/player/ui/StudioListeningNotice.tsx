import {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiHeadphones, FiX } from "react-icons/fi";
import { routes } from "../../../../app/routeMap";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { IconButton } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { STUDIO_EXIT, STUDIO_FADE } from "../../studioMotion";
import {
  dismissStudioListeningNotice,
  readStudioListeningNotice,
  subscribeStudioListeningNotice,
} from "../studioListeningNoticeStore";
import css from "./StudioListeningNotice.module.css";

/** How long the notice stays when nobody points at it or focuses inside. */
const AUTO_DISMISS_MS = 12_000;

/** Closes the notice after 12 seconds. A pointer or focus inside holds the
 *  timer; leaving or moving focus out starts a fresh 12 seconds. */
function useNoticeAutoDismiss(isShown: boolean) {
  const timerRef = useRef<number | null>(null);
  const isPointerInsideRef = useRef(false);
  const isFocusInsideRef = useRef(false);
  const clearTimer = useCallback(() => {
    if (timerRef.current === null) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);
  const startTimer = useCallback(() => {
    clearTimer();
    // A pointer leaving the card during its exit starts nothing.
    if (!readStudioListeningNotice()) return;
    if (isPointerInsideRef.current || isFocusInsideRef.current) return;
    timerRef.current = window.setTimeout(
      dismissStudioListeningNotice,
      AUTO_DISMISS_MS,
    );
  }, [clearTimer]);
  useEffect(() => {
    if (!isShown) return;
    isPointerInsideRef.current = false;
    isFocusInsideRef.current = false;
    startTimer();
    return clearTimer;
  }, [isShown, startTimer, clearTimer]);
  return {
    onPointerEnter: () => {
      isPointerInsideRef.current = true;
      clearTimer();
    },
    onPointerLeave: () => {
      isPointerInsideRef.current = false;
      startTimer();
    },
    onFocus: () => {
      isFocusInsideRef.current = true;
      clearTimer();
    },
    onBlur: (event: FocusEvent<HTMLDivElement>) => {
      // Focus moving between the link and the close button stays inside.
      if (event.currentTarget.contains(event.relatedTarget)) return;
      isFocusInsideRef.current = false;
      startTimer();
    },
  };
}

type NoticeHandlers = ReturnType<typeof useNoticeAutoDismiss>;

/** The play/pause control both player surfaces mark. */
const PLAY_TOGGLE_SELECTOR = "[data-studio-play-toggle]";

/** Closes the notice and, when focus sat inside it, hands focus back to the
 *  element that held it before the notice took it (or the play/pause control
 *  when that element is gone). Focus outside the notice is left alone. */
function useNoticeFocusReturn(handlers: NoticeHandlers) {
  const returnTargetRef = useRef<HTMLElement | null>(null);
  const closeNotice = (card: HTMLElement | null) => {
    if (card?.contains(document.activeElement)) {
      const previous = returnTargetRef.current;
      const target =
        previous?.isConnected === true
          ? previous
          : document.querySelector<HTMLElement>(PLAY_TOGGLE_SELECTOR);
      target?.focus();
    }
    dismissStudioListeningNotice();
  };
  return {
    closeNotice,
    onFocus: (event: FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        returnTargetRef.current =
          event.relatedTarget instanceof HTMLElement
            ? event.relatedTarget
            : null;
      }
      handlers.onFocus();
    },
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") closeNotice(event.currentTarget);
    },
  };
}

/** The visible card. A child of AnimatePresence, so it knows when it is
 *  playing its exit and goes inert for it. */
function StudioListeningNoticeCard({ handlers }: { handlers: NoticeHandlers }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const focusReturn = useNoticeFocusReturn(handlers);
  const hidden = { opacity: 0, y: reducedMotion ? 0 : 12 };
  return (
    <m.div
      className={css.notice}
      inert={!isPresent}
      initial={hidden}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        ...hidden,
        transition: reducedMotion ? { duration: 0 } : STUDIO_EXIT,
      }}
      transition={reducedMotion ? { duration: 0 } : STUDIO_FADE}
      {...handlers}
      onFocus={focusReturn.onFocus}
      onKeyDown={focusReturn.onKeyDown}
    >
      <FiHeadphones aria-hidden className={css.icon} />
      <p className={css.text}>
        <span>{t("studio:listening.notice.body")}</span>{" "}
        <Link
          to={routes.studioListening}
          className={css.link}
          onClick={dismissStudioListeningNotice}
        >
          {t("studio:listening.notice.cta")}
        </Link>
      </p>
      <IconButton
        size="sm"
        className={css.close}
        aria-label={t("studio:listening.notice.close")}
        onClick={(event) =>
          focusReturn.closeNotice(event.currentTarget.parentElement)
        }
      >
        <FiX aria-hidden />
      </IconButton>
    </m.div>
  );
}

/** The first-play notice (contract 11): once, after the first counted play,
 *  a card above the player says the listening history is on and links to
 *  Your listening. Portaled to the body, so no scrolling container clips it.
 *  The live region stays mounted, so its text is announced when it lands. */
export function StudioListeningNotice() {
  const { t } = useTranslation();
  const isShown = useSyncExternalStore(
    subscribeStudioListeningNotice,
    readStudioListeningNotice,
    readStudioListeningNotice,
  );
  const handlers = useNoticeAutoDismiss(isShown);
  return createPortal(
    <>
      <p role="status" className="visuallyHidden">
        {isShown ? t("studio:listening.notice.body") : ""}
      </p>
      <AnimatePresence>
        {isShown && (
          <StudioListeningNoticeCard
            key="studio-listening-notice"
            handlers={handlers}
          />
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
}
