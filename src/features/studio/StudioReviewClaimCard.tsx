import { FiExternalLink } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioAdminClaimView } from "./api/studioSafety.adapters";
import type { StudioClaimDecision } from "./api/studioSafety.api";
import { claimStatusLabelKeyFor } from "./studioClaimStatus.data";
import { ReviewCardFrame, ReviewFact, type TitleRef } from "./StudioReviewCard";
import { ReviewTrackLink } from "./StudioReviewTrackLink";
import { reviewDaysSince, useReviewDate } from "./useReviewDate";
import css from "./StudioFlagReview.module.css";

/** The dates a claim has collected, oldest first: filed, accepted,
 *  countered, replied. Each shows once it happened. */
function claimTimelineOf(claim: StudioAdminClaimView) {
  return [
    { labelKey: "studio:claims.mine.filedOn", iso: claim.createdAt },
    {
      labelKey: "studio:flagReviewLive.claims.acceptedOn",
      iso: claim.acceptedAt,
    },
    {
      labelKey: "studio:flagReviewLive.claims.counteredOn",
      iso: claim.counteredAt,
    },
    {
      labelKey: "studio:flagReviewLive.claims.repliedOn",
      iso: claim.repliedAt,
    },
  ].filter((entry): entry is { labelKey: string; iso: string } =>
    Boolean(entry.iso),
  );
}

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
  // How long the claim has kept the track offline: from the accept, while
  // the track is still withheld.
  const offlineDays =
    claim.track.isWithheld && claim.acceptedAt
      ? reviewDaysSince(claim.acceptedAt)
      : null;
  return (
    <ReviewCardFrame
      release={claim.release}
      titleRef={titleRef}
      chip={t(claimStatusLabelKeyFor(claim.status, "staff"))}
      urgency={
        offlineDays !== null ? (
          <p className={css.age}>
            {offlineDays === 0
              ? t("studio:flagReviewLive.claims.offlineToday")
              : t("studio:flagReviewLive.claims.offlineFor", {
                  count: offlineDays,
                })}
          </p>
        ) : null
      }
      meta={claimTimelineOf(claim)
        .map(({ labelKey, iso }) => t(labelKey, { date: dateOf(iso) }))
        .join(" · ")}
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
        <ReviewTrackLink
          trackId={claim.track.id}
          releaseId={claim.release.id}
          href={claim.track.href}
          label={t("studio:flagReviewLive.claims.trackLine", {
            number: claim.track.position,
            title: claim.track.title,
          })}
          title={claim.track.title}
          canPlay={!claim.track.isWithheld}
        />
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
