import { useEffect, useRef, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
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

  return (
    <div
      className={styles.overlay}
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
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {success ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <FiCheck size={26} aria-hidden />
            </div>
            <h2>
              Thank you — that's <em>€{value}</em> to {recipient}.
            </h2>
            <p>
              100% of your tip reaches {recipient} directly. No platform cut, no
              processing skimmed off the top.
            </p>
            <Button variant="ghost-dark" size="lg" onClick={onClose}>
              Back to the music
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.eb}>Tip · 100% to the artist</div>
            <div className={styles.title}>
              Send a tip to <em>{recipient}</em>
            </div>
            <div className={styles.sub}>
              Tips pass through untouched — every cent lands with {recipient}.
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
                  €{p}
                </button>
              ))}
            </div>

            <div className={styles.customRow}>
              <span>€</span>
              <input
                type="number"
                min={1}
                inputMode="decimal"
                placeholder="Custom amount"
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
                  <span className={styles.spinner} aria-hidden /> Sending…
                </>
              ) : (
                <>Tip €{value || 0} →</>
              )}
            </Button>

            <div className={styles.note}>
              Pays {recipient} on top of streaming · <em>nothing skimmed</em>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
