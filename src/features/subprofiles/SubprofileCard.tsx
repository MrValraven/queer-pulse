import { Link } from "react-router-dom";
import { FiLink2 } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { linkToPath } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { ACCENT_TOKENS, DEFAULT_ACCENT } from "./subprofilePresence.data";
import type { AccentKey, SubprofileCardDTO } from "./api/subprofiles.api";
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
 * A persona is not a member, so it never carries a platform staff/mod badge —
 * that badge belongs to the owning member's profile, not to their personas.
 *
 * Tinted with the persona's curated accent (kind badge fill, dot color) and,
 * in the footer, a small affordance row: an "open to collabs" dot and a
 * social-link-count chip — each renders only when there's something to show.
 */
export function SubprofileCard({
  card,
  to,
}: {
  card: SubprofileCardDTO;
  to?: string;
}) {
  const { t } = useTranslation();
  const accent = (card.accent as AccentKey | null) ?? DEFAULT_ACCENT;
  const { tint, on } = ACCENT_TOKENS[accent];
  const isOpenToCollabs = card.availability === "open_to_collabs";
  const hasSocials = card.socialCount > 0;

  return (
    <Link
      className={styles.card}
      to={to ?? linkToPath(`/p/${card.handle}`)}
      style={{ ["--accent-tint" as string]: tint, ["--accent-on" as string]: on }}
    >
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
        <span className={styles.name}>{card.displayName}</span>
        {card.tagline && <span className={styles.tagline}>{card.tagline}</span>}
        {(isOpenToCollabs || hasSocials) && (
          <div className={styles.affordances}>
            {isOpenToCollabs && (
              <span className={styles.availabilityChip}>
                <span className={styles.dot} aria-hidden />
                {t("subprofiles:card.openToCollabs")}
              </span>
            )}
            {hasSocials && (
              <span
                className={styles.socialChip}
                aria-label={t("subprofiles:card.socialCount", {
                  count: card.socialCount,
                })}
              >
                <FiLink2 aria-hidden />
                <span aria-hidden>{card.socialCount}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
