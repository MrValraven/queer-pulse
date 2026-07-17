import { useEffect, useMemo, useState } from "react";
import { FiSun, FiX } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useScrollLock } from "../../shared/hooks";
import {
  STEP_LABEL_KEYS,
  TOTAL_STEPS,
  type BudgetRow,
} from "./microGrants.data";
import {
  AboutStep,
  BudgetStep,
  CategoryStep,
  ProjectStep,
  ReviewStep,
} from "./GrantApplicationSteps";
import styles from "./MicroGrantsPage.module.css";

export function GrantApplicationModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  useScrollLock();
  const [step, setStep] = useState(1);
  const [cat, setCat] = useState<number | null>(null);
  const [projName, setProjName] = useState("");
  const [projWhat, setProjWhat] = useState("");
  const [appName, setAppName] = useState("");
  const [rows, setRows] = useState<BudgetRow[]>([
    { id: 1, item: "", amount: "" },
  ]);
  const [checks, setChecks] = useState<Set<number>>(new Set());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

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

  const next = () => setStep((s) => (s === TOTAL_STEPS ? 6 : s + 1));
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

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={t("resources:microGrants.apply.modalAriaLabel")}
      >
        <div className={styles.sheetHead}>
          <div className={styles.sheetTitle}>
            {t("resources:microGrants.apply.modalTitle")}
          </div>
          <button type="button" className={styles.close} onClick={onClose}>
            <FiX />
          </button>
        </div>

        {step <= TOTAL_STEPS && (
          <div className={styles.progress}>
            <div className={styles.stepsRow}>
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((i) => (
                <div
                  key={i}
                  className={[
                    styles.stepDot,
                    i < step && styles.stepDotDone,
                    i === step && styles.stepDotActive,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              ))}
            </div>
            <div className={styles.stepLabel}>
              {t("resources:microGrants.apply.stepIndicator", {
                step,
                total: TOTAL_STEPS,
                stepLabel: t(STEP_LABEL_KEYS[step - 1]!),
              })}
            </div>
          </div>
        )}

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
          {step === 6 && (
            <div className={styles.success}>
              <div className={styles.successIcon}>
                <FiSun />
              </div>
              <div className={styles.successTitle}>
                <Translation
                  i18nKey="resources:microGrants.apply.success.title"
                  components={{ em: <em /> }}
                />
              </div>
              <p className={styles.successSub}>
                {t("resources:microGrants.apply.success.sub")}
              </p>
              <button type="button" className={styles.next} onClick={onClose}>
                {t("resources:microGrants.apply.success.closeCta")}
              </button>
            </div>
          )}
        </div>

        {step <= TOTAL_STEPS && (
          <div className={styles.footer}>
            <button type="button" className={styles.back} onClick={back}>
              {step === 1
                ? t("resources:microGrants.apply.cancelCta")
                : t("resources:microGrants.apply.backCta")}
            </button>
            <button type="button" className={styles.next} onClick={next}>
              {step === TOTAL_STEPS
                ? t("resources:microGrants.apply.submitCta")
                : t("resources:microGrants.apply.continueCta")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
