import { Avatar, type AvatarTint } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MemberDirectoryFilterPage.module.css";

/** Most tags a result card shows before collapsing the rest into a "+N" chip.
 *  Keeps every card's tag row bounded regardless of how rich the profile is. */
const MAX_CARD_TAGS = 3;

export interface MemberCardBodyProps {
  name: string;
  initials: string;
  tint: AvatarTint;
  photo?: string;
  /** The quiet line under the name — pronouns, in practice. */
  meta: string;
  /** The card's two-line blurb: the member's short bio, or its bio-derived
   *  fallback. Resolve it with `directoryBlurb` — never pass a raw field. */
  blurb: string;
  tags: { label: string; match?: boolean }[];
  /** Marks the signed-in member's own card with a "You" pill. */
  isMe?: boolean;
  vouchCount?: number;
  mutualsCount?: number;
}

/**
 * The inside of a member's directory card, with no wrapper of its own — callers
 * supply that, because the directory needs a `<Link>` and the profile editor's
 * preview needs a static `<div>` (a link inside a form is the wrong affordance).
 *
 * This exists so `MemberResultCard` and `DirectoryCardPreview` render from one
 * body: the preview's whole value is being exactly what strangers see, and two
 * copies of this markup would drift apart the first time either is touched.
 */
export function MemberCardBody({
  name,
  initials,
  tint,
  photo,
  meta,
  blurb,
  tags,
  isMe = false,
  vouchCount,
  mutualsCount,
}: MemberCardBodyProps) {
  const { t } = useTranslation();
  const visibleTags = tags.slice(0, MAX_CARD_TAGS);
  const overflowTags = tags.length - visibleTags.length;
  return (
    <>
      <div className={styles.mHead}>
        <Avatar
          initials={initials}
          tint={tint}
          src={photo}
          size={48}
          alt={name}
        />
        <div>
          <div className={styles.mName}>
            {name}
            {isMe && (
              <span className={styles.mYou}>{t("members:card.you")}</span>
            )}
          </div>
          <div className={styles.mPron}>{meta}</div>
        </div>
      </div>
      <div className={styles.mRole}>{blurb}</div>
      <div className={styles.mTags}>
        {visibleTags.map((tag) => (
          <span
            key={tag.label}
            className={[styles.mTag, tag.match && styles.mTagMatch]
              .filter(Boolean)
              .join(" ")}
          >
            {tag.label}
          </span>
        ))}
        {overflowTags > 0 && (
          <span
            className={styles.mTagMore}
            title={tags
              .slice(MAX_CARD_TAGS)
              .map((tag) => tag.label)
              .join(", ")}
          >
            +{overflowTags}
          </span>
        )}
      </div>
      <div className={styles.mFoot}>
        {/* mutualsCount is a placeholder 0 on live cards until the API carries
            it, and `.vouch` draws a jade dot via ::before — so render nothing
            at all at zero rather than leaving a bare dot floating in the
            footer. */}
        {!!vouchCount && (
          <span className={styles.vouch}>
            {t("members:card.vouchCount", { count: vouchCount })}
          </span>
        )}
        {!!mutualsCount && (
          <span>{t("members:card.mutualsCount", { count: mutualsCount })}</span>
        )}
      </div>
    </>
  );
}
