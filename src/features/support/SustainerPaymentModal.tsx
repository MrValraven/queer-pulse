import { useEffect, useState, type ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { useScrollLock } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { PaymentCheckout } from "./PaymentCheckout";
import { PaymentSuccess, type Receipt } from "./PaymentSuccess";
import { FREQS, TIER_LABEL_KEYS } from "./sustainer.pricing";
import type { SustainerStore } from "./useSustainer";
import styles from "./sustainer.module.css";

/** Reference like QP-2026-0084 (four digits). */
function makeRef(): string {
  return `QP-2026-${String(Math.floor(1000 + Math.random() * 8999))}`;
}

function buildReceipt(t: TFunction, store: SustainerStore): Receipt {
  const total = store.baseAmount + (store.solid ? store.solidAmount : 0);
  const tierLabel =
    store.selectedName === "Custom"
      ? t("support:tiers.name.custom")
      : t(TIER_LABEL_KEYS[store.selectedName as keyof typeof TIER_LABEL_KEYS]);
  return {
    welcomeName: store.gift
      ? t("support:modal.welcomeName.gift")
      : store.selectedName === "Custom"
        ? t("support:modal.welcomeName.customSupporter")
        : tierLabel,
    text: store.gift
      ? t("support:modal.receipt.giftText")
      : t("support:modal.receipt.text"),
    tier: tierLabel + (store.gift ? t("support:modal.receipt.giftSuffix") : ""),
    billing: t(FREQS[store.freq].billingKey),
    solid: store.solid ? store.money(store.solidAmount) : null,
    ref: makeRef(),
    charged: store.money(total),
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
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function complete() {
    const r = buildReceipt(t, store);
    if (!store.gift) {
      store.becomeSupporter({
        tier: store.selectedName === "Custom" ? "Custom" : store.selectedName,
        price: store.money(store.baseAmount),
        freq: store.freq,
      });
    }
    setReceipt(r);
    showToast(
      store.gift
        ? t("support:modal.giftSentToast")
        : t("support:modal.welcomeToast"),
      "success",
    );
  }

  let head: ReactNode;
  if (receipt) {
    head = (
      <Translation
        i18nKey="support:modal.head.done"
        components={{ em: <em /> }}
      />
    );
  } else if (store.gift) {
    head = (
      <Translation
        i18nKey="support:modal.head.gift"
        components={{ em: <em /> }}
      />
    );
  } else if (store.selectedName === "Custom") {
    head = (
      <Translation
        i18nKey="support:modal.head.custom"
        components={{ em: <em /> }}
      />
    );
  } else {
    head = (
      <Translation
        i18nKey="support:modal.head.tier"
        values={{
          name: t(
            TIER_LABEL_KEYS[store.selectedName as keyof typeof TIER_LABEL_KEYS],
          ),
        }}
        components={{ em: <em /> }}
      />
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
        aria-label={t("support:modal.checkoutAriaLabel")}
      >
        <div className={styles.pcTop}>
          <div className={styles.pcHead}>{head}</div>
          <button
            type="button"
            className={styles.pcClose}
            onClick={onClose}
            aria-label={t("support:modal.close")}
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
