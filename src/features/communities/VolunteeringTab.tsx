import { FiAlertTriangle, FiPlus } from "react-icons/fi";
import { Button, EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  VolunteerCardSkeleton,
  VolunteerRoleCard,
} from "../marketing/VolunteerRoleCard";
import {
  opportunityBackState,
  postOpportunityPath,
} from "../marketing/volunteerPaths";
import type { VolunteeringTabState } from "./useVolunteeringTab";
import detail from "./CommunityDetailPage.module.css";
import hubStyles from "./CommunityHubTabs.module.css";
import styles from "./VolunteeringTab.module.css";

/** How many placeholder cards stand in for the list on the first load. */
const SKELETON_COUNT = 2;

/**
 * "Post an opportunity here": deep-links the post form with this community
 * preselected (`postOpportunityPath`), so the new opportunity is filed here
 * by default. Owners, co-owners and mods only, the same set the post form's
 * community picker and the backend accept. Mirrors the Events tab's
 * `HostGatheringCta`.
 */
function PostOpportunityCta({
  communitySlug,
  isProminent,
}: {
  communitySlug: string;
  /** The empty state gets the loud version with a line of encouragement; a
   *  tab that already lists opportunities gets the quiet one under the grid. */
  isProminent: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={isProminent ? hubStyles.hostCtaLoud : hubStyles.hostCtaQuiet}
    >
      {isProminent && (
        <p className={hubStyles.hostCtaLead}>
          {t("communities:detail.volunteering.post.lead")}
        </p>
      )}
      <Button
        variant={isProminent ? "primary" : "ghost"}
        to={postOpportunityPath(communitySlug)}
      >
        <FiPlus aria-hidden /> {t("communities:detail.volunteering.post.cta")}
      </Button>
    </div>
  );
}

/**
 * A community's open volunteer opportunities, on the same card the main
 * volunteering board uses. Each card carries router state naming this
 * community, so the detail page's back link returns here. Visibility and the
 * fetch live in `useVolunteeringTab`; this component only renders its state.
 */
export function VolunteeringTab({
  slug,
  name,
  isStaff,
  volunteering,
}: {
  /** This community's slug: the back link target and the post form preset. */
  slug: string;
  /** This community's display name, shown in the detail page's back link. */
  name: string;
  /** Whether the viewer owns, co-owns or moderates this community. Only they
   *  are offered the post call to action. */
  isStaff: boolean;
  volunteering: VolunteeringTabState;
}) {
  const { t } = useTranslation();
  const { opportunities, total, isLoading, isError, isFetching, refetch } =
    volunteering;
  const shouldOfferPost = isStaff && slug.length > 0;
  const heading = (
    <div className={detail.secLbl}>
      {t("communities:detail.volunteering.heading")}
    </div>
  );

  // A retry after an error shows the placeholders while it runs, so the
  // button press visibly does something before the answer arrives.
  if (isLoading || (isError && isFetching)) {
    return (
      <div aria-busy="true">
        {heading}
        <div className={styles.grid}>
          {Array.from({ length: SKELETON_COUNT }).map(
            (_unused, skeletonIndex) => (
              <VolunteerCardSkeleton key={skeletonIndex} />
            ),
          )}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<FiAlertTriangle />}
        title={t("communities:detail.volunteering.error.title")}
        description={t("communities:detail.volunteering.error.description")}
        action={{
          label: t("communities:detail.volunteering.error.retryCta"),
          onClick: refetch,
        }}
      />
    );
  }

  if (opportunities.length === 0) {
    return (
      <div>
        {heading}
        <p className={hubStyles.eventsEmpty}>
          {t("communities:detail.volunteering.empty")}
        </p>
        {shouldOfferPost && (
          <PostOpportunityCta communitySlug={slug} isProminent />
        )}
      </div>
    );
  }

  const backState = opportunityBackState(slug, name);
  return (
    <div>
      {heading}
      <div className={styles.grid}>
        {opportunities.map((opportunity, index) => (
          <VolunteerRoleCard
            key={opportunity.slug}
            opportunity={opportunity}
            delay={Math.min(index, 8) * 60}
            detailLinkState={backState}
          />
        ))}
      </div>
      {/* The endpoint returns the newest opportunities up to a cap, so a
          busy community says how many it shows out of all the open ones. */}
      {total > opportunities.length && (
        <p className={styles.note}>
          {t("communities:detail.volunteering.showingNewest", {
            shown: opportunities.length,
            total,
          })}
        </p>
      )}
      {shouldOfferPost && (
        <PostOpportunityCta communitySlug={slug} isProminent={false} />
      )}
    </div>
  );
}
