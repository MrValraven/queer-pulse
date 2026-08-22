import type { CardProgramDTO, IssuerCardDTO, MyCardDTO } from "./api/cards.api";

/**
 * One holder's card, reshaped into the same object `MembershipCardFace` draws
 * for its owner, so an issuer looking at a member's card sees exactly the card
 * that member is holding rather than a mod-flavoured summary of it.
 *
 * Everything specific to the card comes off the `IssuerCardDTO` (serial, dates,
 * effective status, role, and the photo the card actually prints); everything
 * shared across the programme comes off the `CardProgramDTO` the panel already
 * has loaded. Nothing is invented here.
 *
 * `cardPhotoUrl` maps straight onto `holderAvatarUrl` on purpose: the backend
 * has already applied the programme's photo switch AND the holder's own veto
 * to it, so it is the card's face by the time it arrives. The roster row's
 * `avatarUrl` (the holder's plain profile picture) must never be substituted
 * for it, or a member who turned their photo off would find it printed on
 * their card in their community's mod tools.
 *
 * Lives in a `.data.ts` rather than in the modal because it is data-shaping,
 * and because fast-refresh's lint rule wants component files to export only
 * components.
 */
export function holderCardFace(
  holder: IssuerCardDTO,
  program: CardProgramDTO,
  community: { name: string; slug: string },
): MyCardDTO {
  return {
    id: holder.id,
    serial: holder.serial,
    status: holder.status,
    issuedAt: holder.issuedAt,
    expiresAt: holder.expiresAt,
    communityName: community.name,
    communitySlug: community.slug,
    role: holder.role,
    holderName: holder.holderName,
    holderAvatarUrl: holder.cardPhotoUrl,
    // The holder's own control over their photo, and theirs alone: read only
    // by `CardPhotoConsent` on their own wallet page, never by either face.
    // An issuer is not told which of the two switches emptied the photo slot.
    isPhotoHidden: false,
    // The issuer sees the member's real code. It is the card's own permanent
    // value, so there is nothing holder-specific to withhold.
    token: holder.token,
    program,
  };
}
