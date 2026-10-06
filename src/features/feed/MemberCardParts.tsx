import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import {
  Avatar,
  ExpandableText,
  type AvatarTint,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { memberPath } from "../forum/forumAuthor.helpers";
import { MemberPortrait } from "../members/MemberPortrait";
import { MemberInterestTags } from "./MemberInterestTags";
import styles from "./MemberCard.module.css";

// ── Pieces of the feed's "New member" card ──────────────────────────────────
// Shared by both layouts in `MemberCard.tsx` (the desktop portrait split and
// the phone avatar row), which decides where each one sits.

/** A link to the member's profile, or the same box inert when the actor has
 *  no slug to address. The photo and the name both use it, so the two
 *  targets always agree.
 *
 *  `isMouseOnly` keeps the link clickable but takes it out of the tab order
 *  and the accessibility tree, for a photo that repeats the name link beside
 *  it. The name link stays the one tab stop and carries the label. */
function ProfileLink({
  slug,
  name,
  className,
  isMouseOnly = false,
  children,
}: {
  slug: string;
  name: string;
  className?: string;
  isMouseOnly?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  if (!slug) return <span className={className}>{children}</span>;
  if (isMouseOnly) {
    return (
      <Link
        to={memberPath(slug)}
        className={className}
        tabIndex={-1}
        aria-hidden="true"
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      to={memberPath(slug)}
      className={className}
      aria-label={t("feed:action.viewProfileAria", { name })}
    >
      {children}
    </Link>
  );
}

/** The head row: the one context line (why this person is worth a look) and
 *  when they joined. The context line holds to one line and ellipsises, with
 *  the full text in its `title`. The time is a `<time>` carrying the join
 *  timestamp, left out when that timestamp does not parse (an empty label). */
export function MemberCardHead({
  contextLabel,
  timeLabel,
  dateTime,
}: {
  contextLabel: string;
  timeLabel: string;
  dateTime: string;
}) {
  return (
    <div className={styles.head}>
      <span className={styles.eyebrow} title={contextLabel}>
        {contextLabel}
      </span>
      {timeLabel && (
        <time className={styles.time} dateTime={dateTime}>
          {timeLabel}
        </time>
      )}
    </div>
  );
}

/** Name, pronouns and staff badge on one wrapping line, then the
 *  neighbourhood under it. */
export function MemberNameBlock({
  slug,
  name,
  pronouns,
  neighbourhood,
}: {
  slug: string;
  name: string;
  pronouns?: string;
  neighbourhood?: string;
}) {
  return (
    <div className={styles.identityText}>
      <div className={styles.nameRow}>
        <ProfileLink slug={slug} name={name} className={styles.nameLink}>
          {name}
        </ProfileLink>
        {pronouns && <span className={styles.pronouns}>{pronouns}</span>}
        <MemberStaffBadge slug={slug || undefined} className={styles.badge} />
      </div>
      {neighbourhood && (
        <p className={styles.meta}>
          <FiMapPin className={styles.metaIcon} aria-hidden />
          {neighbourhood}
        </p>
      )}
    </div>
  );
}

/** The bio and interest tags, or a single muted prompt when the member has
 *  shared nothing yet (the caller decides that, since the neighbourhood
 *  counts too). The prompt has its own line for someone already connected,
 *  whose button reads "Say hi".
 *
 *  The bio leads, exactly as the member wrote it (line breaks, emoji and
 *  casing kept), folded to four lines with ExpandableText's Read more / Show
 *  less toggle. The tags sit on one row under it (see MemberInterestTags). */
export function MemberCardBody({
  bio,
  interests,
  sharedInterests,
  isEmpty,
  isConnected,
}: {
  bio?: string;
  interests: string[];
  sharedInterests?: string[];
  isEmpty: boolean;
  isConnected: boolean;
}) {
  const { t } = useTranslation();
  if (isEmpty) {
    return (
      <p className={styles.emptyPrompt}>
        {isConnected
          ? t("feed:memberCard.emptyPromptConnected")
          : t("feed:memberCard.emptyPrompt")}
      </p>
    );
  }
  if (!bio && interests.length === 0) return null;
  return (
    <div className={styles.body}>
      {bio && (
        <ExpandableText className={styles.bio} lines={4} resetKey={bio}>
          {bio}
        </ExpandableText>
      )}
      {interests.length > 0 && (
        <MemberInterestTags
          interests={interests}
          sharedInterests={sharedInterests}
        />
      )}
    </div>
  );
}

interface MemberPhotoProps {
  slug: string;
  name: string;
  initials: string;
  tint: AvatarTint;
  src?: string;
}

/** The desktop layout's full-height photo column, flush with the card's
 *  top, left and bottom edges. The name link sits right beside it, so the
 *  photo is decorative (`alt=""`) and its link is mouse-only. */
export function MemberPortraitColumn({
  slug,
  name,
  initials,
  tint,
  src,
}: MemberPhotoProps) {
  return (
    <ProfileLink
      slug={slug}
      name={name}
      className={styles.portraitCell}
      isMouseOnly
    >
      <MemberPortrait
        className={styles.portraitFill}
        initials={initials}
        tint={tint}
        src={src}
        alt=""
      />
    </ProfileLink>
  );
}

/** The phone layout's 64px round photo, decorative for the same reason. */
export function MemberAvatarLink({
  slug,
  name,
  initials,
  tint,
  src,
}: MemberPhotoProps) {
  return (
    <ProfileLink
      slug={slug}
      name={name}
      className={styles.avatarLink}
      isMouseOnly
    >
      <Avatar
        className={styles.avatarPhoto}
        initials={initials}
        tint={tint}
        size={64}
        src={src}
      />
    </ProfileLink>
  );
}
