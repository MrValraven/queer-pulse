// queerpulse/src/features/admin/AdminGovernancePrinciplesEditor.tsx
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
  PrincipleDTO,
} from "./api/adminGovernanceOverview.api";
import styles from "./AdminGovernancePage.module.css";

const PRINCIPLE_KEYS = [
  "noSellingData",
  "visibilityChoice",
  "noAlgorithms",
  "communityVoice",
  "transparency",
  "accessNotConditional",
] as const;

const PRINCIPLE_ICONS = [
  "lock",
  "eye",
  "slash",
  "message",
  "book",
  "accessible",
] as const;

export function AdminGovernancePrinciplesEditor({
  rows,
  meta,
}: {
  rows: PrincipleDTO[];
  meta: AdminOverviewSectionMeta;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const update = useUpdateAdminOverview();
  const [draft, setDraft] = useState<PrincipleDTO[]>(rows);

  const { containerRef, draggingIndex, gripHandlers } = useRowDragReorder(
    (from, to) => setDraft((prev) => reorder(prev, from, to)),
  );

  const dirty = JSON.stringify(draft) !== JSON.stringify(rows);

  const patch = (index: number, partial: Partial<PrincipleDTO>): void => {
    setDraft((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...partial } : row)),
    );
  };

  const onRemove = (index: number): void => {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const availableKeys = PRINCIPLE_KEYS.filter(
    (key) => !draft.some((row) => row.key === key),
  );
  const onAdd = (): void => {
    const nextKey = availableKeys[0];
    if (!nextKey) return;
    setDraft((prev) => [...prev, { key: nextKey, icon: PRINCIPLE_ICONS[0] }]);
  };

  const onSave = () => {
    if (!dirty) {
      showToast(t("admin:governance.overview.edit.noChanges"), "info");
      return;
    }
    update.mutate(
      { principles: draft },
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
              i18nKey="admin:governance.overview.principles.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.cardSub}>
            {t("admin:governance.overview.principles.sub")}
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
              {t(`admin:governance.overview.principles.key.${row.key}`)}
            </span>
            <div className={styles.ovField}>
              <label
                className={styles.ovFieldLabel}
                id={`principle-icon-${index}`}
              >
                {t("admin:governance.overview.principles.field.icon")}
              </label>
              <Select
                labelledBy={`principle-icon-${index}`}
                value={row.icon}
                onChange={(value) => patch(index, { icon: value ?? row.icon })}
                options={PRINCIPLE_ICONS.map((icon) => ({
                  value: icon,
                  label: t(`admin:governance.overview.principles.icon.${icon}`),
                }))}
              />
            </div>
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
