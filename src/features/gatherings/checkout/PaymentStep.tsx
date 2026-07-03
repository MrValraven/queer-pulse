import { Link } from "react-router-dom";
import { FiAlertCircle, FiLock } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { routes } from "../../../app/routeMap";
import { useCheckout } from "./checkoutContext";
import { eur } from "./checkout.validation";
import type { PaymentForm } from "./usePaymentForm";
import { ExpressPay } from "./ExpressPay";
import { PaymentMethodTabs } from "./PaymentMethodTabs";
import { CardForm } from "./CardForm";
import { MbwayPanel, MultibancoPanel } from "./AltPayPanels";
import { CodeOfCare } from "./CodeOfCare";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function PaymentStep({ pf }: { pf: PaymentForm }) {
  const { method, pricing, goStep } = useCheckout();

  const payLabel =
    method === "mbway"
      ? `Send request for ${eur(pricing.total)} →`
      : method === "multibanco"
        ? `Confirm booking · ${eur(pricing.total)} →`
        : `Pay ${eur(pricing.total)} →`;

  return (
    <>
      <h1 className={s["co-step-title"]}>
        Payment <em>details</em>
      </h1>
      <p className={s["co-step-lede"]}>
        Encrypted and processed by Stripe. QueerPulse never sees or stores your
        card number.
      </p>

      <div
        className={cx(s["co-pay-error"], pf.payError && s.show)}
        role="alert"
        aria-live="assertive"
      >
        <FiAlertCircle />
        <div className={s["co-pay-error-txt"]}>{pf.payError}</div>
      </div>

      <ExpressPay pf={pf} />
      <PaymentMethodTabs />

      {method === "card" && <CardForm pf={pf} />}
      {method === "mbway" && <MbwayPanel pf={pf} />}
      {method === "multibanco" && <MultibancoPanel />}

      <CodeOfCare />

      <div className={s["co-trust"]}>
        <span className={s["co-trust-lock"]}>
          <FiLock />
          256-bit encrypted
        </span>
        <div className={s["co-trust-cards"]}>
          <span className={s["co-card-chip"]}>VISA</span>
          <span className={s["co-card-chip"]}>MC</span>
          <span className={s["co-card-chip"]}>AMEX</span>
          <span className={s["co-stripe-badge"]}>
            via <strong>Stripe</strong>
          </span>
        </div>
      </div>

      <Button
        variant="primary"
        className={cx(s["co-pay-btn"], pf.processing && s.loading)}
        disabled={!pf.canPay || pf.processing}
        onClick={pf.submit}
      >
        {pf.processing ? "Processing…" : payLabel}
      </Button>
      <p className={s["co-terms"]}>
        By paying you agree to our{" "}
        <Link to={routes.terms}>terms of service</Link> and{" "}
        <Link to={routes.privacy}>privacy policy</Link>. You can cancel for a
        full refund up to 48h before.
      </p>
      <p className={s["co-demo-hint"]}>
        Demo: use card <strong>4000 0000 0000 0002</strong> to see a
        declined-payment flow.
      </p>

      <div className={s["co-step-nav"]}>
        <button
          className={s["co-back-btn"]}
          type="button"
          onClick={() => goStep(1, "back")}
        >
          ← Back to review
        </button>
      </div>
    </>
  );
}
