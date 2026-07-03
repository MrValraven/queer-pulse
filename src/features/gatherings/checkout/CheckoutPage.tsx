import { PageShell } from "../../../shared/components/layout";
import { CheckoutProvider } from "./CheckoutProvider";
import { useCheckout } from "./checkoutContext";
import { useSeatHold } from "./useSeatHold";
import { usePaymentForm } from "./usePaymentForm";
import { CheckoutProgress } from "./CheckoutProgress";
import { CheckoutSidebar } from "./CheckoutSidebar";
import { CheckoutMobileBar } from "./CheckoutMobileBar";
import { OfflineBanner } from "./OfflineBanner";
import { ReviewStep } from "./ReviewStep";
import { PaymentStep } from "./PaymentStep";
import { ConfirmationStep } from "./ConfirmationStep";
import { cx } from "./cx";
import s from "./checkout.module.css";

function CheckoutInner() {
  const { step, dir, paid } = useCheckout();
  const hold = useSeatHold(paid);
  const pf = usePaymentForm();
  const slide = dir === "forward" ? s["slide-in-r"] : s["slide-in-l"];

  return (
    <>
      <OfflineBanner />
      <div className={s["co-page"]}>
        <div className="wrap">
          <CheckoutProgress />
          <div className={s["co-layout"]}>
            <div>
              <div key={step} className={cx(s["co-step"], s.active, slide)}>
                {step === 1 && <ReviewStep hold={hold} />}
                {step === 2 && <PaymentStep pf={pf} />}
                {step === 3 && <ConfirmationStep />}
              </div>
            </div>
            <CheckoutSidebar />
          </div>
        </div>
      </div>
      <CheckoutMobileBar pf={pf} />
    </>
  );
}

export function CheckoutPage() {
  return (
    <PageShell>
      <CheckoutProvider>
        <CheckoutInner />
      </CheckoutProvider>
    </PageShell>
  );
}
