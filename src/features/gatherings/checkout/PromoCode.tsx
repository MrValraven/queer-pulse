import { useState } from "react";
import { useCheckout } from "./checkoutContext";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function PromoCode() {
  const { promo, applyPromo, removePromo } = useCheckout();
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function apply() {
    const result = applyPromo(value);
    if (result === "invalid") {
      setError(t("gatherings:checkout.promo.invalidError"));
    } else if (result === "ok") {
      setError("");
      setValue("");
    }
  }

  if (promo) {
    return (
      <div className={s["co-promo-applied"]}>
        <span>
          <Translation
            i18nKey="gatherings:checkout.promo.appliedLabel"
            values={{ code: promo }}
            components={{ code: <span className={s.code} /> }}
          />
        </span>
        <button
          className={s["co-promo-remove"]}
          type="button"
          onClick={removePromo}
        >
          {t("gatherings:checkout.promo.removeCta")}
        </button>
      </div>
    );
  }

  return (
    <div className={s["co-promo"]}>
      <div className={s["co-promo-wrap"]}>
        <input
          className={cx(s["co-in"], error && s.invalid)}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              apply();
            }
          }}
          placeholder={t("gatherings:checkout.promo.inputPlaceholder")}
          autoComplete="off"
          aria-label={t("gatherings:checkout.promo.inputAriaLabel")}
        />
        <div className={cx(s["co-err"], error && s.show)}>{error}</div>
      </div>
      <button className={s["co-promo-btn"]} type="button" onClick={apply}>
        {t("gatherings:checkout.promo.applyCta")}
      </button>
    </div>
  );
}
