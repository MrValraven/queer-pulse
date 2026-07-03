import { useCheckout } from "./checkoutContext";
import { cx } from "./cx";
import s from "./checkout.module.css";

const TABS = [
  { id: "card", title: "Card", sub: "Visa, Mastercard, Amex", flag: false },
  { id: "mbway", title: "MB WAY", sub: "Approve in your app", flag: true },
  { id: "multibanco", title: "Multibanco", sub: "Reference / ATM", flag: true },
] as const;

export function PaymentMethodTabs() {
  const { method, setMethod } = useCheckout();

  return (
    <div className={s["co-paytabs"]} role="tablist" aria-label="Payment method">
      {TABS.map((t) => {
        const on = method === t.id;
        return (
          <button
            key={t.id}
            className={cx(s["co-paytab"], on && s.on)}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => setMethod(t.id)}
          >
            <span className={s["co-paytab-t"]}>
              {t.title} {t.flag && <span className={s["pt-flag"]}>PT</span>}
            </span>
            <span className={s["co-paytab-s"]}>{t.sub}</span>
          </button>
        );
      })}
    </div>
  );
}
