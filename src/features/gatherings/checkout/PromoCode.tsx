import { useState } from "react";
import { useCheckout } from "./checkoutContext";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function PromoCode() {
  const { promo, applyPromo, removePromo } = useCheckout();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function apply() {
    const result = applyPromo(value);
    if (result === "invalid") {
      setError("That code isn't valid or has expired.");
    } else if (result === "ok") {
      setError("");
      setValue("");
    }
  }

  if (promo) {
    return (
      <div className={s["co-promo-applied"]}>
        <span>
          Code <span className={s.code}>{promo}</span> applied
        </span>
        <button
          className={s["co-promo-remove"]}
          type="button"
          onClick={removePromo}
        >
          Remove
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
          placeholder="Enter code"
          autoComplete="off"
          aria-label="Promo code"
        />
        <div className={cx(s["co-err"], error && s.show)}>{error}</div>
      </div>
      <button className={s["co-promo-btn"]} type="button" onClick={apply}>
        Apply
      </button>
    </div>
  );
}
