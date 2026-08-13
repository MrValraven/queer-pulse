import { useState } from "react";
import { createPortal } from "react-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Button, FormField } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useScrollLock } from "../../shared/hooks";
import styles from "./PrintOrderModal.module.css";

type Stage = "compose" | "placing" | "done";

/** This modal is scoped to Issue 09's print run — not a generic issue picker. */
const ISSUE_LABEL = "Issue 09 · On Health";

/**
 * Self-contained print-order flow for Issue 09: compose the order → simulated
 * "placing" loading state → plum-panel success. Mounted only when open, so it
 * locks scroll unconditionally and owns its own state.
 */
export function PrintOrderModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [stage, setStage] = useState<Stage>("compose");
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState("");
  useScrollLock();

  const total = 12 * quantity;
  const valid = /\S+@\S+\.\S+/.test(email);

  const placeOrder = () => {
    if (!valid || stage !== "compose") return;
    setStage("placing");
    setTimeout(() => setStage("done"), 1100);
  };

  const success = stage === "done";

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${styles.modal} ${success ? styles.modalSuccess : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("magazine:printOrder.dialogAria")}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("magazine:printOrder.closeAria")}
        >
          ×
        </button>

        {success ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M5 12.5l4 4L19 7" />
              </svg>
            </div>
            <h2>
              <Translation
                i18nKey="magazine:printOrder.success.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p>
              <Translation
                i18nKey="magazine:printOrder.success.body"
                components={{ b: <b /> }}
                values={{ count: quantity, issue: ISSUE_LABEL, email }}
              />
            </p>
            <Button size="lg" variant="ghost-dark" onClick={onClose}>
              {t("magazine:printOrder.success.doneCta")}
            </Button>
          </div>
        ) : (
          <div>
            <div className={styles.eye}>
              {t("magazine:printOrder.eyebrow", { issue: ISSUE_LABEL })}
            </div>
            <h2 className={styles.title}>
              <Translation
                i18nKey="magazine:printOrder.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={styles.lead}>
              <Translation
                i18nKey="magazine:printOrder.lead"
                components={{ b: <b /> }}
                values={{ pages: 84, price: 12 }}
              />
            </p>

            <div className={styles.qtyRow}>
              <span className={styles.qtyLabel}>
                {t("magazine:printOrder.copiesLabel")}
              </span>
              <div className={styles.stepper}>
                <button
                  type="button"
                  onClick={() => setQuantity((previous) => Math.max(1, previous - 1))}
                  disabled={quantity <= 1 || stage === "placing"}
                  aria-label={t("magazine:printOrder.fewerCopiesAria")}
                >
                  −
                </button>
                <span className={styles.qtyVal} aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((previous) => Math.min(10, previous + 1))}
                  disabled={quantity >= 10 || stage === "placing"}
                  aria-label={t("magazine:printOrder.moreCopiesAria")}
                >
                  +
                </button>
              </div>
              <span className={styles.total}>
                €<b>{total}</b>
              </span>
            </div>

            <FormField
              label={t("magazine:printOrder.emailFieldLabel")}
              required
              helper={t("magazine:printOrder.emailFieldHelper")}
            >
              <input
                id="po-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("magazine:printOrder.emailPlaceholder")}
                disabled={stage === "placing"}
              />
            </FormField>

            <div className={styles.foot}>
              <button
                type="button"
                className={styles.back}
                onClick={onClose}
                disabled={stage === "placing"}
              >
                <FiArrowLeft aria-hidden /> {t("magazine:printOrder.cancelCta")}
              </button>
              <Button
                size="lg"
                type="button"
                onClick={placeOrder}
                disabled={!valid || stage === "placing"}
                aria-busy={stage === "placing"}
              >
                {stage === "placing"
                  ? t("magazine:printOrder.placingCta")
                  : t("magazine:printOrder.placeCta", { total })}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
