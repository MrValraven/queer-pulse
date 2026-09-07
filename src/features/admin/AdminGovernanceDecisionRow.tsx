import {
  PolicyAuthoredCell,
  PolicyStaticCell,
} from "./AdminGovernancePolicyCells";
import {
  EMPTY_AUTHORED_TEXT,
  LONG_TEXT_MAX_LENGTH,
  SHORT_TEXT_MAX_LENGTH,
} from "./adminGovernanceOverviewRows.utils";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { DecisionDTO } from "./api/adminGovernanceOverview.api";

/**
 * PRD-265. The lead sentence of one decision-log entry: the first column.
 *
 * A SEEDED entry shows the words members read and nothing to type — its EN and
 * PT are in the bundle. An AUTHORED entry carries the editor's own pair. Both
 * forms sit in the same list and reorder together, which is the point: the
 * public decision log is one record, not a bundle section followed by extras.
 */
export function AdminGovernanceDecisionLead({
  row,
  index,
  caption,
  onPatch,
}: {
  row: DecisionDTO;
  index: number;
  caption: string;
  onPatch: (partial: Partial<DecisionDTO>) => void;
}) {
  const { t } = useTranslation();

  if (row.key) {
    return (
      <PolicyStaticCell caption={caption}>
        {t(`governance:decisions.${row.key}.lead`)}
      </PolicyStaticCell>
    );
  }
  return (
    <PolicyAuthoredCell
      idPrefix={`decision-lead-${index}`}
      caption={caption}
      label={t("admin:governance.overview.decisions.field.lead")}
      value={row.lead ?? EMPTY_AUTHORED_TEXT}
      maxLength={SHORT_TEXT_MAX_LENGTH}
      onChange={(lead) => onPatch({ lead })}
    />
  );
}

/** The rest of one decision-log entry: who asked, and how it was decided. */
export function AdminGovernanceDecisionRow({
  row,
  index,
  caption,
  onPatch,
}: {
  row: DecisionDTO;
  index: number;
  caption: string;
  onPatch: (partial: Partial<DecisionDTO>) => void;
}) {
  const { t } = useTranslation();

  if (row.key) {
    return (
      <PolicyStaticCell caption={caption} isSecondary>
        {t(`governance:decisions.${row.key}.body`)}
      </PolicyStaticCell>
    );
  }
  return (
    <PolicyAuthoredCell
      idPrefix={`decision-body-${index}`}
      caption={caption}
      label={t("admin:governance.overview.decisions.field.body")}
      value={row.body ?? EMPTY_AUTHORED_TEXT}
      maxLength={LONG_TEXT_MAX_LENGTH}
      isMultiline
      onChange={(body) => onPatch({ body })}
    />
  );
}
