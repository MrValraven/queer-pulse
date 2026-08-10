import { Link } from "react-router-dom";
import { FiCheck, FiActivity, FiMessageCircle } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { Community } from "../homepage/data/types";
import { getLiving } from "./livingCommunities.data";
import { photoOf } from "./communityPeople";
import { AccessTierBadge } from "./CommunityBadges";
import styles from "./CommunitiesPage.module.css";

export function CommunityCard({
  community,
  joined,
  onJoin,
}: {
  community: Community;
  joined: boolean;
  onJoin: (c: Community) => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const living = getLiving(community.slug);
  // living data (flagship demo) → the card DTO's join policy (live + created) →
  // legacy `privateBadge` fallback. Consulting `community.accessTier` is what
  // keeps invite/request cards from showing an "Open to all" badge + public join.
  const tier =
    living?.accessTier ??
    community.accessTier ??
    (community.privateBadge ? "private" : "public");
  const roster = living?.roster.slice(0, 4) ?? [];
  const joinLabel =
    tier === "public"
      ? t("communities:card.join.public")
      : tier === "invite"
        ? t("communities:card.join.invite")
        : t("communities:card.join.request");

  return (
    <Link
      to={`/community/${community.slug}`}
      className={[styles.card, joined && styles.joinedCard]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.cardTop}>
        <span className={[styles.type, styles[community.type]].join(" ")}>
          {community.typeLabel}
        </span>
        <AccessTierBadge tier={tier} />
      </div>
      <div className={styles.name}>{community.name}</div>
      <p className={styles.desc}>{community.description}</p>

      {living && (
        <div className={styles.statsRow}>
          <span className={styles.stat}>
            <FiActivity aria-hidden />{" "}
            {t("communities:card.stats.active", {
              count: living.stats.activeThisWeek,
            })}
          </span>
          <span className={styles.stat}>
            <FiMessageCircle aria-hidden />{" "}
            {t("communities:card.stats.posts", {
              count: living.stats.postsThisWeek,
            })}
          </span>
        </div>
      )}

      <div className={styles.foot}>
        {roster.length > 0 ? (
          <div className={styles.cardAvStack}>
            {roster.map((m) => (
              <span className={styles.cardAv} key={m.slug ?? m.name}>
                <Avatar
                  initials={m.initials}
                  tint={m.tint}
                  src={photoOf(m, demoMode)}
                  size={26}
                  alt={m.name}
                />
              </span>
            ))}
            <span className={styles.meta}>{community.count}</span>
          </div>
        ) : (
          <span className={styles.meta}>{community.count}</span>
        )}

        {joined ? (
          <span className={[styles.joinBtn, styles.joined].join(" ")}>
            <FiCheck aria-hidden /> {t("communities:card.joined")}
          </span>
        ) : tier === "private" ? (
          <span className={styles.joinBtn}>{t("communities:card.view")}</span>
        ) : (
          <span
            className={styles.joinBtn}
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onJoin(community);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onJoin(community);
              }
            }}
          >
            {joinLabel}
          </span>
        )}
      </div>
    </Link>
  );
}
