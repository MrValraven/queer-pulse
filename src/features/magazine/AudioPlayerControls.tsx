import { useState } from "react";
import { FiMoon, FiX } from "react-icons/fi";
import { SPEEDS, secToTime } from "./audioPlayer.data";
import type { AudioPlayer } from "./useAudioPlayer";
import styles from "./AudioPlayerPage.module.css";

export function PlayerTransport({ player }: { player: AudioPlayer }) {
  return (
    <div className={styles.controls}>
      <button
        type="button"
        className={styles.ctrl}
        title="Previous chapter"
        onClick={player.prevChapter}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <polygon points="19 20 9 12 19 4 19 20" />
          <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" />
        </svg>
      </button>
      <button
        type="button"
        className={styles.ctrl}
        title="-15s"
        onClick={() => player.nudge(-15)}
      >
        <svg viewBox="0 0 24 24">
          <path d="M2.5 2v6h6" />
          <path d="M21.5 12A9 9 0 1 1 6 5.3L2.5 8" />
        </svg>
      </button>
      <button
        type="button"
        className={styles.playBtn}
        onClick={player.togglePlay}
        title={player.playing ? "Pause" : "Play"}
      >
        {player.playing ? (
          <svg viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24">
            <polygon points="6 4 20 12 6 20" />
          </svg>
        )}
      </button>
      <button
        type="button"
        className={styles.ctrl}
        title="+30s"
        onClick={() => player.nudge(30)}
      >
        <svg viewBox="0 0 24 24">
          <path d="M21.5 2v6h-6" />
          <path d="M2.5 12A9 9 0 1 0 18 5.3L21.5 8" />
        </svg>
      </button>
      <button
        type="button"
        className={styles.ctrl}
        title="Next chapter"
        onClick={player.nextChapter}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 4 15 12 5 20 5 4" />
          <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" />
        </svg>
      </button>
    </div>
  );
}

export function PlayerSecondary({
  player,
  onSleep,
}: {
  player: AudioPlayer;
  onSleep: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <div className={styles.secondary}>
      <div className={styles.speed}>
        {SPEEDS.map((sp) => (
          <button
            key={sp}
            type="button"
            className={[
              styles.speedBtn,
              player.speed === sp && styles.speedActive,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => player.setSpeed(sp)}
          >
            {sp}
          </button>
        ))}
      </div>
      <div className={styles.actionsRow}>
        <button
          type="button"
          className={[styles.actionBtn, saved && styles.actionActive]
            .filter(Boolean)
            .join(" ")}
          onClick={() => setSaved((v) => !v)}
        >
          <svg viewBox="0 0 24 24">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          Save
        </button>
        <button
          type="button"
          className={[styles.actionBtn, liked && styles.actionActive]
            .filter(Boolean)
            .join(" ")}
          onClick={() => setLiked((v) => !v)}
        >
          <svg viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          Like
        </button>
        {player.sleepRemaining !== null ? (
          <span className={styles.sleepChip}>
            <FiMoon />
            {secToTime(player.sleepRemaining)}
            <button
              type="button"
              className={styles.sleepChipX}
              title="Cancel sleep timer"
              onClick={player.cancelSleep}
            >
              <FiX />
            </button>
          </span>
        ) : (
          <button type="button" className={styles.actionBtn} onClick={onSleep}>
            <svg viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            Sleep
          </button>
        )}
      </div>
    </div>
  );
}
