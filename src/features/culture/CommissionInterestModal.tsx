import { useState } from "react";
import { Avatar } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCreateCommissionInterest } from "./api/useCreateCommissionInterest";
import { CultureFormModal } from "./CultureFormModals";
import { SuccessPanel } from "./CultureModalKit";
import { COMMISSION_CAT_LABEL_KEY, type Commission } from "./culture.data";
import styles from "./CultureModals.module.css";

/**
 * Express-interest flow for a commission. Confirms intent, then shows a
 * plum-panel "we'll connect you if the creator wants to move forward" state.
 * Calls onSent so the card keeps its sent state after closing.
 *
 * The commission board's projects are curated editorial content
 * (`culture.data.tsx`), but this submission is real member data — it calls
 * `POST /commissions/interest` in live mode (see `useCreateCommissionInterest`),
 * demo mode keeps the prototype's simulated success.
 */
export function CommissionInterestModal({
  commission,
  onClose,
  onSent,
}: {
  commission: Commission;
  onClose: () => void;
  onSent: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [message, setMessage] = useState("");
  const mutation = useCreateCommissionInterest();

  function submit() {
    mutation.mutate(
      {
        commissionTitle: commission.title,
        commissionCategory: commission.category,
        recipientName: commission.who.name,
        message: message.trim() || undefined,
      },
      {
        onError: () =>
          showToast(t("culture:commissionInterest.errorToast"), "error"),
      },
    );
  }

  return (
    <CultureFormModal
      onClose={onClose}
      sending={mutation.isPending}
      done={mutation.isSuccess}
      eyebrow={t("culture:commissionInterest.eyebrow")}
      title={
        <Translation
          i18nKey="culture:commissionInterest.title"
          values={{ name: commission.who.name.split(" ")[0] }}
          components={{ em: <em /> }}
        />
      }
      sub={t("culture:commissionInterest.sub")}
      submitLabel={t("culture:commissionInterest.sendCta")}
      onSubmit={submit}
      success={
        <SuccessPanel
          title={t("culture:commissionInterest.success.title")}
          em={t("culture:commissionInterest.success.em")}
          steps={[
            <Translation
              key="step1"
              i18nKey="culture:commissionInterest.success.step1"
              values={{ name: commission.who.name }}
            />,
            t("culture:commissionInterest.success.step2"),
            t("culture:commissionInterest.success.step3"),
          ]}
          onClose={() => {
            onSent();
            onClose();
          }}
        >
          {t("culture:commissionInterest.success.body", {
            name: commission.who.name,
          })}
        </SuccessPanel>
      }
    >
      <div className={styles.panel}>
        <Avatar
          initials={commission.who.initials}
          tint={commission.who.tint}
          size={40}
        />
        <div>
          <div className={styles.panelCat}>
            {t(COMMISSION_CAT_LABEL_KEY[commission.category])}
          </div>
          <div className={styles.panelTitle}>{commission.title}</div>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="ci-msg">
          {t("culture:commissionInterest.messageLabel")}
        </label>
        <textarea
          id="ci-msg"
          placeholder={t("culture:commissionInterest.messagePlaceholder")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
    </CultureFormModal>
  );
}
