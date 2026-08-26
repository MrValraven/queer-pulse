import { FiAlertTriangle, FiCheckCircle, FiInfo } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminChip } from "./ui";
import {
  GROUP_LISTING_RISK_SEVERITY,
  groupListingRiskBand,
} from "./adminHousingGroupListings.data";
import styles from "./AdminHousingGroupListingsPage.module.css";

const BAND_LABEL_KEY = {
  high: "admin:groupListingQueue.risk.band.high",
  medium: "admin:groupListingQueue.risk.band.medium",
  low: "admin:groupListingQueue.risk.band.low",
} as const;

/**
 * The score, as a labelled pill. The band word carries the meaning, so the
 * colour is never doing the work alone and the pill reads the same in
 * grayscale.
 */
export function GroupListingRiskPill({ score }: { score: number }) {
  const { t } = useTranslation();
  const band = groupListingRiskBand(score);
  return (
    <span
      className={`${styles.riskPill} ${styles[`riskPill_${band}`]}`}
      title={t("admin:groupListingQueue.risk.scoreTitle")}
    >
      <span className={styles.riskPillScore}>{score}</span>
      <span className={styles.riskPillBand}>{t(BAND_LABEL_KEY[band])}</span>
    </span>
  );
}

/**
 * Every signal behind the score, named in plain words.
 *
 * This is why the console exists rather than a sorted column of numbers: a
 * moderator is deciding whether a real person's room reaches the community, so
 * they get the reasoning. A listing whose only marks are thinness reads
 * visibly differently from one carrying an off-platform payment ask.
 *
 * An unrecognised code renders as itself, so a new backend signal shows up
 * rather than quietly disappearing from the list.
 */
export function GroupListingRiskReasons({ reasons }: { reasons: string[] }) {
  const { t } = useTranslation();

  if (reasons.length === 0) {
    return (
      <p className={styles.posterMeta}>
        <FiCheckCircle aria-hidden />{" "}
        {t("admin:groupListingQueue.risk.noneRaised")}
      </p>
    );
  }

  return (
    <ul
      className={styles.riskList}
      aria-label={t("admin:groupListingQueue.risk.listLabel")}
    >
      {reasons.map((code) => {
        const isAlert = GROUP_LISTING_RISK_SEVERITY[code] === "alert";
        const labelKey = `admin:groupListingQueue.risk.reason.${code}`;
        const label = t(labelKey);
        return (
          <li key={code}>
            <AdminChip tone={isAlert ? "danger" : "amber"}>
              {isAlert ? (
                <FiAlertTriangle aria-hidden />
              ) : (
                <FiInfo aria-hidden />
              )}{" "}
              {label === labelKey ? code : label}
            </AdminChip>
          </li>
        );
      })}
    </ul>
  );
}
