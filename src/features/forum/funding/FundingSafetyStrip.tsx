import { FiShield } from "react-icons/fi";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { LISBON_TIME_ZONE } from "./funding.data";
import styles from "./FundingFacts.module.css";

/** Who holds the money, and when a moderator last checked the fundraiser. */
export function FundingSafetyStrip({
  host,
  approvedAt,
}: {
  host: string;
  approvedAt: string | null;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <p className={styles.strip}>
      <FiShield aria-hidden className={styles.stripIcon} />
      <span>
        {approvedAt
          ? t("forum:funding.ask.safetyStrip", {
              host,
              date: fmt.date(new Date(approvedAt), {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: LISBON_TIME_ZONE,
              }),
            })
          : t("forum:funding.ask.safetyStripPending", { host })}
      </span>
    </p>
  );
}
