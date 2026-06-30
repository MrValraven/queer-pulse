import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import styles from "./MarketingModal.module.css";

export function LiveStreamModal({ onClose }: { onClose: () => void }) {
  const [playing, setPlaying] = useState(false);
  useScrollLock();

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className={styles.eye}>Live stream · Atelier Pulso</div>
        <h2 className={styles.title}>
          Annual Assembly · <em>live.</em>
        </h2>
        <p className={styles.lead}>
          The in-person sessions are streamed here with open chat. The stream
          goes live when the room opens — <b>14 Nov · 10:00 WET.</b>
        </p>

        <div className={styles.stage}>
          <span className={styles.liveTag}>
            <span className={styles.liveDot} />
            {playing ? "Live" : "Starts soon"}
          </span>
          {!playing && (
            <button
              type="button"
              className={styles.playBtn}
              onClick={() => setPlaying(true)}
              aria-label="Play stream"
            >
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M6 4l14 8-14 8z" fill="currentColor" />
              </svg>
            </button>
          )}
          <div className={styles.stageNote}>
            {playing
              ? "Streaming the main room · audio + slides · chat below"
              : "Stream starts at 10:00 WET on 14 November"}
          </div>
        </div>

        <div className={styles.foot}>
          <button type="button" className={styles.back} onClick={onClose}>
            ← Close
          </button>
          <Button size="lg" href="#vote" onClick={onClose}>
            Cast your vote instead →
          </Button>
        </div>
      </div>
    </div>
  );
}
