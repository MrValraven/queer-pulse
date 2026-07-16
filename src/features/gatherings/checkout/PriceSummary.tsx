import { MEMBER_RATE, PROMO_RATE, type TierId } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { cx } from "./cx";
import s from "./checkout.module.css";

const TIER_NAME_KEY: Record<TierId, string> = {
  solidarity: "gatherings:checkout.summary.tier.solidarity",
  standard: "gatherings:checkout.summary.tier.standard",
  supporter: "gatherings:checkout.summary.tier.supporter",
};

/** Step-1 line items + total. */
export function PriceSummary() {
  const { tier, qty, promo, pricing } = useCheckout();
  const { t } = useTranslation();
  const fmt = useFormat();
  const tierName = t(TIER_NAME_KEY[tier]);
  const memberPercent = fmt.number(MEMBER_RATE, { style: "percent" });
  const promoPercent = fmt.number(PROMO_RATE, { style: "percent" });

  return (
    <>
      <div className={s["co-items"]}>
        <Row
          label={t("gatherings:checkout.summary.lineItem", {
            count: qty,
            tier: tierName,
          })}
          value={fmt.currency(pricing.subtotal)}
        />
        {pricing.memberDisc > 0 && (
          <Row
            label={
              <>
                {t("gatherings:checkout.summary.memberDiscount")}{" "}
                <span style={{ fontSize: 12, color: "var(--jade)" }}>
                  {t("gatherings:checkout.summary.percentOff", {
                    percent: memberPercent,
                  })}
                </span>
              </>
            }
            value={"− " + fmt.currency(pricing.memberDisc)}
            discount
          />
        )}
        {pricing.promoDisc > 0 && (
          <Row
            label={
              <>
                {t("gatherings:checkout.summary.promoLabel", {
                  code: promo ?? "",
                })}{" "}
                <span style={{ fontSize: 12, color: "var(--jade)" }}>
                  {t("gatherings:checkout.summary.percentOff", {
                    percent: promoPercent,
                  })}
                </span>
              </>
            }
            value={"− " + fmt.currency(pricing.promoDisc)}
            discount
          />
        )}
      </div>
      <div className={s["co-total-row"]}>
        <span>{t("gatherings:checkout.summary.total")}</span>
        <span>{fmt.currency(pricing.total)}</span>
      </div>
      <div className={s["co-total-note"]}>
        {t("gatherings:checkout.summary.priceNote")}
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
