import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiCheck, FiClock } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { communities } from "../homepage/data/communities";
import { memberProfiles } from "../members/data/memberProfiles";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { useCommunityMembership } from "../../app/providers/CommunityMembershipProvider";
import { JoinModal } from "./JoinModal";
import {
  getCommunityDetail,
  membersFor,
  type Thread as ThreadData,
  type Tint,
} from "./communityDetails";
import { getLiving } from "./livingCommunities.data";
import { LivingHubTabs } from "./LivingHubTabs";
import { FallbackHubTabs } from "./FallbackHubTabs";
import { CommunitySidebar } from "./CommunitySidebar";
import styles from "./CommunityDetailPage.module.css";

const HERO_AV: Record<Tint, { background: string; color: string }> = {
  coral: {
    background: "rgba(var(--accent-rgb),.22)",
    color: "var(--accent-soft)",
  },
  jade: { background: "rgba(var(--jade-rgb),.22)", color: "var(--jade-soft)" },
  plum: { background: "rgba(247,243,238,.18)", color: "rgba(247,243,238,.8)" },
};

export function CommunityDetailPage() {
  const { slug } = useParams();
  const { isMember, join, leave, hasRequested, requestToJoin, roleIn } =
    useCommunityMembership();
  const [joining, setJoining] = useState(false);

  const community = communities.find((c) => c.slug === slug);
  const detail = getCommunityDetail(slug);
  if (!community || !detail)
    return <Navigate to={routes.communities} replace />;

  const living = getLiving(slug);
  const joined = slug ? isMember(slug) : false;
  const requested = slug ? hasRequested(slug) : false;
  const role = slug ? roleIn(slug) : null;
  const tier =
    living?.accessTier ?? (community.privateBadge ? "private" : "public");
  const joinLabel =
    tier === "invite"
      ? "Join with invite"
      : tier === "public"
        ? "Join community"
        : "Request to join";

  const memberNum = parseInt(community.count, 10);
  const hasCount = !Number.isNaN(memberNum);
  const members = membersFor(slug!.length, 8);
  const heroAvatars = members.slice(0, 5);

  const welcome: ThreadData = {
    votes: 38,
    title: `Welcome, new members — introduce yourself`,
    author: detail.organiser,
    time: "2 weeks ago",
    replyCount: 18,
    post: `New to ${community.name}? Say hello here. Tell us your name, where you're from, and what brought you here. We read every one.`,
    replies: [
      {
        initials: members[6]!.initials,
        name: members[6]!.name,
        tint: members[6]!.tint,
        text: "Hello! Just moved to Lisbon and this is the first thing I've joined. Already feels like the right call.",
      },
      {
        initials: members[4]!.initials,
        name: members[4]!.name,
        tint: members[4]!.tint,
        text: "Welcome! Come to the next one — easiest way in is just to show up.",
      },
    ],
  };
  const threads = [detail.topicThread, welcome];
  const related = communities
    .filter((c) => c.slug !== slug && !c.privateBadge)
    .slice(0, 3);

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className={`wrap ${styles.heroInner}`}>
          <Link to={routes.communities} className={styles.breadcrumb}>
            ← Communities
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
                <FiCheck aria-hidden /> Joined
              </Button>
            ) : requested ? (
              <Button variant="ghost" disabled>
                <FiClock aria-hidden /> Requested
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setJoining(true)}>
                {joinLabel}
              </Button>
            )}
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className={styles.avStrip}>
                {heroAvatars.map((m, i) => {
                  const photo = m.slug
                    ? memberProfiles[m.slug]?.photo
                    : undefined;
                  const inner = (
                    <>
                      <span className={styles.heroAvTip}>{m.name}</span>
                      <span className={styles.sav} style={HERO_AV[m.tint]}>
                        {photo ? (
                          <img
                            src={resolveAvatarSrc(photo)}
                            alt={m.name}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          m.initials
                        )}
                      </span>
                    </>
                  );
                  return m.slug ? (
                    <Link
                      key={i}
                      to={`/members/${m.slug}`}
                      className={styles.heroAv}
                      style={{ zIndex: heroAvatars.length - i }}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <span
                      key={i}
                      className={styles.heroAv}
                      style={{ zIndex: heroAvatars.length - i }}
                    >
                      {inner}
                    </span>
                  );
                })}
              </div>
              {hasCount && (
                <span className={styles.stripNote}>
                  and {memberNum - 5} more
                </span>
              )}
            </div>
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
          onJoined={() => slug && join(slug)}
          onRequested={() => slug && requestToJoin(slug)}
        />
      )}
    </PageShell>
  );
}
