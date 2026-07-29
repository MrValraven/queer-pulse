import { useState, type FormEvent } from "react";
import { FiLock } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { ModalShell, SuccessPanel, Sending } from "../economy/ModalKit";
import { useSubmitFlow } from "../economy/modalFlow";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { DonateModalSummary } from "./DonateModalSummary";
import { DonateModalFields } from "./DonateModalFields";
import modal from "../economy/ApplicationModals.module.css";
import styles from "./DonateModal.module.css";

const FEE_RATE = 0.03;

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

          <DonateModalSummary
            amount={amount}
            fee={fee}
            total={total}
            monthly={monthly}
            coverFee={coverFee}
            setCoverFee={setCoverFee}
            feePct={Math.round(FEE_RATE * 100)}
          />

          <DonateModalFields
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            card={card}
            setCard={setCard}
            expiry={expiry}
            setExpiry={setExpiry}
            cvc={cvc}
            setCvc={setCvc}
          />

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
