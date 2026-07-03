import { useEffect, useState, type ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { useScrollLock } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { PaymentCheckout } from "./PaymentCheckout";
import { PaymentSuccess, type Receipt } from "./PaymentSuccess";
import { FREQS } from "./sustainer.pricing";
import type { SustainerStore } from "./useSustainer";
import styles from "./sustainer.module.css";

/** Reference like QP-2026-0084 (four digits). */
function makeRef(): string {
  return `QP-2026-${String(Math.floor(1000 + Math.random() * 8999))}`;
}

function buildReceipt(store: SustainerStore): Receipt {
  const f = FREQS[store.freq];
  const total = store.baseAmount + (store.solid ? store.solidAmount : 0);
  const tierWord =
    store.selectedName === "Custom" ? "Custom" : store.selectedName;
  return {
    welcomeName: store.gift
      ? "friend of QueerPulse"
      : store.selectedName === "Custom"
        ? "supporter"
        : store.selectedName,
    text: store.gift
      ? "We've emailed your gift and their new Sustainer badge is ready to activate."
      : "Your Sustainer badge is active. Thank you for keeping this place alive.",
    tier: tierWord + (store.gift ? " (gift)" : ""),
    billing: f.billing,
    solid: store.solid ? store.money(store.solidAmount) : null,
    ref: makeRef(),
    charged: `${store.money(total)}.00`,
  };
}

/** Full payment modal — mounted only while open, so scroll-lock + Escape run
 * per the repo convention. Switches from checkout to the success receipt. */
export function SustainerPaymentModal({
  store,
  onClose,
}: {
  store: SustainerStore;
  onClose: () => void;
}) {
  useScrollLock();
  const { showToast } = useToast();
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function complete() {
    const r = buildReceipt(store);
    if (!store.gift) {
      const f = FREQS[store.freq];
      store.becomeSupporter({
        tier: store.selectedName === "Custom" ? "Custom" : store.selectedName,
        price: store.money(store.baseAmount),
        per: f.per,
        billing: f.billing,
      });
    }
    setReceipt(r);
    showToast(
      store.gift ? "Gift sent." : "Welcome aboard — badge activated.",
      "success",
    );
  }

  let head: ReactNode;
  if (receipt) {
    head = (
      <>
        All <em>done</em>
      </>
    );
  } else if (store.gift) {
    head = (
      <>
        Gift a <em>membership</em>
      </>
    );
  } else if (store.selectedName === "Custom") {
    head = (
      <>
        Support <em>QueerPulse</em>
      </>
    );
  } else {
    head = (
      <>
        Becoming a <em>{store.selectedName}</em>
      </>
    );
  }

  return (
    <div
      className={styles.payOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.paymentCard}
        role="dialog"
        aria-modal="true"
        aria-label="Supporting membership checkout"
      >
        <div className={styles.pcTop}>
          <div className={styles.pcHead}>{head}</div>
          <button
            type="button"
            className={styles.pcClose}
            onClick={onClose}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        {receipt ? (
          <PaymentSuccess receipt={receipt} onClose={onClose} />
        ) : (
          <PaymentCheckout store={store} onComplete={complete} />
        )}
      </div>
    </div>
  );
}
