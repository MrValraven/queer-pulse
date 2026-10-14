import { AnimatePresence, m, useIsPresent } from "motion/react";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { FiRepeat, FiShuffle, FiSkipBack, FiSkipForward } from "react-icons/fi";
import { useChipMotion } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useStudioPlayer } from "../studioPlayerContext";
import { StudioEpisodeSkipButton } from "./StudioEpisodeSkipButton";
import { StudioPlayPauseIcon } from "./StudioIconSwap";
import styles from "./StudioPlayerControls.module.css";

const REPEAT_KEY = {
  off: "studio:player.repeat.off",
  all: "studio:player.repeat.all",
  one: "studio:player.repeat.one",
} as const;

export function StudioShuffleButton() {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  return (
    <button
      type="button"
      className={styles.iconButton}
      aria-pressed={player.queue.isShuffled}
      aria-label={t("studio:player.shuffle")}
      onClick={player.toggleShuffle}
    >
      <FiShuffle aria-hidden />
    </button>
  );
}

export function StudioRepeatButton() {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const mode = player.queue.repeat;
  const { chip } = useChipMotion();
  return (
    <button
      type="button"
      className={styles.iconButton}
      data-mode={mode}
      aria-label={t(REPEAT_KEY[mode])}
      onClick={player.cycleRepeat}
    >
      <FiRepeat aria-hidden />
      {/* The "1" pops in and out with the shared chip motion. */}
      <AnimatePresence initial={false}>
        {mode === "one" && (
          <m.span
            key="repeat-one"
            className={styles.repeatOne}
            aria-hidden="true"
            initial={chip.initial}
            animate={chip.animate}
            exit={chip.exit}
            transition={chip.transition}
          >
            1
          </m.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/** One button of the swap. On its way out it is inert (out of the tab
 *  order, keyboard and assistive tech) and ignores the pointer while it
 *  fades. */
function TransportSlotItem({ children }: { children: ReactNode }) {
  const isPresent = useIsPresent();
  const { chip } = useChipMotion();
  return (
    <m.span
      className={styles.transportSlotItem}
      inert={!isPresent}
      aria-hidden={isPresent ? undefined : true}
      data-slot-item=""
      data-leaving={isPresent ? undefined : ""}
      initial={chip.initial}
      animate={chip.animate}
      exit={chip.exit}
      transition={chip.transition}
    >
      {children}
    </m.span>
  );
}

/** A transport cell whose button swaps (skip on an episode, Previous or
 *  Next on music) with the shared chip motion; instant under reduced
 *  motion. Focus on the leaving button moves to the one taking its place,
 *  so it never drops to the page. */
function TransportSlot({
  slotKey,
  children,
}: {
  slotKey: string;
  children: ReactNode;
}) {
  const slotRef = useRef<HTMLSpanElement>(null);
  const shownKeyRef = useRef(slotKey);
  /** Focus sits in this cell. A blur to nowhere (the leaving button turning
   *  inert) clears it only after the swap's own commit has read it. */
  const hasFocusRef = useRef(false);
  useLayoutEffect(() => {
    if (shownKeyRef.current === slotKey) return;
    shownKeyRef.current = slotKey;
    const slot = slotRef.current;
    if (!slot) return;
    const hadFocus =
      hasFocusRef.current || slot.contains(document.activeElement);
    if (!hadFocus) return;
    const entering = slot.querySelector<HTMLElement>(
      "[data-slot-item]:not([data-leaving]) button",
    );
    if (entering && !entering.contains(document.activeElement))
      entering.focus();
  }, [slotKey]);
  return (
    <span
      ref={slotRef}
      className={styles.transportSlot}
      onFocus={() => {
        hasFocusRef.current = true;
      }}
      onBlur={(event) => {
        const slot = slotRef.current;
        const next = event.relatedTarget;
        if (slot && next instanceof Node && slot.contains(next)) return;
        queueMicrotask(() => {
          hasFocusRef.current = slot?.contains(document.activeElement) === true;
        });
      }}
    >
      <AnimatePresence initial={false}>
        <TransportSlotItem key={slotKey}>{children}</TransportSlotItem>
      </AnimatePresence>
    </span>
  );
}

/** Previous, play or pause, next. `large` is Now playing's size. */
export function StudioTransport({ size }: { size: "bar" | "large" }) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const isPlaying = player.status === "playing";
  // Artist kinds: an episode skips 15 s back and 30 s forward (spec 5.6).
  const isEpisode = player.currentItem?.isEpisode === true;
  const slotKind = isEpisode ? "episode" : "music";
  return (
    <div className={styles.transport} data-size={size}>
      <TransportSlot slotKey={`back-${slotKind}`}>
        {isEpisode ? (
          <StudioEpisodeSkipButton
            direction="back"
            className={styles.iconButton}
          />
        ) : (
          <button
            type="button"
            className={styles.iconButton}
            onClick={player.previous}
            aria-label={t("studio:playerBar.previous")}
          >
            <FiSkipBack aria-hidden />
          </button>
        )}
      </TransportSlot>
      <button
        type="button"
        className={styles.playButton}
        onClick={player.togglePlay}
        aria-label={
          isPlaying ? t("studio:playerBar.pause") : t("studio:playerBar.play")
        }
        aria-busy={player.status === "loading" || undefined}
      >
        <StudioPlayPauseIcon isPlaying={isPlaying} />
      </button>
      <TransportSlot slotKey={`forward-${slotKind}`}>
        {isEpisode ? (
          <StudioEpisodeSkipButton
            direction="forward"
            className={styles.iconButton}
          />
        ) : (
          <button
            type="button"
            className={styles.iconButton}
            aria-disabled={!player.hasNext || undefined}
            aria-label={t("studio:playerBar.next")}
            onClick={() => {
              if (player.hasNext) player.next();
            }}
          >
            <FiSkipForward aria-hidden />
          </button>
        )}
      </TransportSlot>
    </div>
  );
}
