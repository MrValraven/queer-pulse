import { useTranslation } from "../../shared/i18n/useTranslation";
import modal from "../economy/ApplicationModals.module.css";

function formatCard(raw: string) {
  return raw
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2
    ? `${digits.slice(0, 2)} / ${digits.slice(2)}`
    : digits;
}

/** Card + contact fields for the donation form. */
export function DonateModalFields({
  name,
  setName,
  email,
  setEmail,
  card,
  setCard,
  expiry,
  setExpiry,
  cvc,
  setCvc,
}: {
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  card: string;
  setCard: (value: string) => void;
  expiry: string;
  setExpiry: (value: string) => void;
  cvc: string;
  setCvc: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className={modal.field}>
        <label htmlFor="dn-name">
          {t("marketing:donateModal.field.nameOnCard")}
        </label>
        <input
          id="dn-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("marketing:donateModal.field.namePlaceholder")}
          autoComplete="cc-name"
        />
      </div>
      <div className={modal.field}>
        <label htmlFor="dn-email">
          {t("marketing:donateModal.field.emailReceipt")}
        </label>
        <input
          id="dn-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("marketing:donateModal.field.emailPlaceholder")}
          autoComplete="email"
        />
      </div>
      <div className={modal.field}>
        <label htmlFor="dn-card">
          {t("marketing:donateModal.field.cardNumber")}
        </label>
        <input
          id="dn-card"
          inputMode="numeric"
          value={card}
          onChange={(e) => setCard(formatCard(e.target.value))}
          placeholder="4242 4242 4242 4242"
          autoComplete="cc-number"
        />
      </div>
      <div className={modal.fieldRow}>
        <div className={modal.field}>
          <label htmlFor="dn-exp">
            {t("marketing:donateModal.field.expiry")}
          </label>
          <input
            id="dn-exp"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM / YY"
            autoComplete="cc-exp"
          />
        </div>
        <div className={modal.field}>
          <label htmlFor="dn-cvc">
            {t("marketing:donateModal.field.cvc")}
          </label>
          <input
            id="dn-cvc"
            inputMode="numeric"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="123"
            autoComplete="cc-csc"
          />
        </div>
      </div>
    </>
  );
}
