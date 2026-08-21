import { Link } from "react-router-dom";
import { FiCheck, FiActivity, FiMessageCircle, FiArrowRight } from "react-icons/fi";
import { Avatar, Tag, TagRow } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { Community } from "../homepage/data/types";
import { getLiving } from "./livingCommunities.data";
import { photoOf } from "./communityPeople";
import { AccessTierBadge } from "./CommunityBadges";
import { CARD_TAG_DISPLAY_CAP, COMMUNITY_TAG_LABEL_KEY } from "./communityTags.data";
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
  const isPrivate = tier === "private";
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
      className={[
        styles.card,
        joined && styles.joinedCard,
        isPrivate && styles.privateCard,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={[styles.shoulder, styles[community.type]].join(" ")}>
        <div className={styles.cardTop}>
          <span className={styles.type}>{community.typeLabel}</span>
          <AccessTierBadge tier={tier} />
        </div>
        {roster.length > 0 && (
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
          </div>
        )}
      </div>

      <div className={styles.name}>{community.name}</div>
      <p className={styles.desc}>{community.description}</p>

      {community.tags && community.tags.length > 0 && (
        <TagRow>
          {community.tags.slice(0, CARD_TAG_DISPLAY_CAP).map((tagId) => (
            <Tag key={tagId}>
              {COMMUNITY_TAG_LABEL_KEY[tagId]
                ? t(COMMUNITY_TAG_LABEL_KEY[tagId])
                : tagId}
            </Tag>
          ))}
        </TagRow>
      )}

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
        <span className={styles.meta}>{community.count}</span>

        {joined ? (
          <span className={[styles.joinBtn, styles.joined].join(" ")}>
            <FiCheck aria-hidden /> {t("communities:card.joined")}
          </span>
        ) : isPrivate ? (
          <span className={[styles.joinBtn, styles.enterQuietly].join(" ")}>
            {t("communities:card.enterQuietly")} <FiArrowRight aria-hidden />
          </span>
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
