import { Button } from "../../../shared/components/ui";
import type { TierId } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import type { PaymentForm } from "./usePaymentForm";
import s from "./checkout.module.css";

const TIER_NAME_KEY: Record<TierId, string> = {
  solidarity: "gatherings:checkout.summary.tier.solidarity",
  standard: "gatherings:checkout.summary.tier.standard",
  supporter: "gatherings:checkout.summary.tier.supporter",
};

export function CheckoutMobileBar({ pf }: { pf: PaymentForm }) {
  const { step, tier, qty, pricing, tryGoStep2 } = useCheckout();
  const { t } = useTranslation();
  const fmt = useFormat();
  if (step === 3) return null;

  const label =
    step === 1
      ? t("gatherings:checkout.mobileBar.continueCta")
      : t("gatherings:checkout.mobileBar.payCta", {
          amount: fmt.currency(pricing.total),
        });
  const onClick = step === 1 ? () => tryGoStep2() : pf.submit;

  return (
    <div className={s["co-mobile-bar"]}>
      <div>
        <div className={s["co-mb-total"]}>{fmt.currency(pricing.total)}</div>
        <div className={s["co-mb-note"]}>
          {t("gatherings:checkout.summary.lineItem", {
            count: qty,
            tier: t(TIER_NAME_KEY[tier]),
          })}
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
