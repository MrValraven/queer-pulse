import { BILLING_COUNTRIES } from "./checkout.data";
import { validPostal } from "./checkout.validation";
import type { PaymentForm } from "./usePaymentForm";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function BillingFields({ pf }: { pf: PaymentForm }) {
  return (
    <>
      <div className={s["co-sec"]}>Billing</div>
      <div className={s["co-grid-2"]}>
        <div className={s["co-field"]}>
          <label className={s["co-lbl"]} htmlFor="billCountry">
            Country
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
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className={s["co-field"]}>
          <label className={s["co-lbl"]} htmlFor="billPostal">
            Postal code
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
            Enter your postal code.
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
          I need a <strong>VAT invoice</strong> for a business
        </span>
      </label>
      {pf.vatOpen && (
        <div style={{ marginTop: 12 }}>
          <div className={s["co-grid-2"]}>
            <div className={s["co-field"]}>
              <label className={s["co-lbl"]} htmlFor="vatCompany">
                Company name
              </label>
              <input
                className={s["co-in"]}
                id="vatCompany"
                type="text"
                placeholder="Company, Lda."
              />
            </div>
            <div className={s["co-field"]}>
              <label className={s["co-lbl"]} htmlFor="vatNumber">
                VAT / NIF number
              </label>
              <input
                className={s["co-in"]}
                id="vatNumber"
                type="text"
                placeholder="PT123456789"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
