import { TIERS } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { eur } from "./checkout.validation";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function TierSelect() {
  const { tier, setTier } = useCheckout();

  return (
    <fieldset className={s["co-tiers"]} aria-label="Ticket type">
      {TIERS.map((t) => {
        const selected = tier === t.id;
        return (
          <label
            key={t.id}
            className={cx(s["co-tier"], selected && s.sel)}
            data-tier={t.id}
          >
            <input
              type="radio"
              name="tier"
              value={t.id}
              checked={selected}
              onChange={() => setTier(t.id)}
            />
            <span className={s["co-tier-radio"]} aria-hidden />
            <span className={s["co-tier-body"]}>
              <span className={s["co-tier-top"]}>
                <span className={s["co-tier-name"]}>
                  {t.name}
                  {t.tag && <span className={s["co-tier-tag"]}>{t.tag}</span>}
                </span>
                <span className={s["co-tier-price"]}>{eur(t.price)}</span>
              </span>
              <span className={s["co-tier-desc"]}>{t.desc}</span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
