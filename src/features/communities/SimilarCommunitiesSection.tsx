import { useState } from "react";
import { SectionHead, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../app/providers/useCommunityMembership";
import type { Community } from "../homepage/data/types";
import { CommunityJoinFlowModal } from "./CommunityJoinFlowModal";
import { CommunityCard } from "./CommunityCard";
import { useSimilarCommunities } from "./api/useSimilarCommunities";
import styles from "./SimilarCommunitiesSection.module.css";

/**
 * "Similar communities" — up to 4 cards ranked by shared curated-tag overlap
 * with the community being viewed (`GET /communities/:slug/related`, see
 * `useSimilarCommunities`). Lives below the main hub layout, not in the
 * sidebar — a fuller, joinable-card presentation distinct from the sidebar's
 * compact same-type text list.
 *
 * A deliberately quiet, secondary surface: its own query never blocks the
 * page's primary loading state, there's no skeleton (the section only ever
 * appears once real data has arrived), and it renders nothing at all while
 * loading, on error, or when the list comes back empty — never a "nothing
 * similar yet" empty state competing with the rest of the hub.
 */
export function SimilarCommunitiesSection({
  currentSlug,
}: {
  currentSlug: string;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { isMember } = useCommunityMembership();
  const { communities, isLoading } = useSimilarCommunities(currentSlug);
  const [joining, setJoining] = useState<Community | null>(null);

  if (isLoading || communities.length === 0) return null;

  return (
    <>
      <FadeIn className={styles.section}>
        <SectionHead title={t("communities:detail.similar.heading")} />
        <div className={styles.grid}>
          {communities.map((community, index) => (
            <FadeIn key={community.slug} delay={Math.min(index, 8) * 60}>
              <CommunityCard
                community={community}
                joined={
                  demoMode
                    ? community.slug
                      ? isMember(community.slug)
                      : false
                    : community.myRole != null
                }
                onJoin={setJoining}
              />
            </FadeIn>
          ))}
        </div>
      </FadeIn>

      {joining && (
        <CommunityJoinFlowModal
          community={joining}
          onClose={() => setJoining(null)}
        />
      )}
    </>
  );
}
