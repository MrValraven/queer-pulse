import { useState, type FormEvent } from "react";
import { FiCheck, FiLock } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { ModalShell, SuccessPanel, Sending } from "../economy/ModalKit";
import { useSubmitFlow } from "../economy/modalFlow";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import modal from "../economy/ApplicationModals.module.css";
import styles from "./DonateModal.module.css";

const FEE_RATE = 0.03;

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

export function DonateModal({
  amount,
  monthly,
  onClose,
}: {
  amount: number;
  monthly: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { submit, sending, done } = useSubmitFlow();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [coverFee, setCoverFee] = useState(true);

  const fee = coverFee ? Math.round(amount * FEE_RATE * 100) / 100 : 0;
  const total = amount + fee;

  const ready =
    name.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(email) &&
    card.replace(/\s/g, "").length >= 15 &&
    expiry.replace(/\D/g, "").length === 4 &&
    cvc.length >= 3;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!ready || sending) return;
    submit(undefined, 1100);
  }

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title={t("marketing:donateModal.success.title")}
          em={t(
            monthly
              ? "marketing:donateModal.success.emMonthly"
              : "marketing:donateModal.success.emOneOff",
          )}
          onClose={onClose}
          closeLabel={t("marketing:donateModal.success.closeLabel")}
        >
          {t(
            monthly
              ? "marketing:donateModal.success.bodyMonthly"
              : "marketing:donateModal.success.bodyOneOff",
            { amount: fmt.currency(total) },
          )}
        </SuccessPanel>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className={modal.eyebrow}>
            {t("marketing:donate.hero.eyebrow")}
          </div>
          <h2 className={modal.title}>
            <Translation
              i18nKey="marketing:donateModal.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={modal.sub}>{t("marketing:donateModal.sub")}</p>

          <div className={modal.panel}>
            <div className={modal.rows}>
              <div className={modal.row}>
                <span className={modal.rowK}>
                  {t(
                    monthly
                      ? "marketing:donateModal.row.monthlyGift"
                      : "marketing:donateModal.row.oneOffGift",
                  )}
                </span>
                <span className={modal.rowV}>
                  {monthly
                    ? t("marketing:donateModal.amount.monthly", {
                        amount: fmt.currency(amount),
                      })
                    : fmt.currency(amount)}
                </span>
              </div>
              {coverFee && (
                <div className={modal.row}>
                  <span className={modal.rowK}>
                    {t("marketing:donateModal.row.feeCovered")}
                  </span>
                  <span className={modal.rowV}>{fmt.currency(fee)}</span>
                </div>
              )}
              <div className={modal.row}>
                <span className={modal.rowK}>
                  {t("marketing:donateModal.row.chargedToday")}
                </span>
                <span className={modal.rowV}>
                  {monthly
                    ? t("marketing:donateModal.amount.monthly", {
                        amount: fmt.currency(total),
                      })
                    : fmt.currency(total)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className={`${modal.checkRow} ${coverFee ? modal.checkRowOn : ""}`}
            onClick={() => setCoverFee((v) => !v)}
            aria-pressed={coverFee}
          >
            <span className={modal.checkBox}>
              {coverFee && <FiCheck size={14} aria-hidden />}
            </span>
            <span className={modal.checkText}>
              <span className={modal.checkLabel}>
                {t("marketing:donateModal.checkLabel", {
                  pct: Math.round(FEE_RATE * 100),
                })}
              </span>
              <span className={modal.checkHint}>
                {t("marketing:donateModal.checkHint", {
                  amount: fmt.currency(amount),
                })}
              </span>
            </span>
          </button>

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
              placeholder="you@example.com"
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
                onChange={(e) =>
                  setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="123"
                autoComplete="cc-csc"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="jade"
            size="lg"
            disabled={!ready || sending}
            style={{ width: "100%" }}
          >
            {sending ? (
              <Sending label={t("marketing:donateModal.processing")} />
            ) : (
              t(
                monthly
                  ? "marketing:donateModal.submitCta.monthly"
                  : "marketing:donateModal.submitCta.oneOff",
                { amount: fmt.currency(total) },
              )
            )}
          </Button>
          <p className={styles.secure}>
            <FiLock size={12} aria-hidden /> {t("marketing:donateModal.secure")}
          </p>
        </form>
      )}
    </ModalShell>
  );
}
