import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import {
  type AvatarTint,
  Tag,
  TagRow,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../../shared/staff/MemberStaffBadge";
import { profilePath, type Spotlight } from "./Discovery.data";
import { portraitSrc } from "./portraitSrc";
import styles from "./Discovery.module.css";

/** Maps a member's avatar tint to the featured face's tint class (photo bg + label). */
const tintClass: Record<AvatarTint, string | undefined> = {
  coral: styles.tCoral,
  jade: styles.tJade,
  plum: styles.tPlum,
  default: styles.tPlum,
  auth: styles.tPlum,
};

/** One featured member: big portrait on the left, their story on the right. */
export function SpotlightFace({ member, quote }: Spotlight) {
  const { t } = useTranslation();
  const to = profilePath(member);
  const portrait = portraitSrc(member.photo);

  return (
    <div
      className={[styles.face, tintClass[member.tint]]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.featPhoto}>
        {portrait ? (
          <img
            src={portrait}
            alt={member.name}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className={styles.photoFallback} aria-hidden>
            {member.initials}
          </span>
        )}
        {member.verified && (
          <span className={styles.photoVerified}>
            <svg
              width={13}
              height={13}
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <polyline
                points="20 6 9 17 4 12"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("homepage:discovery.verifiedBadge")}
          </span>
        )}
      </div>

      <div className={styles.featContent}>
        <span className={styles.capMeta}>
          {t("homepage:discovery.featuredMember")}
        </span>
        <span className={styles.nameRow}>
          <Link to={to} className={styles.nameLink}>
            <h3 className={styles.name}>{member.name}</h3>
          </Link>
          <MemberStaffBadge slug={member.key} />
        </span>
        <p className={styles.role}>
          {member.role} · {member.hood}
        </p>
        <p className={styles.quote}>{quote}</p>

        <TagRow className={styles.featTags}>
          {member.tags.slice(0, 3).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </TagRow>

        <div className={styles.featFoot}>
          {member.verified && (
            <span className={styles.vouch}>
              {t("homepage:discovery.vouchedBy", { name: member.vouchedBy })}
            </span>
          )}
          {/* The card is a teaser: send people to the profile to read the full
              story first. Reaching out happens from there, so the Connect modal
              has one entry point instead of two. */}
          <Link to={to} className={styles.sayHi}>
            {t("homepage:discovery.viewProfile")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
