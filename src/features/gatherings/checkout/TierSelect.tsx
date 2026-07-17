import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { TIERS } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function TierSelect() {
  const { tier, setTier } = useCheckout();
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <fieldset
      className={s["co-tiers"]}
      aria-label={t("gatherings:checkout.tiers.fieldsetAria")}
    >
      {TIERS.map((tierOption) => {
        const selected = tier === tierOption.id;
        return (
          <label
            key={tierOption.id}
            className={cx(s["co-tier"], selected && s.sel)}
            data-tier={tierOption.id}
          >
            <input
              type="radio"
              name="tier"
              value={tierOption.id}
              checked={selected}
              onChange={() => setTier(tierOption.id)}
            />
            <span className={s["co-tier-radio"]} aria-hidden />
            <span className={s["co-tier-body"]}>
              <span className={s["co-tier-top"]}>
                <span className={s["co-tier-name"]}>
                  {t(tierOption.nameKey)}
                  {tierOption.tagKey && (
                    <span className={s["co-tier-tag"]}>
                      {t(tierOption.tagKey)}
                    </span>
                  )}
                </span>
                <span className={s["co-tier-price"]}>
                  {fmt.currency(tierOption.price)}
                </span>
              </span>
              <span className={s["co-tier-desc"]}>{t(tierOption.descKey)}</span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
