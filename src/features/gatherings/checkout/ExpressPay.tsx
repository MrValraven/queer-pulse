import type { PaymentForm } from "./usePaymentForm";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cx } from "./cx";
import s from "./checkout.module.css";

/** Express-wallet brand wordmarks — logotype fragments (a lone "G" mark, the
 * two-tone "Pay"/"Pal" halves of the PayPal logo, the "Pay" suffix on Apple/
 * Google buttons), not authored prose. Kept as data so they render via
 * expression rather than literal JSX text — brand nouns are never translated. */
const PAY_SUFFIX = "Pay";
const GOOGLE_MARK = "G";
const PAYPAL_PAY = "Pay";
const PAYPAL_PAL = "Pal";

export function ExpressPay({ pf }: { pf: PaymentForm }) {
  const { t } = useTranslation();

  return (
    <>
      <div className={s["co-sec"]} style={{ marginTop: 0 }}>
        {t("gatherings:checkout.express.heading")}
      </div>
      <div className={s["co-express"]}>
        <button
          className={cx(s["co-xbtn"], s.apple)}
          type="button"
          onClick={() => pf.express("Apple Pay")}
        >
          <span className={s.xw}></span> {PAY_SUFFIX}
        </button>
        <button
          className={cx(s["co-xbtn"], s.gpay)}
          type="button"
          onClick={() => pf.express("Google Pay")}
        >
          <span className={cx(s.xw, s["x-gmark"])}>{GOOGLE_MARK}</span>{" "}
          {PAY_SUFFIX}
        </button>
        <button
          className={cx(s["co-xbtn"], s.paypal)}
          type="button"
          onClick={() => pf.express("PayPal")}
        >
          <span className={s.xw}>
            <em className={s["x-pp1"]}>{PAYPAL_PAY}</em>
            <em className={s["x-pp2"]}>{PAYPAL_PAL}</em>
          </span>
        </button>
      </div>
      <div className={s["co-or"]}>
        {t("gatherings:checkout.express.orPayByCard")}
      </div>
    </>
  );
}
