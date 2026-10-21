import { useEffect, useRef, useState, type FormEvent } from "react";
import { FiCheck, FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Button, Collapse } from "../../shared/components/ui";
import { StudioShell } from "./StudioShell";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PLAN_PRICE } from "./studioCheckout.data";
import s from "./studioPages.module.css";
import { StudioCheckoutSummary } from "./StudioCheckoutSummary";
import local from "./StudioCheckoutPage.module.css";

type CheckoutPhase = "idle" | "processing" | "declined" | "done";

/** Demo rule: a card number ending in this declines, so the showcase can model
 *  a refused payment. */
const DEMO_DECLINED_ENDING = "0002";
const DEMO_PROCESSING_MS = 1400;

export function StudioCheckoutPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [phase, setPhase] = useState<CheckoutPhase>("idle");
  const [declinedLastFour, setDeclinedLastFour] = useState("");
  const timer = useRef<number | undefined>(undefined);
  const isProcessing = phase === "processing";

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const priceLabel = fmt.currency(PLAN_PRICE, "EUR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const cadenceLabel = t("studio:checkout.cadenceMonthly");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isProcessing) return;
    const cardEntry = new FormData(event.currentTarget).get("cardNumber");
    const cardDigits = (typeof cardEntry === "string" ? cardEntry : "").replace(
      /\D/g,
      "",
    );
    setPhase("processing");
    timer.current = window.setTimeout(() => {
      if (cardDigits.endsWith(DEMO_DECLINED_ENDING)) {
        setDeclinedLastFour(cardDigits.slice(-4));
        setPhase("declined");
        return;
      }
      setPhase("done");
      showToast(t("studio:checkout.doneToast"));
    }, DEMO_PROCESSING_MS);
  }

  if (phase === "done") {
    return (
      <StudioShell>
        <div className={`${s.done} ${s.screenIn}`} key="done">
          <div className={s.doneIcon}>
            <FiCheck />
          </div>
          <h1>
            <Translation
              i18nKey="studio:checkout.doneTitle"
              components={{ em: <em /> }}
            />
          </h1>
          <p>{t("studio:checkout.doneBody", { amount: priceLabel })}</p>
          <div className={s.doneActions}>
            <Button to={routes.studio} variant="primary">
              {t("studio:checkout.startListeningCta")}{" "}
              <FiArrowRight aria-hidden />
            </Button>
            <Button to={routes.studioLibrary} variant="ghost">
              {t("studio:checkout.goToLibraryCta")}
            </Button>
          </div>
        </div>
      </StudioShell>
    );
  }

  return (
    <StudioShell>
      <div className={s.pageH}>
        <div className={s.eb}>{t("studio:checkout.eyebrow")}</div>
        <h1>
          <Translation
            i18nKey="studio:checkout.title"
            components={{ em: <em /> }}
          />
        </h1>
        <div className={s.dek}>{t("studio:checkout.dek")}</div>
      </div>

      <div className={s.coGrid}>
        <form onSubmit={handleSubmit} aria-busy={isProcessing}>
          <fieldset disabled={isProcessing} className={local.fields}>
            <div className={s.coField}>
              <label className={s.coLabel} htmlFor="co-name">
                {t("studio:checkout.nameLabel")}
              </label>
              <input
                id="co-name"
                name="cardName"
                className={s.coInput}
                type="text"
                autoComplete="cc-name"
                placeholder={t("studio:checkout.namePlaceholder")}
                required
              />
            </div>
            <div className={s.coField}>
              <label className={s.coLabel} htmlFor="co-card">
                {t("studio:checkout.cardLabel")}
              </label>
              <input
                id="co-card"
                name="cardNumber"
                className={s.coInput}
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder={t("studio:checkout.cardPlaceholder")}
                required
              />
            </div>
            <div className={s.coRow}>
              <div className={s.coField}>
                <label className={s.coLabel} htmlFor="co-exp">
                  {t("studio:checkout.expiryLabel")}
                </label>
                <input
                  id="co-exp"
                  name="cardExpiry"
                  className={s.coInput}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder={t("studio:checkout.expiryPlaceholder")}
                  required
                />
              </div>
              <div className={s.coField}>
                <label className={s.coLabel} htmlFor="co-cvc">
                  {t("studio:checkout.cvcLabel")}
                </label>
                <input
                  id="co-cvc"
                  name="cardCvc"
                  className={s.coInput}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  required
                />
              </div>
            </div>
          </fieldset>
          <Collapse isOpen={phase === "declined"}>
            <p className={local.error} role="alert">
              {t("studio:checkout.declined", { last4: declinedLastFour })}
            </p>
          </Collapse>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isProcessing}
            style={{ width: "100%", marginTop: 8 }}
          >
            {isProcessing ? (
              t("studio:checkout.processingCta")
            ) : (
              <>
                {t("studio:checkout.payCta", {
                  amount: priceLabel,
                  cadence: cadenceLabel,
                })}{" "}
                <FiArrowRight aria-hidden />
              </>
            )}
          </Button>
          <p className={s.sumNote}>{t("studio:checkout.prototypeNote")}</p>
          <p className={s.sumNote}>{t("studio:checkout.declineHint")}</p>
        </form>

        <StudioCheckoutSummary priceLabel={priceLabel} />
      </div>
    </StudioShell>
  );
}
