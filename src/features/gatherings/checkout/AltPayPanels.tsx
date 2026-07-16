import { FiClock, FiSmartphone } from "react-icons/fi";
import { useCheckout } from "./checkoutContext";
import { validMbway } from "./checkout.validation";
import type { PaymentForm } from "./usePaymentForm";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { cx } from "./cx";
import s from "./checkout.module.css";

/** Mock Multibanco entity code — invariant reference data, not chrome. */
const MULTIBANCO_ENTITY = "11249";

export function MbwayPanel({ pf }: { pf: PaymentForm }) {
  const { t } = useTranslation();

  return (
    <div className={s["co-paypanel"] + " " + s.on}>
      <div className={s["co-field"]}>
        <label className={s["co-lbl"]} htmlFor="mbwayPhone">
          {t("gatherings:checkout.payment.mbwayPhoneLabel")}
        </label>
        <div className={s["co-mbway-phone"]}>
          <span className={s["co-mbway-cc"]}>+351</span>
          <input
            className={cx(s["co-in"], pf.errors.phone && s.invalid)}
            id="mbwayPhone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="912 345 678"
            maxLength={11}
            value={pf.phone}
            onChange={(e) => pf.onPhone(e.target.value)}
            onBlur={(e) =>
              e.target.value && pf.setErr("phone", !validMbway(pf.phone))
            }
          />
        </div>
        <div className={cx(s["co-err"], pf.errors.phone && s.show)}>
          {t("gatherings:checkout.payment.mbwayError")}
        </div>
      </div>
      <div className={s["co-mbway-note"]}>
        <FiSmartphone />
        <span>{t("gatherings:checkout.payment.mbwayNote")}</span>
      </div>
    </div>
  );
}

export function MultibancoPanel() {
  const { mbRef, pricing } = useCheckout();
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <div className={s["co-paypanel"] + " " + s.on}>
      <div className={s["co-mb-ref"]}>
        <div className={s["co-mb-ref-row"]}>
          <span className={s["co-mb-ref-lbl"]}>
            {t("gatherings:checkout.payment.multibancoEntityLabel")}
          </span>
          <span className={s["co-mb-ref-val"]}>{MULTIBANCO_ENTITY}</span>
        </div>
        <div className={s["co-mb-ref-row"]}>
          <span className={s["co-mb-ref-lbl"]}>
            {t("gatherings:checkout.payment.multibancoReferenceLabel")}
          </span>
          <span className={s["co-mb-ref-val"]}>{mbRef ?? "—"}</span>
        </div>
        <div className={s["co-mb-ref-row"]}>
          <span className={s["co-mb-ref-lbl"]}>
            {t("gatherings:checkout.payment.multibancoAmountLabel")}
          </span>
          <span className={s["co-mb-ref-val"]}>
            {fmt.currency(pricing.total)}
          </span>
        </div>
      </div>
      <div className={s["co-mb-hint"]}>
        <FiClock />
        <span>
          <Translation
            i18nKey="gatherings:checkout.payment.multibancoHint"
            components={{ strong: <strong /> }}
          />
        </span>
      </div>
    </div>
  );
}
