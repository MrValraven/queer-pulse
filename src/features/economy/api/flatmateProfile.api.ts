import {
  apiDelete,
  apiGet,
  apiGetNullable,
  apiPost,
  apiPut,
} from "../../../shared/api/client";
import { toItemsPage, type ItemsPage } from "../../../shared/api/pagination";
import type { MemberRefDTO } from "../../../shared/api/refs";
import type { VerificationLevel } from "./verification.api";

export type IdentityVisibility = "public" | "members" | "matches" | "hidden";

/** Optional shared-living preferences + co-living questionnaire (ordinary, not
 * special-category). `noise` and `sharing` are the questionnaire additions;
 * `outAtHome` moved into the consent-gated `FlatmateIdentityHousehold`. */
export interface FlatmateHouseholdNorms {
  smoking?: string;
  pets?: string;
  guests?: string;
  cleanliness?: string;
  sleepSchedule?: string;
  noise?: string;
  sharing?: string;
}

/** Consent-gated (GDPR Art.9) trans-affirming household prompts. The backend
 * only populates these for a viewer the owner has permitted. */
export interface FlatmateIdentityHousehold {
  outAtHome?: string;
  bathroomComfort?: string;
  mailNamePrivacy?: string;
  medicationPrivacy?: string;
}

/** The compatibility factors behind a match score. Stable keys the UI maps to a
 * translated "why you matched" label. */
export type MatchFactor =
  | "budget"
  | "neighbourhood"
  | "lifestyle"
  | "timing"
  | "safeSpace"
  | "household";

/** One explainable reason a match scored. `label` is a GDPR-redacted English
 * fallback; the UI prefers the translated factor label. */
export interface MatchReason {
  factor: MatchFactor;
  label: string;
  weight: number;
  contribution: number;
}

export interface FlatmateProfileDTO {
  slug: string;
  type: "seeking" | "offering";
  member: MemberRefDTO | null;
  /** The owner's real identity-verification level (honest badge). */
  verificationLevel: VerificationLevel;
  pronouns: string;
  neighbourhood: string;
  budgetEuros: number;
  moveInFrom: string | null;
  flexibleTiming: boolean;
  about: string;
  lifestyleTags: string[];
  /** Special-category (GDPR Art.9). The backend only populates these for a
   * viewer the owner has permitted — otherwise they arrive empty. */
  genderIdentity: string | null;
  safeSpaceNeeds: string[];
  householdNorms: FlatmateHouseholdNorms | null;
  /** Consent-gated trans-affirming prompts — null unless the viewer is permitted. */
  identityHousehold: FlatmateIdentityHousehold | null;
  identityVisibility: IdentityVisibility;
  /** Owner-only signal: whether Art.9 consent is on record. */
  specialCategoryConsent: boolean;
  createdAt: string;
  matchScore: number | null;
  /** Explainable "why you matched" factors; already GDPR-redacted server-side. */
  matchReasons: MatchReason[];
}

export interface FlatmateFilters {
  type?: string;
  neighbourhood?: string;
  budgetMax?: number;
  /** One budget band id (`FlatmateBudgetBand` in `flatmatesFacets`). */
  budgetBand?: string;
  moveInBy?: string;
  /** One move-in window: `now`, `flex` or a month key such as `jul`. */
  moveIn?: string;
  tags?: string[];
  /** How several `tags` combine. The server defaults to `any`; the board
   *  sends `all`, the reading its lifestyle chips have always had. */
  tagMatch?: "any" | "all";
  page?: number;
}

/**
 * The directory's availability counts, sent on page 1 only. Each group is
 * counted with its own filter lifted and the rest applied, and each `all*`
 * field is that group's distinct "Any" total. `neighbourhood` is keyed by the
 * lowercased name and `tags` by the exact tag; both leave zeros out, so an
 * absent key means nobody. Undefined on a server that predates the facets.
 */
export interface FlatmateFacets {
  type: Record<FlatmateProfileDTO["type"], number>;
  allTypes: number;
  neighbourhood: Record<string, number>;
  allNeighbourhoods: number;
  budget: Record<string, number>;
  allBudgets: number;
  moveIn: Record<string, number>;
  allMoveIns: number;
  tags: Record<string, number>;
}

