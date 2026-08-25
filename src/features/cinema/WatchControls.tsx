import { useState } from "react";
import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./WatchPage.module.css";

/** The resting play-affordance shown in the player screen once the advisory
 * gate is dismissed. */
export function WatchPlayState() {
  const { t } = useTranslation();
  return (
    <div className={styles.playState}>
      <div className={styles.playBtn}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7L8 5z" />
        </svg>
      </div>
      {/* eslint-disable local/no-literal-string -- this film's own title; content per the scope rule */}
      <div className={styles.psTitle}>
        The light <em>between</em> rooms
      </div>
      {/* eslint-enable local/no-literal-string */}
      <div className={styles.psMeta}>
        {t("cinema:watch.controls.pausedStatus", {
          time: "31:44",
          remaining: 60,
        })}
      </div>
    </div>
  );
}

/** The transport bar: scrubber, play/skip controls, CC/AD toggles and the
 * subtitle-language select. */
export function WatchControls({
  cc,
  ad,
  onCcToggle,
  onAdToggle,
}: {
  cc: boolean;
  ad: boolean;
  onCcToggle: () => void;
  onAdToggle: () => void;
}) {
  const { t } = useTranslation();
  const [subtitleLang, setSubtitleLang] = useState("en");
  return (
    <div className={styles.controls}>
      <div className={styles.progress}>
        <div className={styles.progressFill} />
        <div className={styles.cnMarker} style={{ left: "31.1%" }} />
        <div
          className={styles.cnMarker}
          style={{ left: "46.5%", background: "rgba(247,243,238,.3)" }}
        />
        <div
          className={styles.cnMarker}
          style={{ left: "55.2%", background: "rgba(247,243,238,.3)" }}
        />
      </div>
      <div className={styles.controlsRow}>
        <span className={styles.ctrlBtn}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
          >
            <polygon points="19 20 9 12 19 4 19 20" />
            <line x1={5} y1={19} x2={5} y2={5} />
          </svg>
        </span>
        <span className={`${styles.ctrlBtn} ${styles.primary}`}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        </span>
        <span className={styles.ctrlBtn}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
          >
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1={19} y1={5} x2={19} y2={19} />
          </svg>
        </span>
        <span className={styles.ctrlTime}>
          <span className="cur">31:44</span> / 1:32:18
        </span>
        <div className={styles.ctrlSpace} />
        <button
          type="button"
          className={[styles.ctrlPill, cc && styles.ctrlPillOn]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={cc}
          aria-label={t("cinema:watch.controls.ccAria")}
          onClick={onCcToggle}
        >
          {t("cinema:watch.controls.ccToggleLabel")}
        </button>
        <button
          type="button"
          className={[styles.ctrlPill, ad && styles.ctrlPillOn]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={ad}
          aria-label={t("cinema:watch.controls.adAria")}
          onClick={onAdToggle}
        >
          {t("cinema:watch.controls.adToggleLabel")}
        </button>
        <Select
          size="sm"
          label={t("cinema:film.facts.language")}
          value={subtitleLang}
          onChange={(value) => setSubtitleLang(value ?? "en")}
          options={[
            { value: "pt", label: t("cinema:watch.controls.subtitleLang.pt") },
            { value: "en", label: t("cinema:watch.controls.subtitleLang.en") },
            { value: "es", label: t("cinema:watch.controls.subtitleLang.es") },
            {
              value: "none",
              label: t("cinema:watch.controls.subtitleLang.none"),
            },
          ]}
        />
      </div>
    </div>
  );
}
