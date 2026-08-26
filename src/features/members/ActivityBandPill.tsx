import { FiClock } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ACTIVITY_BAND_LABEL_KEY, type ActivityBand } from "./activityBand";
import styles from "./ActivityBandPill.module.css";

/**
 * The one place the "recently active" band is rendered, shared by the directory
 * card and the profile so the two can never drift into saying different things
 * about the same member.
 *
 * Renders NOTHING for a `null` band. That covers a member who opted out and a
 * member the platform has never observed, and both must look identical: a
 * placeholder saying "unknown" would still be a disclosure, and "not active
 * recently" on a member with no stored value would be a claim invented from an
 * absence of data.
 */
export function ActivityBandPill({
  band,
}: {
  band: ActivityBand | null | undefined;
}) {
  const { t } = useTranslation();
  if (!band) return null;
  return (
    <span
      className={[styles.band, band === "dormant" && styles.dormant]
        .filter(Boolean)
        .join(" ")}
    >
      <FiClock aria-hidden />
      {t(ACTIVITY_BAND_LABEL_KEY[band])}
    </span>
  );
}
