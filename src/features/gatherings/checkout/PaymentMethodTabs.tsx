import { useCheckout } from "./checkoutContext";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cx } from "./cx";
import s from "./checkout.module.css";

/** "PT" availability badge — an ISO country-code marker, not authored prose;
 * kept as data (like the flag-icon exception) rather than a catalog key. */
const AVAILABLE_IN_PT_BADGE = "PT";

const TABS = [
  {
    id: "card",
    titleKey: "gatherings:checkout.payment.tabCardTitle",
    subKey: "gatherings:checkout.payment.tabCardSub",
    flag: false,
  },
  {
    id: "mbway",
    titleKey: "gatherings:checkout.payment.tabMbwayTitle",
    subKey: "gatherings:checkout.payment.tabMbwaySub",
    flag: true,
  },
  {
    id: "multibanco",
    titleKey: "gatherings:checkout.payment.tabMultibancoTitle",
    subKey: "gatherings:checkout.payment.tabMultibancoSub",
    flag: true,
  },
] as const;

export function PaymentMethodTabs() {
  const { method, setMethod } = useCheckout();
  const { t } = useTranslation();

  return (
    <div
      className={s["co-paytabs"]}
      role="tablist"
      aria-label={t("gatherings:checkout.payment.methodTabsAriaLabel")}
    >
      {TABS.map((tab) => {
        const on = method === tab.id;
        return (
          <button
            key={tab.id}
            className={cx(s["co-paytab"], on && s.on)}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => setMethod(tab.id)}
          >
            <span className={s["co-paytab-t"]}>
              {t(tab.titleKey)}{" "}
              {tab.flag && (
                <span className={s["pt-flag"]}>{AVAILABLE_IN_PT_BADGE}</span>
              )}
            </span>
            <span className={s["co-paytab-s"]}>{t(tab.subKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
