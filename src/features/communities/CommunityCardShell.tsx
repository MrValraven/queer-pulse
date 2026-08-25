import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Avatar, ImageSlot, Tag, TagRow } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { CommunityType } from "../homepage/data/types";
import type { Person } from "./communityDetails";
import { photoOf } from "./communityPeople";
import {
  CARD_TAG_DISPLAY_CAP,
  COMMUNITY_TAG_LABEL_KEY,
} from "./communityTags.data";
import styles from "./CommunitiesPage.module.css";

/**
 * The community card's shared visual skeleton: the category-coloured shoulder
 * letterhead (with its optional cover photo, scrim and avatar roster), the
 * serif name, the three-line description, the tag pills, and the footer.
 *
 * Every surface that shows a community as a card renders through this, so the
 * discover grid (`CommunityCard`) and a member's profile pins
 * (`ProfileCommunityCard`) stay the same object rather than drifting apart.
 * What differs between them is passed in as two slots:
 *
 *  - `badge` — the shoulder's right-hand chip. Discover puts the access tier
 *    or "You're in" there; a profile pin puts the owner's role.
 *  - `footAction` — the footer's right-hand control. Discover puts the join
 *    pill there; a profile pin has none, since the whole card already links
 *    to the community.
 *
 * The styles deliberately still live in `CommunitiesPage.module.css`: the
 * featured card and the grid's loading skeleton share `.card`/`.foot`/`.name`
 * and the category colours, so the rules stay put and this component reaches
 * into them.
 */
export function CommunityCardShell({
  slug,
  name,
  type,
  typeLabel,
  description,
  countLabel,
  activeThisWeek,
  coverImageUrl,
  tags,
  roster,
  badge,
  footAction,
  className,
  isPreview = false,
}: {
  slug?: string;
  name: string;
  type: CommunityType;
  typeLabel: string;
  description: string;
  /** Pre-formatted, e.g. `"128 members"`. */
  countLabel: string;
  /** Omitted where the source carries no activity number (the demo registry). */
  activeThisWeek?: number;
  coverImageUrl?: string | null;
  tags?: string[];
  /** Faces overlapping the shoulder's bottom edge. Demo-only in practice —
   *  see `CommunityCard`'s `getLiving` lookup. */
  roster?: Person[];
  badge?: ReactNode;
  footAction?: ReactNode;
  /** Extra root classes — pass them from this same CSS module so the
   *  `.privateCard .shoulder` style descendant selectors still match. */
  className?: string;
  /** Renders the same card as an inert `<div>` instead of a `<Link>`, for the
   *  edit modal's live preview: a card inside a dialog must not be tabbable
   *  and must not navigate the member away from the form they are filling in. */
  isPreview?: boolean;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const shownRoster = roster ?? [];

  const face = (
    <>
      <div
        className={[
          styles.shoulder,
          styles[type],
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
          <span className={styles.type}>{typeLabel}</span>
          {badge}
        </div>
        {shownRoster.length > 0 && (
          <div className={styles.cardAvStack}>
            {shownRoster.map((member) => (
              <span className={styles.cardAv} key={member.slug ?? member.name}>
                <Avatar
                  initials={member.initials}
                  tint={member.tint}
                  src={photoOf(member, demoMode)}
                  size={26}
                  alt={member.name}
                />
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.name}>{name}</div>
      <p className={styles.desc}>{description}</p>

      {tags && tags.length > 0 && (
        <TagRow>
          {tags.slice(0, CARD_TAG_DISPLAY_CAP).map((tagId) => (
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
          {countLabel && <span className={styles.meta}>{countLabel}</span>}
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
        {footAction}
      </div>
    </>
  );

  const rootClassName = [styles.card, className].filter(Boolean).join(" ");

  if (isPreview) {
    return <div className={rootClassName}>{face}</div>;
  }

  return (
    <Link to={`/community/${slug}`} className={rootClassName}>
      {face}
    </Link>
  );
}
