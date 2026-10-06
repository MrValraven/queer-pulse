import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { AvatarTint } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { memberPath } from "../forum/forumAuthor.helpers";
import { MemberPortrait } from "../members/MemberPortrait";
import { FeedCardHead, FeedCardShell } from "./FeedCard";
import feedStyles from "./FeedCard.module.css";
import styles from "./MemberCard.module.css";

/**
 * The full-height portrait column of a split "New member" card. A link to the
 * member's profile (the same target and label as `FeedAvatarLink`), or an
 * inert panel when the actor has no slug to link to.
 */
function MemberCardPortrait({
  slug,
  name,
  initials,
  tint,
  src,
}: {
  slug: string;
  name: string;
  initials: string;
  tint: AvatarTint;
  src?: string;
}) {
  const { t } = useTranslation();
  // The name sits right beside the portrait, so the photo itself is
  // decorative: `alt=""` keeps it from being read twice.
  const portrait = (
    <MemberPortrait
      className={styles.portraitFill}
      initials={initials}
      tint={tint}
      src={src}
      alt=""
    />
  );
  if (!slug) return <div className={styles.portraitCell}>{portrait}</div>;
  return (
    <Link
      to={memberPath(slug)}
      className={`${styles.portraitCell} ${styles.portraitLink}`}
      aria-label={t("feed:action.viewProfileAria", { name })}
    >
      {portrait}
    </Link>
  );
}

/**
 * Desktop split layout of the feed's "New member" card: the member's portrait
 * fills a left column from the card's top edge to its bottom edge, and the
 * details run down the right column in the same order as the stacked card.
 * The small round avatar is dropped because the portrait already shows the
 * member's face. `MemberCard` decides when this layout applies.
 */
export function MemberCardSplit({
  slug,
  name,
  initials,
  tint,
  avatarSrc,
  label,
  timestamp,
  nameBlock,
  meta,
  children,
}: {
  slug: string;
  name: string;
  initials: string;
  tint: AvatarTint;
  avatarSrc?: string;
  label: string;
  timestamp: string;
  nameBlock: ReactNode;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <FeedCardShell accent="coral" className={styles.split}>
      <MemberCardPortrait
        slug={slug}
        name={name}
        initials={initials}
        tint={tint}
        src={avatarSrc}
      />
      <div className={styles.details}>
        <FeedCardHead label={label} timestamp={timestamp} />
        <div className={feedStyles.identityText}>
          <div className={feedStyles.name}>{nameBlock}</div>
          {meta && <div className={feedStyles.meta}>{meta}</div>}
        </div>
        {children}
      </div>
    </FeedCardShell>
  );
}
