import { FiActivity, FiArrowRight, FiCalendar, FiCheck } from "react-icons/fi";
import { Button, ImageSlot, Tag, TagRow } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Community, CommunityType } from "../../shared/types/domain";
import { useCommunityPulse } from "./api/useCommunityPulse";
import { AccessTierBadge } from "./CommunityBadges";
import {
  CARD_TAG_DISPLAY_CAP,
  COMMUNITY_TAG_LABEL_KEY,
} from "./communityTags.data";
import styles from "./FeaturedCommunityCard.module.css";

/** Category pill colour per `CommunityType` — mirrors CommunitiesPage.module.css's
 *  `.social`/`.arts`/… mapping (same token values, kept in this module's own CSS
 *  since that file is owned by another concurrently-editing agent). */
const CATEGORY_CLASS: Record<CommunityType, string> = {
  social: styles.social!,
  arts: styles.arts!,
  activism: styles.activism!,
  support: styles.support!,
  sports: styles.sports!,
  professional: styles.professional!,
};

/** The identity mark's rendered edge, in CSS pixels. Mirrors `.markImg`'s own
 *  width/height in this component's stylesheet; spelled onto the `<img>` too so
 *  the browser reserves the box before the file decodes. Larger than the grid
 *  card's 44px because this card's cover is, at its narrowest, five times the
 *  size of a grid card's letterhead. */
const FEATURED_MARK_PX = 56;

interface FeaturedCommunityCardProps {
  community: Community;
  /** Whether the viewer already belongs to this community. The caller
   *  computes this the same way it does for grid cards (demoMode →
   *  isMember(slug), live → community.myRole != null) — this component has
   *  no membership state of its own, so the "You're in" pill stays hidden
   *  unless this is explicitly passed. */
  isJoined?: boolean;
}

/**
 * Hero card for the Communities Discover page, spotlighting one community
 * above the grid. Presentational only — the caller fetches/picks the
 * `Community` and computes `isJoined`.
 */
export function FeaturedCommunityCard({
  community,
  isJoined = false,
}: FeaturedCommunityCardProps) {
  const { t } = useTranslation();
  // The caller guarantees `community.slug` is set — only communities with a
  // slug are eligible to be featured — so it's narrowed once here rather
  // than trusted with `!` at every use below.
  const slug = community.slug!;
  const { events } = useCommunityPulse(slug);
  const nextEvent = events[0];
  const tier = community.accessTier ?? "public";

  return (
    <section className={styles.card}>
      <div className={styles.mediaWrap}>
        <ImageSlot
          src={community.coverImageUrl ?? undefined}
          placeholder={community.name}
          tint="plum"
          radius={0}
          width="100%"
          height="100%"
        />
        {nextEvent && (
          <span className={styles.flag}>
            <span className={styles.liveDot} aria-hidden />
            {t("communities:discover.featured.gatheringFlag")}
          </span>
        )}
        {community.avatarImageUrl && (
          // The community's own square mark (PRD-146), the same object the grid
          // cards and the detail hero carry. Decorative: the name is a heading
          // in the body beside it, so labelling this would repeat it to a
          // screen reader. Absent draws nothing at all.
          <span className={styles.mark} aria-hidden>
            <img
              className={styles.markImg}
              src={community.avatarImageUrl}
              alt=""
              width={FEATURED_MARK_PX}
              height={FEATURED_MARK_PX}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.top}>
          <span
            className={[styles.category, CATEGORY_CLASS[community.type]].join(
              " ",
            )}
          >
            {community.typeLabel}
          </span>
          <AccessTierBadge tier={tier} />
          {isJoined && (
            <span className={styles.joined}>
              <FiCheck aria-hidden />{" "}
              {t("communities:discover.featured.youreIn")}
            </span>
          )}
        </div>

        <h2 className={styles.name}>{community.name}</h2>
        <p className={styles.tagline}>{community.description}</p>

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

        {nextEvent && (
          <div className={styles.next}>
            <FiCalendar aria-hidden />
            <span>
              {t("communities:discover.featured.next")}{" "}
              <b>
                {nextEvent.title}
                <span className={styles.nextMeta}>{nextEvent.meta}</span>
              </b>
            </span>
          </div>
        )}

        <div className={styles.foot}>
          <div className={styles.stats}>
            <span className={styles.count}>{community.count}</span>
            {community.activeThisWeek != null && (
              <span className={styles.activeStat}>
                <FiActivity aria-hidden />
                {t("communities:card.stats.active", {
                  count: community.activeThisWeek,
                })}
              </span>
            )}
          </div>
          <Button variant="primary" to={`/community/${slug}`}>
            {t("communities:discover.featured.openCta")}
            <FiArrowRight aria-hidden />
          </Button>
        </div>
      </div>
    </section>
  );
}
