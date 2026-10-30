import type { CropRect } from "../../../../shared/components/ui/cropGeometry";
import type { TFunction } from "../../../../shared/i18n/types";
import type { ListingTeamManagerRowView } from "../api/listingTeam.types";
import type { ManagedListingDTO } from "../api/listings.api";

const KEY = "marketing:listBusiness.team";
const HIDDEN_SUBJECT_AVATAR = { avatarUrl: null, initials: "?" } as const;

/**
 * Who a manager row is about, read the same way for a persona and a member:
 * what to print beside the avatar, what a control names in its label, and the
 * line under the name. A subject whose profile is hidden from the manager
 * reads the hidden copy, so the row can still be cancelled or removed.
 */
export interface ListingTeamRowSubject {
  kind: "persona" | "member";
  /** The persona or member is not visible to the manager right now. */
  isHidden: boolean;
  /** Printed beside the avatar. A craft-named persona shows its owner here. */
  name: string;
  /** Names the row in aria-labels and status lines. */
  labelName: string;
  /** The line under the name: persona kind, "Member" and @slug, or the hint. */
  metaLine: string;
  avatar: {
    avatarUrl: string | null;
    avatarCrop?: CropRect;
    initials: string;
  };
}

export function listingTeamRowSubject(
  row: ListingTeamManagerRowView,
  t: TFunction,
): ListingTeamRowSubject {
  if (row.kind === "member") {
    const member = row.member;
    if (!member) {
      return {
        kind: "member",
        isHidden: true,
        name: t(`${KEY}.hiddenMember.name`),
        labelName: t(`${KEY}.hiddenMember.name`),
        metaLine: t(`${KEY}.hiddenMember.hint`),
        avatar: HIDDEN_SUBJECT_AVATAR,
      };
    }
    return {
      kind: "member",
      isHidden: false,
      name: member.name,
      labelName: member.name,
      metaLine: t(`${KEY}.member.meta`, { slug: member.slug }),
      avatar: member,
    };
  }
  const persona = row.persona;
  if (!persona) {
    return {
      kind: "persona",
      isHidden: true,
      name: t(`${KEY}.hiddenPersona.name`),
      labelName: t(`${KEY}.hiddenPersona.name`),
      metaLine: t(`${KEY}.hiddenPersona.hint`),
      avatar: HIDDEN_SUBJECT_AVATAR,
    };
  }
  return {
    kind: "persona",
    isHidden: false,
    name: persona.nameBesideCraft,
    labelName: persona.titleName,
    metaLine: t(persona.kindLabelKey),
    avatar: persona,
  };
}

/**
 * Whether invites and approvals can land: the listing is live and shown in
 * the directory. Declining, cancelling and removing stay available either way.
 */
export function isListingTeamOpen(listing: ManagedListingDTO): boolean {
  return (
    listing.status === "live" &&
    listing.directoryVisibility?.isHiddenByOwner !== true
  );
}

/** The member ids with one member moved a step; an edge move changes nothing. */
export function moveMemberId(
  memberIds: string[],
  memberId: string,
  direction: "up" | "down",
): string[] {
  const fromIndex = memberIds.indexOf(memberId);
  const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
  if (fromIndex === -1 || toIndex < 0 || toIndex >= memberIds.length) {
    return [...memberIds];
  }
  const moved = [...memberIds];
  const [member] = moved.splice(fromIndex, 1);
  if (member === undefined) return moved;
  moved.splice(toIndex, 0, member);
  return moved;
}
