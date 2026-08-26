import { useState } from "react";
import { FiClock } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSubmitGroupListing } from "./api/useGroupListingOwnerActions";
import {
  verificationRequiredFrom,
  type VerificationLevel,
} from "./api/verification.api";
import { StepUpVerificationModal } from "./StepUpVerificationModal";
import { useAffirmingPledgeGate } from "./useAffirmingPledgeGate";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import { ScamSafetyBanner } from "./ScamSafetyBanner";
import { GroupListingFields } from "./GroupListingFields";
import { useGroupListingForm } from "./useGroupListingForm";
import styles from "./ApplicationModals.module.css";

/**
 * A member shares a room inside a vetted housing group (LOC-19).
 *
 * `POST /housing-groups/:slug/listings` had no caller anywhere, so the group
 * review queue had nothing in it and the poster's own edit and withdraw
 * controls acted on listings nobody could create. This is the missing form.
 *
 * The room lands in review and reaches the group page only once a moderator
 * clears it. That is said before the send and repeated in the confirmation, so
 * nobody walks away believing their room is up. Both backend gates (the
 * affirming pledge, a phone-verified account) come back as errors and open
 * their own prompt, since only the server knows where the member stands.
 */
export function PostGroupRoomModal({
  groupSlug,
  groupName,
  onClose,
}: {
  groupSlug: string;
  groupName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const form = useGroupListingForm();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [stepUpLevel, setStepUpLevel] = useState<VerificationLevel | null>(
    null,
  );
  const { handlePledgeError, pledgeGate } = useAffirmingPledgeGate();
  const submitListing = useSubmitGroupListing(groupSlug);

  function handleSubmit() {
    if (!form.isValid) return;
    submitListing.mutate(form.buildBody(), {
      // Confirmed from the server's answer, never before it.
      onSuccess: () => setIsSubmitted(true),
      // Neither gate is a failure: open the matching prompt so the member can
      // accept the pledge or verify and retry, rather than hit a dead end.
      onError: (error) => {
        if (handlePledgeError(error, handleSubmit)) return;
        const requiredLevel = verificationRequiredFrom(error);
        if (requiredLevel) {
          setStepUpLevel(requiredLevel);
          return;
        }
        showToast(
          describeError(
            t("economy:groupListing.post.failed"),
            error,
            t("shared:apiError.tryAgainTail"),
          ),
          "error",
        );
      },
    });
  }

  if (pledgeGate) return pledgeGate;

  if (stepUpLevel) {
    return (
      <StepUpVerificationModal
        requiredLevel={stepUpLevel}
        onVerified={() => {
          setStepUpLevel(null);
          handleSubmit();
        }}
        onClose={() => setStepUpLevel(null)}
      />
    );
  }

  return (
    <ModalShell
      onClose={onClose}
      success={isSubmitted}
      ariaLabel={t("economy:groupListing.post.ariaLabel", { group: groupName })}
    >
      {isSubmitted ? (
        <SuccessPanel
          title={t("economy:groupListing.post.success.title")}
          em={t("economy:groupListing.post.success.titleEm")}
          onClose={onClose}
          closeLabel={t("economy:housingModal.done")}
        >
          <Translation
            i18nKey="economy:groupListing.post.success.body"
            values={{ group: groupName }}
            components={{ strong: <strong /> }}
          />
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>
            {t("economy:groupListing.post.eyebrow")}
          </div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="economy:groupListing.post.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.sub}>
            {t("economy:groupListing.post.sub", { group: groupName })}
          </p>

          <ScamSafetyBanner />

          <p className={styles.reviewWarning}>
            <FiClock aria-hidden />
            {t("economy:groupListing.post.reviewNotice")}
          </p>

          <GroupListingFields form={form} />

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              {t("economy:housingModal.cancel")}
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!form.isValid || submitListing.isPending}
              onClick={handleSubmit}
            >
              {submitListing.isPending ? (
                <Sending label={t("economy:groupListing.post.submitting")} />
              ) : (
                t("economy:groupListing.post.submitCta")
              )}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
