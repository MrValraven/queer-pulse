import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { CommunityGovernanceLogDetailsDTO } from "./api/communityGovernanceLog.api";
import { detailLines } from "./communityGovernanceDetailLines";
import styles from "./ModToolsGovernanceLog.module.css";

/**
 * The legible rendering of one entry's allowlisted `details`. Renders nothing
 * when there is nothing to say beyond the action itself, which is every
 * platform action (the server sends those with an empty `details` on purpose)
 * and most lifecycle entries.
 */
export function ModToolsGovernanceLogDetails({
  action,
  details,
}: {
  action: string;
  details: CommunityGovernanceLogDetailsDTO;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const lines = detailLines(
    action,
    details,
    t,
    (iso) => fmt.date(new Date(iso)),
    (value) => fmt.number(value),
  );
  if (lines.length === 0) return null;

  return (
    <dl className={styles.details}>
      {lines.map((line) => (
        <div key={line.key} className={styles.detailRow}>
          <dt className={styles.detailLabel}>{line.label}</dt>
          <dd className={styles.detailValue}>{line.value}</dd>
        </div>
      ))}
    </dl>
  );
}
