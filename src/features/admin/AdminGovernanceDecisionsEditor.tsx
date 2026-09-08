import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminGovernanceGridRow } from "./AdminGovernanceGridRow";
import { AdminGovernanceSectionCard } from "./AdminGovernanceSectionCard";
import {
  AdminGovernanceDecisionLead,
  AdminGovernanceDecisionRow,
} from "./AdminGovernanceDecisionRow";
import {
  decisionRowLabel,
  EMPTY_AUTHORED_TEXT,
  SEEDED_DECISION_KEYS,
} from "./adminGovernanceOverviewRows.utils";
import {
  isPolicyRowChanged,
  type PolicyEditorProps,
} from "./adminGovernancePolicySection.utils";
import { useOverviewRowReorder } from "./useOverviewRowReorder";
import type { DecisionDTO } from "./api/adminGovernanceOverview.api";

const GRID_COLUMNS = "minmax(0, 1fr) minmax(0, 1.6fr)";

/**
 * PRD-265. The public decision log: what changed, why, and who asked for it.
 *
 * Before PRD-265 this could only toggle the four entries the bundle happened to
 * carry, so the page the platform presents as its accountability record stopped
 * at four decisions and the next real one could not be logged by the people who
 * took it. "Log a decision" writes a genuinely new entry, in both languages.
 */
export function AdminGovernanceDecisionsEditor({
  rows,
  publishedRows,
  setRows,
  meta,
  isActive,
  isChanged,
}: PolicyEditorProps<DecisionDTO>) {
  const { t } = useTranslation();
  const { containerRef, rowProps, announcement } = useOverviewRowReorder(
    rows,
    setRows,
  );

  const patch = (index: number, partial: Partial<DecisionDTO>): void => {
    setRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...partial } : row,
      ),
    );
  };

  const availableKeys = SEEDED_DECISION_KEYS.filter(
    (key) => !rows.some((row) => row.key === key),
  );

  const columnLabels = {
    lead: t("admin:governance.overview.decisions.field.lead"),
    body: t("admin:governance.overview.decisions.field.body"),
  };

  return (
    <AdminGovernanceSectionCard
      sectionId="decisions"
      title={
        <Translation
          i18nKey="admin:governance.overview.decisions.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("admin:governance.overview.decisions.sub")}
      columns={[columnLabels.lead, columnLabels.body]}
      gridColumns={GRID_COLUMNS}
      meta={meta}
      isActive={isActive}
      isChanged={isChanged}
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setRows((previous) => [
                ...previous,
                { lead: EMPTY_AUTHORED_TEXT, body: EMPTY_AUTHORED_TEXT },
              ])
            }
          >
            {t("admin:governance.overview.decisions.addDecision")}
          </Button>
          {availableKeys.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const nextKey = availableKeys[0];
                if (!nextKey) return;
                setRows((previous) => [...previous, { key: nextKey }]);
              }}
            >
              {t("admin:governance.overview.edit.restoreSeeded")}
            </Button>
          )}
        </>
      }
    >
      <div ref={containerRef}>
        {rows.map((row, index) => (
          // Index-keyed: a list mixing seeded and authored entries has no field
          // that is unique across both.
          <AdminGovernanceGridRow
            key={index}
            {...rowProps(index, decisionRowLabel(row, t))}
            ordinal={index + 1}
            isChanged={isPolicyRowChanged(row, publishedRows[index])}
            onRemove={() =>
              setRows((previous) =>
                previous.filter((_, rowIndex) => rowIndex !== index),
              )
            }
            lead={
              <AdminGovernanceDecisionLead
                row={row}
                index={index}
                caption={columnLabels.lead}
                onPatch={(partial) => patch(index, partial)}
              />
            }
          >
            <AdminGovernanceDecisionRow
              row={row}
              index={index}
              caption={columnLabels.body}
              onPatch={(partial) => patch(index, partial)}
            />
          </AdminGovernanceGridRow>
        ))}
      </div>
      {/* Polite live region for the move buttons: a drag is visible, a button
          press is not, so the row's new position is spoken. */}
      <p className="visuallyHidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </AdminGovernanceSectionCard>
  );
}
