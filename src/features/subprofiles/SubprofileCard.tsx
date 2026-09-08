import { Link } from "react-router-dom";
import { initialsFromName } from "../../shared/lib/initials";
import { FiChevronRight, FiLink2, FiUsers } from "react-icons/fi";
import { Avatar, ImageSlot, Tag, TagRow } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { accentStyle, DEFAULT_ACCENT } from "./subprofilePresence.data";
import { skinFor } from "./subprofile-skins";
import { personaCardPath } from "./personaLinks.data";
import { personaTitleName } from "./subprofile-kinds";
import type { AccentKey, SubprofileCardDTO } from "./api/subprofiles.api";
import styles from "./SubprofileCard.module.css";

/** Cap on how many tag chips render on the card face — the directory grid
 *  keeps cards equal-height, so a persona with a long tag list only shows its
 *  top few (the filter row still exposes the full vocabulary). */
const CARD_TAG_CAP = 4;

/** Device pixels to request for the header banner from a resizable image host.
 *  The band is one grid column wide (~360px at the widest breakpoint), so the
 *  fluid default — viewport width × DPR — would over-ask by several times for
 *  every card on the page. */
const COVER_SRC_SIZE = 720;

/**
 * Expressive "artist card" for a standalone persona. Reused by the persona
 * directory and the main profile's "Also as…" block, so it stays self-contained
 * and takes a plain `SubprofileCardDTO`. Routes via `personaCardPath` by
 * default — `/members/<owner>/<slug>` for linked personas, `/p/<handle>` for
 * unlinked ones; pass `to` to override (the "Also as…" block does this).
 *
 * A persona is not a member, so it never carries a platform staff/mod badge —
 * that badge belongs to the owning member's profile, not to their personas.
 *
 * The header band shows the persona's own banner (`coverUrl`) when it has one,
 * framed by the owner's saved reframe crop as a FOCAL POINT — the band is far
 * wider and shorter than the 3:1 box that crop was drawn in, so reproducing it
 * exactly would distort it. A persona with no banner keeps the accent wash, so
 * the grid never shows an empty frame.
 *
 * The persona's curated accent tints that wash, the avatar ring, and
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
  const family = skinFor(card.kind);
  const isOpenToCollabs = card.availability === "open_to_collabs";
  const hasSocials = card.socialCount > 0;
  const hasFollowers = card.followerCount > 0;
  const visibleTags = card.tags.slice(0, CARD_TAG_CAP);
  // A persona still carrying its profession as a name ("Poet") is titled
  // "Owner Name | Poet" instead, so the card names a person rather than a
  // category. Unlinked personas carry no owner name and stay bare.
  const titleName = personaTitleName({
    displayName: card.displayName,
    kind: card.kind,
    ownerName: card.ownerName,
  });

  return (
    <Link
      className={styles.card}
      to={to ?? personaCardPath(card)}
      style={accentStyle(accent)}
    >
      <div className={styles.header} aria-hidden>
        {card.coverUrl && (
          <ImageSlot
            src={card.coverUrl}
            alt=""
            tint="plum"
            focus={card.coverCrop ?? undefined}
            srcSize={COVER_SRC_SIZE}
            radius={0}
            width="100%"
            height="100%"
            // A persona whose banner is still loading (or fails) shows the
            // accent wash underneath rather than the literal "Image" caption.
            placeholder=""
            className={styles.cover}
          />
        )}
      </div>
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
        <span className={styles.name}>{titleName}</span>
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
