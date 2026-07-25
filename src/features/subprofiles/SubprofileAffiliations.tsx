import { Link } from "react-router-dom";
import { Avatar, Reveal, SectionHead } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AFFILIATION_ROLE_KEYS, affiliationHref } from "./affiliations.data";
import type { AffiliationDTO } from "./api/subprofiles.api";
import styles from "./SubprofileAffiliations.module.css";

/** Up to two initials from a display name, for the avatar fallback. */
function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

function AffiliationCard({ affiliation }: { affiliation: AffiliationDTO }) {
  const { t } = useTranslation();
  const roleKey = AFFILIATION_ROLE_KEYS[affiliation.role];

  return (
    <Link className={styles.card} to={affiliationHref(affiliation)}>
      <Avatar
        initials={initialsFrom(affiliation.name)}
        src={affiliation.imageUrl ?? undefined}
        alt={affiliation.name}
        tint="plum"
        size={52}
        className={styles.avatar}
      />
      <div className={styles.body}>
        <span className={styles.typeBadge}>
          {t(`subprofiles:affiliation.type.${affiliation.targetType}`)}
        </span>
        <span className={styles.name}>{affiliation.name}</span>
        <span className={styles.role}>
          {roleKey ? t(roleKey) : affiliation.role}
        </span>
      </div>
    </Link>
  );
}

/**
 * "Part of" — the persona's owner-chosen event/community links (spec 3c).
 * Existence, visibility and block-filtering are all validated server-side, so
 * every affiliation here is safe to show as-is. Renders nothing when there
 * are none — callers gate on `data.affiliations.length`, but this also
 * guards itself for any other caller.
 */
export function SubprofileAffiliations({
  affiliations,
}: {
  affiliations: AffiliationDTO[];
}) {
  const { t } = useTranslation();
  if (affiliations.length === 0) return null;

  return (
    <div className={`wrap ${styles.wrap}`}>
      <Reveal as="section" className={styles.section}>
        <SectionHead title={t("subprofiles:affiliation.heading")} />
        <div className={styles.grid}>
          {affiliations.map((affiliation) => (
            <AffiliationCard
              key={`${affiliation.targetType}::${affiliation.targetSlug}`}
              affiliation={affiliation}
            />
          ))}
        </div>
      </Reveal>
    </div>
  );
}
