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
    initials: dto.member
      ? initialsOf(dto.member.firstName, dto.member.lastName)
      : "",
    tint: tintForSlug(memberSlug),
    photo: dto.member?.avatarUrl ?? undefined,
    verified: false, // not carried by the DTO (FE-only richness gap)
    since: "",
    matchScore: dto.matchScore,
  };
}

function moveInLabel(dto: FlatmateProfileDTO): string {
  if (dto.flexibleTiming) return "Flexible";
  return dto.moveInFrom ?? "Flexible";
}
