import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminGovernanceGridRow } from "./AdminGovernanceGridRow";
import { AdminGovernanceSectionCard } from "./AdminGovernanceSectionCard";
import {
  PolicyEmptyCell,
  PolicyNumberCell,
  PolicyReadOnlyCell,
  PolicySelectCell,
  PolicyTextCell,
  PolicyToggleCell,
} from "./AdminGovernancePolicyCells";
import { isPolicyRowChanged } from "./adminGovernancePolicySection.utils";
import type { PolicyEditorProps } from "./adminGovernancePolicySection.utils";
import { useOverviewRowReorder } from "./useOverviewRowReorder";
import {
  HEALTH_TREND_KEYS,
  trendTakesCount,
} from "./adminGovernanceHealthFields.utils";
import type { HealthStatDTO } from "./api/adminGovernanceOverview.api";
import styles from "./AdminGovernancePolicy.module.css";

const HEALTH_KEYS = [
  "activeMembers",
  "retention",
  "reportsFiled",
  "membersRemoved",
  "gatheringsHosted",
  "appealUpheld",
] as const;

const FIGURE_MAX_LENGTH = 20;
const GRID_COLUMNS =
  "minmax(0, 1.5fr) minmax(0, 0.72fr) minmax(0, 1.18fr) minmax(0, 0.6fr) minmax(0, 1fr)";

/** The figures members read first, in the order they read them. */
export function AdminGovernanceHealthEditor({
  rows,
  publishedRows,
  setRows,
  meta,
  isActive,
  isChanged,
}: PolicyEditorProps<HealthStatDTO>) {
  const { t } = useTranslation();
  const { containerRef, rowProps, announcement } = useOverviewRowReorder(
    rows,
    setRows,
  );

  const patch = (index: number, partial: Partial<HealthStatDTO>): void => {
    setRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...partial } : row,
      ),
    );
  };

  // Only the six catalogued stats can be shown, so this list is empty until an
  // admin first removes one: a genuinely new stat needs a figure the backend
  // knows how to produce, which is a code change, not an editor's.
  const availableKeys = HEALTH_KEYS.filter(
    (key) => !rows.some((row) => row.key === key),
  );

  // Named rather than positional: these read as column heads at desk width
  // and as per-cell captions once the head strip is gone, and a cell picking
  // the wrong one of five would be invisible in both.
  const columnLabels = {
    stat: t("admin:governance.policy.field.stat"),
    figure: t("admin:governance.overview.health.field.value"),
    trend: t("admin:governance.overview.health.field.trend"),
    trendCount: t("admin:governance.overview.health.field.trendCount"),
    trendArrow: t("admin:governance.policy.field.trendArrow"),
  };

  return (
    <AdminGovernanceSectionCard
      sectionId="health"
      title={
        <Translation
          i18nKey="admin:governance.overview.health.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("admin:governance.overview.health.sub")}
      columns={[
        columnLabels.stat,
        columnLabels.figure,
        columnLabels.trend,
        columnLabels.trendCount,
        columnLabels.trendArrow,
      ]}
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
            setRows((previous) => [
              ...previous,
              { key: nextKey, n: "", up: false, trendKey: "steady" },
            ]);
          }}
        >
          {t("admin:governance.policy.add.stat")}
        </Button>
      }
    >
      <div ref={containerRef}>
        {rows.map((row, index) => {
          const statLabel = t(
            `admin:governance.overview.health.stat.${row.key}`,
          );
          // COM-4: the backend overwrites this figure with a live account count
          // on every read AND on every save, so a typed number here would be a
          // dead end at best and a misleading one at worst.
          const isLiveFigure = row.key === "activeMembers";
          return (
            <AdminGovernanceGridRow
              key={row.key}
              {...rowProps(index, statLabel)}
              ordinal={index + 1}
              isChanged={isPolicyRowChanged(row, publishedRows[index])}
              onRemove={() =>
                setRows((previous) =>
                  previous.filter((_, rowIndex) => rowIndex !== index),
                )
              }
              lead={<span className={styles.rowName}>{statLabel}</span>}
            >
              {isLiveFigure ? (
                <PolicyReadOnlyCell
                  caption={columnLabels.figure}
                  value={row.n}
                  reason={t(
                    "admin:governance.overview.health.field.valueComputedHint",
                  )}
                />
              ) : (
                <PolicyTextCell
                  caption={columnLabels.figure}
                  ariaLabel={t("admin:governance.policy.aria.figure", {
                    label: statLabel,
                  })}
                  value={row.n}
                  maxLength={FIGURE_MAX_LENGTH}
                  isNumeric
                  onChange={(value) => patch(index, { n: value })}
                />
              )}

              <PolicySelectCell
                caption={columnLabels.trend}
                ariaLabel={t("admin:governance.policy.aria.trend", {
                  label: statLabel,
                })}
                value={row.trendKey}
                options={HEALTH_TREND_KEYS.map((key) => ({
                  value: key,
                  label: t(`admin:governance.overview.health.trend.${key}`),
                }))}
                onChange={(value) => patch(index, { trendKey: value })}
              />

              {trendTakesCount(row.trendKey) ? (
                <PolicyNumberCell
                  caption={columnLabels.trendCount}
                  ariaLabel={t("admin:governance.policy.aria.trendCount", {
                    label: statLabel,
                  })}
                  value={row.trendCount}
                  onChange={(value) => patch(index, { trendCount: value })}
                />
              ) : (
                <PolicyEmptyCell
                  caption={columnLabels.trendCount}
                  reason={t(
                    "admin:governance.overview.health.field.trendCountUnused",
                  )}
                />
              )}

              <PolicyToggleCell
                caption={columnLabels.trendArrow}
                ariaLabel={t("admin:governance.policy.aria.up", {
                  label: statLabel,
                })}
                checked={row.up}
                onText={t("admin:governance.overview.health.field.upOn")}
                offText={t("admin:governance.overview.health.field.upOff")}
                onChange={(checked) => patch(index, { up: checked })}
              />
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
