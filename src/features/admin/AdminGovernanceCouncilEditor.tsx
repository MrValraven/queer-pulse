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
  CouncilSeatDTO,
} from "./api/adminGovernanceOverview.api";
import styles from "./AdminGovernancePage.module.css";

const COUNCIL_ROLE_KEYS = [
  "psychologistChair",
  "lawyerLegalAdvisor",
  "housingActivist",
  "healthcareAdvocate",
] as const;

const COUNCIL_TINTS = ["jade", "violet", "plum"] as const;

function makeSeat(): CouncilSeatDTO {
  return {
    name: "",
    initials: "",
    roleKey: COUNCIL_ROLE_KEYS[0],
    tint: COUNCIL_TINTS[0],
  };
}

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

  const { containerRef, draggingIndex, gripHandlers } = useRowDragReorder(
    (from, to) => setDraft((prev) => reorder(prev, from, to)),
  );

  const dirty = JSON.stringify(draft) !== JSON.stringify(rows);

  const patch = (index: number, partial: Partial<CouncilSeatDTO>): void => {
    setDraft((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...partial } : row)),
    );
  };

  const onRemove = (index: number): void => {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const onAdd = (): void => {
    setDraft((prev) => [...prev, makeSeat()]);
  };

  const onSave = () => {
    if (!dirty) {
      showToast(t("admin:governance.overview.edit.noChanges"), "info");
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
            gripHandlers={gripHandlers(index)}
            isDragging={draggingIndex === index}
            onRemove={() => onRemove(index)}
          >
            <div className={styles.ovField}>
              <label
                className={styles.ovFieldLabel}
                htmlFor={`council-name-${index}`}
              >
                {t("admin:governance.overview.council.field.name")}
              </label>
              <input
                id={`council-name-${index}`}
                type="text"
                maxLength={80}
                value={row.name}
                onChange={(event) => patch(index, { name: event.target.value })}
              />
            </div>
            <div className={styles.ovField}>
              <label
                className={styles.ovFieldLabel}
                htmlFor={`council-initials-${index}`}
              >
                {t("admin:governance.overview.council.field.initials")}
              </label>
              <input
                id={`council-initials-${index}`}
                type="text"
                maxLength={4}
                value={row.initials}
                onChange={(event) =>
                  patch(index, { initials: event.target.value })
                }
              />
            </div>
            <div className={styles.ovField}>
              <label className={styles.ovFieldLabel} id={`council-role-${index}`}>
                {t("admin:governance.overview.council.field.role")}
              </label>
              <Select
                labelledBy={`council-role-${index}`}
                value={row.roleKey}
                onChange={(value) =>
                  patch(index, { roleKey: value ?? row.roleKey })
                }
                options={COUNCIL_ROLE_KEYS.map((key) => ({
                  value: key,
                  label: t(`admin:governance.overview.council.role.${key}`),
                }))}
              />
            </div>
            <div className={styles.ovField}>
              <label className={styles.ovFieldLabel} id={`council-tint-${index}`}>
                {t("admin:governance.overview.council.field.tint")}
              </label>
              <Select
                labelledBy={`council-tint-${index}`}
                value={row.tint}
                onChange={(value) =>
                  patch(index, {
                    tint: (value ?? row.tint) as CouncilSeatDTO["tint"],
                  })
                }
                options={COUNCIL_TINTS.map((tint) => ({
                  value: tint,
                  label: t(`admin:governance.overview.council.tint.${tint}`),
                }))}
              />
            </div>
          </OverviewEditorRow>
        ))}
      </div>

      <Button variant="ghost" size="sm" onClick={onAdd} className={styles.ovAddBtn}>
        {t("admin:governance.overview.council.addSeat")}
      </Button>

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
