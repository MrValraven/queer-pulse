import { useMemo, useState } from "react";
import { FiUsers } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  FadeIn,
  Outro,
  Reveal,
  SkeletonLine,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { useCommunityMembership } from "../../app/providers/CommunityMembershipProvider";
import type { Community, CommunityType } from "../homepage/data/types";
import { useCommunities } from "./api/useCommunities";
import { useJoinCommunity } from "./api/useCommunityMutations";
import { getLiving } from "./livingCommunities.data";
import { JoinModal } from "./JoinModal";
import { CommunityCard } from "./CommunityCard";
import styles from "./CommunitiesPage.module.css";

const FILTERS: { value: "all" | CommunityType; label: string }[] = [
  { value: "all", label: "All communities" },
  { value: "social", label: "Social" },
  { value: "arts", label: "Arts" },
  { value: "activism", label: "Activism" },
  { value: "support", label: "Support" },
  { value: "sports", label: "Sports" },
  { value: "professional", label: "Professional" },
];

function CommunityCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <SkeletonLine width={84} height={20} style={{ borderRadius: 6 }} />
      <SkeletonLine width="70%" height={21} />
      <SkeletonLine width="100%" height={14} />
      <SkeletonLine width="85%" height={14} />
      <div className={styles.foot}>
        <SkeletonLine width={90} height={13} />
        <SkeletonLine width={64} height={13} />
      </div>
    </div>
  );
}

export function CommunitiesPage() {
  const { data, isLoading } = useCommunities();
  const loading = useSimulatedLoad() || isLoading;
  const { isMember, join, requestToJoin } = useCommunityMembership();
  const [filter, setFilter] = useState<"all" | CommunityType>("all");
  const [joining, setJoining] = useState<Community | null>(null);
  const joinMutation = useJoinCommunity(joining?.slug ?? "");

  const communities = useMemo(() => data?.items ?? [], [data]);

  const joiningTier = joining
    ? (getLiving(joining.slug)?.accessTier ??
      (joining.privateBadge ? "private" : "public"))
    : "public";

  const visible = useMemo(
    () =>
      filter === "all"
        ? communities
        : communities.filter((c) => c.type === filter),
    [filter, communities],
  );

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.eyebrow}>
            Community Directory
          </Reveal>
          <Reveal as="h1" className={styles.title} delay={60}>
            Find your <em>people.</em>
          </Reveal>
          <Reveal as="p" className={styles.lede} delay={120}>
            A living directory of queer communities across Lisbon. Social clubs,
            arts collectives, activist groups, sports teams, support circles,
            and professional networks — something for where you are right now.
          </Reveal>
          <Reveal delay={180} className={styles.heroCta}>
            <Button to={routes.communitiesHome} variant="primary">
              Go to your hub
            </Button>
          </Reveal>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <Reveal className={styles.filters}>
            {FILTERS.map((option) => (
              <button
                type="button"
                key={option.value}
                className={[
                  styles.chip,
                  filter === option.value && styles.chipActive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </Reveal>

          {!loading && visible.length === 0 ? (
            communities.length === 0 ? (
              <EmptyState
                icon={<FiUsers />}
                title="No communities yet"
                description="The directory is still finding its feet. Be one of the first to gather your people — start a community and others will follow."
                action={{
                  label: "Start a community",
                  to: routes.startCommunity,
                }}
              />
            ) : (
              <EmptyState
                icon={<FiUsers />}
                title="Nothing matches your filters"
                description="No communities in this category yet. Switch back to all communities to see everything across Lisbon."
                action={{
                  label: "Clear filters",
                  onClick: () => setFilter("all"),
                }}
              />
            )
          ) : (
            <div className={styles.grid}>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <CommunityCardSkeleton key={i} />
                  ))
                : visible.map((community, index) => (
                    <FadeIn
                      key={community.name}
                      delay={Math.min(index, 8) * 60}
                    >
                      <CommunityCard
                        community={community}
                        joined={
                          community.slug ? isMember(community.slug) : false
                        }
                        onJoin={setJoining}
                      />
                    </FadeIn>
                  ))}
            </div>
          )}
        </div>
      </div>

      <Outro
        title={
          <>
            Not finding the right <em>space?</em>
          </>
        }
        sub="Suggest a community to add to the directory, or post on the board to find people who share your interest — and maybe start something together."
      >
        <Button to="/#board" size="lg">
          See the board →
        </Button>
      </Outro>

      {joining && (
        <JoinModal
          community={{
            name: joining.name,
            typeLabel: joining.typeLabel,
            count: joining.count,
            description: joining.description,
          }}
          tier={joiningTier}
          onClose={() => setJoining(null)}
          onJoined={() => {
            if (joining.slug) join(joining.slug);
            joinMutation.mutate({});
          }}
          onRequested={() => {
            if (joining.slug) requestToJoin(joining.slug);
            joinMutation.mutate({});
          }}
        />
      )}
    </PageShell>
  );
}
