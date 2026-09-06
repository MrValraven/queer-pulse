import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminGovernanceDecisionRow } from "./AdminGovernanceDecisionRow";
import {
  decisionRowLabel,
  EMPTY_AUTHORED_TEXT,
  hasIncompleteAuthoredText,
  SEEDED_DECISION_KEYS,
} from "./adminGovernanceOverviewRows.utils";
import { OverviewEditedBadge } from "./OverviewEditedBadge";
import { OverviewEditorRow } from "./OverviewEditorRow";
import { useOverviewRowReorder } from "./useOverviewRowReorder";
import { useUpdateAdminOverview } from "./api/useAdminGovernanceOverview";
import type {
  AdminOverviewSectionMeta,
  DecisionDTO,
} from "./api/adminGovernanceOverview.api";
import styles from "./AdminGovernancePage.module.css";

/**
 * PRD-265. The public decision log, editable.
 *
 * Before this, the editor could only toggle the four entries the i18n bundle
 * happened to carry, so the page the platform presents as its accountability
 * record stopped at four decisions and the next real one could not be logged
 * by the people who took it. "Add a decision" now writes a genuinely new entry,
 * in both languages, persisted as data.
 */
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

  const patch = (index: number, partial: Partial<DecisionDTO>): void => {
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

  const availableKeys = SEEDED_DECISION_KEYS.filter(
    (key) => !draft.some((row) => row.key === key),
  );

  /** A new, empty authored entry — the path that no longer needs a deploy. */
  const onAddAuthored = (): void => {
    setDraft((previous) => [
      ...previous,
      { lead: EMPTY_AUTHORED_TEXT, body: EMPTY_AUTHORED_TEXT },
    ]);
  };

  /** Put back a bundle entry that was removed from the list. */
  const onRestoreSeeded = (): void => {
    const nextKey = availableKeys[0];
    if (!nextKey) return;
    setDraft((previous) => [...previous, { key: nextKey }]);
  };

  const hasIncompleteAuthoredRow = draft.some(
    (row) => !row.key && hasIncompleteAuthoredText([row.lead, row.body]),
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
          // Index-keyed, like the council editor: a list that mixes seeded and
          // authored entries has no field that is unique across both.
          <OverviewEditorRow
            key={index}
            {...rowProps(index, decisionRowLabel(row, t))}
            onRemove={() => onRemove(index)}
          >
            <AdminGovernanceDecisionRow
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
          {t("admin:governance.overview.decisions.addDecision")}
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
