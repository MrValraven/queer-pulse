import { AnimatePresence, m } from "motion/react";
import { useId } from "react";
import { IconButton, Tooltip } from "../../../shared/components/ui";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
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
}

const REDUCED_FADE = { duration: 0.12 } as const;

/**
 * The one Studio play control, for a hero, a card and a track row. A blocked
 * play stays focusable (`aria-disabled`), so keyboard and screen-reader users
 * land on it and hear why. Loading draws a ring around the button and keeps
 * the pause glyph, since a press then stops what is about to play.
 */
export function StudioPlayButton({
  state,
  onToggle,
  label,
  blockedReason,
  size = "hero",
}: StudioPlayButtonProps) {
  const { reducedMotion } = useMotionPrefs();
  const reasonId = useId();
  const isBlocked = state === "blocked";
  const isLoading = state === "loading";
  const hasReason = isBlocked && Boolean(blockedReason);
  const isHero = size === "hero";

  return (
    <span className={styles.wrap} data-size={size}>
      <Tooltip
        label={blockedReason ?? label}
        placement="top"
        isDisabled={!hasReason || isHero}
      >
        <IconButton
          aria-label={label}
          aria-disabled={isBlocked || undefined}
          aria-busy={isLoading || undefined}
          aria-describedby={hasReason ? reasonId : undefined}
          className={`${styles.play} ${styles[size]}`}
          data-state={state}
          onClick={() => {
            if (!isBlocked) onToggle();
          }}
        >
          <span className={styles.ring} aria-hidden="true" />
          <StudioPlayPauseIcon isPlaying={state === "playing" || isLoading} />
        </IconButton>
      </Tooltip>
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
