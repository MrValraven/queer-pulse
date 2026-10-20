import { useEffect, useState, type FocusEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import {
  FiArrowLeft,
  FiMaximize,
  FiMinimize,
  FiMoon,
  FiSun,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import { Button, IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { gatheringPath } from "../../gatherings/gatheringPaths";
import { useFullscreen } from "./useFullscreen";
import type { QuizshowScreenTheme } from "./useScreenTheme";
import styles from "./QuizshowScreen.module.css";

const IDLE_AFTER_MS = 3000;

/** An icon that fades into its other state, keyed by which state it shows. */
function SwappingIcon({
  iconKey,
  children,
}: {
  iconKey: string;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.span
        key={iconKey}
        className={styles.toolbarIcon}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.15 }}
      >
        {children}
      </m.span>
    </AnimatePresence>
  );
}

/** True once the pointer has been still for three seconds; any movement or key wakes it. */
function useIsPointerIdle(): boolean {
  const [isIdle, setIsIdle] = useState(false);
  useEffect(() => {
    let timeoutId = window.setTimeout(() => setIsIdle(true), IDLE_AFTER_MS);
    const wake = () => {
      setIsIdle(false);
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setIsIdle(true), IDLE_AFTER_MS);
    };
    window.addEventListener("pointermove", wake, { passive: true });
    window.addEventListener("keydown", wake);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("keydown", wake);
    };
  }, []);
  return isIdle;
}

/** Keyboard focus only: a mouse click leaves focus on the button, and that must not keep the toolbar up. */
function isKeyboardFocus(element: Element): boolean {
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
}

interface QuizshowScreenToolbarProps {
  slug: string;
  theme: QuizshowScreenTheme;
  onToggleTheme: () => void;
  isLocallyMuted: boolean;
  isHostMuted: boolean;
  onToggleLocalMute: () => void;
}

/**
 * Full screen, theme, the screen's own mute and Back to the event, top right.
 * It fades out after three still seconds so the TV shows only the game, and
 * comes back on pointer movement or while any of its buttons has keyboard focus.
 * Portaled to the body: route transitions transform the page.
 */
export function QuizshowScreenToolbar({
  slug,
  theme,
  onToggleTheme,
  isLocallyMuted,
  isHostMuted,
  onToggleLocalMute,
}: QuizshowScreenToolbarProps) {
  const { t } = useTranslation();
  const isSilent = isLocallyMuted || isHostMuted;
  let muteLabelKey = "quizshow:screen.mute";
  if (isLocallyMuted) muteLabelKey = "quizshow:screen.unmute";
  else if (isHostMuted) muteLabelKey = "quizshow:screen.mutedByHost";
  const isPointerIdle = useIsPointerIdle();
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const { isSupported, isFullscreen, toggleFullscreen } = useFullscreen();
  const isFaded = isPointerIdle && !hasFocusWithin;

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget;
    if (
      !(nextTarget instanceof Node) ||
      !event.currentTarget.contains(nextTarget)
    ) {
      setHasFocusWithin(false);
    }
  };

  return createPortal(
    <div
      className={styles.toolbar}
      data-theme={theme}
      data-faded={isFaded ? "true" : "false"}
      onFocus={(event) => setHasFocusWithin(isKeyboardFocus(event.target))}
      onBlur={handleBlur}
    >
      {isSupported && (
        <IconButton
          aria-label={t(
            isFullscreen
              ? "quizshow:screen.exitFullscreen"
              : "quizshow:screen.fullscreen",
          )}
          onClick={toggleFullscreen}
        >
          <SwappingIcon iconKey={isFullscreen ? "minimize" : "maximize"}>
            {isFullscreen ? (
              <FiMinimize aria-hidden="true" fill="none" />
            ) : (
              <FiMaximize aria-hidden="true" fill="none" />
            )}
          </SwappingIcon>
        </IconButton>
      )}
      <IconButton
        aria-label={t(
          theme === "dark"
            ? "quizshow:screen.themeLight"
            : "quizshow:screen.themeDark",
        )}
        onClick={onToggleTheme}
      >
        <SwappingIcon iconKey={theme === "dark" ? "sun" : "moon"}>
          {theme === "dark" ? (
            <FiSun aria-hidden="true" fill="none" />
          ) : (
            <FiMoon aria-hidden="true" fill="none" />
          )}
        </SwappingIcon>
      </IconButton>
      <IconButton aria-label={t(muteLabelKey)} onClick={onToggleLocalMute}>
        <SwappingIcon iconKey={isSilent ? "muted" : "sounding"}>
          {isSilent ? (
            <FiVolumeX aria-hidden="true" fill="none" />
          ) : (
            <FiVolume2 aria-hidden="true" fill="none" />
          )}
        </SwappingIcon>
      </IconButton>
      <Button
        variant="icon"
        to={gatheringPath(slug)}
        aria-label={t("quizshow:screen.backToEvent")}
      >
        <FiArrowLeft aria-hidden="true" fill="none" />
      </Button>
    </div>,
    document.body,
  );
}
