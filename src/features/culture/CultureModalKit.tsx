import { useEffect, useState, type ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CultureModals.module.css";

// Consolidated into the shared UI/hooks layer — re-exported here so existing
// `./CultureModalKit` consumers keep their imports unchanged. (All call sites
// invoke `submit()` with no args, so the shared `submit(onComplete?, ms)`
// signature is a drop-in.)
export { Sending } from "../../shared/components/ui";
export { useSubmitFlow } from "../../shared/hooks";

/** Shared bottom-sheet frame: backdrop, close button, scroll lock. */
export function ModalShell({
  onClose,
  success,
  label,
  children,
}: {
  onClose: () => void;
  success?: boolean;
  /** Accessible dialog name announced to screen readers. */
  label?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  useScrollLock();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label ?? t("culture:modal.dialogAriaLabel")}
        className={[styles.modal, success && styles.modalSuccess]
          .filter(Boolean)
          .join(" ")}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("culture:modal.close")}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

/** Plum-panel confirmation with a jade tick, serif title and optional next steps.
 * Intentionally NOT swapped for the shared <SuccessPanel>: this one renders flat
 * inside the already-plum ModalShell success surface (the shared panel brings its
 * own plum background + padding, which would double up here) and keeps the richer
 * staggered entrance animation, reduced-motion-guarded in CultureModals.module.css. */
export function SuccessPanel({
  title,
  em,
  children,
  steps,
  onClose,
}: {
  title: string;
  em: string;
  children: ReactNode;
  steps?: ReactNode[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.success}>
      <div className={styles.successIcon}>
        <FiCheck size={26} color="var(--jade)" aria-hidden />
      </div>
      <h2>
        {title} <em>{em}</em>
      </h2>
      <p>{children}</p>
      {steps && steps.length > 0 && (
        <ul className={styles.steps}>
          {steps.map((step, i) => (
            <li key={i} className={styles.step}>
              <FiCheck size={16} aria-hidden />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.successBtn}>
        <Button size="lg" variant="ghost-dark" onClick={onClose}>
          {t("culture:modal.done")}
        </Button>
      </div>
    </div>
  );
}

/** Multi-select pill row used inside the modal forms. `options` stay stable
 * English ids (the `Set<string>` selection state never changes with
 * language); `optionLabel` resolves each option's translated display text —
 * i18n Pattern A's label-key indirection applied to a generic component. */
export function ChipSelect({
  options,
  selected,
  onToggle,
  optionLabel,
  labelledBy,
}: {
  options: readonly string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  optionLabel?: (option: string) => string;
  /** `id` of the visible field label that names this group — without it the
   *  group is announced as an anonymous "group". */
  labelledBy?: string;
}) {
  return (
    <div className={styles.chips} role="group" aria-labelledby={labelledBy}>
      {options.map((opt) => {
        const on = selected.has(opt);
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={on}
            className={[styles.chip, on && styles.chipOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onToggle(opt)}
          >
            {optionLabel ? optionLabel(opt) : opt}
          </button>
        );
      })}
    </div>
  );
}

/** Small hook for the chip-select Set state. */
export function useChipSet() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = (value: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  return { selected, toggle };
}
