import { AdminGovernanceAuthoredText } from "./AdminGovernanceAuthoredText";
import {
  EMPTY_AUTHORED_TEXT,
  LONG_TEXT_MAX_LENGTH,
  SHORT_TEXT_MAX_LENGTH,
} from "./adminGovernanceOverviewRows.utils";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { DecisionDTO } from "./api/adminGovernanceOverview.api";
import styles from "./AdminGovernancePage.module.css";

/**
 * PRD-265. The editable body of one decision-log row.
 *
 * A SEEDED row shows its catalog label and nothing else: its EN and PT live in
 * the bundle, so there is nothing here to type. An AUTHORED row shows the two
 * language pairs the editor owns. Both forms sit in the same list and reorder
 * together, which is the point — the public decision log is one record, not a
 * bundle section followed by an "extras" section.
 */
export function AdminGovernanceDecisionRow({
  row,
  index,
  onPatch,
}: {
  row: DecisionDTO;
  index: number;
  onPatch: (partial: Partial<DecisionDTO>) => void;
}) {
  const { t } = useTranslation();

  if (row.key) {
    return (
      <span className={styles.editLineLabel}>
        {t(`admin:governance.overview.decisions.key.${row.key}`)}
      </span>
    );
  }

  return (
    <>
      <AdminGovernanceAuthoredText
        idPrefix={`decision-lead-${index}`}
        label={t("admin:governance.overview.decisions.field.lead")}
        value={row.lead ?? EMPTY_AUTHORED_TEXT}
        maxLength={SHORT_TEXT_MAX_LENGTH}
        onChange={(lead) => onPatch({ lead })}
      />
      <AdminGovernanceAuthoredText
        idPrefix={`decision-body-${index}`}
        label={t("admin:governance.overview.decisions.field.body")}
        value={row.body ?? EMPTY_AUTHORED_TEXT}
        maxLength={LONG_TEXT_MAX_LENGTH}
        isMultiline
        onChange={(body) => onPatch({ body })}
      />
    </>
  );
}
