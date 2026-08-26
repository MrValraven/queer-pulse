import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { OverviewEditedBadge } from "./OverviewEditedBadge";
import { OverviewEditorRow } from "./OverviewEditorRow";
import { useOverviewRowReorder } from "./useOverviewRowReorder";
import { useUpdateAdminOverview } from "./api/useAdminGovernanceOverview";
import type {
  AdminOverviewSectionMeta,
  DecisionDTO,
} from "./api/adminGovernanceOverview.api";
import styles from "./AdminGovernancePage.module.css";

const DECISION_KEYS = [
  "slidingScale",
  "forumLaunched",
  "visibilityDefaults",
  "languageToggle",
] as const;

export function AdminGovernanceDecisionsEditor({
  rows,
  meta,
}: {
  rows: DecisionDTO[];
  meta: AdminOverviewSectionMeta;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const update = useUpdateAdminOverview();
  const [draft, setDraft] = useState<DecisionDTO[]>(rows);

  const { containerRef, rowProps, announcement } = useOverviewRowReorder(
    draft,
    setDraft,
  );

  const dirty = JSON.stringify(draft) !== JSON.stringify(rows);

  const onRemove = (index: number): void => {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const availableKeys = DECISION_KEYS.filter(
    (key) => !draft.some((row) => row.key === key),
  );
  const onAdd = (): void => {
    const nextKey = availableKeys[0];
    if (!nextKey) return;
    setDraft((prev) => [...prev, { key: nextKey }]);
  };

  const onSave = () => {
    if (!dirty) {
      showToast(t("admin:governance.overview.edit.noChanges"), "info");
      return;
    }
    update.mutate(
      { decisions: draft },
      {
        onSuccess: () =>
          showToast(t("admin:governance.overview.edit.saved"), "success"),
        onError: () =>
          showToast(t("admin:governance.overview.edit.error"), "error"),
      },
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.ovSectionHead}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>
            <Translation
              i18nKey="admin:governance.overview.decisions.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.cardSub}>
            {t("admin:governance.overview.decisions.sub")}
          </p>
        </div>
        <OverviewEditedBadge meta={meta} />
      </div>

      <div className={styles.ovList} ref={containerRef}>
        {draft.map((row, index) => (
          <OverviewEditorRow
            key={row.key}
            {...rowProps(
              index,
              t(`admin:governance.overview.decisions.key.${row.key}`),
            )}
            onRemove={() => onRemove(index)}
          >
            <span className={styles.editLineLabel}>
              {t(`admin:governance.overview.decisions.key.${row.key}`)}
            </span>
          </OverviewEditorRow>
        ))}
      </div>
      {/* Polite live region for the row move buttons: a drag is visible,
          a button press is not, so the row's new position is spoken. */}
      <p className="visuallyHidden" role="status" aria-live="polite">
        {announcement}
      </p>

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
        <span />
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
