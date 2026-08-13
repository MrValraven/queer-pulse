import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiCheck, FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import styles from "./StudioTipModal.module.css";

const PRESETS = [2, 5, 10];

type Phase = "pick" | "sending" | "done";

/**
 * Reusable tip modal for the Studio section. Amount presets + custom →
 * loading spinner → plum-panel "thank you" success. Self-contained: owns its
 * state and locks scroll (only mounted when open).
 */
export function StudioTipModal({
  recipient,
  onClose,
}: {
  recipient: string;
  onClose: () => void;
}) {
  useScrollLock();
  const { t } = useTranslation();
  const fmt = useFormat();
  const [phase, setPhase] = useState<Phase>("pick");
  const [amount, setAmount] = useState(2);
  const [custom, setCustom] = useState("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const value = custom ? Number(custom) : amount;
  const canSend = value > 0 && !Number.isNaN(value);

  function send() {
    if (!canSend) return;
    setPhase("sending");
    timer.current = window.setTimeout(() => setPhase("done"), 1100);
  }

  const success = phase === "done";

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={[styles.modal, success && styles.modalSuccess]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label={t("studio:tipModal.dialogAria", { recipient })}
      >
        <span className={styles.grabber} aria-hidden />
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("studio:tipModal.closeAria")}
        >
          ×
        </button>

        {success ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <FiCheck size={26} aria-hidden />
            </div>
            <h2>
              <Translation
                i18nKey="studio:tipModal.success.title"
                components={{ em: <em /> }}
                values={{ amount: fmt.currency(value), recipient }}
              />
            </h2>
            <p>{t("studio:tipModal.success.body", { recipient })}</p>
            <Button variant="ghost-dark" size="lg" onClick={onClose}>
              {t("studio:tipModal.success.backCta")}
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.eb}>{t("studio:tipModal.eyebrow")}</div>
            <div className={styles.title}>
              <Translation
                i18nKey="studio:tipModal.title"
                components={{ em: <em /> }}
                values={{ recipient }}
              />
            </div>
            <div className={styles.sub}>
              {t("studio:tipModal.sub", { recipient })}
            </div>

            <div className={styles.amounts}>
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={[
                    styles.amount,
                    !custom && amount === p && styles.amountOn,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => {
                    setAmount(p);
                    setCustom("");
                  }}
                >
                  {fmt.currency(p)}
                </button>
              ))}
            </div>

            <div className={styles.customRow}>
              <span>€</span>
              <input
                type="number"
                min={1}
                inputMode="decimal"
                aria-label={t("studio:tipModal.customPlaceholder")}
                placeholder={t("studio:tipModal.customPlaceholder")}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={send}
              disabled={!canSend || phase === "sending"}
              style={{ width: "100%" }}
            >
              {phase === "sending" ? (
                <>
                  <span className={styles.spinner} aria-hidden />{" "}
                  {t("studio:tipModal.sendingCta")}
                </>
              ) : (
                <>
                  {t("studio:tipModal.sendCta", {
                    amount: fmt.currency(value || 0),
                  })}{" "}
                  <FiArrowRight aria-hidden />
                </>
              )}
            </Button>

            <div className={styles.note}>
              <Translation
                i18nKey="studio:tipModal.note"
                components={{ em: <em /> }}
                values={{ recipient }}
              />
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
