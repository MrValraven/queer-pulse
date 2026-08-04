import { Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { initialsFromName } from "../../shared/lib/initials";
import { linkToPath, routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfilePersonas } from "./useProfilePersonas";
import styles from "./MobileProfile.module.css";

/**
 * Instagram "story highlights"-style horizontal row of a member's personas
 * (subprofiles), for the mobile profile header. Data + visibility rules
 * mirror `ProfileSubprofilesSection` exactly (same hook, same gates), so this
 * row and that section always agree on what a given viewer can see: nothing
 * while loading, and nothing on a visitor's profile with zero linked +
 * published personas. A self view with zero personas still renders — just
 * the "add" circle — so an owner always has a one-tap path to create their
 * first one.
 */
export function MobilePersonaHighlights({
  ownerSlug,
  isSelf,
  previewing,
}: {
  ownerSlug: string;
  isSelf: boolean;
  previewing: boolean;
}) {
  const { t } = useTranslation();
  // An owner previewing their own profile as a visitor sees the visitor's
  // persona set (and loses the "add" circle) — same `selfView` rule
  // `ProfilePage`/`MobileProfileTabPanels` apply to every other section.
  const selfView = isSelf && !previewing;
  const { personas, isLoading } = useProfilePersonas({
    ownerSlug,
    isSelf: selfView,
  });

  if (isLoading) return null;
  if (!selfView && personas.length === 0) return null;

  return (
    <div className={styles.highlightsRow} role="list">
      {selfView && (
        <Link
          to={routes.subprofilesDashboard}
          className={styles.highlightItem}
          role="listitem"
          aria-label={t("subprofiles:alsoAs.addAnother")}
        >
          <span className={styles.highlightAddFrame} aria-hidden>
            <FiPlus />
          </span>
        </Link>
      )}
      {personas.map((persona) => (
        <Link
          key={persona.slug}
          to={
            persona.handle
              ? linkToPath(`/p/${persona.handle}`)
              : `${routes.members}/${ownerSlug}/${persona.slug}`
          }
          className={styles.highlightItem}
          role="listitem"
        >
          <span className={styles.highlightAvatarFrame}>
            <Avatar
              initials={initialsFromName(persona.displayName, "?")}
              src={persona.avatarUrl ?? undefined}
              tint="plum"
              size={60}
              name={persona.displayName}
            />
          </span>
          <span className={styles.highlightLabel}>{persona.displayName}</span>
        </Link>
      ))}
    </div>
  );
}
