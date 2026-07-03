import { Button } from "../../../shared/components/ui";
import { TIER_MAP } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { eur } from "./checkout.validation";
import type { PaymentForm } from "./usePaymentForm";
import s from "./checkout.module.css";

export function CheckoutMobileBar({ pf }: { pf: PaymentForm }) {
  const { step, tier, qty, pricing, tryGoStep2 } = useCheckout();
  if (step === 3) return null;

  const label = step === 1 ? "Continue →" : `Pay ${eur(pricing.total)} →`;
  const onClick = step === 1 ? () => tryGoStep2() : pf.submit;

  return (
    <div className={s["co-mobile-bar"]}>
      <div>
        <div className={s["co-mb-total"]}>{eur(pricing.total)}</div>
        <div className={s["co-mb-note"]}>
          {qty} × {TIER_MAP[tier].name} seat
        </div>
      </div>
      <Button
        variant="primary"
        onClick={onClick}
        style={{ padding: "12px 22px" }}
      >
        {label}
      </Button>
    </div>
  );
}
