import { Avatar, type AvatarTint } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { ActivityBandPill } from "./ActivityBandPill";
import type { ActivityBand } from "./activityBand";
import { MemberPortrait } from "./MemberPortrait";
import styles from "./MemberDirectoryFilterPage.module.css";

/** Most tags a result card shows before collapsing the rest into a "+N" chip.
 *  Keeps every card's tag row bounded regardless of how rich the profile is. */
const MAX_CARD_TAGS = 3;

export interface MemberCardBodyProps {
  name: string;
  /** Member slug, so the card can show the staff badge next to the name.
   *  Optional: callers with no slug in scope simply render no badge. */
  slug?: string;
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
  /** Coarse "recently active" band, already gated by the backend for this
   *  viewer. `null`/absent renders nothing at all: the member opted out, or the
   *  platform has never observed a session for them, and neither may be shown
   *  as "not active recently". See `activityBand.ts`. */
  activityBand?: ActivityBand | null;
  /** Renders the split card (portrait column beside the details) when true,
   *  and the compact avatar-in-a-row card otherwise. Resolve it once with
   *  `useIsMemberCardSplit` and give the wrapper `.mCardSplit` to match. */
  isSplit?: boolean;
}

/** The name row (name, staff badge, "You" pill) over the pronouns line. */
function MemberCardIdentity({
  name,
  slug,
  meta,
  isMe,
}: Pick<MemberCardBodyProps, "name" | "slug" | "meta"> & { isMe: boolean }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className={styles.mName}>
        <span>{name}</span>
        <MemberStaffBadge slug={slug} />
        {isMe && <span className={styles.mYou}>{t("members:card.you")}</span>}
      </div>
      <div className={styles.mPron}>{meta}</div>
    </div>
  );
}

/** Everything under the identity: blurb, tag chips with "+N", and the footer. */
function MemberCardDetails({
  blurb,
  tags,
  vouchCount,
  mutualsCount,
  activityBand,
}: Pick<
  MemberCardBodyProps,
  "blurb" | "tags" | "vouchCount" | "mutualsCount" | "activityBand"
>) {
  const { t } = useTranslation();
  const visibleTags = tags.slice(0, MAX_CARD_TAGS);
  const overflowTags = tags.length - visibleTags.length;
  return (
    <>
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
        {/* Renders nothing when the band is null, which is the common case on
            a fresh platform and the permanent case for a member who opted
            out. */}
        <ActivityBandPill band={activityBand} />
      </div>
    </>
  );
}

/**
 * The inside of a member's directory card, with no wrapper of its own — callers
 * supply that, because the directory needs a `<Link>` and the profile editor's
 * preview needs a static `<div>` (a link inside a form is the wrong affordance).
 *
 * This exists so `MemberResultCard` and `DirectoryCardPreview` render from one
 * body: the preview's whole value is being exactly what strangers see, and two
 * copies of this markup would drift apart the first time either is touched.
 *
 * With `isSplit` it renders two grid cells: a full-height portrait for the
 * wrapper's 30% left column and the details column beside it. The wrapper supplies the split grid (`.mCardSplit`). The
 * portrait takes the place of the small round avatar and carries `alt=""`,
 * since the name sits right beside it and names the card's link.
 */
export function MemberCardBody({
  name,
  slug,
  initials,
  tint,
  photo,
  meta,
  blurb,
  tags,
  isMe = false,
  vouchCount,
  mutualsCount,
  activityBand,
  isSplit = false,
}: MemberCardBodyProps) {
  const details = (
    <MemberCardDetails
      blurb={blurb}
      tags={tags}
      vouchCount={vouchCount}
      mutualsCount={mutualsCount}
      activityBand={activityBand}
    />
  );
  const identity = (
    <MemberCardIdentity name={name} slug={slug} meta={meta} isMe={isMe} />
  );
  if (isSplit) {
    return (
      <>
        <div className={styles.mPortraitCell}>
          <MemberPortrait
            className={styles.mPortraitFill}
            initials={initials}
            tint={tint}
            src={photo}
            alt=""
          />
        </div>
        <div className={styles.mSplitBody}>
          {identity}
          {details}
        </div>
      </>
    );
  }
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
        {identity}
      </div>
      {details}
    </>
  );
}
