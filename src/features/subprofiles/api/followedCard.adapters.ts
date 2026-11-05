import type { FollowedPersonaDTO, SubprofileCardDTO } from "./subprofiles.api";
import {
  toPortraitCardView,
  type PortraitCardView,
} from "./directoryCard.adapters";
import { personaOwnerAddress } from "../personaLinks.data";

/**
 * One card on the "You follow" tab: the same portrait card the "Everyone" tab
 * draws, plus the instant the member started following, for the card's
 * "Following since" note.
 */
export interface FollowedPortraitCardView {
  card: PortraitCardView;
  /** ISO instant this member started following. */
  followedAt: string;
}

/**
 * The followed row as a directory card, so both tabs go through ONE adapter
 * (`toPortraitCardView`): the same title naming, image pick, availability
 * pill and credits. Every field an older server leaves out falls back to the
 * card's own default: no picture crop, no pill, no tags and no credits row.
 * `viewerFollowing` reads true when absent, because every row on this list is
 * a follow. `handle` is the empty string when the row has none, which every
 * builder in `personaLinks.data.ts` reads as "no handle".
 */
export function followedPersonaToCardDto(
  dto: FollowedPersonaDTO,
): SubprofileCardDTO {
  return {
    ...(dto.table ? { table: dto.table } : {}),
    id: dto.id,
    handle: dto.handle ?? "",
    linkVisibility: dto.linkVisibility,
    // The server already sends these two linked-only. Gated again here, on
    // the same rule the directory card follows, so an unlinked persona can
    // never name its owner through this list.
    ownerSlug: dto.linkVisibility === "linked" ? dto.ownerSlug : null,
    ownerName: dto.linkVisibility === "linked" ? dto.ownerName : null,
    slug: dto.slug,
    kind: dto.kind,
    displayName: dto.displayName,
    avatarUrl: dto.avatarUrl,
    crop: dto.crop ?? null,
    coverUrl: dto.coverUrl ?? null,
    coverCrop: dto.coverCrop ?? null,
    tagline: dto.tagline,
    accent: dto.accent,
    availability: dto.availability ?? null,
    availabilityUpdatedAt: dto.availabilityUpdatedAt ?? null,
    socialCount: 0,
    tags: dto.tags ?? [],
    followerCount: dto.followerCount,
    viewerFollowing: dto.viewerFollowing ?? true,
    viewerIsMember: dto.viewerIsMember ?? false,
    ...(dto.credits ? { credits: dto.credits } : {}),
  };
}

/**
 * A followed persona as the "You follow" tab's portrait card, or `null` when
 * the persona has no public address.
 *
 * THE LINK IS NEVER FABRICATED. The address comes from `personaOwnerAddress`,
 * the builder the earlier row list always used: a handle wins, a LINKED
 * persona without one falls back to its creator's nested path, and anything
 * else has no address. `personaCardPath`, which the directory card uses,
 * agrees on the first two cases but turns the third into a dead `/p/` link,
 * because a directory card is assumed to always carry a handle. The portrait
 * card always draws its View link, so a row with no address is left out of
 * the grid here (the server's publish rule requires a handle on every
 * unlinked persona, so a live row should never land in that case).
 */
export function toFollowedPortraitCardView(
  dto: FollowedPersonaDTO,
): FollowedPortraitCardView | null {
  const address = personaOwnerAddress(dto, dto.ownerSlug ?? undefined);
  if (address.status !== "ready") return null;
  return {
    card: {
      ...toPortraitCardView(followedPersonaToCardDto(dto)),
      href: address.path,
    },
    followedAt: dto.followedAt,
  };
}
