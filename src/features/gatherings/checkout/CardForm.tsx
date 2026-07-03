import { FiCheck } from "react-icons/fi";
import { useCheckout } from "./checkoutContext";
import {
  validCardNumber,
  validCvc,
  validExpiry,
  validName,
} from "./checkout.validation";
import type { PaymentForm } from "./usePaymentForm";
import { BillingFields } from "./BillingFields";
import { cx } from "./cx";
import s from "./checkout.module.css";

const BRAND_LABEL: Record<string, string> = {
  visa: "VISA",
  mc: "MC",
  amex: "AMEX",
};

export function CardForm({ pf }: { pf: PaymentForm }) {
  const { usingSaved, savedCardRemoved, selectSaved, removeSavedCard } =
    useCheckout();
  const { card, errors, brand } = pf;
  const savedSelected = usingSaved && !savedCardRemoved;

  return (
    <div className={s["co-paypanel"] + " " + s.on}>
      {!savedCardRemoved && (
        <div>
          <div className={s["co-sec"]} style={{ marginTop: 0 }}>
            Saved card
          </div>
          <button
            className={cx(s["co-saved-card"], !savedSelected && s.unsel)}
            type="button"
            aria-pressed={savedSelected}
            onClick={selectSaved}
          >
            <span className={s["co-sc-check"]} aria-hidden>
              <FiCheck />
            </span>
            <span className={s["co-sc-ico"]}>VISA</span>
            <span>
              <span className={s["co-sc-num"]} style={{ display: "block" }}>
                •••• •••• •••• 4242
              </span>
              <span className={s["co-sc-exp"]} style={{ display: "block" }}>
                Expires 09 / 28
              </span>
            </span>
            <span
              className={s["co-sc-manage"]}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                removeSavedCard();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  removeSavedCard();
                }
              }}
            >
              Remove
            </span>
          </button>
          <div className={s["co-or"]}>or use a new card</div>
        </div>
      )}

      <div className={cx(s["co-card-fields"], savedSelected && s.disabled)}>
        <div className={s["co-field"]}>
          <label className={s["co-lbl"]} htmlFor="ccNum">
            Card number
          </label>
          <div className={s["co-ccnum-wrap"]}>
            <input
              className={cx(s["co-in"], errors.num && s.invalid)}
              id="ccNum"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              value={card.num}
              onChange={(e) => pf.onNum(e.target.value)}
              onBlur={(e) =>
                e.target.value && pf.setErr("num", !validCardNumber(card.num))
              }
            />
            <span
              className={cx(
                s["co-brand-ico"],
                brand && s.show,
                brand && s[brand],
              )}
            >
              {BRAND_LABEL[brand] ?? ""}
            </span>
          </div>
          <div className={cx(s["co-err"], errors.num && s.show)}>
            Enter a valid 16-digit card number.
          </div>
        </div>

        <div className={s["co-grid-2"]}>
          <div className={s["co-field"]}>
            <label className={s["co-lbl"]} htmlFor="ccExp">
              Expiry
            </label>
            <input
              className={cx(s["co-in"], errors.exp && s.invalid)}
              id="ccExp"
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM / YY"
              maxLength={7}
              value={card.exp}
              onChange={(e) => pf.onExp(e.target.value)}
              onBlur={(e) =>
                e.target.value && pf.setErr("exp", !validExpiry(card.exp))
              }
            />
            <div className={cx(s["co-err"], errors.exp && s.show)}>
              Check the expiry date.
            </div>
          </div>
          <div className={s["co-field"]}>
            <label className={s["co-lbl"]} htmlFor="ccCvc">
              CVC
            </label>
            <input
              className={cx(s["co-in"], errors.cvc && s.invalid)}
              id="ccCvc"
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="•••"
              maxLength={4}
              value={card.cvc}
              onChange={(e) => pf.onCvc(e.target.value)}
              onBlur={(e) =>
                e.target.value && pf.setErr("cvc", !validCvc(card.cvc))
              }
            />
            <div className={cx(s["co-err"], errors.cvc && s.show)}>
              3 or 4 digits.
            </div>
          </div>
        </div>

        <div className={s["co-field"]}>
          <label className={s["co-lbl"]} htmlFor="ccName">
            Name on card
          </label>
          <input
            className={cx(s["co-in"], errors.name && s.invalid)}
            id="ccName"
            type="text"
            autoComplete="cc-name"
            placeholder="Full name"
            value={card.name}
            onChange={(e) => pf.onName(e.target.value)}
            onBlur={(e) =>
              e.target.value && pf.setErr("name", !validName(card.name))
            }
          />
          <div className={cx(s["co-err"], errors.name && s.show)}>
            Enter the name on the card.
          </div>
        </div>

        <label className={s["co-check-row"]} style={{ marginTop: 2 }}>
          <input
            type="checkbox"
            checked={card.saveCard}
            onChange={(e) => pf.setSaveCard(e.target.checked)}
          />
          <span className={s["co-check-box"]} aria-hidden />
          <span>Save this card securely for next time</span>
        </label>
      </div>

      <BillingFields pf={pf} />
    </div>
  );
}
