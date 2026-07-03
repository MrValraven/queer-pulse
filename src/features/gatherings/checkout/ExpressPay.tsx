import type { PaymentForm } from "./usePaymentForm";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function ExpressPay({ pf }: { pf: PaymentForm }) {
  return (
    <>
      <div className={s["co-sec"]} style={{ marginTop: 0 }}>
        Express checkout
      </div>
      <div className={s["co-express"]}>
        <button
          className={cx(s["co-xbtn"], s.apple)}
          type="button"
          onClick={() => pf.express("Apple Pay")}
        >
          <span className={s.xw}></span> Pay
        </button>
        <button
          className={cx(s["co-xbtn"], s.gpay)}
          type="button"
          onClick={() => pf.express("Google Pay")}
        >
          <span className={cx(s.xw, s["x-gmark"])}>G</span> Pay
        </button>
        <button
          className={cx(s["co-xbtn"], s.paypal)}
          type="button"
          onClick={() => pf.express("PayPal")}
        >
          <span className={s.xw}>
            <em className={s["x-pp1"]}>Pay</em>
            <em className={s["x-pp2"]}>Pal</em>
          </span>
        </button>
      </div>
      <div className={s["co-or"]}>or pay by card</div>
    </>
  );
}
