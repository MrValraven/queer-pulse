import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminGovernanceCouncilRow } from "./AdminGovernanceCouncilRow";
import {
  COUNCIL_TINTS,
  councilRowLabel,
  EMPTY_AUTHORED_TEXT,
  hasIncompleteAuthoredText,
  SEEDED_COUNCIL_ROLE_KEYS,
} from "./adminGovernanceOverviewRows.utils";
import { OverviewEditedBadge } from "./OverviewEditedBadge";
import { OverviewEditorRow } from "./OverviewEditorRow";
import { useOverviewRowReorder } from "./useOverviewRowReorder";
import { useUpdateAdminOverview } from "./api/useAdminGovernanceOverview";
import type {
  AdminOverviewSectionMeta,
  CouncilSeatDTO,
} from "./api/adminGovernanceOverview.api";
import styles from "./AdminGovernancePage.module.css";

/**
 * A new seat, with an AUTHORED role (PRD-265): the four role descriptors in
 * the i18n bundle describe the four people who were on the council when it
 * shipped, so a fifth seat that had to reuse one of them was misdescribed.
 */
function makeSeat(): CouncilSeatDTO {
  return {
    name: "",
    initials: "",
    role: EMPTY_AUTHORED_TEXT,
    tint: COUNCIL_TINTS[0],
  };
}

/** A seat that carries one of the four seeded role keys, for putting back a
 *  seeded seat removed by mistake. */
function makeSeededSeat(roleKey: string): CouncilSeatDTO {
  return { name: "", initials: "", roleKey, tint: COUNCIL_TINTS[0] };
}

/** PRD-265. The advisory council, editable — seats and their descriptors. */
export function AdminGovernanceCouncilEditor({
  rows,
  meta,
}: {
  rows: CouncilSeatDTO[];
  meta: AdminOverviewSectionMeta;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const update = useUpdateAdminOverview();
  const [draft, setDraft] = useState<CouncilSeatDTO[]>(rows);
  const [note, setNote] = useState("");

  const { containerRef, rowProps, announcement } = useOverviewRowReorder(
    draft,
    setDraft,
  );

  const dirty = JSON.stringify(draft) !== JSON.stringify(rows);

  const patch = (index: number, partial: Partial<CouncilSeatDTO>): void => {
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

  const availableRoleKeys = SEEDED_COUNCIL_ROLE_KEYS.filter(
    (key) => !draft.some((row) => row.roleKey === key),
  );

  const onAdd = (): void => {
    setDraft((previous) => [...previous, makeSeat()]);
  };

  const onRestoreSeeded = (): void => {
    const nextKey = availableRoleKeys[0];
    if (!nextKey) return;
    setDraft((previous) => [...previous, makeSeededSeat(nextKey)]);
  };

  const hasIncompleteAuthoredRow = draft.some(
    (row) => !row.roleKey && hasIncompleteAuthoredText([row.role]),
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
      { council: draft, note: note.trim() || undefined },
      {
        onSuccess: () => {
          showToast(t("admin:governance.overview.edit.saved"), "success");
          setNote("");
        },
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
              i18nKey="admin:governance.overview.council.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.cardSub}>
            {t("admin:governance.overview.council.sub")}
          </p>
        </div>
        <OverviewEditedBadge meta={meta} />
      </div>

      <div className={styles.ovList} ref={containerRef}>
        {draft.map((row, index) => (
          <OverviewEditorRow
            key={index}
            {...rowProps(index, councilRowLabel(row, t))}
            onRemove={() => onRemove(index)}
          >
            <AdminGovernanceCouncilRow
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
          onClick={onAdd}
          className={styles.ovAddBtn}
        >
          {t("admin:governance.overview.council.addSeat")}
        </Button>
        {availableRoleKeys.length > 0 && (
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
        <div className={styles.ovNote}>
          <label className={styles.ovFieldLabel} htmlFor="council-note">
            {t("admin:governance.overview.edit.section.note")}
          </label>
          <input
            id="council-note"
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
