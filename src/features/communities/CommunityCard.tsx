import { Link } from "react-router-dom";
import { FiCheck, FiArrowRight } from "react-icons/fi";
import { Avatar, ImageSlot, Tag, TagRow } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { Community } from "../homepage/data/types";
import { getLiving } from "./livingCommunities.data";
import { photoOf } from "./communityPeople";
import { AccessTierBadge } from "./CommunityBadges";
import {
  CARD_TAG_DISPLAY_CAP,
  COMMUNITY_TAG_LABEL_KEY,
} from "./communityTags.data";
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
      <div
        className={[
          styles.shoulder,
          styles[community.type],
          coverImageUrl && styles.hasPhoto,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {coverImageUrl && (
          // The photo replaces the flat colour as the letterhead's ground, so
          // its chrome (type label, badge, roster) rides a scrim rather than
          // the raw image. Rendered as an <img> via ImageSlot, never a CSS
          // background, so a broken/missing cover falls back cleanly.
          <span className={styles.shoulderPhoto} aria-hidden>
            <ImageSlot
              src={coverImageUrl}
              radius={0}
              width="100%"
              height="100%"
              srcSize={720}
              // The slot's own hairline would draw a line across the
              // letterhead; the card already has its border.
              style={{ border: "none" }}
            />
            <span className={styles.shoulderScrim} />
          </span>
        )}
        <div className={styles.cardTop}>
          <span className={styles.type}>{community.typeLabel}</span>
          {/* Once you're in, the access tier has stopped being news — the badge
              slot says so instead, which is the only thing that distinguishes
              your own communities' cards on the "My communities" tab. */}
          {joined ? (
            <span className={styles.inBadge}>
              <FiCheck aria-hidden /> {t("communities:card.youreIn")}
            </span>
          ) : (
            <AccessTierBadge tier={tier} onPhoto={!!coverImageUrl} />
          )}
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

      <div className={styles.foot}>
        <span className={styles.metaStack}>
          <span className={styles.meta}>{community.count}</span>
          {/* The demo registry carries no activity, the live card DTO does —
              so this line appears wherever a real number exists and is simply
              absent where none does, in either mode. */}
          {activeThisWeek !== undefined && (
            <span className={styles.activeLine}>
              <span className={styles.activeDot} aria-hidden />
              {t("communities:card.stats.active", { count: activeThisWeek })}
            </span>
          )}
        </span>

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
