// queerpulse/src/features/admin/AdminGovernancePrinciplesEditor.tsx
import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminGovernancePrincipleRow } from "./AdminGovernancePrincipleRow";
import {
  EMPTY_AUTHORED_TEXT,
  hasIncompleteAuthoredText,
  PRINCIPLE_ICONS,
  principleRowLabel,
  SEEDED_PRINCIPLE_KEYS,
} from "./adminGovernanceOverviewRows.utils";
import { OverviewEditedBadge } from "./OverviewEditedBadge";
import { OverviewEditorRow } from "./OverviewEditorRow";
import { useOverviewRowReorder } from "./useOverviewRowReorder";
import { useUpdateAdminOverview } from "./api/useAdminGovernanceOverview";
import type {
  AdminOverviewSectionMeta,
  PrincipleDTO,
} from "./api/adminGovernanceOverview.api";
import styles from "./AdminGovernancePage.module.css";

/** PRD-265. The platform principles, editable — including principles nobody
 *  had written when the bundle shipped. */
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

  const { containerRef, rowProps, announcement } = useOverviewRowReorder(
    draft,
    setDraft,
  );

  const dirty = JSON.stringify(draft) !== JSON.stringify(rows);

  const patch = (index: number, partial: Partial<PrincipleDTO>): void => {
    setDraft((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...partial } : row,
      ),
    );
  };

  const onRemove = (index: number): void => {
    setDraft((previous) =>
      previous.filter((_, rowIndex) => rowIndex !== index),
    );
  };

  const availableKeys = SEEDED_PRINCIPLE_KEYS.filter(
    (key) => !draft.some((row) => row.key === key),
  );

  const onAddAuthored = (): void => {
    setDraft((previous) => [
      ...previous,
      {
        title: EMPTY_AUTHORED_TEXT,
        text: EMPTY_AUTHORED_TEXT,
        icon: PRINCIPLE_ICONS[0],
      },
    ]);
  };

  const onRestoreSeeded = (): void => {
    const nextKey = availableKeys[0];
    if (!nextKey) return;
    setDraft((previous) => [
      ...previous,
      { key: nextKey, icon: PRINCIPLE_ICONS[0] },
    ]);
  };

  const hasIncompleteAuthoredRow = draft.some(
    (row) => !row.key && hasIncompleteAuthoredText([row.title, row.text]),
  );

  const onSave = () => {
    if (!dirty) {
      showToast(t("admin:governance.overview.edit.noChanges"), "info");
      return;
    }
    if (hasIncompleteAuthoredRow) {
      showToast(
        t("admin:governance.overview.edit.needsBothLanguages"),
        "error",
      );
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
            key={index}
            {...rowProps(index, principleRowLabel(row, t))}
            onRemove={() => onRemove(index)}
          >
            <AdminGovernancePrincipleRow
              row={row}
              index={index}
              onPatch={(partial) => patch(index, partial)}
            />
          </OverviewEditorRow>
        ))}
      </div>
      {/* Polite live region for the row move buttons: a drag is visible,
          a button press is not, so the row's new position is spoken. */}
      <p className="visuallyHidden" role="status" aria-live="polite">
        {announcement}
      </p>

      <div className={styles.ovAddRow}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddAuthored}
          className={styles.ovAddBtn}
        >
          {t("admin:governance.overview.principles.addPrinciple")}
        </Button>
        {availableKeys.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRestoreSeeded}
            className={styles.ovAddBtn}
          >
            {t("admin:governance.overview.edit.restoreSeeded")}
          </Button>
        )}
      </div>

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
