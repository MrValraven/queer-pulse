import { useState, type ReactNode } from "react";
import { FiCast, FiCheck, FiClock, FiDownload, FiMoon } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  CAST_TARGETS,
  SLEEP_PRESETS,
  TRANSCRIPT,
  buildTranscriptText,
} from "./audioPlayer.data";
import styles from "./AudioPlayerModals.module.css";

function Overlay({
  onClose,
  wide,
  children,
}: {
  onClose: () => void;
  wide?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  useScrollLock();
  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={[styles.modal, wide && styles.modalWide]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("magazine:audio.modal.closeAriaLabel")}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export function CastModal({ onClose }: { onClose: () => void }) {
  const [connected, setConnected] = useState<string | null>(null);
  const { showToast } = useToast();
  const { t } = useTranslation();

  const connect = (id: string, name: string) => {
    setConnected(id);
    showToast(t("magazine:audio.cast.connectedToast", { name }), "success");
  };

  const device = CAST_TARGETS.find((d) => d.id === connected);

  return (
    <Overlay onClose={onClose}>
      {device ? (
        <div className={styles.success}>
          <div className={styles.successIcon}>
            <FiCheck />
          </div>
          <h3 className={styles.title}>
            <Translation
              i18nKey="magazine:audio.cast.streamingTitle"
              components={{ em: <em /> }}
              values={{ name: device.name }}
            />
          </h3>
          <p className={styles.sub}>
            {t("magazine:audio.cast.playingOnDevice", { kind: device.kind })}
          </p>
          <div className={styles.actions} style={{ justifyContent: "center" }}>
            <Button variant="ghost-dark" onClick={() => setConnected(null)}>
              {t("magazine:audio.cast.chooseAnotherCta")}
            </Button>
            <Button variant="ghost-dark" onClick={onClose}>
              {t("magazine:audio.cast.doneCta")}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.eye}>{t("magazine:audio.cast.eyebrow")}</div>
          <h3 className={styles.title}>
            {t("magazine:audio.cast.nearbyDevicesTitle")}
          </h3>
          <p className={styles.sub}>{t("magazine:audio.cast.pickDeviceSub")}</p>
          <div className={styles.list}>
            {CAST_TARGETS.map((d) => (
              <button
                key={d.id}
                type="button"
                className={styles.row}
                onClick={() => connect(d.id, d.name)}
              >
                <span className={styles.rowIcon}>
                  <FiCast />
                </span>
                <span className={styles.rowMain}>
                  <span className={styles.rowName}>{d.name}</span>
                  <span className={styles.rowKind}>{d.kind}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </Overlay>
  );
}

export function SleepTimerModal({
  active,
  onClose,
  onPick,
  onCancel,
}: {
  active: number | null;
  onClose: () => void;
  onPick: (minutes: number) => void;
  onCancel: () => void;
}) {
  return (
    <Overlay onClose={onClose}>
      <div className={styles.eye}>
        <FiMoon style={{ verticalAlign: "-2px", marginRight: 6 }} />
        Sleep timer
      </div>
      <h3 className={styles.title}>Stop playing after…</h3>
      <p className={styles.sub}>
        Playback fades out and pauses when the timer reaches zero.
      </p>
      <div className={styles.presets}>
        {SLEEP_PRESETS.map((m) => (
          <button
            key={m}
            type="button"
            className={styles.preset}
            onClick={() => {
              onPick(m);
              onClose();
            }}
          >
            {m}
            <small>minutes</small>
          </button>
        ))}
      </div>
      {active !== null && (
        <div className={styles.actions} style={{ marginTop: 18 }}>
          <Button
            variant="ghost-dark"
            onClick={() => {
              onCancel();
              onClose();
            }}
          >
            Turn off timer
          </Button>
        </div>
      )}
    </Overlay>
  );
}

export function TranscriptDownloadModal({ onClose }: { onClose: () => void }) {
  const download = () => {
    const blob = new Blob([buildTranscriptText()], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "the-back-room-ep34-transcript.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Overlay onClose={onClose} wide>
      <div className={styles.eye}>
        <FiClock style={{ verticalAlign: "-2px", marginRight: 6 }} />
        Transcript · Episode 34
      </div>
      <h3 className={styles.title}>Preview &amp; download</h3>
      <p className={styles.sub}>
        Full transcript with speaker labels and timestamps.
      </p>
      <div className={styles.preview}>
        {TRANSCRIPT.map((t, i) => (
          <div key={i} className={styles.previewBlock}>
            <div className={styles.previewWho}>
              {t.who} <time>{t.time}</time>
            </div>
            <p>{t.text}</p>
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <Button variant="primary" onClick={download}>
          <FiDownload style={{ verticalAlign: "-2px", marginRight: 7 }} />
          Download .txt
        </Button>
        <Button variant="ghost-dark" onClick={onClose}>
          Close
        </Button>
      </div>
    </Overlay>
  );
}
