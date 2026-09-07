import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminGovernanceGridRow } from "./AdminGovernanceGridRow";
import { AdminGovernanceSectionCard } from "./AdminGovernanceSectionCard";
import { PolicyStaticCell } from "./AdminGovernancePolicyCells";
import {
  isPolicyRowChanged,
  type PolicyEditorProps,
} from "./adminGovernancePolicySection.utils";
import { useOverviewRowReorder } from "./useOverviewRowReorder";
import type { ModerationStepDTO } from "./api/adminGovernanceOverview.api";
import styles from "./AdminGovernancePolicy.module.css";

const MODERATION_STEP_KEYS = [
  "reportFiled",
  "review",
  "decision",
  "appeal",
] as const;

const GRID_COLUMNS = "minmax(0, 1fr) minmax(0, 1.7fr)";

/**
 * The moderation steps, in the order they happen.
 *
 * Nothing here is typed: both halves of every step live in the translation
 * bundle, in both languages, and this list controls which of them appear and in
 * what order. The second column shows the sentence members actually read, so
 * reordering is done against the words rather than against four labels.
 */
export function AdminGovernanceModerationEditor({
  rows,
  publishedRows,
  setRows,
  meta,
  isActive,
  isChanged,
}: PolicyEditorProps<ModerationStepDTO>) {
  const { t } = useTranslation();
  const { containerRef, rowProps, announcement } = useOverviewRowReorder(
    rows,
    setRows,
  );

  const availableKeys = MODERATION_STEP_KEYS.filter(
    (key) => !rows.some((row) => row.key === key),
  );

  const columnLabels = {
    step: t("admin:governance.policy.field.step"),
    stepText: t("admin:governance.policy.field.stepText"),
  };

  return (
    <AdminGovernanceSectionCard
      sectionId="moderationSteps"
      title={
        <Translation
          i18nKey="admin:governance.overview.moderation.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("admin:governance.overview.moderation.sub")}
      columns={[columnLabels.step, columnLabels.stepText]}
      gridColumns={GRID_COLUMNS}
      meta={meta}
      isActive={isActive}
      isChanged={isChanged}
      hint={t("admin:governance.policy.hint.wordingInBundle")}
      footer={
        <Button
          variant="ghost"
          size="sm"
          disabled={availableKeys.length === 0}
          onClick={() => {
            const nextKey = availableKeys[0];
            if (!nextKey) return;
            setRows((previous) => [...previous, { key: nextKey }]);
          }}
        >
          {t("admin:governance.policy.add.step")}
        </Button>
      }
    >
      <div ref={containerRef}>
        {rows.map((row, index) => {
          const stepTitle = t(`governance:steps.${row.key}.title`);
          return (
            <AdminGovernanceGridRow
              key={row.key}
              {...rowProps(index, stepTitle)}
              ordinal={index + 1}
              isChanged={isPolicyRowChanged(row, publishedRows[index])}
              onRemove={() =>
                setRows((previous) =>
                  previous.filter((_, rowIndex) => rowIndex !== index),
                )
              }
              lead={<span className={styles.rowName}>{stepTitle}</span>}
            >
              <PolicyStaticCell caption={columnLabels.stepText} isSecondary>
                {t(`governance:steps.${row.key}.text`)}
              </PolicyStaticCell>
            </AdminGovernanceGridRow>
          );
        })}
      </div>
      {/* Polite live region for the move buttons: a drag is visible, a button
          press is not, so the row's new position is spoken. */}
      <p className="visuallyHidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </AdminGovernanceSectionCard>
  );
}
