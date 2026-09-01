import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import type { UpsertFlatmateProfileBody } from "./api/flatmateProfile.api";
import { useMyFlatmateProfile } from "./api/useMyFlatmateProfile";
import { useUpsertFlatmateProfile } from "./api/useUpsertFlatmateProfile";
import {
  verificationRequiredFrom,
  type VerificationLevel,
} from "./api/verification.api";
import { StepUpVerificationModal } from "./StepUpVerificationModal";
import { useAffirmingPledgeGate } from "./useAffirmingPledgeGate";
import { ModalShell } from "./ModalKit";
import { PostProfileForm } from "./PostProfileForm";
import styles from "./FlatmatesPage.module.css";

export function PostProfileModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [stepUp, setStepUp] = useState<VerificationLevel | null>(null);
  const [pendingBody, setPendingBody] =
    useState<UpsertFlatmateProfileBody | null>(null);
  const { data: myProfile } = useMyFlatmateProfile();
  const { handlePledgeError, pledgeGate } = useAffirmingPledgeGate();
  const upsertFlatmateProfile = useUpsertFlatmateProfile();

  const handleSubmit = (body: UpsertFlatmateProfileBody) => {
    // Guard against a rapid double-click firing two POSTs while the first is
    // still in flight.
    if (upsertFlatmateProfile.isPending) return;
    upsertFlatmateProfile.mutate(body, {
      onSuccess: () => setSubmitted(true),
      onError: (error) => {
        if (handlePledgeError(error, () => handleSubmit(body))) return;
        const required = verificationRequiredFrom(error);
        if (required) {
          // Keep the entered profile so verifying then retries the same save.
          setPendingBody(body);
          setStepUp(required);
        } else {
          showToast(t("economy:postProfileModal.error"), "error");
        }
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
          if (pendingBody) handleSubmit(pendingBody);
        }}
        onClose={() => setStepUp(null)}
      />
    );
  }

  return (
    <ModalShell
      onClose={onClose}
      ariaLabel={t("economy:postProfileModal.ariaLabel")}
    >
      {submitted ? (
        <div className={styles.success}>
          <div className={styles.successIcon}>
            <svg
              viewBox="0 0 28 28"
              fill="none"
              stroke="var(--jade)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 14l6 6L23 8" />
            </svg>
          </div>
          <h2>
            <Translation
              i18nKey="economy:postProfileModal.success.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("economy:postProfileModal.success.body")}</p>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("economy:postProfileModal.success.backCta")}
          </Button>
        </div>
      ) : (
        // Keyed on the loaded profile so the form remounts (re-running its
        // useState initializers) once `useMyFlatmateProfile` resolves in live
        // edit mode — otherwise an existing profile opens blank. Demo/create
        // resolve immediately/to null, so the key stays "new".
        <PostProfileForm
          key={myProfile?.slug ?? "new"}
          initial={myProfile}
          onSubmit={handleSubmit}
          onClose={onClose}
          // A confirmed take-down closes the editor back to the board, which
          // the delete hook has already invalidated. The success is announced
          // by the toast the danger zone raises, so there is no second panel
          // claiming something the request may not have done.
          onDeleted={onClose}
          submitting={upsertFlatmateProfile.isPending}
        />
      )}
    </ModalShell>
  );
}
