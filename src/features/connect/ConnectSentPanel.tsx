import { useEffect, useRef, useState } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AUTO_CLOSE_SECONDS } from "./connectModal.data";
import styles from "./ConnectModal.module.css";

/** Animated success panel that counts down and closes the modal on its own. */
export function ConnectSentPanel({
  firstName,
  onClose,
}: {
  firstName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [secondsLeft, setSecondsLeft] = useState(AUTO_CLOSE_SECONDS);
  // Latest-callback ref: the countdown must be set up exactly once, when the
  // panel mounts. Keying the effect on `onClose` restarted the interval (and
  // reset the text to 6) whenever the callback's identity changed, while the
  // CSS bar — a plain 6s animation that only restarts on remount — kept
  // draining, so the two desynced.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const tick = window.setInterval(() => {
      setSecondsLeft((s) => (s > 1 ? s - 1 : 0));
    }, 1000);
    const done = window.setTimeout(
      () => onCloseRef.current(),
      AUTO_CLOSE_SECONDS * 1000,
    );
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(done);
    };
  }, []);

  return (
    <div className={styles.sent}>
      <div className={styles.tyIcon}>
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            className={styles.tyCheck}
            d="M5 12.5l4 4L19 7"
            stroke="var(--jade)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2>
        <Translation i18nKey="connect:sent.title" components={{ em: <em /> }} />
      </h2>
      <p>{t("connect:sent.body", { name: firstName })}</p>
      <Button size="lg" variant="ghost-dark" onClick={onClose}>
        {t("connect:sent.close")}
      </Button>
      <div className={styles.autoClose} aria-live="polite">
        <span className={styles.autoCloseTrack}>
          <span className={styles.autoCloseBar} />
        </span>
        <span className={styles.autoCloseText}>
          {t("connect:sent.autoClose", { seconds: secondsLeft })}
        </span>
      </div>
    </div>
  );
}
