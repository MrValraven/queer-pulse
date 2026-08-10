import { Link } from "react-router-dom";
import { initialsFromName } from "../../shared/lib/initials";
import { FiChevronRight, FiLink2, FiUsers } from "react-icons/fi";
import { Avatar, Tag, TagRow } from "../../shared/components/ui";
import { linkToPath } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ACCENT_TOKENS, DEFAULT_ACCENT } from "./subprofilePresence.data";
import { skinFor } from "./subprofile-skins";
import type { AccentKey, SubprofileCardDTO } from "./api/subprofiles.api";
import styles from "./SubprofileCard.module.css";

/** Cap on how many tag chips render on the card face — the directory grid
 *  keeps cards equal-height, so a persona with a long tag list only shows its
 *  top few (the filter row still exposes the full vocabulary). */
const CARD_TAG_CAP = 4;

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
 * the family pill, so each persona reads as its own identity. Personas
 * redesign Phase 4: the pill now names the persona's skin **family**
 * (`skinFor(card.kind)`) rather than its raw kind, and the footer grew a
 * follower count alongside the existing "open to collabs"/link-count meta —
 * each part renders only when there's something to show.
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
  const family = skinFor(card.kind);
  const isOpenToCollabs = card.availability === "open_to_collabs";
  const hasSocials = card.socialCount > 0;
  const hasFollowers = card.followerCount > 0;
  const visibleTags = card.tags.slice(0, CARD_TAG_CAP);

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
        <span className={styles.familyPill}>
          {t(`subprofiles:family.${family}.label`)}
        </span>
        <span className={styles.name}>{card.displayName}</span>
        {card.tagline && <span className={styles.tagline}>{card.tagline}</span>}
        {visibleTags.length > 0 && (
          <TagRow className={styles.tags}>
            {visibleTags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </TagRow>
        )}
        <div className={styles.footer}>
          <div className={styles.meta}>
            {isOpenToCollabs && (
              <span className={styles.availabilityChip}>
                <span className={styles.dot} aria-hidden />
                {t("subprofiles:card.openToCollabs")}
              </span>
            )}
            {hasFollowers && (
              <span className={styles.socialChip}>
                <FiUsers aria-hidden />
                {t("subprofiles:card.followerCount", {
                  count: card.followerCount,
                })}
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
            {t("subprofiles:card.openPersona")}
            <FiChevronRight aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
