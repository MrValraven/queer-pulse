import { Link } from "react-router-dom";
import { Avatar } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromParts } from "../../shared/lib/initials";
import { tintForSlug } from "../../shared/api/refs";
import { useProfileMutuals } from "./api/useProfileMutuals";
import styles from "./ProfileMutualsCard.module.css";

/**
 * Visitor-only "You both know X and Y" card, floating beside the hero text
 * (`ProfileHero` in `ProfileSections.tsx`) in the space the decorative hero
 * blob would otherwise leave empty. Renders nothing while loading, on error,
 * or when there are no mutuals — this is a light social-proof cue, not a
 * section that needs its own empty state.
 *
 * Deliberately has no "ask X to introduce you" action: that copy implies a
 * warm-intro request flow (messaging a third party about an intro) that
 * doesn't exist anywhere in this codebase. Building one is out of scope here;
 * the card states the mutual connection and stops.
 */
export function ProfileMutualsCard({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { data } = useProfileMutuals(slug);
  if (!data || data.count === 0 || data.members.length === 0) return null;

  const [first, second] = data.members;
  const othersCount = data.count - data.members.length;
  const i18nKey =
    othersCount > 0
      ? "members:profile.mutuals.many"
      : second
        ? "members:profile.mutuals.two"
        : "members:profile.mutuals.one";

  return (
    <aside className={styles.card} aria-label={t("members:profile.mutuals.title")}>
      <span className={styles.title}>{t("members:profile.mutuals.title")}</span>
      <div className={styles.faces}>
        {first && (
          <Link
            to={`/members/${first.slug}`}
            className={styles.face}
            aria-label={`${first.firstName} ${first.lastName}`}
          >
            <Avatar
              initials={initialsFromParts(first.firstName, first.lastName)}
              tint={tintForSlug(first.slug)}
              size={32}
            />
          </Link>
        )}
        {second && (
          <Link
            to={`/members/${second.slug}`}
            className={styles.face}
            aria-label={`${second.firstName} ${second.lastName}`}
          >
            <Avatar
              initials={initialsFromParts(second.firstName, second.lastName)}
              tint={tintForSlug(second.slug)}
              size={32}
            />
          </Link>
        )}
      </div>
      <span className={styles.text}>
        <Translation
          i18nKey={i18nKey}
          values={{
            nameA: first?.firstName,
            nameB: second?.firstName,
            othersCount,
          }}
          components={{ strong: <strong /> }}
        />
      </span>
    </aside>
  );
}
