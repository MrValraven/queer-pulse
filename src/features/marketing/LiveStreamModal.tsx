import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useScrollLock } from "../../shared/hooks";
import styles from "./MarketingModal.module.css";

export function LiveStreamModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);
  useScrollLock();

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="liveStreamModalTitle"
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("marketing:liveStream.closeAria")}
        >
          ×
        </button>

        <div className={styles.eye}>{t("marketing:liveStream.eyebrow")}</div>
        <h2 className={styles.title} id="liveStreamModalTitle">
          <Translation
            i18nKey="marketing:liveStream.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.lead}>
          <Translation
            i18nKey="marketing:liveStream.lead"
            components={{ b: <b /> }}
          />
        </p>

        <div className={styles.stage}>
          <span className={styles.liveTag}>
            <span className={styles.liveDot} />
            {playing
              ? t("marketing:liveStream.statusLive")
              : t("marketing:liveStream.statusSoon")}
          </span>
          {!playing && (
            <button
              type="button"
              className={styles.playBtn}
              onClick={() => setPlaying(true)}
              aria-label={t("marketing:liveStream.playAria")}
            >
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M6 4l14 8-14 8z" fill="currentColor" />
              </svg>
            </button>
          )}
          <div className={styles.stageNote}>
            {playing
              ? t("marketing:liveStream.noteStreaming")
              : t("marketing:liveStream.noteSoon")}
          </div>
        </div>

        <div className={styles.foot}>
          <button type="button" className={styles.back} onClick={onClose}>
            {t("marketing:liveStream.backCta")}
          </button>
          <Button size="lg" href="#vote" onClick={onClose}>
            {t("marketing:liveStream.voteInsteadCta")}
          </Button>
        </div>
      </div>
    </div>
  );
}
