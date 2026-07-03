import { TIER_MAP } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { eur } from "./checkout.validation";
import { cx } from "./cx";
import s from "./checkout.module.css";

/** Step-1 line items + total. */
export function PriceSummary() {
  const { tier, qty, promo, pricing } = useCheckout();
  const tierName = TIER_MAP[tier].name + " seat";

  return (
    <>
      <div className={s["co-items"]}>
        <Row label={`${qty} × ${tierName}`} value={eur(pricing.subtotal)} />
        {pricing.memberDisc > 0 && (
          <Row
            label={
              <>
                Member discount{" "}
                <span style={{ fontSize: 12, color: "var(--jade)" }}>
                  10% off
                </span>
              </>
            }
            value={"− " + eur(pricing.memberDisc)}
            discount
          />
        )}
        {pricing.promoDisc > 0 && (
          <Row
            label={
              <>
                Promo {promo}{" "}
                <span style={{ fontSize: 12, color: "var(--jade)" }}>
                  5% off
                </span>
              </>
            }
            value={"− " + eur(pricing.promoDisc)}
            discount
          />
        )}
      </div>
      <div className={s["co-total-row"]}>
        <span>Total</span>
        <span>{eur(pricing.total)}</span>
      </div>
      <div className={s["co-total-note"]}>
        Includes all fees. No booking surcharge. Secure payment via Stripe.
      </div>
    </>
  );
}

function Row({
  label,
  value,
  discount,
}: {
  label: React.ReactNode;
  value: string;
  discount?: boolean;
}) {
  return (
    <div className={s["co-item-row"]}>
      <span className={s["co-item-lbl"]}>{label}</span>
      <span className={cx(s["co-item-val"], discount && s.discount)}>
        {value}
      </span>
    </div>
  );
}
