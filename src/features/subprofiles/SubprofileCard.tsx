import { Link } from "react-router-dom";
import { initialsFromName } from "../../shared/lib/initials";
import { FiArrowRight, FiLink2 } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { linkToPath } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { ACCENT_TOKENS, DEFAULT_ACCENT } from "./subprofilePresence.data";
import type { AccentKey, SubprofileCardDTO } from "./api/subprofiles.api";
import styles from "./SubprofileCard.module.css";

/**
 * Expressive "artist card" for a standalone persona. Reused by the persona
 * directory and the main profile's "Also as…" block, so it stays self-contained
 * and takes a plain `SubprofileCardDTO`. Links to `/p/<handle>` by default; pass
 * `to` to override — the "Also as…" block sends linked personas to their nested
 * `/members/<owner>/<slug>` route instead (linked personas have no handle).
 *
 * A persona is not a member, so it never carries a platform staff/mod badge —
 * that badge belongs to the owning member's profile, not to their personas.
 *
 * The persona's curated accent tints a soft header wash, the avatar ring, and
 * the kind badge, so each persona reads as its own identity. The footer carries
 * a small affordance row — an "open to collabs" dot, a link count, and a "View"
 * signifier — each part renders only when there's something to show.
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
      <div className={styles.header} aria-hidden />
      <Avatar
        initials={initialsFromName(card.displayName, "?")}
        src={card.avatarUrl ?? undefined}
        tint="plum"
        size={60}
        className={styles.avatar}
      />
      <div className={styles.body}>
        <span className={styles.kindBadge}>
          {t(KIND_LABEL_KEYS[card.kind])}
        </span>
        <span className={styles.name}>{card.displayName}</span>
        {card.tagline && <span className={styles.tagline}>{card.tagline}</span>}
        <div className={styles.footer}>
          <div className={styles.meta}>
            {isOpenToCollabs && (
              <span className={styles.availabilityChip}>
                <span className={styles.dot} aria-hidden />
                {t("subprofiles:card.openToCollabs")}
              </span>
            )}
            {hasSocials && (
              <span className={styles.socialChip}>
                <FiLink2 aria-hidden />
                {t("subprofiles:card.linkCount", { count: card.socialCount })}
              </span>
            )}
          </div>
          <span className={styles.view}>
            {t("subprofiles:card.view")}
            <FiArrowRight aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
