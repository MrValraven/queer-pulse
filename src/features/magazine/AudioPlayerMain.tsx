import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { HOME, MEMBER, SHOW, secToTime } from "./audioPlayer.data";
import { CastModal, SleepTimerModal } from "./AudioPlayerModals";
import { PlayerTransport, PlayerSecondary } from "./AudioPlayerControls";
import type { AudioPlayer } from "./useAudioPlayer";
import styles from "./AudioPlayerPage.module.css";

function PlayerTopbar({ onCast }: { onCast: () => void }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const share = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(location.href);
    showToast(t("magazine:audio.linkCopiedToast"), "success");
  };
  return (
    <div className={styles.topbar}>
      <Link to={SHOW} className={styles.back}>
        {t("magazine:audio.backToShow")}
      </Link>
      <Link to={HOME} className={styles.brand}>
        <span className={styles.brandDot} />
        Queer<span className={styles.brandItalic}>Pulse</span>
      </Link>
      <div className={styles.extra}>
        <button
          type="button"
          className={styles.iconBtn}
          title={t("magazine:audio.shareTitle")}
          onClick={share}
        >
          <svg viewBox="0 0 24 24">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          title={t("magazine:audio.castTitle")}
          onClick={onCast}
        >
          <svg viewBox="0 0 24 24">
            <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
            <line x1="2" y1="20" x2="2.01" y2="20" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function AudioPlayerMain({ player }: { player: AudioPlayer }) {
  const { t } = useTranslation();
  const [castOpen, setCastOpen] = useState(false);
  const [sleepOpen, setSleepOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const seekFromEvent = (clientX: number) => {
    const el = barRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    player.seekFraction((clientX - rect.left) / rect.width);
  };

  const pct = (player.currentTime / player.duration) * 100;

  return (
    <>
      <PlayerTopbar onCast={() => setCastOpen(true)} />

      <main className={styles.wrap}>
        <div className={styles.cover}>The Back Room · cover art</div>
        <div className={styles.info}>
          <div className={styles.show}>
            <Link to={SHOW}>The Back Room</Link> · Episode <em>34</em>
          </div>
          <h1 className={styles.title}>
            Dr. Inês Pereira on <em>fifteen minutes of someone else's time.</em>
          </h1>
          <p className={styles.guest}>
            In conversation with{" "}
            <Link to={MEMBER}>
              <b>Catarina Vaz</b>
            </Link>{" "}
            · recorded 6 May at Café Beirão · 52 min
          </p>

          <div>
            <div
              ref={barRef}
              className={styles.bar}
              role="slider"
              tabIndex={0}
              aria-label={t("magazine:audio.seekAriaLabel")}
              aria-valuemin={0}
              aria-valuemax={player.duration}
              aria-valuenow={Math.floor(player.currentTime)}
              onClick={(e) => seekFromEvent(e.clientX)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  player.nudge(5);
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  player.nudge(-5);
                }
              }}
            >
              <div className={styles.barFill} style={{ width: `${pct}%` }} />
            </div>
            <div className={styles.times}>
              <span>
                <b>{secToTime(player.currentTime)}</b>
              </span>
              <span>{secToTime(player.duration)}</span>
            </div>
          </div>

          <PlayerTransport player={player} />

          <PlayerSecondary player={player} onSleep={() => setSleepOpen(true)} />
        </div>
      </main>

      {castOpen && <CastModal onClose={() => setCastOpen(false)} />}
      {sleepOpen && (
        <SleepTimerModal
          active={player.sleepRemaining}
          onClose={() => setSleepOpen(false)}
          onPick={player.startSleep}
          onCancel={player.cancelSleep}
        />
      )}
    </>
  );
}
