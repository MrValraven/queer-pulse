import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ListingTeamPersonaAvatar } from "./listBusiness/team/ListingTeamPersonaAvatar";
import type { ListingTeamMemberView } from "./listBusiness/api/listingTeam.types";
import styles from "./DirectoryTeam.module.css";

/** One team member: a single link to their persona page. */
export function DirectoryTeamCard({
  member,
}: {
  member: ListingTeamMemberView;
}) {
  const { t } = useTranslation();
  const { persona, roleLabel } = member;

  return (
    <Link to={persona.href} className={styles.card}>
      <ListingTeamPersonaAvatar persona={persona} size={56} />
      <span className={styles.text}>
        <span className={styles.name}>{persona.displayName}</span>
        <span className={styles.kind}>{t(persona.kindLabelKey)}</span>
        {roleLabel && <span className={styles.role}>{roleLabel}</span>}
      </span>
    </Link>
  );
}
