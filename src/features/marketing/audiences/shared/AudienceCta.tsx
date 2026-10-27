import type { MouseEvent } from "react";
import { FiArrowDown, FiArrowRight } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { Button } from "../../../../shared/components/ui/Button";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { requestInvitePath } from "../../../auth/api/joinRequestSource";
import {
  AUDIENCE_SOURCES,
  AUDIENCE_WALKTHROUGH_HEADING_ID,
  AUDIENCE_WALKTHROUGH_ID,
  type AudienceId,
  type AudienceMemberAction,
} from "./audiences.data";
import { useAudienceViewer } from "./useAudienceViewer";
import styles from "./AudienceCta.module.css";

/**
 * Scrolls to the walkthrough and hands focus to its heading, so a keyboard
 * or screen-reader user continues from there. The hash stays out of the URL.
 */
function useWalkthroughJump() {
  const { reducedMotion } = useMotionPrefs();
  return (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document
      .getElementById(AUDIENCE_WALKTHROUGH_ID)
      ?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    document
      .getElementById(AUDIENCE_WALKTHROUGH_HEADING_ID)
      ?.focus({ preventScroll: true });
  };
}

/** A guest's invite request, tagged with the page it came from. */
function InviteButton({ audience }: { audience: AudienceId }) {
  const { t } = useTranslation();
  return (
    <Button
      variant="primary"
      size="lg"
      to={requestInvitePath(AUDIENCE_SOURCES[audience])}
    >
      {t("audiences:cta.requestInvite")}
      <FiArrowRight aria-hidden />
    </Button>
  );
}

/** A member's direct actions: the first leads, the rest sit quietly beside. */
function MemberActionButtons({
  memberActions,
  isOnDark,
}: {
  memberActions: readonly AudienceMemberAction[];
  isOnDark: boolean;
}) {
  return memberActions.map((action, index) => (
    <Button
      key={action.actionId}
      variant={index === 0 ? "primary" : isOnDark ? "ghost-dark" : "quiet"}
      size="lg"
      to={action.to}
    >
      {action.label}
      {index === 0 && <FiArrowRight aria-hidden />}
    </Button>
  ));
}

/**
 * The page's call to action. A guest gets "Request an invite"; a signed-in
 * member gets the audience's direct actions; while the live session is still
 * being checked, the row waits empty, so each viewer sees only their own.
 * The hero placement adds "See how it works", which every viewer gets. The
 * closing placement sits on the plum band.
 */
export function AudienceCta({
  audience,
  placement,
  memberActions,
}: {
  audience: AudienceId;
  placement: "hero" | "closing";
  memberActions: readonly AudienceMemberAction[];
}) {
  const { t } = useTranslation();
  const viewer = useAudienceViewer();
  const jumpToWalkthrough = useWalkthroughJump();
  const isHero = placement === "hero";

  return (
    <div className={styles.actions} data-placement={placement}>
      {viewer === "guest" && <InviteButton audience={audience} />}
      {viewer === "member" && (
        <MemberActionButtons memberActions={memberActions} isOnDark={!isHero} />
      )}
      {isHero && (
        <Button
          variant="ghost"
          size="lg"
          href={`#${AUDIENCE_WALKTHROUGH_ID}`}
          onClick={jumpToWalkthrough}
        >
          {t("audiences:cta.seeHowItWorks")}
          <FiArrowDown aria-hidden />
        </Button>
      )}
    </div>
  );
}
