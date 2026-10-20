import { createElement } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { mediaMax } from "../../shared/theme/breakpoints";
import { kindIcon } from "../subprofiles/subprofile-kinds";
import { shouldShowKindLabel } from "./directoryTeam.data";
import { ListingTeamPersonaAvatar } from "./listBusiness/team/ListingTeamPersonaAvatar";
import type { ListingTeamMemberView } from "./listBusiness/api/listingTeam.types";
import styles from "./DirectoryTeamPortrait.module.css";

const PORTRAIT_AVATAR_SIZE = 76;
/* Phones: matches the shorter band in the `--sm` block of the module CSS. */
const PORTRAIT_AVATAR_SIZE_PHONE = 64;

/** The header washes the cards cycle through, in list order. */
const BAND_TINT_CLASSES = [
  styles.tintCoral,
  styles.tintJade,
  styles.tintViolet,
  styles.tintRose,
];

/** By position, so neighbours never share a wash. */
function bandTintClassFor(position: number): string {
  return BAND_TINT_CLASSES[position % BAND_TINT_CLASSES.length] ?? "";
}

interface DirectoryTeamPortraitCardProps {
  member: ListingTeamMemberView;
  /** Every member of the whole team has this kind, so no card repeats it. */
  isKindShared: boolean;
  /** Position across the whole team, folded members included. */
  position: number;
  avatarSize: number;
}

/** One team member as a small profile card: tinted band, lifted avatar,
 *  name and handle, then the business role and the persona's craft. */
export function DirectoryTeamPortraitCard({
  member,
  isKindShared,
  position,
  avatarSize,
}: DirectoryTeamPortraitCardProps) {
  const { t } = useTranslation();
  const { persona, roleLabel } = member;
  const kindLabel = t(persona.kindLabelKey);
  // Compared against the name the card prints, so a craft-named persona
  // shown under its owner's name still says what the craft is.
  const shouldShowKind =
    !isKindShared && shouldShowKindLabel(persona.nameBesideCraft, kindLabel);

  return (
    <Link to={persona.href} className={styles.card}>
      <span
        className={`${styles.band} ${bandTintClassFor(position)}`}
        aria-hidden="true"
      />
      <span className={styles.arrow} aria-hidden="true">
        <FiArrowRight size={15} />
      </span>
      <span className={styles.avatarRing}>
        <ListingTeamPersonaAvatar persona={persona} size={avatarSize} />
      </span>
      <span className={styles.identity}>
        <span className={styles.name}>{persona.nameBesideCraft}</span>
        <span className={styles.handle}>@{persona.handle}</span>
      </span>
      {(roleLabel || shouldShowKind) && (
        <span className={styles.chips}>
          {roleLabel && <span className={styles.role}>{roleLabel}</span>}
          {shouldShowKind && (
            <span className={styles.kind}>
              {createElement(kindIcon(persona.kind), {
                size: 13,
                "aria-hidden": true,
              })}
              <span className={styles.kindLabel}>{kindLabel}</span>
            </span>
          )}
        </span>
      )}
    </Link>
  );
}

/** The grid of team cards. `positionOffset` lets the folded list carry on
 *  the band sequence from the last visible card. */
export function DirectoryTeamPortraitList({
  members,
  isKindShared,
  positionOffset = 0,
}: {
  members: ListingTeamMemberView[];
  isKindShared: boolean;
  positionOffset?: number;
}) {
  const isPhone = useMediaQuery(mediaMax("sm"));
  const avatarSize = isPhone
    ? PORTRAIT_AVATAR_SIZE_PHONE
    : PORTRAIT_AVATAR_SIZE;

  return (
    <div className={styles.container}>
      <ul className={styles.grid}>
        {members.map((member, index) => (
          <li key={member.persona.id} className={styles.item}>
            <DirectoryTeamPortraitCard
              member={member}
              isKindShared={isKindShared}
              position={positionOffset + index}
              avatarSize={avatarSize}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
