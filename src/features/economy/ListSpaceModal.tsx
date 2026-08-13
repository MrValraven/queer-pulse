import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSubmitHousingListing } from "./api/useSubmitHousingListing";
import {
  verificationRequiredFrom,
  type VerificationLevel,
} from "./api/verification.api";
import { StepUpVerificationModal } from "./StepUpVerificationModal";
import { useAffirmingPledgeGate } from "./useAffirmingPledgeGate";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import { ScamSafetyBanner } from "./ScamSafetyBanner";
import { ListSpaceFields } from "./ListSpaceFields";
import { useListSpaceForm } from "./useListSpaceForm";
import { useState } from "react";
import styles from "./ApplicationModals.module.css";

export function ListSpaceModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const form = useListSpaceForm();
  const [done, setDone] = useState(false);
  const [stepUp, setStepUp] = useState<VerificationLevel | null>(null);
  const { handlePledgeError, pledgeGate } = useAffirmingPledgeGate();
  const submitListing = useSubmitHousingListing();
  const sending = submitListing.isPending;

  const handleSubmit = () => {
    if (!form.valid) return;
    submitListing.mutate(form.buildBody(), {
      onSuccess: () => setDone(true),
      // Neither gate is a failure — open the matching prompt so the member can
      // accept the affirming pledge / verify and retry, not a dead-end toast.
      onError: (error) => {
        if (handlePledgeError(error, handleSubmit)) return;
        const required = verificationRequiredFrom(error);
        if (required) setStepUp(required);
        else showToast(t("economy:listSpace.error"), "error");
      },
    });
  };

  if (pledgeGate) return pledgeGate;

  if (stepUp) {
    return (
      <StepUpVerificationModal
        requiredLevel={stepUp}
        onVerified={() => {
          setStepUp(null);
          handleSubmit();
        }}
        onClose={() => setStepUp(null)}
      />
    );
  }

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title={t("economy:listSpace.success.title")}
          em={t("economy:listSpace.success.em")}
          onClose={onClose}
          closeLabel={t("economy:housingModal.done")}
        >
          <Translation
            i18nKey="economy:listSpace.success.body"
            values={{ title: form.title }}
            components={{ strong: <strong /> }}
          />
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>{t("economy:listSpace.eyebrow")}</div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="economy:listSpace.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.sub}>{t("economy:listSpace.sub")}</p>

          <ScamSafetyBanner />

          <ListSpaceFields form={form} />

          <p className={styles.note}>{t("economy:listSpace.note")}</p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              {t("economy:housingModal.cancel")}
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!form.valid || sending}
              onClick={handleSubmit}
            >
              {sending ? (
                <Sending label={t("economy:listSpace.submitting")} />
              ) : (
                t("economy:listSpace.submitCta")
              )}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
