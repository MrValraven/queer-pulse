import { Link } from "react-router-dom";
import { Avatar } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromParts } from "../../shared/lib/initials";
import { tintForSlug } from "../../shared/api/refs";
import { useProfileMutuals } from "./api/useProfileMutuals";
import styles from "./ProfileMutualsCard.module.css";

/**
 * Visitor-only "You both know X and Y" card. On desktop it floats beside the
 * hero text (`ProfileHero` in `ProfileSections.tsx`) in the space the
 * decorative hero blob would otherwise leave empty; on mobile
 * `MobileProfileHeader` stacks it full width under the vouch row, passing
 * `className` to lift the desktop width limits. Renders nothing while
 * loading, on error, or when there are no mutuals: it is a light social-proof
 * cue and needs no empty state of its own.
 *
 * Deliberately has no "ask X to introduce you" action: that copy implies a
 * warm-intro request flow (messaging a third party about an intro) that
 * doesn't exist anywhere in this codebase. Building one is out of scope here;
 * the card states the mutual connection and stops.
 */
export function ProfileMutualsCard({
  slug,
  className,
}: {
  slug: string;
  /** Extra class merged onto the card, for a caller's layout overrides. */
  className?: string;
}) {
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
    <aside
      className={className ? `${styles.card} ${className}` : styles.card}
      aria-label={t("members:profile.mutuals.title")}
    >
      <span className={styles.title}>{t("members:profile.mutuals.title")}</span>
      <div className={styles.faces}>
        {data.members.map((member) => (
          <Link
            key={member.slug}
            to={`/members/${member.slug}`}
            className={styles.face}
            aria-label={`${member.firstName} ${member.lastName}`}
          >
            <Avatar
              initials={initialsFromParts(member.firstName, member.lastName)}
              tint={tintForSlug(member.slug)}
              size={32}
              // The mutual's real face, when they have one the viewer may see
              // (the endpoint applies the `photoVisible` gate and sends null
              // otherwise); `Avatar` falls back to the initials below it.
              // No `name`/`alt`: the Link above already announces who this is,
              // so the image stays decorative instead of double-reading.
              src={member.avatarUrl ?? undefined}
            />
          </Link>
        ))}
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
