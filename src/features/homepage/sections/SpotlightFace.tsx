import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { type AvatarTint, Tag, TagRow } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useAuth } from "../../../app/providers/authContext";
import type { SpotlightView } from "./spotlightView";
import styles from "./Discovery.module.css";

/** Maps a member's avatar tint to the featured face's tint class (photo bg + label). */
const tintClass: Record<AvatarTint, string | undefined> = {
  coral: styles.tCoral,
  jade: styles.tJade,
  plum: styles.tPlum,
  default: styles.tPlum,
  auth: styles.tPlum,
};

/**
 * One featured member: big portrait on the left, their story on the right.
 *
 * Profile navigation (the name link and the "View profile" footer link) is for
 * signed-in members only, and it goes to the member's normal in-app profile at
 * `/members/:slug`. A signed-out visitor on the marketing homepage gets the
 * card as a teaser with nothing to click through to: member profiles are a
 * members-only surface, and the section's own "Explore members" CTA already
 * hands a signed-out visitor the membership explainer, so the card doesn't
 * offer a second, dead-ending door into the same place. Demo mode is always
 * "signed in" (mock persona), so the demo showcase keeps its links.
 */
export function SpotlightFace({ view }: { view: SpotlightView }) {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const showVouch = view.verified && !!view.vouchedBy;

  return (
    <div
      className={[styles.face, tintClass[view.tint]].filter(Boolean).join(" ")}
    >
      <div className={styles.featPhoto}>
        {view.photoUrl ? (
          <img
            src={view.photoUrl}
            alt={view.name}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className={styles.photoFallback} aria-hidden>
            {view.initials}
          </span>
        )}
        {view.verified && (
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
        {loggedIn ? (
          <Link to={view.to} className={styles.nameLink}>
            <h3 className={styles.name}>{view.name}</h3>
          </Link>
        ) : (
          <h3 className={styles.name}>{view.name}</h3>
        )}
        {view.role && (
          <p className={styles.role}>
            {view.hood ? `${view.role} · ${view.hood}` : view.role}
          </p>
        )}
        <p className={styles.quote}>{view.quote}</p>

        {view.tags.length > 0 && (
          <TagRow className={styles.featTags}>
            {view.tags.slice(0, 3).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </TagRow>
        )}

        {/* The footer carries a top rule, so it only renders when it actually
            has something in it. For a signed-out visitor with no voucher line
            (the live feed never supplies one) it would otherwise leave a stray
            hairline under the tags. */}
        {(showVouch || loggedIn) && (
          <div className={styles.featFoot}>
            {showVouch && (
              <span className={styles.vouch}>
                {t("homepage:discovery.vouchedBy", { name: view.vouchedBy })}
              </span>
            )}
            {/* The card is a teaser: send people to the profile to read the full
                story first. Reaching out happens from there, so the Connect modal
                has one entry point instead of two. */}
            {loggedIn && (
              <Link to={view.to} className={styles.sayHi}>
                {t("homepage:discovery.viewProfile")}{" "}
                <FiArrowRight aria-hidden />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
