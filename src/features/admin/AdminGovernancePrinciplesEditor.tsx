import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminGovernanceGridRow } from "./AdminGovernanceGridRow";
import { AdminGovernanceSectionCard } from "./AdminGovernanceSectionCard";
import {
  AdminGovernancePrincipleLead,
  AdminGovernancePrincipleRow,
} from "./AdminGovernancePrincipleRow";
import {
  EMPTY_AUTHORED_TEXT,
  PRINCIPLE_ICONS,
  principleRowLabel,
  SEEDED_PRINCIPLE_KEYS,
} from "./adminGovernanceOverviewRows.utils";
import {
  isPolicyRowChanged,
  type PolicyEditorProps,
} from "./adminGovernancePolicySection.utils";
import { useOverviewRowReorder } from "./useOverviewRowReorder";
import type { PrincipleDTO } from "./api/adminGovernanceOverview.api";

const GRID_COLUMNS = "minmax(0, 1.15fr) minmax(0, 0.9fr) minmax(0, 1.5fr)";

/** PRD-265. The promises the page makes, in the order members read them,
 *  including promises nobody had written when the bundle shipped. */
export function AdminGovernancePrinciplesEditor({
  rows,
  publishedRows,
  setRows,
  meta,
  isActive,
  isChanged,
}: PolicyEditorProps<PrincipleDTO>) {
  const { t } = useTranslation();
  const { containerRef, rowProps, announcement } = useOverviewRowReorder(
    rows,
    setRows,
  );

  const patch = (index: number, partial: Partial<PrincipleDTO>): void => {
    setRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...partial } : row,
      ),
    );
  };

  const availableKeys = SEEDED_PRINCIPLE_KEYS.filter(
    (key) => !rows.some((row) => row.key === key),
  );

  const columnLabels = {
    promise: t("admin:governance.policy.field.promise"),
    icon: t("admin:governance.overview.principles.field.icon"),
    text: t("admin:governance.overview.principles.field.bodyText"),
  };

  return (
    <AdminGovernanceSectionCard
      sectionId="principles"
      title={
        <Translation
          i18nKey="admin:governance.overview.principles.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("admin:governance.overview.principles.sub")}
      columns={[columnLabels.promise, columnLabels.icon, columnLabels.text]}
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
                {
                  title: EMPTY_AUTHORED_TEXT,
                  text: EMPTY_AUTHORED_TEXT,
                  icon: PRINCIPLE_ICONS[0],
                },
              ])
            }
          >
            {t("admin:governance.overview.principles.addPrinciple")}
          </Button>
          {availableKeys.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const nextKey = availableKeys[0];
                if (!nextKey) return;
                setRows((previous) => [
                  ...previous,
                  { key: nextKey, icon: PRINCIPLE_ICONS[0] },
                ]);
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
          // Index-keyed: a list mixing seeded and authored principles has no
          // field that is unique across both.
          <AdminGovernanceGridRow
            key={index}
            {...rowProps(index, principleRowLabel(row, t))}
            ordinal={index + 1}
            isChanged={isPolicyRowChanged(row, publishedRows[index])}
            onRemove={() =>
              setRows((previous) =>
                previous.filter((_, rowIndex) => rowIndex !== index),
              )
            }
            lead={
              <AdminGovernancePrincipleLead
                row={row}
                index={index}
                caption={columnLabels.promise}
                onPatch={(partial) => patch(index, partial)}
              />
            }
          >
            <AdminGovernancePrincipleRow
              row={row}
              index={index}
              columnLabels={columnLabels}
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
