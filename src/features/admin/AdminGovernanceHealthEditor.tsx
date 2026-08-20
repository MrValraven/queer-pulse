import { useState } from "react";
import { Button, Select } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useRowDragReorder } from "../subprofiles/useRowDragReorder";
import { OverviewEditedBadge } from "./OverviewEditedBadge";
import { OverviewEditorRow, reorder } from "./OverviewEditorRow";
import { useUpdateAdminOverview } from "./api/useAdminGovernanceOverview";
import type {
  AdminOverviewSectionMeta,
  HealthStatDTO,
} from "./api/adminGovernanceOverview.api";
import styles from "./AdminGovernancePage.module.css";

const HEALTH_KEYS = [
  "activeMembers",
  "retention",
  "reportsFiled",
  "membersRemoved",
  "gatheringsHosted",
  "appealUpheld",
] as const;

const HEALTH_TREND_KEYS = [
  "upThisQuarter",
  "steady",
  "allResolved",
  "cocViolations",
  "upVsQ1",
  "ofFiled",
] as const;

function makeHealthStat(key: string): HealthStatDTO {
  return { key, n: "", up: true, trendKey: HEALTH_TREND_KEYS[0] };
}

export function AdminGovernanceHealthEditor({
  rows,
  meta,
}: {
  rows: HealthStatDTO[];
  meta: AdminOverviewSectionMeta;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const update = useUpdateAdminOverview();
  const [draft, setDraft] = useState<HealthStatDTO[]>(rows);
  const [note, setNote] = useState("");

  const { containerRef, draggingIndex, gripHandlers } = useRowDragReorder(
    (from, to) => setDraft((prev) => reorder(prev, from, to)),
  );

  const dirty = JSON.stringify(draft) !== JSON.stringify(rows);

  const patch = (index: number, partial: Partial<HealthStatDTO>): void => {
    setDraft((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...partial } : row)),
    );
  };

  const onRemove = (index: number): void => {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  };

  // Every currently-shown key is hidden from the "add back" list — there are
  // only six catalog keys total, so this is empty until an admin first
  // removes one (nothing new to add without a code change, per the
  // structure-only-editing decision).
  const availableKeys = HEALTH_KEYS.filter(
    (key) => !draft.some((row) => row.key === key),
  );
  const onAdd = (): void => {
    const nextKey = availableKeys[0];
    if (!nextKey) return;
    setDraft((prev) => [...prev, makeHealthStat(nextKey)]);
  };

  const onSave = () => {
    if (!dirty) {
      showToast(t("admin:governance.overview.edit.noChanges"), "info");
      return;
    }
    update.mutate(
      { health: draft, note: note.trim() || undefined },
      {
        onSuccess: () => {
          showToast(t("admin:governance.overview.edit.saved"), "success");
          setNote("");
        },
        onError: () => {
          showToast(t("admin:governance.overview.edit.error"), "error");
        },
      },
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.ovSectionHead}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>
            <Translation
              i18nKey="admin:governance.overview.health.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.cardSub}>
            {t("admin:governance.overview.health.sub")}
          </p>
        </div>
        <OverviewEditedBadge meta={meta} />
      </div>

      <div className={styles.ovList} ref={containerRef}>
        {draft.map((row, index) => (
          <OverviewEditorRow
            key={row.key}
            gripHandlers={gripHandlers(index)}
            isDragging={draggingIndex === index}
            onRemove={() => onRemove(index)}
          >
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
                  onChange={(event) => patch(index, { n: event.target.value })}
                />
              )}
            </div>
            <div className={styles.ovField}>
              <label
                className={styles.ovFieldLabel}
                id={`health-trend-${index}`}
              >
                {t("admin:governance.overview.health.field.trend")}
              </label>
              <Select
                labelledBy={`health-trend-${index}`}
                value={row.trendKey}
                onChange={(value) =>
                  patch(index, { trendKey: value ?? row.trendKey })
                }
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
                  patch(index, {
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
                onChange={(event) => patch(index, { up: event.target.checked })}
              />
            </label>
          </OverviewEditorRow>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onAdd}
        disabled={availableKeys.length === 0}
        className={styles.ovAddBtn}
      >
        {t("admin:governance.overview.edit.addRow")}
      </Button>

      <div className={styles.ovFooter}>
        <div className={styles.ovNote}>
          <label className={styles.ovFieldLabel} htmlFor="health-note">
            {t("admin:governance.overview.edit.section.note")}
          </label>
          <input
            id="health-note"
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>
        <Button
          variant="primary"
          onClick={onSave}
          disabled={update.isPending || !dirty}
        >
          {t("admin:governance.overview.edit.save")}
        </Button>
      </div>
    </div>
  );
}
