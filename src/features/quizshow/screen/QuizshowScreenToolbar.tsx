import {
  useEffect,
  useId,
  useState,
  type FocusEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import {
  FiArrowLeft,
  FiMaximize,
  FiMinimize,
  FiMoon,
  FiSmile,
  FiSun,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import { TbMoodOff } from "react-icons/tb";
import { Button, IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_SOUND_LEVELS,
  type QuizshowSoundLevel,
} from "../sound/quizshowCues";
import { useFullscreen } from "./useFullscreen";
import type { QuizshowScreenTheme } from "./useScreenTheme";
import styles from "./QuizshowScreen.module.css";
import soundStyles from "./QuizshowScreenSound.module.css";

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

/** The TV's own switches: they stay on this page and never send a frame. */
export interface QuizshowScreenControls {
  theme: QuizshowScreenTheme;
  onToggleTheme: () => void;
  isLocallyMuted: boolean;
  onToggleLocalMute: () => void;
  /** Quiet, Normal or Venue (item 39), kept on this device. */
  soundLevel: QuizshowSoundLevel;
  onSoundLevelChange: (level: QuizshowSoundLevel) => void;
  /** The "Hide reactions" switch (C6.19), for this page load only. */
  isReactionsHidden: boolean;
  onToggleReactions: () => void;
}

interface QuizshowScreenToolbarProps extends QuizshowScreenControls {
  /** The event page, the game page, or the TV's code screen. */
  backPath: string;
  /** "Back to the event", "Back to the game" or, on a paired TV, "Show a new code". */
  backLabelKey: string;
  /** Navigation state for the back link: a paired TV sends its leave state. */
  backState?: unknown;
  isHostMuted: boolean;
}

const SOUND_LEVEL_LABEL_KEYS: Record<QuizshowSoundLevel, string> = {
  quiet: "quizshow:screen.soundLevel.quiet",
  normal: "quizshow:screen.soundLevel.normal",
  venue: "quizshow:screen.soundLevel.venue",
};

/** The level after `level`, back to the first after the last. */
function nextSoundLevel(level: QuizshowSoundLevel): QuizshowSoundLevel {
  const levelIndex = QUIZSHOW_SOUND_LEVELS.indexOf(level);
  return (
    QUIZSHOW_SOUND_LEVELS[(levelIndex + 1) % QUIZSHOW_SOUND_LEVELS.length] ??
    level
  );
}

/**
 * One button that names the level ("Sound: Normal") and steps to the next
 * one on each press: Quiet, Normal, Venue, then Quiet again. A narrow
 * window leaves it out (the CSS), so the toolbar fits beside the sound chip.
 * A screen reader hears which level a press leads to (the description) and,
 * after each press, the new level (a polite status line).
 */
function SoundLevelButton({
  soundLevel,
  onSoundLevelChange,
}: {
  soundLevel: QuizshowSoundLevel;
  onSoundLevelChange: (level: QuizshowSoundLevel) => void;
}) {
  const { t } = useTranslation();
  const hintId = useId();
  // Empty until the first press, so loading the page announces nothing.
  const [announcedLevel, setAnnouncedLevel] =
    useState<QuizshowSoundLevel | null>(null);
  const levelLine = (level: QuizshowSoundLevel) =>
    t("quizshow:screen.soundLevel.cycle", {
      level: t(SOUND_LEVEL_LABEL_KEYS[level]),
    });
  const changeLevel = () => {
    const nextLevel = nextSoundLevel(soundLevel);
    onSoundLevelChange(nextLevel);
    setAnnouncedLevel(nextLevel);
  };
  return (
    <>
      <Button
        variant="icon"
        className={soundStyles.levelButton}
        aria-describedby={hintId}
        onClick={changeLevel}
      >
        {levelLine(soundLevel)}
      </Button>
      <span id={hintId} className="visuallyHidden">
        {t("quizshow:screen.soundLevel.next", {
          level: t(SOUND_LEVEL_LABEL_KEYS[nextSoundLevel(soundLevel)]),
        })}
      </span>
      <span role="status" className="visuallyHidden">
        {announcedLevel === null ? "" : levelLine(announcedLevel)}
      </span>
    </>
  );
}

/**
 * Full screen, theme, the screen's own mute, the sound level, the reactions
 * switch and the back link, bottom right. It never runs wider than the
 * window: its buttons wrap and stay on screen.
 * It fades out after three still seconds so the TV shows only the game, and
 * comes back on pointer movement or while any of its buttons has keyboard focus.
 * Portaled to the body: route transitions transform the page.
 */
export function QuizshowScreenToolbar({
  backPath,
  backLabelKey,
  backState,
  theme,
  onToggleTheme,
  isLocallyMuted,
  isHostMuted,
  onToggleLocalMute,
  soundLevel,
  onSoundLevelChange,
  isReactionsHidden,
  onToggleReactions,
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
      data-qs-theme={theme}
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
      <SoundLevelButton
        soundLevel={soundLevel}
        onSoundLevelChange={onSoundLevelChange}
      />
      <IconButton
        aria-label={t(
          isReactionsHidden
            ? "quizshow:screen.showReactions"
            : "quizshow:screen.hideReactions",
        )}
        onClick={onToggleReactions}
      >
        <SwappingIcon iconKey={isReactionsHidden ? "hidden" : "shown"}>
          {isReactionsHidden ? (
            <TbMoodOff aria-hidden="true" />
          ) : (
            <FiSmile aria-hidden="true" fill="none" />
          )}
        </SwappingIcon>
      </IconButton>
      <Button
        variant="icon"
        to={backPath}
        state={backState}
        aria-label={t(backLabelKey)}
      >
        <FiArrowLeft aria-hidden="true" fill="none" />
      </Button>
    </div>,
    document.body,
  );
}
