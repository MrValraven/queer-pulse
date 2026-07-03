import { FiClock, FiSmartphone } from "react-icons/fi";
import { useCheckout } from "./checkoutContext";
import { eur, validMbway } from "./checkout.validation";
import type { PaymentForm } from "./usePaymentForm";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function MbwayPanel({ pf }: { pf: PaymentForm }) {
  return (
    <div className={s["co-paypanel"] + " " + s.on}>
      <div className={s["co-field"]}>
        <label className={s["co-lbl"]} htmlFor="mbwayPhone">
          MB WAY phone number
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
          Enter your 9-digit MB WAY number.
        </div>
      </div>
      <div className={s["co-mbway-note"]}>
        <FiSmartphone />
        <span>
          Tap pay and we'll send a request to your MB WAY app. You have 4
          minutes to approve it — your seat is held until then.
        </span>
      </div>
    </div>
  );
}

export function MultibancoPanel() {
  const { mbRef, pricing } = useCheckout();
  return (
    <div className={s["co-paypanel"] + " " + s.on}>
      <div className={s["co-mb-ref"]}>
        <div className={s["co-mb-ref-row"]}>
          <span className={s["co-mb-ref-lbl"]}>Entity</span>
          <span className={s["co-mb-ref-val"]}>11249</span>
        </div>
        <div className={s["co-mb-ref-row"]}>
          <span className={s["co-mb-ref-lbl"]}>Reference</span>
          <span className={s["co-mb-ref-val"]}>{mbRef ?? "—"}</span>
        </div>
        <div className={s["co-mb-ref-row"]}>
          <span className={s["co-mb-ref-lbl"]}>Amount</span>
          <span className={s["co-mb-ref-val"]}>{eur(pricing.total)}</span>
        </div>
      </div>
      <div className={s["co-mb-hint"]}>
        <FiClock />
        <span>
          Pay this reference at any ATM or through home banking within{" "}
          <strong>3 days</strong>. We'll hold your seat and email your ticket
          the moment it clears.
        </span>
      </div>
    </div>
  );
}
