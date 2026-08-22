import { initialsOf, tintForSlug } from "../../../shared/api/refs";
import type { Profile } from "../flatmates.data";
import type { FlatmateProfileDTO } from "./flatmateProfile.api";
import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";

/** Builds the FE Profile view-model from a live DTO. Identity comes entirely
 * from `dto.member` (the backend member ref) — never the demo MEMBERS registry
 * (see [[queerpulse-demo-persona-leak]]). `id` uses the row index (only used as
 * a client-side key for the "sent" set).
 *
 * i18n: the name fallback and the move-in line are chrome, so they resolve
 * through `t`; the budget goes through `fmt.currency` (pt-PT suffixes the
 * symbol with a space, "1 200 €", so a `€` prefix is wrong there). */
export function flatmateDtoToProfile(
  dto: FlatmateProfileDTO,
  index: number,
  t: TFunction,
  fmt: Formatters,
): Profile {
  const memberSlug = dto.member?.slug ?? dto.slug;
  const name = dto.member
    ? `${dto.member.firstName} ${dto.member.lastName}`.trim()
    : t("economy:member.fallbackName");
  return {
    id: index,
    slug: memberSlug, // the /members/:slug link target
    profileSlug: dto.slug, // hello / save / report target
    name,
    pronouns: dto.pronouns,
    type: dto.type,
    neighbourhood: dto.neighbourhood,
    neighbourhoodLabel: dto.neighbourhood,
    budget: dto.budgetEuros
      ? fmt.currency(dto.budgetEuros, "EUR", { maximumFractionDigits: 0 })
      : "",
    budgetRange: dto.budgetEuros,
    movein: moveInLabel(dto, t),
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

function moveInLabel(dto: FlatmateProfileDTO, t: TFunction): string {
  if (dto.flexibleTiming) return t("economy:flatmates.filter.moveIn.flex");
  return dto.moveInFrom ?? t("economy:flatmates.filter.moveIn.flex");
}
