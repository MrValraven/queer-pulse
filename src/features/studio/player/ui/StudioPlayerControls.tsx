import { AnimatePresence, m, useIsPresent } from "motion/react";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { FiRepeat, FiShuffle, FiSkipBack, FiSkipForward } from "react-icons/fi";
import { useChipMotion } from "../../../../shared/components/ui";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  noteMemberPlayToggle,
  useStudioPlaybackSignals,
} from "../studioPlaybackSignals";
import { useStudioPlayer } from "../studioPlayerContext";
import { StudioEpisodeSkipButton } from "./StudioEpisodeSkipButton";
import { StudioPlayPauseIcon } from "./StudioIconSwap";
import styles from "./StudioPlayerControls.module.css";
import { useStudioShortcutHint } from "./useStudioShortcutHint";

const REPEAT_KEY = {
  off: "studio:player.repeat.off",
  all: "studio:player.repeat.all",
  one: "studio:player.repeat.one",
} as const;

/** The 4px dot under Shuffle and Repeat while on (DES-22), so their state
 *  reads by shape as well as colour. */
function StudioControlOnDot() {
  return <span className={styles.onDot} aria-hidden="true" />;
}

export function StudioShuffleButton() {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const hintFor = useStudioShortcutHint();
  const label = t("studio:player.shuffle");
  const hint = hintFor(label, "shuffle");
  const isOn = player.queue.isShuffled;
  const isEpisode = player.currentItem?.isEpisode === true;
  return (
    <IconButton
      className={styles.iconButton}
      aria-pressed={isOn}
      aria-label={label}
      aria-keyshortcuts={isEpisode ? undefined : hint.ariaKeyShortcuts}
      aria-disabled={isEpisode || undefined}
      tooltip={
        isEpisode ? t("studio:player.shuffleEpisodeDisabled") : hint.tooltip
      }
      data-active={isOn || undefined}
      onClick={() => {
        if (!isEpisode) player.toggleShuffle();
      }}
    >
      <FiShuffle aria-hidden />
      <StudioControlOnDot />
    </IconButton>
  );
}

export function StudioRepeatButton() {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const mode = player.queue.repeat;
  const { chip } = useChipMotion();
  const hintFor = useStudioShortcutHint();
  const label = t(REPEAT_KEY[mode]);
  const hint = hintFor(label, "repeat");
  const isEpisode = player.currentItem?.isEpisode === true;
  return (
    <IconButton
      className={styles.iconButton}
      data-mode={mode}
      data-active={mode !== "off" || undefined}
      aria-label={label}
      aria-keyshortcuts={isEpisode ? undefined : hint.ariaKeyShortcuts}
      aria-disabled={isEpisode || undefined}
      tooltip={
        isEpisode ? t("studio:player.repeatEpisodeDisabled") : hint.tooltip
      }
      onClick={() => {
        if (!isEpisode) player.cycleRepeat();
      }}
    >
      <FiRepeat aria-hidden />
      <StudioControlOnDot />
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
    </IconButton>
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

/** Previous, play or pause, next. `large` is Now playing's size. While the
 *  stream loads or the audio waits for data, a ring turns around play
 *  (ENG-01); it fades in after a short delay, so a quick start never
 *  flashes it. */
export function StudioTransport({ size }: { size: "bar" | "large" }) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const { isBuffering } = useStudioPlaybackSignals();
  const hintFor = useStudioShortcutHint();
  const isPlaying = player.status === "playing";
  const isWaiting = player.status === "loading" || isBuffering;
  // The warning gate's Play it is the answer while it waits, so this play
  // steps back to the muted ink.
  const isGated = player.pendingWarning !== null;
  // Artist kinds: an episode skips 15 s back and 30 s forward (spec 5.6).
  const isEpisode = player.currentItem?.isEpisode === true;
  const slotKind = isEpisode ? "episode" : "music";
  const playLabel = isPlaying
    ? t("studio:playerBar.pause")
    : t("studio:playerBar.play");
  const playHint = hintFor(playLabel, "playPause");
  const previousHint = hintFor(t("studio:playerBar.previous"), "previousTrack");
  const nextHint = hintFor(t("studio:playerBar.next"), "nextTrack");
  return (
    <div className={styles.transport} data-size={size}>
      <TransportSlot slotKey={`back-${slotKind}`}>
        {isEpisode ? (
          <StudioEpisodeSkipButton
            direction="back"
            className={styles.iconButton}
          />
        ) : (
          <IconButton
            className={styles.iconButton}
            onClick={player.previous}
            aria-label={t("studio:playerBar.previous")}
            aria-keyshortcuts={previousHint.ariaKeyShortcuts}
            tooltip={previousHint.tooltip}
          >
            <FiSkipBack aria-hidden />
          </IconButton>
        )}
      </TransportSlot>
      <IconButton
        className={styles.playButton}
        onClick={() => {
          noteMemberPlayToggle();
          player.togglePlay();
        }}
        aria-label={playLabel}
        aria-keyshortcuts={playHint.ariaKeyShortcuts}
        tooltip={playHint.tooltip}
        aria-busy={isWaiting || undefined}
        data-waiting={isWaiting || undefined}
        data-gated={isGated || undefined}
        data-studio-play-toggle=""
      >
        <span className={styles.waitRing} aria-hidden="true" />
        <StudioPlayPauseIcon isPlaying={isPlaying} />
      </IconButton>
      <TransportSlot slotKey={`forward-${slotKind}`}>
        {isEpisode ? (
          <StudioEpisodeSkipButton
            direction="forward"
            className={styles.iconButton}
          />
        ) : (
          <IconButton
            className={styles.iconButton}
            aria-disabled={!player.hasNext || undefined}
            aria-label={t("studio:playerBar.next")}
            aria-keyshortcuts={nextHint.ariaKeyShortcuts}
            tooltip={nextHint.tooltip}
            onClick={() => {
              if (player.hasNext) player.next();
            }}
          >
            <FiSkipForward aria-hidden />
          </IconButton>
        )}
      </TransportSlot>
    </div>
  );
}
