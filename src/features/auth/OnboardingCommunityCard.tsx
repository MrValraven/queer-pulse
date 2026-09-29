import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CommunityJoinFlowModal } from "../communities/CommunityJoinFlowModal";
import type { Community } from "../homepage/data/types";
import { useOnboardingCommunityJoin } from "./useOnboardingCommunityJoin";
import styles from "./OnboardingPage.module.css";

/** One suggested community on the onboarding communities step. The button
 *  toggles: tap to join, tap again to leave. Each card owns its own hooks, so
 *  rules-of-hooks stay intact across a variable-length grid. */
export function OnboardingCommunityCard({
  community,
}: {
  community: Community;
}) {
  const { t } = useTranslation();
  const {
    status,
    message,
    isJoining,
    isBusy,
    isWizardOpen,
    handleTap,
    closeWizard,
    markJoined,
    markRequested,
  } = useOnboardingCommunityJoin(community);
  const isMember = status !== "idle";

  // A success line is for screen readers only: the button's check and label
  // already show it.
  const messageClassName =
    message?.tone === "success"
      ? "visuallyHidden"
      : [styles.ccMessage, message?.tone === "error" && styles.ccMessageError]
          .filter(Boolean)
          .join(" ");

  return (
    <div
      className={[styles.commCard, isMember && styles.commJoined]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.ccName}>{community.name}</div>
      <div className={styles.ccCount}>{community.count}</div>
      <div className={styles.ccDesc}>{community.description}</div>
      <button
        type="button"
        className={[styles.ccJoin, isMember && styles.ccJoinActive]
          .filter(Boolean)
          .join(" ")}
        onClick={() => void handleTap()}
        aria-disabled={isBusy || undefined}
        aria-busy={isJoining || undefined}
        aria-pressed={isMember}
        title={
          status === "joined"
            ? t("auth:onboarding.stepCommunities.leave")
            : undefined
        }
      >
        {isJoining ? (
          t("auth:onboarding.stepCommunities.joining")
        ) : status === "requested" ? (
          <>
            <FiCheck aria-hidden />{" "}
            {t("auth:onboarding.stepCommunities.requested")}
          </>
        ) : status === "joined" ? (
          <>
            <FiCheck aria-hidden />{" "}
            {t("auth:onboarding.stepCommunities.joined")}
          </>
        ) : (
          t("auth:onboarding.stepCommunities.join")
        )}
      </button>
      {/* Always mounted, so a screen reader hears the line it is given. */}
      <p className={messageClassName} aria-live="polite" aria-atomic="true">
        {message ? t(message.key, message.values) : null}
      </p>
      {isWizardOpen && (
        <CommunityJoinFlowModal
          community={community}
          onClose={closeWizard}
          onMembershipGranted={markJoined}
          onRequestFiled={markRequested}
        />
      )}
    </div>
  );
}
