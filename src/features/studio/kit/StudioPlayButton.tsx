import { AnimatePresence, m } from "motion/react";
import { useId } from "react";
import { Button, IconButton, Tooltip } from "../../../shared/components/ui";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { StudioPlayPauseIcon } from "../player/ui/StudioIconSwap";
import { STUDIO_EXIT, STUDIO_FADE } from "../studioMotion";
import styles from "./StudioPlayButton.module.css";

export type StudioPlayButtonState = "idle" | "playing" | "loading" | "blocked";
export type StudioPlayButtonSize = "hero" | "card" | "row";

export interface StudioPlayButtonProps {
  state: StudioPlayButtonState;
  onToggle: () => void;
  /** The action, named for what a press does now ("Play Night Bus"). */
  label: string;
  /** Why play is blocked. The hero shows it beside the button; a card or row
   *  shows it as the button's tooltip. Either way it describes the button. */
  blockedReason?: string;
  size?: StudioPlayButtonSize;
  /** The hero's own word over "Play" and "Pause" ("Play scene"). The
   *  aria-label must contain it, so the visible label stays in the name. */
  visibleLabel?: string;
  /** Other words the hero can switch to ("Cancel"), stacked unseen so the
   *  pill keeps one width when one of them shows. */
  alternateLabels?: readonly string[];
}

const REDUCED_FADE = { duration: 0.12 } as const;

/**
 * The one Studio play control, for a hero, a card and a track row. A blocked
 * play stays focusable (`aria-disabled`), so keyboard and screen-reader users
 * land on it and hear why. Loading draws a ring around the button and keeps
 * the pause glyph, since a press then stops what is about to play. The hero
 * is a pill that also shows a word, "Play" or "Pause" unless `visibleLabel`
 * names it; its aria-label ("Play Night Bus") contains that word, so the
 * visible label stays in the accessible name.
 */
export function StudioPlayButton({
  state,
  onToggle,
  label,
  blockedReason,
  size = "hero",
  visibleLabel,
  alternateLabels = [],
}: StudioPlayButtonProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const reasonId = useId();
  const isBlocked = state === "blocked";
  const isLoading = state === "loading";
  const isPlaying = state === "playing" || isLoading;
  const hasReason = isBlocked && Boolean(blockedReason);
  const isHero = size === "hero";
  const playWord = t("studio:playButton.play");
  const pauseWord = t("studio:playButton.pause");
  const activeWord = visibleLabel ?? (isPlaying ? pauseWord : playWord);
  // Every word the pill can show shares one grid cell, so the pill keeps the
  // widest one's width and a switch crossfades without a jump.
  const stackedWords = [
    ...new Set([playWord, pauseWord, ...alternateLabels, activeWord]),
  ];

  const buttonProps = {
    "aria-label": label,
    "aria-disabled": isBlocked || undefined,
    "aria-busy": isLoading || undefined,
    "aria-describedby": hasReason ? reasonId : undefined,
    className: `${styles.play} ${styles[size]}`,
    "data-state": state,
    onClick: () => {
      if (!isBlocked) onToggle();
    },
  };
  const ring = <span className={styles.ring} aria-hidden="true" />;

  return (
    <span className={styles.wrap} data-size={size}>
      {isHero ? (
        // The quiet Button: IconButton draws a square icon-only control, and
        // the hero carries a word beside its glyph. The module repaints it.
        <Button variant="quiet" {...buttonProps}>
          {ring}
          <StudioPlayPauseIcon isPlaying={isPlaying} />
          <span className={styles.heroLabel} aria-hidden="true">
            {stackedWords.map((word) => (
              <span key={word} data-active={word === activeWord || undefined}>
                {word}
              </span>
            ))}
          </span>
        </Button>
      ) : (
        <Tooltip
          label={blockedReason ?? label}
          placement="top"
          isDisabled={!hasReason}
        >
          <IconButton {...buttonProps}>
            {ring}
            <StudioPlayPauseIcon isPlaying={isPlaying} />
          </IconButton>
        </Tooltip>
      )}
      {isHero ? (
        <AnimatePresence initial={false}>
          {hasReason && (
            <m.span
              key="reason"
              id={reasonId}
              className={styles.reason}
              initial={{ opacity: 0, x: reducedMotion ? 0 : -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{
                opacity: 0,
                transition: reducedMotion ? REDUCED_FADE : STUDIO_EXIT,
              }}
              transition={reducedMotion ? REDUCED_FADE : STUDIO_FADE}
            >
              {blockedReason}
            </m.span>
          )}
        </AnimatePresence>
      ) : (
        hasReason && (
          <span id={reasonId} className="visuallyHidden">
            {blockedReason}
          </span>
        )
      )}
    </span>
  );
}
