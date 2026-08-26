import { useRef, useState } from "react";
import { FadeIn, SectionHead } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../app/providers/useCommunityMembership";
import type { Community } from "../homepage/data/types";
import { CommunityCard } from "./CommunityCard";
import { CommunityJoinFlowModal } from "./CommunityJoinFlowModal";
import { useSuggestedCommunities } from "./api/useSuggestedCommunities";
import styles from "./SuggestedCommunitiesSection.module.css";

/**
 * Where focus goes once the join wizard closes and the card that opened it has
 * been joined out of the band. Returns the surface the member is still on: the
 * Discover tabpanel, or the page's `main` in any other host.
 *
 * A container is not focusable by default, so it gets `tabindex="-1"` (which
 * keeps it out of the tab order while letting it take focus programmatically).
 * Captured at OPEN time, because after the join there is no card left to walk
 * up from.
 */
function landingSpotFor(element: HTMLElement | null): HTMLElement | null {
  const landing = element?.closest<HTMLElement>('[role="tabpanel"], main');
  if (!landing) return null;
  if (!landing.hasAttribute("tabindex")) landing.tabIndex = -1;
  return landing;
}

/**
 * "Suggested for you" on the Discover directory: up to 6 communities the
 * viewer has not joined where people they are connected to already are,
 * most-connected-in first (`GET /communities/suggested`).
 *
 * Deliberately quiet, the same posture as `SimilarCommunitiesSection`. An
 * EMPTY result is the normal answer for a member with no connections, so the
 * BAND renders nothing when the list is empty: no heading, no empty state. It
 * renders nothing while loading too, and for the same reason a skeleton would
 * be wrong here: a placeholder band would promise a section that, for most
 * viewers, is about to disappear.
 *
 * The COMPONENT, though, outlives its own band. This list is by definition
 * "communities you have not joined", so joining one removes it, and a member
 * with a single suggestion would otherwise watch the section unmount mid-join
 * and take the open wizard down with it before the welcome step painted (demo
 * mode flips membership synchronously, so it never painted there at all). The
 * early return therefore also waits on the modal. `SimilarCommunitiesSection`
 * has the same shape and is safe only because its list is not
 * membership-filtered, so this guard belongs here alone.
 *
 * The subtitle explains the ranking honestly and in general terms. The card
 * DTO carries no per-community connection-overlap count (the backend ranks by
 * it but does not serialize it), so no card claims a number.
 *
 * `excludeSlug` is the featured community, which the grid already promotes
 * directly above this band. A suggestion is never a second copy of the card
 * the viewer is already looking at.
 */
export function SuggestedCommunitiesSection({
  excludeSlug,
}: {
  excludeSlug?: string;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { isMember } = useCommunityMembership();
  const { communities, isLoading } = useSuggestedCommunities();
  const [joining, setJoining] = useState<Community | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const landingSpotRef = useRef<HTMLElement | null>(null);

  const shown = excludeSlug
    ? communities.filter((community) => community.slug !== excludeSlug)
    : communities;
  const isShowingBand = !isLoading && shown.length > 0;

  const handleJoin = (community: Community) => {
    landingSpotRef.current = landingSpotFor(sectionRef.current);
    setJoining(community);
  };

  const handleClose = () => {
    // Nothing else in the repo has a join trigger that disappears on success
    // (every other join CTA survives as a "You're in" state), so there is no
    // house pattern to copy. This runs BEFORE the modal unmounts, and
    // `useDismiss` restores focus to the trigger afterwards: a surviving card
    // wins back its own focus, while a card that has been joined away is
    // detached and cannot take focus, which leaves the landing spot standing.
    landingSpotRef.current?.focus();
    setJoining(null);
  };

  if (!isShowingBand && !joining) return null;

  return (
    <>
      {isShowingBand && (
        <FadeIn ref={sectionRef} className={styles.section}>
          <SectionHead
            title={t("communities:discover.suggested.heading")}
            subtitle={t("communities:discover.suggested.subtitle")}
          />
          <div className={styles.grid}>
            {shown.map((community, index) => (
              <FadeIn key={community.slug} delay={Math.min(index, 8) * 60}>
                <CommunityCard
                  community={community}
                  /* Demo reads the session membership store; live trusts the
                     card's own DTO. Same branch the discover grid uses. */
                  joined={
                    demoMode
                      ? community.slug
                        ? isMember(community.slug)
                        : false
                      : community.myRole != null
                  }
                  onJoin={handleJoin}
                />
              </FadeIn>
            ))}
          </div>
        </FadeIn>
      )}

      {joining && (
        <CommunityJoinFlowModal community={joining} onClose={handleClose} />
      )}
    </>
  );
}
