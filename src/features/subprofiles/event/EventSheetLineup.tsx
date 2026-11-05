import { Link } from "react-router-dom";
import { Avatar } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { initialsFromName } from "../../../shared/lib/initials";
import { collaboratorHref } from "../collaborators.data";
import type { CollaboratorDTO } from "../api/subprofiles.api";
import styles from "./EventSheetContent.module.css";

/**
 * "Line-up": the linked collaborators as avatar and name chips, each opening
 * that member's profile or persona page (the same `collaboratorHref` the
 * Spotlight credits use), then the line-up the owner typed as free text.
 * Renders nothing when there is neither.
 */
export function EventSheetLineup({
  collaborators,
  lineupText,
}: {
  collaborators: CollaboratorDTO[];
  lineupText: string;
}) {
  const { t } = useTranslation();
  const trimmedLineup = lineupText.trim();
  if (collaborators.length === 0 && !trimmedLineup) return null;

  return (
    <section className={styles.lineup}>
      <h3 className={styles.sectionLabel}>
        {t("subprofiles:event.sheet.lineup")}
      </h3>
      {collaborators.length > 0 && (
        <ul className={styles.chips}>
          {collaborators.map((collaborator) => (
            <li key={`${collaborator.type}:${collaborator.handle}`}>
              <Link className={styles.chip} to={collaboratorHref(collaborator)}>
                {/* The name sits beside it, so the avatar stays decorative. */}
                <Avatar
                  className={styles.chipAvatar}
                  initials={initialsFromName(collaborator.name, "?")}
                  src={collaborator.avatarUrl ?? undefined}
                  size={28}
                />
                <span className={styles.chipName}>{collaborator.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {trimmedLineup && <p className={styles.lineupText}>{trimmedLineup}</p>}
    </section>
  );
}
