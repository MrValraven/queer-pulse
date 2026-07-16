import { Link } from "react-router-dom";
import { Avatar } from "../../shared/components/ui";
import { linkToPath } from "../../app/routeMap";
import { KIND_LABELS } from "./subprofile-kinds";
import type { SubprofileCardDTO } from "./api/subprofiles.api";
import styles from "./SubprofileCard.module.css";

/** Up to two initials from a display name, for the avatar fallback. */
function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * Compact directory/list card for a standalone persona. Reused by the persona
 * directory and the main profile's "Also as…" block, so it stays self-contained
 * and takes a plain `SubprofileCardDTO`. Links to `/p/<handle>` by default; pass
 * `to` to override — the "Also as…" block sends linked personas to their nested
 * `/members/<owner>/<slug>` route instead (linked personas have no handle).
 */
export function SubprofileCard({
  card,
  to,
}: {
  card: SubprofileCardDTO;
  to?: string;
}) {
  return (
    <Link className={styles.card} to={to ?? linkToPath(`/p/${card.handle}`)}>
      <Avatar
        initials={initialsFrom(card.displayName)}
        src={card.avatarUrl ?? undefined}
        tint="plum"
        size={52}
        className={styles.avatar}
      />
      <div className={styles.body}>
        <span className={styles.kindBadge}>{KIND_LABELS[card.kind]}</span>
        <span className={styles.name}>{card.displayName}</span>
        {card.tagline && <span className={styles.tagline}>{card.tagline}</span>}
      </div>
    </Link>
  );
}
