import { FiCheck, FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Community } from "../homepage/data/types";
import { getLiving } from "./livingCommunities.data";
import { AccessTierBadge } from "./CommunityBadges";
import { CommunityCardShell } from "./CommunityCardShell";
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
  // Demo's flagship communities carry their week on the `living` mock; every
  // live card DTO carries its own `activeThisWeek`. Neither is guaranteed.
  const activeThisWeek =
    living?.stats.activeThisWeek ?? community.activeThisWeek;
  // The community's own cover photo, when it has one. Only the live card DTO
  // carries it (the demo registry has no covers), so a photoless card keeps
  // the flat category-coloured letterhead it has always had.
  const coverImageUrl = community.coverImageUrl ?? undefined;
  const joinLabel =
    tier === "public"
      ? t("communities:card.join.public")
      : tier === "invite"
        ? t("communities:card.join.invite")
        : t("communities:card.join.request");

  return (
    <CommunityCardShell
      slug={community.slug}
      name={community.name}
      type={community.type}
      typeLabel={community.typeLabel}
      description={community.description}
      countLabel={community.count}
      activeThisWeek={activeThisWeek}
      coverImageUrl={coverImageUrl}
      tags={community.tags}
      roster={roster}
      className={[joined && styles.joinedCard, isPrivate && styles.privateCard]
        .filter(Boolean)
        .join(" ")}
      badge={
        /* Once you're in, the access tier has stopped being news — the badge
           slot says so instead, which is the only thing that distinguishes
           your own communities' cards on the "My communities" tab. */
        joined ? (
          <span className={styles.inBadge}>
            <FiCheck aria-hidden /> {t("communities:card.youreIn")}
          </span>
        ) : (
          <AccessTierBadge tier={tier} onPhoto={!!coverImageUrl} />
        )
      }
      footAction={
        joined ? (
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
        )
      }
    />
  );
}
