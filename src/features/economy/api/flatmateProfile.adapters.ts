import { initialsOf, tintForSlug } from "../../../shared/api/refs";
import type { Profile } from "../flatmates.data";
import type { FlatmateProfileDTO } from "./flatmateProfile.api";

/** Builds the FE Profile view-model from a live DTO. Identity comes entirely
 * from `dto.member` (the backend member ref) — never the demo MEMBERS registry
 * (see [[queerpulse-demo-persona-leak]]). `id` uses the row index (only used as
 * a client-side key for the "sent" set). */
export function flatmateDtoToProfile(
  dto: FlatmateProfileDTO,
  index: number,
): Profile {
  const memberSlug = dto.member?.slug ?? dto.slug;
  const name = dto.member
    ? `${dto.member.firstName} ${dto.member.lastName}`.trim()
    : "A member";
  return {
    id: index,
    slug: memberSlug, // the /members/:slug link target
    profileSlug: dto.slug, // hello / save / report target
    name,
    pronouns: dto.pronouns,
    type: dto.type,
    neighbourhood: dto.neighbourhood,
    neighbourhoodLabel: dto.neighbourhood,
    budget: dto.budgetEuros ? `€${dto.budgetEuros.toLocaleString()}` : "",
    budgetRange: dto.budgetEuros,
    movein: moveInLabel(dto),
    moveinKey: dto.flexibleTiming ? "flex" : (dto.moveInFrom ?? ""),
    note: dto.about,
    tags: dto.lifestyleTags,
    // Special-category fields are already gated server-side — an empty value
    // here just means the viewer isn't permitted to see it.
    genderIdentity: dto.genderIdentity ?? undefined,
    safeSpaceNeeds:
      dto.safeSpaceNeeds.length > 0 ? dto.safeSpaceNeeds : undefined,
    householdNorms: dto.householdNorms ?? undefined,
    identityHousehold: dto.identityHousehold ?? undefined,
    identityVisibility: dto.identityVisibility,
    // Already GDPR-redacted server-side (generic safe-space label for viewers
    // the owner hasn't permitted) — safe to render as-is.
    matchReasons: dto.matchReasons.length > 0 ? dto.matchReasons : undefined,
    initials: dto.member
      ? initialsOf(dto.member.firstName, dto.member.lastName)
      : "",
    tint: tintForSlug(memberSlug),
    photo: dto.member?.avatarUrl ?? undefined,
    verificationLevel: dto.verificationLevel,
    since: "",
    matchScore: dto.matchScore,
  };
}

function moveInLabel(dto: FlatmateProfileDTO): string {
  if (dto.flexibleTiming) return "Flexible";
  return dto.moveInFrom ?? "Flexible";
}