/** One `GET /flatmate-directory` page, with page 1's facets when sent. */
export type FlatmateProfilesPage = ItemsPage<FlatmateProfileDTO> & {
  facets?: FlatmateFacets;
};

export interface UpsertFlatmateProfileBody {
  type: FlatmateProfileDTO["type"];
  budgetEuros: number;
  pronouns?: string;
  neighbourhood?: string;
  moveInFrom?: string;
  flexibleTiming?: boolean;
  about?: string;
  lifestyleTags?: string[];
  /** Explicit Art.9 consent. When false/omitted the backend clears every
   * special-category field (pronouns, gender, safe-space needs). */
  specialCategoryConsent?: boolean;
  genderIdentity?: string;
  safeSpaceNeeds?: string[];
  householdNorms?: FlatmateHouseholdNorms;
  /** Consent-gated trans-affirming prompts; only stored when consent is given. */
  identityHousehold?: FlatmateIdentityHousehold;
  identityVisibility?: IdentityVisibility;
}

export async function getFlatmateProfiles(
  filters: FlatmateFilters = {},
): Promise<FlatmateProfilesPage> {
  const query = new URLSearchParams();
  if (filters.type && filters.type !== "all") query.set("type", filters.type);
  if (filters.neighbourhood) query.set("neighbourhood", filters.neighbourhood);
  if (filters.budgetMax) query.set("budgetMax", String(filters.budgetMax));
  if (filters.budgetBand) query.set("budgetBand", filters.budgetBand);
  if (filters.moveInBy) query.set("moveInBy", filters.moveInBy);
  if (filters.moveIn) query.set("moveIn", filters.moveIn);
  for (const tag of filters.tags ?? []) query.append("tags", tag);
  if (filters.tagMatch) query.set("tagMatch", filters.tagMatch);
  if (filters.page) query.set("page", String(filters.page));
  const qs = query.toString();
  const res = await apiGet<FlatmateProfileDTO[] | FlatmateProfilesPage>(
    `/flatmate-directory${qs ? `?${qs}` : ""}`,
  );
  // `toItemsPage` knows the four page fields only, so the facets are carried
  // across by hand.
  return {
    ...toItemsPage(res),
    facets: Array.isArray(res) ? undefined : res?.facets,
  };
}

export const getMyFlatmateProfile = () =>
  apiGetNullable<FlatmateProfileDTO>("/flatmate-profiles/mine");

export const upsertFlatmateProfile = (body: UpsertFlatmateProfileBody) =>
  apiPut<FlatmateProfileDTO>("/flatmate-profiles/mine", body);

/**
 * DELETE /flatmate-profiles/mine — the member takes their own profile down.
 * 204 with no body, and idempotent: deleting when there is nothing to delete
 * still succeeds, so a double-confirm can never surface a spurious failure.
 *
 * What the row takes with it (verified against `FlatmateProfilesService.
 * deleteMine` and the FK added by `AddMissingUserForeignKeysForErasure`): the
 * profile itself with every special-category field on it, and every like/pass
 * pointing at it (`flatmate_likes.to_profile_id` is `ON DELETE CASCADE`), which
 * ends any mutual match. Conversations already opened by a "say hello" are
 * ordinary DMs and are NOT touched. The take-down copy has to say both.
 */
export const deleteMyFlatmateProfile = () =>
  apiDelete<void>("/flatmate-profiles/mine");

/** Outcome of a say-hello. `pronounsShared` reflects whether the opt-in pronoun
 * pre-share actually took effect (only when the sender has consent-stored
 * pronouns), so the UI never has to assume. */
export interface SayHelloResult {
  conversationId: string;
  pronounsShared: boolean;
}

export const sayHello = (
  slug: string,
  body: { body?: string; sharePronouns?: boolean },
) => apiPost<SayHelloResult>(`/flatmate-profiles/${slug}/hello`, body);

/** A like/pass decision in the discovery deck. */
export type FlatmateDecision = "like" | "pass";

/** Result of a discovery decision. `matched` is true only on a mutual like. */
export interface FlatmateDecideResult {
  decision: FlatmateDecision;
  matched: boolean;
}

export const decideFlatmate = (slug: string, decision: FlatmateDecision) =>
  apiPost<FlatmateDecideResult>(`/flatmate-directory/${slug}/decide`, {
    decision,
  });
