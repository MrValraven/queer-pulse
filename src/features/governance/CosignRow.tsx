import { useState } from "react";
import { FiEye, FiFeather, FiUserPlus, FiUserX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useAuth } from "../../app/providers/authContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useGovernanceCosign } from "./api/useGovernanceProposals";
import type { GovernanceProposalDTO } from "./api/governanceProposals.api";
import styles from "./GovernancePage.module.css";

/**
 * The gathering half of a member motion: how many members have put their name
 * to it, and the one control that changes that. The proposer's own founding
 * signature is fixed, so they are never offered a withdraw button that would
 * leave a motion nobody proposed. Once the co-signature window has passed the
 * control locks and the row says why.
 */
export function CosignRow({ proposal }: { proposal: GovernanceProposalDTO }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { loggedIn, user } = useAuth();
  const { demoMode, cosign, pending } = useGovernanceCosign();
  // `null` until this member acts; afterwards it is the signature state we
  // show while the live refetch settles (and the only state demo mode has).
  const [pendingSignature, setPendingSignature] = useState<boolean | null>(
    null,
  );

  const threshold = proposal.cosignatureThreshold;
  const hasSigned = pendingSignature ?? proposal.hasCosigned;
  const signatureDelta =
    pendingSignature === null || pendingSignature === proposal.hasCosigned
      ? 0
      : pendingSignature
        ? 1
        : -1;
  const signatureCount = Math.max(
    0,
    proposal.cosignatureCount + signatureDelta,
  );

  const isAwaitingReview = proposal.status === "screening";
  const isProposer =
    proposal.proposedByMemberId !== null &&
    user?.id === proposal.proposedByMemberId;
  // The clock is snapshotted at mount rather than read inline: `Date.now()` is
  // impure, so calling it during render would re-judge "has this drive closed"
  // against a different clock on any unrelated re-render. A mount-time reading
  // is honest here because the window is measured in days, and the server is
  // the authority either way (it refuses a signature on a closed drive), so
  // the worst a stale snapshot costs is one refused click.
  const [nowMs] = useState(() => Date.now());
  const isWindowClosed =
    proposal.gatheringClosesAt !== null &&
    new Date(proposal.gatheringClosesAt).getTime() < nowMs;
  const isThresholdMet = threshold !== null && signatureCount >= threshold;

  const handleCosign = (isWithdrawing: boolean) => {
    setPendingSignature(!isWithdrawing);
    if (demoMode) return;
    cosign(
      { proposalId: proposal.id, isWithdrawing },
      {
        onError: () => {
          setPendingSignature(null);
          showToast(
            t("governance:sections.proposals.cosign.errorToast"),
            "error",
          );
        },
      },
    );
  };

  const progressPercent =
    threshold === null || threshold === 0
      ? 100
      : Math.min(100, Math.round((signatureCount / threshold) * 100));

  return (
    <div className={styles.proposalCosign}>
      <div className={styles.proposalCosignText}>
        <FiFeather aria-hidden />{" "}
        {threshold === null || isThresholdMet
          ? t("governance:sections.proposals.cosign.progressComplete", {
              count: signatureCount,
            })
          : t("governance:sections.proposals.cosign.progress", {
              count: signatureCount,
              threshold,
            })}
      </div>
      <div className={styles.proposalCosignTrack} aria-hidden>
        <div
          className={styles.proposalCosignFill}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      {isAwaitingReview ? (
        <p className={styles.proposalCosignNote}>
          <FiEye aria-hidden />{" "}
          {t("governance:sections.proposals.cosign.awaitingReview")}
        </p>
      ) : (
        <>
          {proposal.gatheringClosesAt && (
            <p className={styles.proposalCosignNote}>
              {t(
                isWindowClosed
                  ? "governance:sections.proposals.cosign.closed"
                  : "governance:sections.proposals.cosign.closes",
                { date: fmt.date(new Date(proposal.gatheringClosesAt)) },
              )}
            </p>
          )}
          {isProposer ? (
            <p className={styles.proposalCosignNote}>
              {t("governance:sections.proposals.cosign.proposerNote")}
            </p>
          ) : !loggedIn ? (
            <p className={styles.proposalCosignNote}>
              {t("governance:sections.proposals.cosign.signedInOnly")}
            </p>
          ) : (
            <div className={styles.proposalVoteRow}>
              {hasSigned ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCosign(true)}
                  disabled={pending}
                >
                  <FiUserX aria-hidden />
                  {t("governance:sections.proposals.cosign.withdrawCta")}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="jade"
                  onClick={() => handleCosign(false)}
                  disabled={pending || isWindowClosed}
                >
                  <FiUserPlus aria-hidden />
                  {t("governance:sections.proposals.cosign.cta")}
                </Button>
              )}
            </div>
          )}
          {hasSigned && !isProposer && (
            <p className={styles.proposalCosignNote}>
              {t("governance:sections.proposals.cosign.signed")}
            </p>
          )}
        </>
      )}
    </div>
  );
}
