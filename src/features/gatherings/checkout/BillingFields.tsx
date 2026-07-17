import { BILLING_COUNTRIES } from "./checkout.data";
import { validPostal } from "./checkout.validation";
import type { PaymentForm } from "./usePaymentForm";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cx } from "./cx";
import s from "./checkout.module.css";

/** `BILLING_COUNTRIES` (in `checkout.data.ts`, out of this slice) holds
 * English labels; map each option value to its own catalog key here so the
 * dropdown renders localized country names without touching that file. */
const COUNTRY_NAME_KEY: Record<string, string> = {
  PT: "gatherings:checkout.billing.country.pt",
  ES: "gatherings:checkout.billing.country.es",
  FR: "gatherings:checkout.billing.country.fr",
  DE: "gatherings:checkout.billing.country.de",
  IT: "gatherings:checkout.billing.country.it",
  NL: "gatherings:checkout.billing.country.nl",
  IE: "gatherings:checkout.billing.country.ie",
  GB: "gatherings:checkout.billing.country.gb",
  US: "gatherings:checkout.billing.country.us",
  OTHER: "gatherings:checkout.billing.country.other",
};

export function BillingFields({ pf }: { pf: PaymentForm }) {
  const { t } = useTranslation();

  return (
    <>
      <div className={s["co-sec"]}>
        {t("gatherings:checkout.billing.heading")}
      </div>
      <div className={s["co-grid-2"]}>
        <div className={s["co-field"]}>
          <label className={s["co-lbl"]} htmlFor="billCountry">
            {t("gatherings:checkout.billing.countryLabel")}
          </label>
          <select
            className={s["co-select"]}
            id="billCountry"
            autoComplete="country"
            value={pf.country}
            onChange={(e) => pf.setCountry(e.target.value)}
          >
            {BILLING_COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>
                {t(COUNTRY_NAME_KEY[c.value] ?? c.value)}
              </option>
            ))}
          </select>
        </div>
        <div className={s["co-field"]}>
          <label className={s["co-lbl"]} htmlFor="billPostal">
            {t("gatherings:checkout.billing.postalLabel")}
          </label>
          <input
            className={cx(s["co-in"], pf.errors.postal && s.invalid)}
            id="billPostal"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="1100-000"
            value={pf.postal}
            onChange={(e) => {
              pf.setPostal(e.target.value);
              if (pf.errors.postal) pf.setErr("postal", false);
            }}
            onBlur={(e) =>
              e.target.value && pf.setErr("postal", !validPostal(pf.postal))
            }
          />
          <div className={cx(s["co-err"], pf.errors.postal && s.show)}>
            {t("gatherings:checkout.billing.postalError")}
          </div>
        </div>
      </div>

      <label className={s["co-check-row"]} style={{ marginTop: 12 }}>
        <input
          type="checkbox"
          checked={pf.vatOpen}
          onChange={(e) => pf.setVatOpen(e.target.checked)}
        />
        <span className={s["co-check-box"]} aria-hidden />
        <span>
          <Translation
            i18nKey="gatherings:checkout.billing.vatCheckbox"
            components={{ strong: <strong /> }}
          />
        </span>
      </label>
      {pf.vatOpen && (
        <div style={{ marginTop: 12 }}>
          <div className={s["co-grid-2"]}>
            <div className={s["co-field"]}>
              <label className={s["co-lbl"]} htmlFor="vatCompany">
                {t("gatherings:checkout.billing.companyLabel")}
              </label>
              <input
                className={s["co-in"]}
                id="vatCompany"
                type="text"
                placeholder={t(
                  "gatherings:checkout.billing.companyPlaceholder",
                )}
              />
            </div>
            <div className={s["co-field"]}>
              <label className={s["co-lbl"]} htmlFor="vatNumber">
                {t("gatherings:checkout.billing.vatNumberLabel")}
              </label>
              <input
                className={s["co-in"]}
                id="vatNumber"
                type="text"
                placeholder={t(
                  "gatherings:checkout.billing.vatNumberPlaceholder",
                )}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
