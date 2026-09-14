import { Link } from "react-router-dom";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { ImageSlot, type ImageSlotTint } from "../../shared/components/ui";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { memberProfiles, type MemberProfile } from "./data/memberProfiles";
import type { RelatedMember } from "./data/members";
import {
  closenessBetween,
  closenessLabel,
  closenessTone,
} from "./relatedCloseness";
import { Section } from "./ProfileSections";
import styles from "./ProfileRelatedSection.module.css";

/** Height of a card's photo panel. Four of these sit in a row on a 1100px
 *  profile column, so the panel stays a little wider than it is tall: the
 *  proportions of a portrait crop of a face. */
const PHOTO_HEIGHT = 168;

/** Pixels to request from a resizable photo host. A card is roughly 250px wide
 *  on a desktop profile column and full-width on a phone, so 640 covers both at
 *  2x; without it a fluid `width="100%"` slot asks for the whole viewport
 *  width (see `ImageSlot`'s `defaultSrcSize`), four times over. */
const PHOTO_SRC_PX = 640;

/** `tintForSlug` draws from the avatar palette, which carries one tint the
 *  image slot has no equivalent for. */
function slotTint(tint: RelatedMember["tint"]): ImageSlotTint {
  return tint === "auth" ? "default" : tint;
}

/**
 * "People close by": up to four members near the profile owner in craft or
 * neighbourhood, each carrying the one fact that puts them there.
 *
 * Live mode reads `relatedCards` (resolved server-side, chip included). Demo
 * mode resolves the owner's `related` slugs against the mock registry and
 * derives the same chip locally, because real members are not in that registry
 * and mock members are not in the database.
 */
export function RelatedSection({ profile }: { profile: MemberProfile }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const relatedMembers: RelatedMember[] = profile.relatedCards?.length
    ? profile.relatedCards
    : demoMode
      ? profile.related.flatMap((relatedSlug) => {
          const registryMember = memberProfiles[relatedSlug];
          if (!registryMember) return [];
          return [
            {
              slug: relatedSlug,
              first: registryMember.first,
              last: registryMember.last,
              role: registryMember.role,
              hood: registryMember.hood,
              initials: registryMember.initials,
              tint: registryMember.tint,
              avatarUrl: registryMember.photo,
              closeness: closenessBetween(profile, registryMember),
            },
          ];
        })
      : [];
  if (relatedMembers.length === 0) return null;
  return (
    <Section
      id="related"
      title={t("members:content.related.title")}
      subtitle={t("members:content.related.subtitle")}
    >
      <div className={styles.grid}>
        {relatedMembers.map((relatedMember) => (
          <RelatedMemberCard
            key={relatedMember.slug}
            member={relatedMember}
            ownerFirst={profile.first}
          />
        ))}
      </div>
    </Section>
  );
}

function RelatedMemberCard({
  member,
  ownerFirst,
}: {
  member: RelatedMember;
  ownerFirst: string;
}) {
  const { t } = useTranslation();
  const fullName = `${member.first} ${member.last}`;
  // The role line reads "Ceramicist · Graça". A member who hides their
  // neighbourhood (or has none) leaves the craft standing alone rather than a
  // trailing separator.
  const craft = member.role.split("·")[0]!.trim();
  const roleLine = member.hood ? `${craft} · ${member.hood}` : craft;
  return (
    <Link to={`/members/${member.slug}`} className={styles.card}>
      <ImageSlot
        src={member.avatarUrl}
        alt={fullName}
        initials={member.initials}
        tint={slotTint(member.tint)}
        height={PHOTO_HEIGHT}
        width="100%"
        srcSize={PHOTO_SRC_PX}
        radius={14}
        className={styles.photo}
      />
      <div className={styles.name}>
        <span className={styles.nameRow}>
          {fullName}
          <MemberStaffBadge slug={member.slug} />
        </span>
      </div>
      <div className={styles.role}>{roleLine}</div>
      {member.closeness && (
        <span
          className={`${styles.chip} ${styles[closenessTone(member.closeness.kind)]}`}
        >
          {closenessTone(member.closeness.kind) === "vouch" ? (
            <FiCheck aria-hidden />
          ) : (
            <FiArrowRight aria-hidden />
          )}
          {closenessLabel(member.closeness, ownerFirst, t)}
        </span>
      )}
    </Link>
  );
}
