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
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cx } from "./cx";
import s from "./checkout.module.css";

const BRAND_LABEL: Record<string, string> = {
  visa: "VISA",
  mc: "MC",
  amex: "AMEX",
};

/** Mock saved-card display — brand mark + expiry, kept as plain data so the
 * digits/format aren't baked into translatable prose. */
const SAVED_CARD_BRAND = "VISA";
const SAVED_CARD_MASK = "•••• •••• •••• 4242";
const SAVED_CARD_EXPIRY = "09 / 28";

interface SavedCardOptionProps {
  savedSelected: boolean;
  selectSaved: () => void;
  removeSavedCard: () => void;
}

/** The "use my saved card" row, split out to keep `CardForm` under the
 * per-component line limit. */
function SavedCardOption({
  savedSelected,
  selectSaved,
  removeSavedCard,
}: SavedCardOptionProps) {
  const { t } = useTranslation();

  return (
    <div>
      <div className={s["co-sec"]} style={{ marginTop: 0 }}>
        {t("gatherings:checkout.card.savedHeading")}
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
        <span className={s["co-sc-ico"]}>{SAVED_CARD_BRAND}</span>
        <span>
          <span className={s["co-sc-num"]} style={{ display: "block" }}>
            {SAVED_CARD_MASK}
          </span>
          <span className={s["co-sc-exp"]} style={{ display: "block" }}>
            {t("gatherings:checkout.card.savedExpiry", {
              expiry: SAVED_CARD_EXPIRY,
            })}
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
          {t("gatherings:checkout.card.removeSavedCta")}
        </span>
      </button>
      <div className={s["co-or"]}>
        {t("gatherings:checkout.card.orNewCard")}
      </div>
    </div>
  );
}

export function CardForm({ pf }: { pf: PaymentForm }) {
  const { usingSaved, savedCardRemoved, selectSaved, removeSavedCard } =
    useCheckout();
  const { t } = useTranslation();
  const { card, errors, brand } = pf;
  const savedSelected = usingSaved && !savedCardRemoved;

  return (
    <div className={s["co-paypanel"] + " " + s.on}>
      {!savedCardRemoved && (
        <SavedCardOption
          savedSelected={savedSelected}
          selectSaved={selectSaved}
          removeSavedCard={removeSavedCard}
        />
      )}

      <div className={cx(s["co-card-fields"], savedSelected && s.disabled)}>
        <div className={s["co-field"]}>
          <label className={s["co-lbl"]} htmlFor="ccNum">
            {t("gatherings:checkout.card.numberLabel")}
          </label>
          <div className={s["co-ccnum-wrap"]}>
            <input
              className={cx(s["co-in"], errors.number && s.invalid)}
              id="ccNum"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder={t("gatherings:checkout.card.numberPlaceholder")}
              maxLength={19}
              value={card.number}
              onChange={(e) => pf.onNumber(e.target.value)}
              onBlur={(e) =>
                e.target.value && pf.setErr("number", !validCardNumber(card.number))
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
          <div className={cx(s["co-err"], errors.number && s.show)}>
            {t("gatherings:checkout.card.numberError")}
          </div>
        </div>

        <div className={s["co-grid-2"]}>
          <div className={s["co-field"]}>
            <label className={s["co-lbl"]} htmlFor="ccExp">
              {t("gatherings:checkout.card.expiryLabel")}
            </label>
            <input
              className={cx(s["co-in"], errors.exp && s.invalid)}
              id="ccExp"
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder={t("gatherings:checkout.card.expiryPlaceholder")}
              maxLength={7}
              value={card.exp}
              onChange={(e) => pf.onExp(e.target.value)}
              onBlur={(e) =>
                e.target.value && pf.setErr("exp", !validExpiry(card.exp))
              }
            />
            <div className={cx(s["co-err"], errors.exp && s.show)}>
              {t("gatherings:checkout.card.expiryError")}
            </div>
          </div>
          <div className={s["co-field"]}>
            <label className={s["co-lbl"]} htmlFor="ccCvc">
              {t("gatherings:checkout.card.cvcLabel")}
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
              {t("gatherings:checkout.card.cvcError")}
            </div>
          </div>
        </div>

        <div className={s["co-field"]}>
          <label className={s["co-lbl"]} htmlFor="ccName">
            {t("gatherings:checkout.card.nameLabel")}
          </label>
          <input
            className={cx(s["co-in"], errors.name && s.invalid)}
            id="ccName"
            type="text"
            autoComplete="cc-name"
            placeholder={t("gatherings:checkout.card.namePlaceholder")}
            value={card.name}
            onChange={(e) => pf.onName(e.target.value)}
            onBlur={(e) =>
              e.target.value && pf.setErr("name", !validName(card.name))
            }
          />
          <div className={cx(s["co-err"], errors.name && s.show)}>
            {t("gatherings:checkout.card.nameError")}
          </div>
        </div>

        <label className={s["co-check-row"]} style={{ marginTop: 2 }}>
          <input
            type="checkbox"
            checked={card.saveCard}
            onChange={(e) => pf.setSaveCard(e.target.checked)}
          />
          <span className={s["co-check-box"]} aria-hidden />
          <span>{t("gatherings:checkout.card.saveCardLabel")}</span>
        </label>
      </div>

      <BillingFields pf={pf} />
    </div>
  );
}
