import { useState } from "react";
import { Button, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { HeadlineTable } from "./AdminGovernanceFinancesHeadlineTable";
import { LedgerTable } from "./AdminGovernanceFinancesLedgerTable";
import {
  SCALAR_KEYS,
  buildUpdateBody,
  countChanges,
  hasRejectedLineAmount,
  isAmountRejected,
  parseNumber,
  toLineDrafts,
  toScalarDrafts,
  type LineDraft,
  type ScalarDrafts,
  type ScalarKey,
} from "./adminGovernanceFinancesEdit.utils";
import { useUpdateAdminFinances } from "./api/useAdminGovernanceFinances";
import type { AdminFinanceLatest } from "./api/adminGovernanceFinances.api";
import styles from "./AdminGovernanceFinancesEdit.module.css";

/**
 * The Finances tab's edit surface: a near-full-screen dialog where every
 * figure is a table row showing what is stored, where it came from, and the
 * new value. Submits only what actually changed (each change flips that
 * figure's provenance to "Edited" and is recorded in the audit trail).
 * Surplus is not editable: it previews live as income minus spending,
 * matching how the backend recomputes it.
 */
export function AdminGovernanceFinancesEdit({
  latest,
  onClose,
}: {
  latest: AdminFinanceLatest;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const update = useUpdateAdminFinances();

  const [scalars, setScalars] = useState<ScalarDrafts>(() =>
    toScalarDrafts(latest),
  );
  const [income, setIncome] = useState<LineDraft[]>(() =>
    toLineDrafts(latest.income),
  );
  const [expense, setExpense] = useState<LineDraft[]>(() =>
    toLineDrafts(latest.expense),
  );
  const [note, setNote] = useState("");

  const drafts = { scalars, income, expense, note };
  const changeCount = countChanges(drafts, latest);
  const surplusPreview =
    (parseNumber(scalars.incomeTotal) ?? 0) -
    (parseNumber(scalars.expenseTotal) ?? 0);

  // Nothing is ever silently dropped: while any figure cannot be read as a
  // number, the cell says so and saving is held back.
  const hasRejectedAmount =
    SCALAR_KEYS.some((key) => isAmountRejected(scalars[key], true)) ||
    hasRejectedLineAmount(income) ||
    hasRejectedLineAmount(expense);

  const setScalar = (key: ScalarKey, value: string): void => {
    setScalars((prev) => ({ ...prev, [key]: value }));
  };
  const patchLine = (
    setLines: typeof setIncome,
    index: number,
    patch: Partial<LineDraft>,
  ): void => {
    setLines((prev) =>
      prev.map((line, lineIndex) =>
        lineIndex === index ? { ...line, ...patch } : line,
      ),
    );
  };

  const onSave = () => {
    const body = buildUpdateBody(drafts, latest);
    if (Object.keys(body).length === 0) {
      showToast(t("admin:governance.finances.edit.noChanges"), "info");
      onClose();
      return;
    }
    update.mutate(body, {
      onSuccess: () => {
        showToast(t("admin:governance.finances.edit.saved"), "success");
        onClose();
      },
      onError: () => {
        showToast(t("admin:governance.finances.edit.error"), "error");
      },
    });
  };

  return (
    <Modal
      full
      onClose={onClose}
      eyebrow={t("admin:governance.finances.edit.eyebrow")}
      title={
        <Translation
          i18nKey="admin:governance.finances.edit.title"
          components={{ em: <em /> }}
        />
      }
      sub={
        <span className={styles.sub}>
          {t("admin:governance.finances.edit.sub")}
        </span>
      }
      footer={
        <div className={styles.foot}>
          <div className={styles.footStatus} aria-live="polite">
            <span
              className={[
                styles.footCount,
                changeCount > 0 && styles.footCountActive,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {changeCount > 0
                ? t("admin:governance.finances.edit.changes", {
                    count: changeCount,
                  })
                : t("admin:governance.finances.edit.noChangesYet")}
            </span>
            {hasRejectedAmount && (
              <span className={styles.footBlocked} role="alert">
                {t("admin:governance.finances.edit.blockedByAmounts")}
              </span>
            )}
          </div>
          <div className={styles.footActions}>
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={update.isPending}
            >
              {t("admin:governance.finances.edit.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={onSave}
              disabled={update.isPending || hasRejectedAmount}
            >
              {t("admin:governance.finances.edit.save")}
            </Button>
          </div>
        </div>
      }
    >
      <div className={styles.body}>
        <HeadlineTable
          scalars={scalars}
          latest={latest}
          onChange={setScalar}
          surplusPreview={surplusPreview}
        />
        <LedgerTable
          titleKey="governance.finances.edit.section.income"
          lines={income}
          original={latest.income}
          onChange={(index, patch) => patchLine(setIncome, index, patch)}
        />
        <LedgerTable
          titleKey="governance.finances.edit.section.spend"
          lines={expense}
          original={latest.expense}
          onChange={(index, patch) => patchLine(setExpense, index, patch)}
        />

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <label
              htmlFor="finances-edit-reason"
              className={styles.sectionTitle}
            >
              {t("admin:governance.finances.edit.section.note")}
            </label>
          </div>
          <textarea
            id="finances-edit-reason"
            className={styles.reason}
            rows={2}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t("admin:governance.finances.edit.notePlaceholder")}
          />
        </section>
      </div>
    </Modal>
  );
}
