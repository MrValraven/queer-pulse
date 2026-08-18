import { useState } from "react";
import { Button, FormField, Modal, Toggle } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { FinanceSourceBadge } from "./FinanceSourceBadge";
import { useUpdateAdminFinances } from "./api/useAdminGovernanceFinances";
import type {
  AdminFinanceLatest,
  AdminFinLine,
  FinanceLedgerEdit,
  UpdateAdminFinancesBody,
} from "./api/adminGovernanceFinances.api";
import styles from "./AdminGovernancePage.module.css";

/** A ledger row while it is being edited — label is read-only context. */
interface LineDraft {
  label: string;
  amount: string;
  note: string;
  enabled: boolean;
}

function toLineDrafts(lines: AdminFinLine[]): LineDraft[] {
  return lines.map((line) => ({
    label: line.label,
    amount: line.amount,
    note: line.note,
    enabled: line.enabled ?? true,
  }));
}

/** Empty string means "left blank" (skip); a non-finite entry is ignored too. */
function parseNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function ledgerDiff(
  drafts: LineDraft[],
  original: AdminFinLine[],
): FinanceLedgerEdit[] {
  const edits: FinanceLedgerEdit[] = [];
  drafts.forEach((draft, index) => {
    const source = original[index];
    if (!source) return;
    const edit: FinanceLedgerEdit = { index };
    let changed = false;
    if (draft.amount !== source.amount) {
      edit.amount = draft.amount;
      changed = true;
    }
    if (draft.note !== source.note) {
      edit.note = draft.note;
      changed = true;
    }
    if (draft.enabled !== (source.enabled ?? true)) {
      edit.enabled = draft.enabled;
      changed = true;
    }
    if (changed) edits.push(edit);
  });
  return edits;
}

/**
 * The Finances tab's edit dialog. Pre-fills every editable figure, lets an
 * admin correct any of them, and submits only what actually changed (each
 * change flips that figure's provenance to "Edited" and is recorded in the
 * audit trail). Surplus is not editable: it previews live as income minus
 * spending, matching how the backend recomputes it.
 */
