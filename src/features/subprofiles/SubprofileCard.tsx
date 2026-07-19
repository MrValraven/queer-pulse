import { Link } from "react-router-dom";
import { Avatar } from "../../shared/components/ui";
import { linkToPath } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
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
 *
 * `ownerSlug` is the *member* slug of the persona's owner — `card` itself only
 * carries a `handle`, which isn't a member identifier — and feeds the staff
 * badge shown beside the display name. Pass it wherever the call site already
 * knows the owning member's slug (e.g. the profile's "Also as…" block); the
 * directory, which only has the DTO, omits it and renders no badge.
 */
export function SubprofileCard({
  card,
  to,
  ownerSlug,
}: {
  card: SubprofileCardDTO;
  to?: string;
  ownerSlug?: string;
}) {
  const { t } = useTranslation();
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
        <span className={styles.kindBadge}>
          {t(KIND_LABEL_KEYS[card.kind])}
        </span>
        <span className={styles.nameRow}>
          <span className={styles.name}>{card.displayName}</span>
          <MemberStaffBadge slug={ownerSlug} />
        </span>
        {card.tagline && <span className={styles.tagline}>{card.tagline}</span>}
      </div>
    </Link>
  );
}
