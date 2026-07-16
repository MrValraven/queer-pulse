import { useState } from "react";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useCheckout } from "./checkoutContext";
import { validEmail } from "./checkout.validation";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function AttendeeDetails() {
  const { isGuest, guestEmail, dietary, access, patch } = useCheckout();
  const { t } = useTranslation();
  const [emailErr, setEmailErr] = useState(false);

  return (
    <>
      {isGuest && (
        <div className={s["co-field"]}>
          <label className={s["co-lbl"]} htmlFor="guestEmail">
            {t("gatherings:checkout.attendee.emailLabel")}
          </label>
          <input
            className={cx(s["co-in"], emailErr && s.invalid)}
            id="guestEmail"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={guestEmail}
            onChange={(e) => {
              patch({ guestEmail: e.target.value });
              if (emailErr) setEmailErr(false);
            }}
            onBlur={(e) =>
              setEmailErr(
                !!e.target.value && !validEmail(e.target.value.trim()),
              )
            }
            placeholder={t("gatherings:checkout.attendee.emailPlaceholder")}
          />
          <div className={cx(s["co-err"], emailErr && s.show)}>
            {t("gatherings:checkout.attendee.emailError")}
          </div>
        </div>
      )}

      <div className={s["co-field"]} style={{ marginBottom: 12 }}>
        <label className={s["co-lbl"]} htmlFor="dietary">
          <Translation
            i18nKey="gatherings:checkout.attendee.dietaryLabel"
            components={{ opt: <span className={s.opt} /> }}
          />
        </label>
        <textarea
          className={s["co-ta"]}
          id="dietary"
          value={dietary}
          onChange={(e) => patch({ dietary: e.target.value })}
          placeholder={t("gatherings:checkout.attendee.dietaryPlaceholder")}
          autoComplete="off"
        />
      </div>

      <div className={s["co-field"]}>
        <label className={s["co-lbl"]} htmlFor="access">
          {t("gatherings:checkout.attendee.accessLabel")}{" "}
          <span className={s.opt}>
            {t("gatherings:checkout.attendee.optionalTag")}
          </span>
        </label>
        <textarea
          className={s["co-ta"]}
          id="access"
          value={access}
          onChange={(e) => patch({ access: e.target.value })}
          placeholder={t("gatherings:checkout.attendee.accessPlaceholder")}
          autoComplete="off"
        />
      </div>
    </>
  );
}
