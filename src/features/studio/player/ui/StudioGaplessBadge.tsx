import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { TbArrowsJoin2 } from "react-icons/tb";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import type { TooltipProps } from "../../../../shared/components/ui/Tooltip";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { STUDIO_EXIT, STUDIO_FADE } from "../../studioMotion";
import type { StudioQueueItem } from "../studioPlayerContext";
import { useStudioIsPlayingGapless } from "../useStudioIsPlayingGapless";
import {
  useStudioGaplessBubbleFit,
  useStudioGaplessDismiss,
} from "./StudioGaplessBadge.hooks";
import styles from "./StudioGaplessBadge.module.css";

/** Where the badge sits: the bar's one-line title, the side panel's track
 *  header, or the Now playing stage. Each sizes the icon to its title. */
export type StudioGaplessBadgeSize = "bar" | "panel" | "stage";

/** The bar sits at the foot of the screen, so its bubble opens upward. The
 *  side panel's tooltip floats outside the scrolling body, as its track
 *  menu's does. */
const PLACEMENT_BY_SIZE: Record<StudioGaplessBadgeSize, "up" | "down"> = {
  bar: "up",
  panel: "down",
  stage: "down",
};
const TOOLTIP_BY_SIZE: Record<
  StudioGaplessBadgeSize,
  TooltipProps["placement"]
> = { bar: "top", panel: "floating-top", stage: "top" };

/** The bubble lifts a little from the trigger's side; reduced motion keeps
 *  only an instant swap. */
function bubbleMotion(placement: "up" | "down", reducedMotion: boolean) {
  if (reducedMotion)
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0 },
    };
  const offset = placement === "up" ? 4 : -4;
  return {
    initial: { opacity: 0, y: offset },
    animate: { opacity: 1, y: 0, transition: STUDIO_FADE },
    exit: { opacity: 0, y: offset, transition: STUDIO_EXIT },
  };
}

/** The icon button and its bubble. The tooltip names it on hover and focus;
 *  a press (or tap, where no tooltip shows) opens one line on why the
 *  release runs on without a crossfade. The bubble lands in a status region
 *  that stays mounted, so a screen reader hears it as it opens. */
function GaplessToggletip({
  item,
  size,
}: {
  item: StudioQueueItem;
  size: StudioGaplessBadgeSize;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const placement = PLACEMENT_BY_SIZE[size];
  const [isOpen, setIsOpen] = useState(false);
  const bubbleId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const close = useCallback(() => setIsOpen(false), []);
  useStudioGaplessDismiss(isOpen, rootRef, triggerRef, close);
  useStudioGaplessBubbleFit(isOpen, bubbleRef, triggerRef, placement);
  const label = t("studio:player.gapless.label");
  return (
    <span
      ref={rootRef}
      className={styles.toggletip}
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;
        if (nextFocus && !event.currentTarget.contains(nextFocus)) close();
      }}
    >
      <IconButton
        ref={triggerRef}
        className={styles.trigger}
        aria-label={label}
        aria-expanded={isOpen}
        aria-controls={bubbleId}
        tooltip={label}
        tooltipPlacement={TOOLTIP_BY_SIZE[size]}
        isTooltipDisabled={isOpen}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <TbArrowsJoin2 aria-hidden />
      </IconButton>
      <span id={bubbleId} role="status">
        <AnimatePresence>
          {isOpen && (
            <m.span
              key="bubble"
              ref={bubbleRef}
              className={styles.bubble}
              data-placement={placement}
              {...bubbleMotion(placement, reducedMotion)}
            >
              {t("studio:player.gapless.body", {
                artist: item.artistName,
                release: item.releaseTitle,
              })}
            </m.span>
          )}
        </AnimatePresence>
      </span>
    </span>
  );
}

/**
 * The gapless badge: shown while the playing track belongs to a release
 * its artist set to play without gaps, so a listener who turned crossfade
 * up knows why it rests between these tracks. It renders nothing when that
 * does not hold (an episode, a preview, casting, plain mode, a single), and
 * fades in and out when it changes under the same track.
 */
export function StudioGaplessBadge({
  item,
  size,
}: {
  item: StudioQueueItem;
  size: StudioGaplessBadgeSize;
}) {
  const { reducedMotion } = useMotionPrefs();
  const isGapless = useStudioIsPlayingGapless(item);
  const fade = reducedMotion ? { duration: 0 } : STUDIO_FADE;
  return (
    <AnimatePresence initial={false}>
      {isGapless && (
        <m.span
          key="gapless"
          className={styles.badge}
          data-size={size}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: fade }}
          exit={{
            opacity: 0,
            transition: reducedMotion ? { duration: 0 } : STUDIO_EXIT,
          }}
        >
          <GaplessToggletip item={item} size={size} />
        </m.span>
      )}
    </AnimatePresence>
  );
}

/** A title with the gapless badge right after it, on one line: the title
 *  shrinks (and truncates or clamps as its own class says) and the badge
 *  keeps its size. The stage's title is a heading, so its line is a block;
 *  the bar and the side panel keep it inline inside their title swap. */
export function StudioGaplessTitleLine({
  item,
  size,
  children,
}: {
  item: StudioQueueItem;
  size: StudioGaplessBadgeSize;
  children: ReactNode;
}) {
  const LineElement = size === "stage" ? "div" : "span";
  return (
    <LineElement className={styles.titleLine} data-size={size}>
      {children}
      <StudioGaplessBadge item={item} size={size} />
    </LineElement>
  );
}
