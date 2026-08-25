import { useState } from "react";
import { Button, FormField, Modal, Toggle } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { FinanceSourceBadge } from "./FinanceSourceBadge";
import { parseAmountInput, toCanonicalAmount } from "./adminFinanceAmount";
import { useUpdateAdminFinances } from "./api/useAdminGovernanceFinances";
import type {
  AdminFinanceLatest,
  AdminFinLine,
  FinanceLedgerEdit,
  UpdateAdminFinancesBody,
} from "./api/adminGovernanceFinances.api";
import styles from "./AdminGovernancePage.module.css";

/** The editable headline figures, in the order they appear in the dialog.
 *  Every one of them is also a key on `AdminFinanceLatest` and on the update
 *  payload, which is what lets the diff loop below stay generic. */
const SCALAR_KEYS = [
  "mrr",
  "sustainerCount",
  "solidarityRate",
  "incomeTotal",
  "expenseTotal",
] as const;

type ScalarKey = (typeof SCALAR_KEYS)[number];

/** Headline figures while they are being edited: raw strings, exactly as
 *  typed, so no notation is thrown away before it can be parsed. */
type ScalarDrafts = Record<ScalarKey, string>;

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

/** Empty string means "left blank" (skip). An unreadable entry never reaches
 *  here: the save button stays disabled while any amount fails to parse, so
 *  a typo is refused out loud rather than dropped from the payload. */
function parseNumber(value: string): number | undefined {
  const parsed = parseAmountInput(value);
  return parsed.status === "ok" ? parsed.value : undefined;
}

/** An amount the admin must fix before saving: unreadable, or (on a row that
 *  is switched on) left empty. */
function isAmountRejected(value: string, isBlankAllowed: boolean): boolean {
  const status = parseAmountInput(value).status;
  return status === "invalid" || (status === "blank" && !isBlankAllowed);
}

function hasRejectedLineAmount(lines: LineDraft[]): boolean {
  return lines.some(
    (line) => line.enabled && isAmountRejected(line.amount, false),
  );
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
    // Amounts are compared as numbers and written back as plain number
    // strings, so re-typing a stored "€1,840" as "1 840" is not recorded as
    // an edit, and what we store carries no locale of its own.
    const draftAmount = parseAmountInput(draft.amount);
    const sourceAmount = parseAmountInput(source.amount);
    if (
      draftAmount.status === "ok" &&
      (sourceAmount.status !== "ok" || draftAmount.value !== sourceAmount.value)
    ) {
      edit.amount = toCanonicalAmount(draftAmount.value);
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
  const { showToast } = useToast();
  const update = useUpdateAdminFinances();

  const [scalars, setScalars] = useState<ScalarDrafts>({
    mrr: String(latest.mrr),
    sustainerCount: String(latest.sustainerCount),
    solidarityRate: String(latest.solidarityRate),
    incomeTotal: String(latest.incomeTotal),
    expenseTotal: String(latest.expenseTotal),
  });
  const [income, setIncome] = useState<LineDraft[]>(
    toLineDrafts(latest.income),
  );
  const [expense, setExpense] = useState<LineDraft[]>(
    toLineDrafts(latest.expense),
  );
  const [note, setNote] = useState("");

  const setScalar = (key: ScalarKey, value: string): void => {
    setScalars((prev) => ({ ...prev, [key]: value }));
  };

  const surplusPreview =
    (parseNumber(scalars.incomeTotal) ?? 0) -
    (parseNumber(scalars.expenseTotal) ?? 0);

  // Nothing is ever silently dropped: while any figure cannot be read as a
  // number, the field says so and saving is held back.
  const hasRejectedAmount =
    SCALAR_KEYS.some((key) => isAmountRejected(scalars[key], true)) ||
    hasRejectedLineAmount(income) ||
    hasRejectedLineAmount(expense);

  const buildBody = (): UpdateAdminFinancesBody => {
    const body: UpdateAdminFinancesBody = {};
    SCALAR_KEYS.forEach((key) => {
      const parsed = parseNumber(scalars[key]);
      if (parsed !== undefined && parsed !== latest[key]) body[key] = parsed;
    });

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
          <Button
            variant="primary"
            onClick={onSave}
            disabled={update.isPending || hasRejectedAmount}
          >
            {t("admin:governance.finances.edit.save")}
          </Button>
        </>
      }
    >
      <FinanceHeadlineFields
        scalars={scalars}
        onChange={setScalar}
        surplusPreview={surplusPreview}
      />

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

      {hasRejectedAmount && (
        <p className={styles.editBlockedNote} role="alert">
          {t("admin:governance.finances.edit.blockedByAmounts")}
        </p>
      )}
    </Modal>
  );
}

/** The five editable headline figures, plus the surplus that is derived from
 *  two of them and so is shown read-only. */
function FinanceHeadlineFields({
  scalars,
  onChange,
  surplusPreview,
}: {
  scalars: ScalarDrafts;
  onChange: (key: ScalarKey, value: string) => void;
  surplusPreview: number;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <fieldset className={styles.editSection}>
      <legend className={styles.editLegend}>
        {t("admin:governance.finances.edit.section.headline")}
      </legend>
      <div className={styles.editGrid}>
        {SCALAR_KEYS.map((key) => (
          <AmountField
            key={key}
            label={t(`admin:governance.finances.edit.field.${key}`)}
            value={scalars[key]}
            onChange={(value) => onChange(key, value)}
          />
        ))}
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
            {fmt.currency(surplusPreview, "EUR")}
          </output>
        </FormField>
      </div>
    </fieldset>
  );
}

/**
 * A money field that accepts whatever notation the admin actually types.
 * `type="text"` is deliberate: a native number input throws away "1.840,50"
 * before React ever sees it, which is how a Portuguese admin used to lose an
 * edit without being told. Parsing and the inline error live here, so the
 * field that is wrong is the field that says so.
 */
function AmountField({
  label,
  value,
  onChange,
  isBlankAllowed = true,
  disabled = false,
  className,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  isBlankAllowed?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const status = parseAmountInput(value).status;
  const isRejected = !disabled && isAmountRejected(value, isBlankAllowed);

  return (
    <FormField
      label={label}
      className={className}
      error={
        isRejected
          ? t(
              status === "blank"
                ? "admin:governance.finances.edit.field.amountRequired"
                : "admin:governance.finances.edit.field.amountInvalid",
            )
          : undefined
      }
    >
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        disabled={disabled}
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
              <AmountField
                label={t("admin:governance.finances.edit.field.lineAmount")}
                className={styles.editLineAmount}
                value={line.amount}
                isBlankAllowed={false}
                disabled={!line.enabled}
                onChange={(amount) => onChange(index, { amount })}
              />
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
