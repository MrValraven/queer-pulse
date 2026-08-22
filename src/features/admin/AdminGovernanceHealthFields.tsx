import { Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { HealthStatDTO } from "./api/adminGovernanceOverview.api";
import styles from "./AdminGovernancePage.module.css";

export const HEALTH_TREND_KEYS = [
  "upThisQuarter",
  "steady",
  "allResolved",
  "cocViolations",
  "upVsQ1",
  "ofFiled",
] as const;

/**
 * One health stat's editable fields (value, trend, trend count, direction),
 * rendered inside the row's `OverviewEditorRow` wrapper. `index` only feeds
 * the label/control `id` pairs; the parent binds it into `onPatch`.
 */
export function AdminGovernanceHealthStatFields({
  row,
  index,
  onPatch,
}: {
  row: HealthStatDTO;
  index: number;
  onPatch: (partial: Partial<HealthStatDTO>) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <span className={styles.editLineLabel}>
        {t(`admin:governance.overview.health.stat.${row.key}`)}
      </span>
      <div className={styles.ovField}>
        <label
          className={styles.ovFieldLabel}
          htmlFor={`health-value-${index}`}
        >
          {t("admin:governance.overview.health.field.value")}
        </label>
        {row.key === "activeMembers" ? (
          // Computed live from real account data (COM-4) — the backend
          // overwrites this figure with a live count on every read AND
          // on save, so letting an admin type a number here would be a
          // dead end at best and misleading at worst. Shown read-only
          // instead of hidden, so the row still communicates the
          // current count inline with the rest of the health stats.
          <>
            <output
              id={`health-value-${index}`}
              className={styles.editLineLabel}
            >
              {row.n}
            </output>
            <p className={styles.ovFieldHint}>
              {t("admin:governance.overview.health.field.valueComputedHint")}
            </p>
          </>
        ) : (
          <input
            id={`health-value-${index}`}
            type="text"
            maxLength={20}
            value={row.n}
            onChange={(event) => onPatch({ n: event.target.value })}
          />
        )}
      </div>
      <div className={styles.ovField}>
        <label className={styles.ovFieldLabel} id={`health-trend-${index}`}>
          {t("admin:governance.overview.health.field.trend")}
        </label>
        <Select
          labelledBy={`health-trend-${index}`}
          value={row.trendKey}
          onChange={(value) => onPatch({ trendKey: value ?? row.trendKey })}
          options={HEALTH_TREND_KEYS.map((key) => ({
            value: key,
            label: t(`admin:governance.overview.health.trend.${key}`),
          }))}
        />
      </div>
      <div className={styles.ovField}>
        <label
          className={styles.ovFieldLabel}
          htmlFor={`health-trendcount-${index}`}
        >
          {t("admin:governance.overview.health.field.trendCount")}
        </label>
        <input
          id={`health-trendcount-${index}`}
          type="number"
          min={0}
          value={row.trendCount ?? ""}
          onChange={(event) =>
            onPatch({
              trendCount:
                event.target.value === ""
                  ? undefined
                  : Number(event.target.value),
            })
          }
        />
      </div>
      <label className={styles.ovField}>
        <span className={styles.ovFieldLabel}>
          {t("admin:governance.overview.health.field.up")}
        </span>
        <input
          type="checkbox"
          checked={row.up}
          onChange={(event) => onPatch({ up: event.target.checked })}
        />
      </label>
    </>
  );
}
