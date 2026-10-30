import { createElement, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiUser } from "react-icons/fi";
import { useAuth } from "../../app/providers/authContext";
import { routes } from "../../app/routeMap";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { mediaMax } from "../../shared/theme/breakpoints";
import { kindIcon } from "../subprofiles/subprofile-kinds";
import { shouldShowKindLabel, teamEntryKey } from "./directoryTeam.data";
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

interface DirectoryTeamCardFrameProps {
  href: string;
  /** Position across the whole team, folded entries included. */
  position: number;
  avatar: ReactNode;
  name: string;
  handle: string;
  /** The chip row content; the row is left out when this is null. */
  chips: ReactNode;
}

/** The card both kinds share: tinted band, lifted avatar, name and handle,
 *  then the chips. The whole card is one link. */
function DirectoryTeamCardFrame({
  href,
  position,
  avatar,
  name,
  handle,
  chips,
}: DirectoryTeamCardFrameProps) {
  return (
    <Link to={href} className={styles.card}>
      <span
        className={`${styles.band} ${bandTintClassFor(position)}`}
        aria-hidden="true"
      />
      <span className={styles.arrow} aria-hidden="true">
        <FiArrowRight size={15} />
      </span>
      <span className={styles.avatarRing}>{avatar}</span>
      <span className={styles.identity}>
        <span className={styles.name}>{name}</span>
        <span className={styles.handle}>@{handle}</span>
      </span>
      {chips !== null && <span className={styles.chips}>{chips}</span>}
    </Link>
  );
}

interface DirectoryTeamPortraitCardProps {
  member: ListingTeamMemberView;
  /** Every entry of the whole team is a persona of one kind, so no card
   *  repeats it. Never true while a member is on the team. */
  isKindShared: boolean;
  /** Position across the whole team, folded entries included. */
  position: number;
  avatarSize: number;
}

/** One team entry as a small profile card: tinted band, lifted avatar, name
 *  and handle, then the business role and the persona's craft or the
 *  "Member" chip. */
export function DirectoryTeamPortraitCard({
  member: entry,
  isKindShared,
  position,
  avatarSize,
}: DirectoryTeamPortraitCardProps) {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const { roleLabel } = entry;

  if (entry.kind === "member") {
    const { member } = entry;
    // `/members/:slug` is members only; a signed-out visitor gets the
    // addressable public profile, the only one the server lists for them.
    const memberHref = loggedIn
      ? member.href
      : `${routes.publicProfile}/${member.slug}`;
    return (
      <DirectoryTeamCardFrame
        href={memberHref}
        position={position}
        avatar={<ListingTeamPersonaAvatar persona={member} size={avatarSize} />}
        name={member.name}
        handle={member.slug}
        chips={
          <>
            {roleLabel && (
              <span className={styles.role} title={roleLabel}>
                {roleLabel}
              </span>
            )}
            <span className={styles.kind}>
              <FiUser size={13} aria-hidden="true" />
              <span className={styles.kindLabel}>
                {t("marketing:directory.detail.team.memberChip")}
              </span>
            </span>
          </>
        }
      />
    );
  }

  const { persona } = entry;
  const kindLabel = t(persona.kindLabelKey);
  // Compared against the name the card prints, so a craft-named persona
  // shown under its owner's name still says what the craft is.
  const shouldShowKind =
    !isKindShared && shouldShowKindLabel(persona.nameBesideCraft, kindLabel);

  return (
    <DirectoryTeamCardFrame
      href={persona.href}
      position={position}
      avatar={<ListingTeamPersonaAvatar persona={persona} size={avatarSize} />}
      name={persona.nameBesideCraft}
      handle={persona.handle}
      chips={
        roleLabel || shouldShowKind ? (
          <>
            {roleLabel && (
              <span className={styles.role} title={roleLabel}>
                {roleLabel}
              </span>
            )}
            {shouldShowKind && (
              <span className={styles.kind}>
                {createElement(kindIcon(persona.kind), {
                  size: 13,
                  "aria-hidden": true,
                })}
                <span className={styles.kindLabel}>{kindLabel}</span>
              </span>
            )}
          </>
        ) : null
      }
    />
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
          <li key={teamEntryKey(member)} className={styles.item}>
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
