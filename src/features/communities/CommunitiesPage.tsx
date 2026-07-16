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
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
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

const FILTERS: { value: "all" | CommunityType; labelKey: string }[] = [
  { value: "all", labelKey: "communities:category.all" },
  { value: "social", labelKey: "communities:category.social" },
  { value: "arts", labelKey: "communities:category.arts" },
  { value: "activism", labelKey: "communities:category.activism" },
  { value: "support", labelKey: "communities:category.support" },
  { value: "sports", labelKey: "communities:category.sports" },
  { value: "professional", labelKey: "communities:category.professional" },
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
  const { t } = useTranslation();
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
            {t("communities:discover.hero.eyebrow")}
          </Reveal>
          <Reveal as="h1" className={styles.title} delay={60}>
            <Translation
              i18nKey="communities:discover.hero.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.lede} delay={120}>
            {t("communities:discover.hero.lead")}
          </Reveal>
          <Reveal delay={180} className={styles.heroCta}>
            <Button to={routes.communitiesHome} variant="primary">
              {t("communities:discover.hero.cta")}
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
                {t(option.labelKey)}
              </button>
            ))}
          </Reveal>

          {!loading && visible.length === 0 ? (
            communities.length === 0 ? (
              <EmptyState
                icon={<FiUsers />}
                title={t("communities:discover.empty.none.title")}
                description={t("communities:discover.empty.none.description")}
                action={{
                  label: t("communities:discover.empty.none.cta"),
                  to: routes.startCommunity,
                }}
              />
            ) : (
              <EmptyState
                icon={<FiUsers />}
                title={t("communities:discover.empty.filtered.title")}
                description={t(
                  "communities:discover.empty.filtered.description",
                )}
                action={{
                  label: t("communities:discover.empty.filtered.cta"),
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
          <Translation
            i18nKey="communities:discover.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("communities:discover.outro.sub")}
      >
        <Button to="/#board" size="lg">
          {t("communities:discover.outro.cta")} →
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
