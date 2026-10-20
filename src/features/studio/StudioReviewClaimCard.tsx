import { FiExternalLink } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioAdminClaimView } from "./api/studioSafety.adapters";
import type { StudioClaimDecision } from "./api/studioSafety.api";
import { claimStatusLabelKeyFor } from "./studioClaimStatus.data";
import { ReviewCardFrame, ReviewFact, type TitleRef } from "./StudioReviewCard";
import { useReviewDate } from "./useReviewDate";

/** A copyright claim for staff (spec 8): the track, who filed it and as
 *  what, the original, the details, the artist's counter-notice and the
 *  claimant's reply. Accept and Decline while submitted; Uphold and Reject
 *  once accepted (with or without a counter-notice) or countered. */
export function StudioReviewClaimCard({
  claim,
  titleRef,
  onDecide,
}: {
  claim: StudioAdminClaimView;
  titleRef: TitleRef;
  onDecide: (decision: StudioClaimDecision) => void;
}) {
  const { t } = useTranslation();
  const dateOf = useReviewDate();
  const isSubmitted = claim.status === "submitted";
  return (
    <ReviewCardFrame
      release={claim.release}
      titleRef={titleRef}
      chip={t(claimStatusLabelKeyFor(claim.status, "staff"))}
      meta={t("studio:claims.mine.filedOn", { date: dateOf(claim.createdAt) })}
      actions={
        isSubmitted ? (
          <>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDecide("accept")}
            >
              {t("studio:flagReviewLive.claims.accept")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDecide("decline")}
            >
              {t("studio:flagReviewLive.claims.decline")}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDecide("uphold")}
            >
              {t("studio:flagReviewLive.claims.uphold")}
            </Button>
            <Button variant="jade" size="sm" onClick={() => onDecide("reject")}>
              {t("studio:flagReviewLive.claims.reject")}
            </Button>
          </>
        )
      }
    >
      <ReviewFact labelKey="studio:flagReviewLive.claims.trackLabel">
        {t("studio:flagReviewLive.claims.trackLine", {
          number: claim.track.position,
          title: claim.track.title,
        })}
      </ReviewFact>
      <ReviewFact
        labelKey="studio:flagReviewLive.claims.availabilityLabel"
        isShown={claim.track.isWithheld}
      >
        {t("studio:flagReviewLive.claims.withheldFact")}
      </ReviewFact>
      <ReviewFact labelKey="studio:flagReviewLive.claims.claimantLabel">
        {`${claim.claimant.displayName} (@${claim.claimant.slug})`}
      </ReviewFact>
      <ReviewFact labelKey="studio:claimPanel.filedByLabel">
        {t(`studio:claimPanel.claimantRole.${claim.claimantRole}`)}
      </ReviewFact>
      <ReviewFact labelKey="studio:claimPanel.claimedWork">
        {claim.originalWork}
        {claim.originalLink ? (
          <>
            {" "}
            <a
              href={claim.originalLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("studio:claimPanel.originalLink")}
              <FiExternalLink aria-hidden />
              <span className="visuallyHidden">
                {` ${t("studio:support.opensInNewTab")}`}
              </span>
            </a>
          </>
        ) : null}
      </ReviewFact>
      <ReviewFact labelKey="studio:claimPanel.claimedDetails">
        {claim.details}
      </ReviewFact>
      {claim.counterNote !== null ? (
        <ReviewFact labelKey="studio:claims.mine.counterHeading">
          {claim.counterNote}
        </ReviewFact>
      ) : null}
      {claim.claimantReply !== null ? (
        <ReviewFact labelKey="studio:claimPanel.claimantReplyHeading">
          {claim.claimantReply}
        </ReviewFact>
      ) : null}
    </ReviewCardFrame>
  );
}