export function AdminGovernanceFinancesEdit({
  latest,
  onClose,
}: {
  latest: AdminFinanceLatest;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const update = useUpdateAdminFinances();

  const [mrr, setMrr] = useState(String(latest.mrr));
  const [sustainerCount, setSustainerCount] = useState(
    String(latest.sustainerCount),
  );
  const [solidarityRate, setSolidarityRate] = useState(
    String(latest.solidarityRate),
  );
  const [incomeTotal, setIncomeTotal] = useState(String(latest.incomeTotal));
  const [expenseTotal, setExpenseTotal] = useState(String(latest.expenseTotal));
  const [income, setIncome] = useState<LineDraft[]>(toLineDrafts(latest.income));
  const [expense, setExpense] = useState<LineDraft[]>(
    toLineDrafts(latest.expense),
  );
  const [note, setNote] = useState("");

  const surplusPreview =
    (parseNumber(incomeTotal) ?? 0) - (parseNumber(expenseTotal) ?? 0);

  const buildBody = (): UpdateAdminFinancesBody => {
    const body: UpdateAdminFinancesBody = {};
    const addScalar = (
      key: "mrr" | "sustainerCount" | "solidarityRate" | "incomeTotal" | "expenseTotal",
      raw: string,
      original: number,
    ): void => {
      const parsed = parseNumber(raw);
      if (parsed !== undefined && parsed !== original) body[key] = parsed;
    };
    addScalar("mrr", mrr, latest.mrr);
    addScalar("sustainerCount", sustainerCount, latest.sustainerCount);
    addScalar("solidarityRate", solidarityRate, latest.solidarityRate);
    addScalar("incomeTotal", incomeTotal, latest.incomeTotal);
    addScalar("expenseTotal", expenseTotal, latest.expenseTotal);

    const incomeEdits = ledgerDiff(income, latest.income);
    if (incomeEdits.length > 0) body.income = incomeEdits;
    const expenseEdits = ledgerDiff(expense, latest.expense);
    if (expenseEdits.length > 0) body.expense = expenseEdits;

    if (Object.keys(body).length > 0 && note.trim()) body.note = note.trim();
    return body;
  };

  const onSave = () => {
    const body = buildBody();
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

  const patchLine = (
    setLines: typeof setIncome,
    index: number,
    patch: Partial<LineDraft>,
  ): void => {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    );
  };

  return (
    <Modal
      wide
      onClose={onClose}
      eyebrow={t("admin:governance.finances.edit.eyebrow")}
      title={
        <Translation
          i18nKey="admin:governance.finances.edit.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("admin:governance.finances.edit.sub")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={update.isPending}>
            {t("admin:governance.finances.edit.cancel")}
          </Button>
          <Button variant="primary" onClick={onSave} disabled={update.isPending}>
            {t("admin:governance.finances.edit.save")}
          </Button>
        </>
      }
    >
      <fieldset className={styles.editSection}>
        <legend className={styles.editLegend}>
          {t("admin:governance.finances.edit.section.headline")}
        </legend>
        <div className={styles.editGrid}>
          <NumberField
            label={t("admin:governance.finances.edit.field.mrr")}
            value={mrr}
            onChange={setMrr}
          />
          <NumberField
            label={t("admin:governance.finances.edit.field.sustainerCount")}
            value={sustainerCount}
            onChange={setSustainerCount}
          />
          <NumberField
            label={t("admin:governance.finances.edit.field.solidarityRate")}
            value={solidarityRate}
            onChange={setSolidarityRate}
          />
          <NumberField
            label={t("admin:governance.finances.edit.field.incomeTotal")}
            value={incomeTotal}
            onChange={setIncomeTotal}
          />
          <NumberField
            label={t("admin:governance.finances.edit.field.expenseTotal")}
            value={expenseTotal}
            onChange={setExpenseTotal}
          />
          <FormField
            label={
              <span className={styles.editSurplusLabel}>
                {t("admin:governance.finances.edit.field.surplus")}
                <FinanceSourceBadge source="computed" />
              </span>
            }
            helper={t("admin:governance.finances.edit.field.surplusHint")}
          >
            <output className={styles.editSurplus}>
              {fmt.currency(surplusPreview)}
            </output>
          </FormField>
        </div>
      </fieldset>

      <LedgerEditor
        titleKey="governance.finances.edit.section.income"
        lines={income}
        onChange={(index, patch) => patchLine(setIncome, index, patch)}
      />
      <LedgerEditor
        titleKey="governance.finances.edit.section.spend"
        lines={expense}
        onChange={(index, patch) => patchLine(setExpense, index, patch)}
      />

      <FormField label={t("admin:governance.finances.edit.section.note")}>
        <textarea
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t("admin:governance.finances.edit.notePlaceholder")}
        />
      </FormField>
    </Modal>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <FormField label={label}>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </FormField>
  );
}

function LedgerEditor({
  titleKey,
  lines,
  onChange,
}: {
  titleKey: string;
  lines: LineDraft[];
  onChange: (index: number, patch: Partial<LineDraft>) => void;
}) {
  const { t } = useTranslation();
  return (
    <fieldset className={styles.editSection}>
      <legend className={styles.editLegend}>{t(`admin:${titleKey}`)}</legend>
      <div className={styles.editLines}>
        {lines.map((line, index) => (
          <div
            key={index}
            className={[
              styles.editLineRow,
              !line.enabled && styles.editLineRowDisabled,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className={styles.editLineHead}>
              <span className={styles.editLineLabel}>{line.label}</span>
              <Toggle
                checked={line.enabled}
                onChange={(enabled) => onChange(index, { enabled })}
                label={t("admin:governance.finances.edit.field.lineEnabled", {
                  label: line.label,
                })}
              />
            </div>
            {!line.enabled && (
              <p className={styles.editLineHint}>
                {t("admin:governance.finances.edit.field.lineDisabledHint")}
              </p>
            )}
            <div className={styles.editLineFields}>
              <FormField
                label={t("admin:governance.finances.edit.field.lineAmount")}
                className={styles.editLineAmount}
              >
                <input
                  type="text"
                  value={line.amount}
                  disabled={!line.enabled}
                  onChange={(event) =>
                    onChange(index, { amount: event.target.value })
                  }
                />
              </FormField>
              <FormField
                label={t("admin:governance.finances.edit.field.lineNote")}
                className={styles.editLineNote}
              >
                <input
                  type="text"
                  value={line.note}
                  disabled={!line.enabled}
                  onChange={(event) =>
                    onChange(index, { note: event.target.value })
                  }
                />
              </FormField>
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
