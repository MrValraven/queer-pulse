import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { submitIntake } from "../../shared/api/intakes";
import { useDismiss } from "../../shared/components/ui";
import { TOTAL_STEPS, type BudgetRow } from "./microGrants.data";
import {
  AboutStep,
  BudgetStep,
  CategoryStep,
  ProjectStep,
  ReviewStep,
} from "./GrantApplicationSteps";
import {
  GrantApplicationFooter,
  GrantApplicationProgress,
  GrantApplicationSuccess,
} from "./GrantApplicationChrome";
import styles from "./MicroGrantsPage.module.css";

/**
 * The wizard's "next / submit" action. Below the final step it just advances;
 * on the final step it submits — demo jumps straight to the success screen
 * (step 6), while live POSTs the application through the generic intake
 * endpoint first, then shows the same success screen (or toasts and stays put
 * on failure). Kept out of the component so the component stays small.
 */
function useGrantAdvance(args: {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  demoMode: boolean;
  buildPayload: () => Record<string, unknown>;
}) {
  const { step, setStep, demoMode, buildPayload } = args;
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const advance = async () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
    if (demoMode) {
      setStep(6);
      return;
    }
    if (isSending) return;
    setIsSending(true);
    try {
      await submitIntake("grant", buildPayload());
      setStep(6);
    } catch {
      showToast(t("shared:intake.errorToast"), "error");
    } finally {
      setIsSending(false);
    }
  };

  return { isSending, advance };
}

export function GrantApplicationModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  // Shared dialog behaviour: scroll lock, initial focus into the sheet, a Tab
  // trap so a keyboard user cannot reach the page behind, focus restore to the
  // trigger on close, and modal-stack-aware Escape.
  const dialogRef = useDismiss(onClose);
  const [step, setStep] = useState(1);
  const [cat, setCat] = useState<number | null>(null);
  const [projName, setProjName] = useState("");
  const [projWhat, setProjWhat] = useState("");
  const [appName, setAppName] = useState("");
  const [rows, setRows] = useState<BudgetRow[]>([
    { id: 1, item: "", amount: "" },
  ]);
  const [checks, setChecks] = useState<Set<number>>(new Set());

  const total = useMemo(
    () => rows.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0),
    [rows],
  );
  const budgetItems = useMemo(
    () =>
      rows
        .filter((r) => r.item || r.amount)
        .map((r) => `${r.item} · €${r.amount || 0}`)
        .join(", ") || "—",
    [rows],
  );

  const { isSending, advance } = useGrantAdvance({
    step,
    setStep,
    demoMode,
    buildPayload: () => ({
      category: cat,
      projectName: projName.trim(),
      projectSummary: projWhat.trim(),
      applicantName: appName.trim(),
      budgetTotal: total,
      budgetItems: rows
        .filter((r) => r.item.trim() || r.amount.trim())
        .map((r) => ({ item: r.item.trim(), amount: r.amount.trim() })),
    }),
  });
  const back = () => (step === 1 ? onClose() : setStep((s) => s - 1));

  const addRow = () =>
    setRows((r) => [...r, { id: Date.now(), item: "", amount: "" }]);
  const removeRow = (id: number) =>
    setRows((r) => r.filter((x) => x.id !== id));
  const updateRow = (id: number, field: "item" | "amount", val: string) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, [field]: val } : x)));
  const toggleCheck = (n: number) =>
    setChecks((prev) => {
      const nx = new Set(prev);
      if (nx.has(n)) nx.delete(n);
      else nx.add(n);
      return nx;
    });

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={t("resources:microGrants.apply.modalAriaLabel")}
      >
        <div className={styles.sheetHead}>
          <div className={styles.sheetTitle}>
            {t("resources:microGrants.apply.modalTitle")}
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t("shared:modal.close")}
          >
            <FiX aria-hidden />
          </button>
        </div>

        {step <= TOTAL_STEPS && <GrantApplicationProgress step={step} />}

        <div className={styles.modalBody}>
          {step === 1 && <CategoryStep cat={cat} setCat={setCat} />}
          {step === 2 && (
            <ProjectStep
              projName={projName}
              setProjName={setProjName}
              projWhat={projWhat}
              setProjWhat={setProjWhat}
            />
          )}
          {step === 3 && (
            <BudgetStep
              rows={rows}
              total={total}
              addRow={addRow}
              removeRow={removeRow}
              updateRow={updateRow}
            />
          )}
          {step === 4 && (
            <AboutStep
              appName={appName}
              setAppName={setAppName}
              checks={checks}
              toggleCheck={toggleCheck}
            />
          )}
          {step === 5 && (
            <ReviewStep
              cat={cat}
              projName={projName}
              projWhat={projWhat}
              appName={appName}
              total={total}
              budgetItems={budgetItems}
            />
          )}
          {step === 6 && <GrantApplicationSuccess onClose={onClose} />}
        </div>

        {step <= TOTAL_STEPS && (
          <GrantApplicationFooter
            step={step}
            isSending={isSending}
            onBack={back}
            onAdvance={() => void advance()}
          />
        )}
      </div>
    </div>,
    document.body,
  );
}
