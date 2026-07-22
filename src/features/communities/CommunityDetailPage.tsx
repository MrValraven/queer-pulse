import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiCheck, FiClock } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../app/providers/CommunityMembershipProvider";
import { JoinModal } from "./JoinModal";
import type { Person } from "./communityDetails";
import { useCommunity } from "./api/useCommunity";
import { useRelatedCommunities } from "./api/useRelatedCommunities";
import { useRoster } from "./api/useRoster";
import { useCommunityPosts } from "./api/useCommunityPosts";
import { useJoinCommunity } from "./api/useCommunityMutations";
import { CommunityHeroAvatars } from "./CommunityHeroAvatars";
import { LivingHubTabs } from "./LivingHubTabs";
import { FallbackHubTabs } from "./FallbackHubTabs";
import { CommunitySidebar } from "./CommunitySidebar";
import styles from "./CommunityDetailPage.module.css";

export function CommunityDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { demoMode } = useDemoMode();
  const { isMember, join, leave, hasRequested, requestToJoin, roleIn } =
    useCommunityMembership();
  const [joining, setJoining] = useState(false);

  const {
    community,
    detail,
    living: baseLiving,
    myRole,
    myJoinRequestStatus,
    notFound,
    isLoading,
  } = useCommunity(slug);
  const roster = useRoster(slug);
  const posts = useCommunityPosts(slug);
  const joinMutation = useJoinCommunity(slug ?? "");
  const related = useRelatedCommunities(slug, community?.type);

  if (notFound) return <Navigate to={routes.communities} replace />;
  if (isLoading || !community || !detail) {
    return (
      <PageShell>
        <div className={styles.body}>
          <div className="wrap" aria-busy="true">
            <SkeletonLine width="40%" height={30} />
            <SkeletonLine width="70%" height={16} style={{ marginTop: 16 }} />
            <SkeletonLine width="55%" height={16} style={{ marginTop: 10 }} />
          </div>
        </div>
      </PageShell>
    );
  }

  // Compose the enriched hub: roster + posts arrive from their own endpoints
  // (in demo they equal `baseLiving`'s, keeping this byte-for-byte).
  const living = baseLiving
    ? { ...baseLiving, roster, pinned: posts.pinned, pulse: posts.pulse }
    : undefined;

  // Membership CTA state: the session provider is the demo source of truth;
  // live mode reads the viewer's role/request straight off the detail DTO.
  const joined = demoMode ? (slug ? isMember(slug) : false) : myRole != null;
  const requested = demoMode
    ? slug
      ? hasRequested(slug)
      : false
    : myJoinRequestStatus === "pending";
  const role = demoMode ? (slug ? roleIn(slug) : null) : myRole;

  const tier =
    living?.accessTier ?? (community.privateBadge ? "private" : "public");
  const joinLabel =
    tier === "invite"
      ? t("communities:detail.join.invite")
      : tier === "public"
        ? t("communities:detail.join.public")
        : t("communities:detail.join.request");

  const memberNum = parseInt(community.count, 10);
  const hasCount = !Number.isNaN(memberNum);
  // The real roster: live mode fetches it, flagship demo communities supply it,
  // and a just-founded community has only its founder — so fall back to the
  // organiser rather than fabricating a crowd that isn't there.
  const members: Person[] = roster.length > 0 ? roster : [detail.organiser];
  const heroAvatars = members.slice(0, 5);

  const threads = [detail.topicThread];

  const onJoined = () => {
    if (slug) join(slug);
    joinMutation.mutate({});
  };
  const onRequested = () => {
    if (slug) requestToJoin(slug);
    joinMutation.mutate({});
  };

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className={`wrap ${styles.heroInner}`}>
          <Link to={routes.communities} className={styles.breadcrumb}>
            {t("communities:detail.breadcrumb")}
          </Link>
          <div className={styles.typeBadge}>
            <span className={styles.dot} />
            {detail.badge}
          </div>
          <h1 className={styles.h1}>{community.name}</h1>
          <p className={styles.heroSub}>{community.description}</p>
          <div className={styles.heroMeta}>
            <span>{community.count}</span>
            <span className={styles.metaSep} />
            <span>{detail.founded}</span>
            <span className={styles.metaSep} />
            <span>{detail.cadence}</span>
          </div>
          <div className={styles.actRow}>
            {joined ? (
              <Button variant="jade" onClick={() => slug && leave(slug)}>
                <FiCheck aria-hidden /> {t("communities:detail.joined")}
              </Button>
            ) : requested ? (
              <Button variant="ghost" disabled>
                <FiClock aria-hidden /> {t("communities:detail.requested")}
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setJoining(true)}>
                {joinLabel}
              </Button>
            )}
            <CommunityHeroAvatars
              avatars={heroAvatars}
              memberNum={memberNum}
              hasCount={hasCount}
            />
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            {living ? (
              <LivingHubTabs
                community={community}
                info={detail}
                living={living}
                threads={threads}
                isMember={joined}
                role={role}
                pulsePaging={posts}
              />
            ) : (
              <FallbackHubTabs
                detail={detail}
                members={members}
                hasCount={hasCount}
                memberNum={memberNum}
                threads={threads}
              />
            )}

            <CommunitySidebar detail={detail} related={related} />
          </div>
        </div>
      </div>

      {joining && (
        <JoinModal
          community={{
            name: community.name,
            typeLabel: detail.badge,
            count: community.count,
            description: community.description,
            tags: detail.tags,
          }}
          tier={tier}
          onClose={() => setJoining(false)}
          onJoined={onJoined}
          onRequested={onRequested}
        />
      )}
    </PageShell>
  );
}
