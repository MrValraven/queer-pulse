import { Link } from "react-router-dom";
import { FiAlertCircle, FiArrowLeft, FiArrowRight, FiLock } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { routes } from "../../../app/routeMap";
import { useCheckout } from "./checkoutContext";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import type { PaymentForm } from "./usePaymentForm";
import { ExpressPay } from "./ExpressPay";
import { PaymentMethodTabs } from "./PaymentMethodTabs";
import { CardForm } from "./CardForm";
import { MbwayPanel, MultibancoPanel } from "./AltPayPanels";
import { CodeOfCare } from "./CodeOfCare";
import { cx } from "./cx";
import s from "./checkout.module.css";

/** Trust-badge card networks — brand marks, expression-rendered so they read
 * as data rather than authored prose (matches CardForm's BRAND_LABEL map). */
const TRUST_CARD_BRANDS = ["VISA", "MC", "AMEX"];

export function PaymentStep({ pf }: { pf: PaymentForm }) {
  const { method, pricing, goStep } = useCheckout();
  const { t } = useTranslation();
  const fmt = useFormat();

  const amount = fmt.currency(pricing.total);
  const payLabel =
    method === "mbway"
      ? t("gatherings:checkout.payment.payCtaMbway", { amount })
      : method === "multibanco"
        ? t("gatherings:checkout.payment.payCtaMultibanco", { amount })
        : t("gatherings:checkout.payment.payCtaCard", { amount });

  return (
    <>
      <h1 className={s["co-step-title"]}>
        <Translation
          i18nKey="gatherings:checkout.payment.title"
          components={{ em: <em /> }}
        />
      </h1>
      <p className={s["co-step-lede"]}>
        {t("gatherings:checkout.payment.lede")}
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
          {t("gatherings:checkout.payment.trustLock")}
        </span>
        <div className={s["co-trust-cards"]}>
          {TRUST_CARD_BRANDS.map((brand) => (
            <span key={brand} className={s["co-card-chip"]}>
              {brand}
            </span>
          ))}
          <span className={s["co-stripe-badge"]}>
            <Translation
              i18nKey="gatherings:checkout.payment.viaStripe"
              components={{ strong: <strong /> }}
            />
          </span>
        </div>
      </div>

      <Button
        variant="primary"
        className={cx(s["co-pay-btn"], pf.processing && s.loading)}
        disabled={!pf.canPay || pf.processing}
        onClick={pf.submit}
      >
        {pf.processing ? (
          t("gatherings:checkout.payment.processingLabel")
        ) : (
          <>
            {payLabel} <FiArrowRight aria-hidden />
          </>
        )}
      </Button>
      <p className={s["co-terms"]}>
        <Translation
          i18nKey="gatherings:checkout.payment.termsNotice"
          components={{
            terms: <Link to={routes.terms} />,
            privacy: <Link to={routes.privacy} />,
          }}
        />
      </p>
      <p className={s["co-demo-hint"]}>
        <Translation
          i18nKey="gatherings:checkout.payment.demoHint"
          components={{ strong: <strong /> }}
        />
      </p>

      <div className={s["co-step-nav"]}>
        <button
          className={s["co-back-btn"]}
          type="button"
          onClick={() => goStep(1, "back")}
        >
          <FiArrowLeft aria-hidden />{" "}
          {t("gatherings:checkout.payment.backToReviewCta")}
        </button>
      </div>
    </>
  );
}
