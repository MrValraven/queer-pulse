import { FiClock } from "react-icons/fi";
import { Badge } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { AdminOverviewSectionMeta } from "./api/adminGovernanceOverview.api";
import styles from "./AdminGovernancePage.module.css";

/** A small pill showing who last edited this section and when, or that it
 *  has never been edited. Adapts `FinanceSourceBadge`'s icon+word pattern to
 *  the simpler two-state shape overview sections need (no seeded/manual/
 *  computed provenance — just "edited" or "not yet"). */
export function OverviewEditedBadge({
  meta,
}: {
  meta: AdminOverviewSectionMeta;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  if (!meta.editedAt || !meta.editor) {
    return (
      <span className={styles.sourceBadge}>
        <Badge tone="ghost">
          <FiClock aria-hidden className={styles.sourceBadgeIco} />
          {t("admin:governance.overview.badge.neverEdited")}
        </Badge>
      </span>
    );
  }

  const name = `${meta.editor.firstName} ${meta.editor.lastName}`.trim();
  return (
    <span className={styles.sourceBadge}>
      <Badge tone="jade">
        <FiClock aria-hidden className={styles.sourceBadgeIco} />
        {t("admin:governance.overview.badge.editedBy", {
          name,
          date: fmt.date(new Date(meta.editedAt)),
        })}
      </Badge>
    </span>
  );
}
