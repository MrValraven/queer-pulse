import { FiHeart } from "react-icons/fi";
import { AdminAvatar, AdminChip } from "../../ui";
import { AdminNotSet } from "../../ui/AdminInlineMarkers";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { AdminRoadmapItemDTO } from "../../api/roadmapAdmin.types";
import styles from "./Card.module.css";

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * The card's bottom meta row: target quarter, vote count, confidence chip,
 * owner avatar (or "Unassigned"). `votesLabel`/`confidence`/`unassigned`
 * text all reuse existing new-UI keys from sibling views (`ideasView`,
 * `drawer.commitment`, `toolbar`) rather than inventing Board-only copy for
 * the same three concepts.
 */
export function CardMeta({ item }: { item: AdminRoadmapItemDTO }) {
  const { t } = useTranslation();
  const votesLabel = `${item.votes} ${t("admin:roadmap.ideasView.votesLabel")}`;

  return (
    <div className={styles.meta}>
      <span className={styles.metaQuarter}>
        {item.targetQuarter ?? <AdminNotSet />}
      </span>

      <span className={styles.metaVotes} aria-label={votesLabel}>
        <FiHeart aria-hidden />
        {item.votes}
      </span>

      <AdminChip tone="ghost" className={styles.metaConfidence}>
        {t(
          `admin:roadmap.drawer.commitment.confidence.${item.confidence}.label`,
        )}
      </AdminChip>

      {item.ownerName ? (
        <AdminAvatar
          initials={initialsFor(item.ownerName)}
          size="sm"
          alt={item.ownerName}
          className={styles.metaOwner}
        />
      ) : (
        <span className={styles.metaUnassigned}>
          {t("admin:roadmap.toolbar.ownerUnassigned")}
        </span>
      )}
    </div>
  );
}
