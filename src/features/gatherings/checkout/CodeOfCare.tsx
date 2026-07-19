import { useState } from "react";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { COC_KEYS } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function CodeOfCare() {
  const { cocAgreed, setCoc } = useCheckout();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className={cx(s["co-coc"], open && s.open)}>
      <div className={s["co-coc-top"]}>
        <label style={{ display: "flex" }}>
          <input
            type="checkbox"
            id="cocCheck"
            aria-labelledby="cocCheckLabel"
            checked={cocAgreed}
            onChange={(e) => setCoc(e.target.checked)}
          />
          <span className={s["co-coc-check"]} aria-hidden />
        </label>
        <div>
          <label
            id="cocCheckLabel"
            className={s["co-coc-txt"]}
            htmlFor="cocCheck"
          >
            <Translation
              i18nKey="gatherings:checkout.coc.agreementLabel"
              components={{ strong: <strong /> }}
            />
          </label>
          <button
            className={s["co-coc-more"]}
            type="button"
            onClick={() => setOpen((o) => !o)}
          >
            {open
              ? `${t("gatherings:checkout.coc.hide")} ←`
              : `${t("gatherings:checkout.coc.whatsThat")} →`}
          </button>
          <div className={s["co-coc-body"]}>
            <ul className={s["co-coc-list"]}>
              {COC_KEYS.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
