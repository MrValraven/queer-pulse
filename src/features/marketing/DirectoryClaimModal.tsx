import { useState } from "react";
import {
  Button,
  FormField,
  ModalSheet,
  Sending,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useClaimListing } from "./api/useClaimListing";
import { useListingClaimPolicy } from "./listBusiness/api/useListingClaims";
import { ClaimAffirmingBaselinePledge } from "./ClaimAffirmingBaselinePledge";
import { DirectoryClaimSuccessPanel } from "./DirectoryClaimSuccessPanel";
import styles from "./DirectoryClaimModal.module.css";

const NOTE_MAX_LENGTH = 2000;

/**
 * "Claim this listing" — for a member who actually runs a business already
 * listed here (by someone else, or by no one). Files through
 * `useClaimListing` (`POST /listings/:ref/claim`) into the moderator review
 * queue; a human reviews and, on approval, reassigns ownership — there's no
 * automatic identity check, so the confirmation is honest about that ("sent
 * for review", never "you now own this").
 */
export function DirectoryClaimModal({
  listingRef,
  placeName,
  onClose,
}: {
  listingRef: string;
  placeName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const claim = useClaimListing(listingRef);
  // The turnaround and the evidence hints come from GET /listings/claim-policy,
  // never from a second copy in this component: the number promised here has to
  // be the number the claim's own status line counts down against, and a
  // moderation-queue commitment is a backend fact. Null in demo mode and while
  // the read is in flight, which simply hides the block.
  const { policy } = useListingClaimPolicy();
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  // Claiming a listing means becoming its owner, and the API rejects the
  // request outright without this: see `ClaimAffirmingBaselinePledge` for why
  // it is required even on a listing that already carries an acceptance.
  const [isBaselineAgreed, setIsBaselineAgreed] = useState(false);

  const submit = () => {
    if (claim.isPending || !isBaselineAgreed) return;
    const trimmedNote = note.trim();
    claim.mutate(
      { note: trimmedNote || undefined, affirmingBaselineAccepted: true },
      {
        onSuccess: () => setDone(true),
        onError: () =>
          showToast(t("marketing:directory.detail.claim.errorToast"), "error"),
      },
    );
  };

  if (done) {
    return (
      <DirectoryClaimSuccessPanel
        onClose={onClose}
        placeName={placeName}
        policy={policy}
        demoMode={demoMode}
      />
    );
  }

  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("marketing:directory.detail.claim.ariaLabel", {
        name: placeName,
      })}
    >
      <div className={styles.eyebrow}>
        {t("marketing:directory.detail.claim.eyebrow")}
      </div>
      <h3 className={styles.title}>
        <Translation
          i18nKey="marketing:directory.detail.claim.title"
          components={{ em: <em /> }}
          values={{ name: placeName }}
        />
      </h3>
      <p className={styles.sub}>{t("marketing:directory.detail.claim.sub")}</p>

      {policy && (
        <div className={styles.policy}>
          <h4 className={styles.policyTitle}>
            {t("marketing:directory.detail.claim.policyTitle")}
          </h4>
          <p className={styles.policyTurnaround}>
            {t("marketing:directory.detail.claim.policyTurnaround", {
              count: policy.reviewTurnaroundDays,
            })}
          </p>
          {policy.evidenceHints.length > 0 && (
            <>
              <p className={styles.policyHintsLabel}>
                {t("marketing:directory.detail.claim.policyHintsLabel")}
              </p>
              {/* Server-owned copy, rendered as written: the backend has no
                  i18n layer, and these sentences are API-served content under
                  the repo's scope rule, not shipped chrome. */}
              <ul className={styles.policyHints}>
                {policy.evidenceHints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <FormField
        label={t("marketing:directory.detail.claim.noteLabel")}
        labelAside={
          <span className={styles.counter}>
            {note.length}/{NOTE_MAX_LENGTH}
          </span>
        }
      >
        <textarea
          rows={5}
          value={note}
          maxLength={NOTE_MAX_LENGTH}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t("marketing:directory.detail.claim.notePlaceholder")}
        />
      </FormField>

      <p className={styles.note}>
        {t("marketing:directory.detail.claim.note")}
      </p>

      <ClaimAffirmingBaselinePledge
        placeName={placeName}
        isAgreed={isBaselineAgreed}
        isDisabled={claim.isPending}
        onChange={setIsBaselineAgreed}
      />

      <div className={styles.foot}>
        <Button variant="ghost" onClick={onClose}>
          {t("marketing:directory.detail.claim.cancel")}
        </Button>
        <Button
          variant="primary"
          onClick={submit}
          disabled={claim.isPending || !isBaselineAgreed}
        >
          {claim.isPending ? (
            <Sending label={t("marketing:directory.detail.claim.submitting")} />
          ) : (
            t("marketing:directory.detail.claim.submit")
          )}
        </Button>
      </div>
    </ModalSheet>
  );
}
