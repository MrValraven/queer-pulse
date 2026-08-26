import { FiAlertTriangle, FiCheckCircle, FiInfo } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { riskBand, riskSignalFor } from "./adminHousingListings.data";
import styles from "./AdminHousingListingsPage.module.css";

const BAND_LABEL_KEY = {
  high: "admin:housingListings.risk.band.high",
  medium: "admin:housingListings.risk.band.medium",
  low: "admin:housingListings.risk.band.low",
} as const;

/**
 * The score, as a labelled pill. The band word carries the meaning so the
 * colour is never doing the work alone, and the accessible name says both.
 */
export function RiskScorePill({ score }: { score: number }) {
  const { t } = useTranslation();
  const band = riskBand(score);
  return (
    <span
      className={`${styles.riskPill} ${styles[`riskPill_${band}`]}`}
      title={t("admin:housingListings.risk.scoreTitle")}
    >
      <span className={styles.riskPillScore}>{score}</span>
      <span className={styles.riskPillBand}>{t(BAND_LABEL_KEY[band])}</span>
    </span>
  );
}

/**
 * Every signal that produced the score, named in plain words, with what each
 * one added.
 *
 * This is the reason the console exists rather than a sorted list of numbers.
 * A moderator is deciding whether a real person's home reaches the community,
 * so they get the reasoning, and a listing whose only marks are thinness reads
 * visibly differently from one carrying an off-platform payment ask.
 */
export function RiskSignalList({
  reasons,
  score,
}: {
  reasons: string[];
  score: number;
}) {
  const { t } = useTranslation();

  if (reasons.length === 0) {
    return (
      <p className={styles.riskClean}>
        <FiCheckCircle aria-hidden />
        {t("admin:housingListings.risk.noneRaised")}
      </p>
    );
  }

  return (
    <div className={styles.riskBlock}>
      <h4 className={styles.riskHead}>
        {t("admin:housingListings.risk.heading", {
          count: reasons.length,
          score,
        })}
      </h4>
      <ul className={styles.riskList}>
        {reasons.map((code) => {
          const signal = riskSignalFor(code);
          const isAlert = signal.severity === "alert";
          return (
            <li
              key={code}
              className={`${styles.riskItem} ${
                isAlert ? styles.riskItemAlert : styles.riskItemNote
              }`}
            >
              {isAlert ? (
                <FiAlertTriangle aria-hidden />
              ) : (
                <FiInfo aria-hidden />
              )}
              <span className={styles.riskItemText}>
                {signal.labelKey ? t(signal.labelKey) : code}
              </span>
              {signal.weight > 0 && (
                <span className={styles.riskItemWeight}>
                  {t("admin:housingListings.risk.weight", {
                    weight: signal.weight,
                  })}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
