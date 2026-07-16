import { useState } from "react";
import { Button } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { EVENT, MAX_SEATS } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { validEmail } from "./checkout.validation";
import { cx } from "./cx";
import s from "./checkout.module.css";

const PARTY_SIZE_OPTIONS = [1, 2, 3, 4];

export function SeatQuantity() {
  const { qty, changeQty } = useCheckout();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [wlEmail, setWlEmail] = useState("");
  const [wlInvalid, setWlInvalid] = useState(false);

  function joinWaitlist() {
    if (!validEmail(wlEmail.trim())) {
      setWlInvalid(true);
      return;
    }
    setWlInvalid(false);
    setWaitlistOpen(false);
    showToast(t("gatherings:checkout.seats.waitlistSuccessToast"), "success");
  }

  return (
    <>
      <div className={s["co-qty-row"]}>
        <div>
          <div className={s["co-qty-lbl"]}>{t("gatherings:checkout.seats.label")}</div>
          <div className={s["co-qty-sub"]}>
            {t("gatherings:checkout.seats.sub", { count: qty })}
          </div>
        </div>
        <div
          className={s["co-stepper"]}
          role="group"
          aria-label={t("gatherings:checkout.seats.stepperAria")}
        >
          <button
            className={s["co-step-btn"]}
            type="button"
            onClick={() => changeQty(-1)}
            disabled={qty <= 1}
            aria-label={t("gatherings:checkout.seats.removeAria")}
          >
            −
          </button>
          <span className={s["co-qty-val"]} aria-live="polite">
            {qty}
          </span>
          <button
            className={s["co-step-btn"]}
            type="button"
            onClick={() => changeQty(1)}
            disabled={qty >= MAX_SEATS}
            aria-label={t("gatherings:checkout.seats.addAria")}
          >
            +
          </button>
        </div>
      </div>

      <div className={s["co-waitlist-link"]}>
        {t("gatherings:checkout.seats.waitlistPrompt", { maxSeats: MAX_SEATS })}{" "}
        <button type="button" onClick={() => setWaitlistOpen((o) => !o)}>
          {t("gatherings:checkout.seats.joinWaitlistCta")}
        </button>
      </div>

      <div className={cx(s["co-waitlist"], waitlistOpen && s.show)}>
        <div className={s["co-waitlist-h"]}>
          {t("gatherings:checkout.seats.waitlistHeading")}
        </div>
        <div className={s["co-waitlist-p"]}>
          {t("gatherings:checkout.seats.waitlistBody", {
            host: EVENT.hostName.split(" ")[0] ?? EVENT.hostName,
          })}
        </div>
        <div className={s["co-grid-2"]}>
          <div className={s["co-field"]}>
            <label className={s["co-lbl"]} htmlFor="wlEmail">
              {t("gatherings:checkout.seats.emailLabel")}
            </label>
            <input
              className={cx(s["co-in"], wlInvalid && s.invalid)}
              id="wlEmail"
              type="email"
              inputMode="email"
              value={wlEmail}
              onChange={(e) => setWlEmail(e.target.value)}
              placeholder={t("gatherings:checkout.seats.emailPlaceholder")}
            />
          </div>
          <div className={s["co-field"]}>
            <label className={s["co-lbl"]} htmlFor="wlSize">
              {t("gatherings:checkout.seats.partySizeLabel")}
            </label>
            <select className={s["co-select"]} id="wlSize">
              {PARTY_SIZE_OPTIONS.map((count) => (
                <option key={count} value={count}>
                  {t("gatherings:checkout.seats.partySizeOption", { count })}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}
        >
          <Button
            variant="primary"
            onClick={joinWaitlist}
            style={{ padding: "10px 20px" }}
          >
            {t("gatherings:checkout.seats.waitlistSubmitCta")} →
          </Button>
        </div>
      </div>
    </>
  );
}
