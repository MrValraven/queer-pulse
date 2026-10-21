import type { EventHostDTO } from "./events.api";
import type {
  InviteRequestDTO,
  InviterInviteStatus,
  RsvpInviteDTO,
} from "./memberInvites.api";

/** One invite the caller sent from their RSVP, as the RSVP panel lists it. */
export interface RsvpInviteView {
  id: string;
  slug: string;
  name: string;
  avatarUrl?: string;
  status: InviterInviteStatus;
  canWithdraw: boolean;
}

/** One request in the organiser's approval queue. */
export interface InviteRequestView {
  id: string;
  inviterName: string;
  inviteeName: string;
  inviteeAvatarUrl?: string;
}

/** A member's full name, or an empty string when the server sent no member
 *  (an account that has since gone). */
function memberName(member: EventHostDTO | null): string {
  if (!member) return "";
  return `${member.firstName} ${member.lastName}`.trim();
}

export function toRsvpInviteView(dto: RsvpInviteDTO): RsvpInviteView {
  return {
    id: dto.id,
    slug: dto.invitee?.slug ?? "",
    name: memberName(dto.invitee),
    // `null` when their photo visibility hides it from this viewer.
    ...(dto.invitee?.avatarUrl ? { avatarUrl: dto.invitee.avatarUrl } : {}),
    status: dto.status,
    canWithdraw: dto.canWithdraw,
  };
}

export function toInviteRequestView(dto: InviteRequestDTO): InviteRequestView {
  return {
    id: dto.id,
    inviterName: memberName(dto.inviter),
    inviteeName: memberName(dto.invitee),
    ...(dto.invitee?.avatarUrl
      ? { inviteeAvatarUrl: dto.invitee.avatarUrl }
      : {}),
  };
}
