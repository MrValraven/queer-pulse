import { useState } from "react";
import type {
  FlatmateHouseholdNorms,
  FlatmateIdentityHousehold,
  FlatmateProfileDTO,
  IdentityVisibility,
  UpsertFlatmateProfileBody,
} from "./api/flatmateProfile.api";
import type { ListingType } from "./flatmates.data";

/** The move-in `<select>` only offers a handful of discrete choices, so each
 * option maps to a fixed date rather than accepting free-form input. */
const MOVE_IN_MONTH_OPTIONS: Record<string, string> = {
  jul2026: "2026-07-01",
  aug2026: "2026-08-01",
  sep2026: "2026-09-01",
};

/** Reverse-maps a DTO's `moveInFrom`/`flexibleTiming` back to a `<select>`
 * option value for edit-mode prefill. Any concrete date that isn't one of the
 * fixed months falls back to "available now" — pragmatic, not lossless. */
function moveInOptionFromProfile(
  profile: FlatmateProfileDTO | null | undefined,
): string {
  if (!profile) return "";
  if (profile.flexibleTiming) return "flex";
  if (!profile.moveInFrom) return "";
  const matchedOption = Object.entries(MOVE_IN_MONTH_OPTIONS).find(
    ([, date]) => date === profile.moveInFrom,
  );
  return matchedOption ? matchedOption[0] : "now";
}

function applyMoveInSelection(
  body: UpsertFlatmateProfileBody,
  moveInOption: string,
): void {
  if (moveInOption === "flex") {
    body.flexibleTiming = true;
  } else if (moveInOption === "now") {
    body.moveInFrom = new Date().toISOString().slice(0, 10);
  } else if (MOVE_IN_MONTH_OPTIONS[moveInOption]) {
    body.moveInFrom = MOVE_IN_MONTH_OPTIONS[moveInOption];
  }
}

/** Owns every controlled field of the post-your-profile form, plus deriving
 * and validating the `UpsertFlatmateProfileBody` on submit. `initial` (the
 * caller's existing profile) seeds edit mode; omit/null for a fresh create
 * form. */
export function usePostProfileFormState(
  initial: FlatmateProfileDTO | null | undefined,
) {
  const [listingType, setListingType] = useState<ListingType>(
    initial?.type ?? "seeking",
  );
  const [pronouns, setPronouns] = useState(initial?.pronouns ?? "");
  const [neighbourhood, setNeighbourhood] = useState(
    initial?.neighbourhood ?? "",
  );
  const [budget, setBudget] = useState(
    initial?.budgetEuros ? String(initial.budgetEuros) : "",
  );
  const [moveInOption, setMoveInOption] = useState(
    moveInOptionFromProfile(initial),
  );
  const [about, setAbout] = useState(initial?.about ?? "");
  const [selectedLifestyleTags, setSelectedLifestyleTags] = useState<
    Set<string>
  >(new Set(initial?.lifestyleTags ?? []));

  // ── Household norms (ordinary shared-living preferences) ─────────────────
  const [householdNorms, setHouseholdNorms] = useState<FlatmateHouseholdNorms>(
    initial?.householdNorms ?? {},
  );

  // ── GDPR Art.9 special-category identity (opt-in, consent-gated) ─────────
  const [specialCategoryConsent, setSpecialCategoryConsent] = useState(
    initial?.specialCategoryConsent ?? false,
  );
  const [genderIdentity, setGenderIdentity] = useState(
    initial?.genderIdentity ?? "",
  );
  const [safeSpaceNeeds, setSafeSpaceNeeds] = useState<Set<string>>(
    new Set(initial?.safeSpaceNeeds ?? []),
  );
  // Trans-affirming household prompts — same Art.9 consent gate as above.
  const [identityHousehold, setIdentityHousehold] =
    useState<FlatmateIdentityHousehold>(initial?.identityHousehold ?? {});
  const [identityVisibility, setIdentityVisibility] =
    useState<IdentityVisibility>(initial?.identityVisibility ?? "matches");

  const budgetEuros = Number(budget);
  const canSubmit =
    budget.trim() !== "" && Number.isFinite(budgetEuros) && budgetEuros > 0;

  const toggleLifestyleTag = (tag: string) =>
    setSelectedLifestyleTags((previousTags) => {
      const nextTags = new Set(previousTags);
      if (nextTags.has(tag)) nextTags.delete(tag);
      else nextTags.add(tag);
      return nextTags;
    });

  const toggleSafeSpaceNeed = (need: string) =>
    setSafeSpaceNeeds((previousNeeds) => {
      const nextNeeds = new Set(previousNeeds);
      if (nextNeeds.has(need)) nextNeeds.delete(need);
      else nextNeeds.add(need);
      return nextNeeds;
    });

  const setHouseholdNorm = (
    key: keyof FlatmateHouseholdNorms,
    value: string,
  ) =>
    setHouseholdNorms((previous) => ({
      ...previous,
      [key]: value || undefined,
    }));

  const setIdentityHouseholdField = (
    key: keyof FlatmateIdentityHousehold,
    value: string,
  ) =>
    setIdentityHousehold((previous) => ({
      ...previous,
      [key]: value || undefined,
    }));

  /** Withdrawing consent clears the special-category fields it protected —
   * including the trans-affirming household prompts. */
  const updateSpecialCategoryConsent = (granted: boolean) => {
    setSpecialCategoryConsent(granted);
    if (!granted) {
      setPronouns("");
      setGenderIdentity("");
      setSafeSpaceNeeds(new Set());
      setIdentityHousehold({});
    }
  };

  /** Only the norm keys the member actually chose, so we never store empties. */
  const cleanHouseholdNorms = (): FlatmateHouseholdNorms | undefined => {
    const entries = Object.entries(householdNorms).filter(
      ([, value]) => value,
    );
    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  };

  const cleanIdentityHousehold = (): FlatmateIdentityHousehold | undefined => {
    const entries = Object.entries(identityHousehold).filter(
      ([, value]) => value,
    );
    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  };

  /** Builds the upsert body, or null when the form isn't valid yet. The
   * special-category fields are only attached when consent is given —
   * otherwise `specialCategoryConsent: false` tells the backend to clear
   * anything it holds. */
  const buildBody = (): UpsertFlatmateProfileBody | null => {
    if (!canSubmit) return null;
    const body: UpsertFlatmateProfileBody = {
      type: listingType,
      budgetEuros,
      neighbourhood,
      about,
      lifestyleTags: Array.from(selectedLifestyleTags),
      householdNorms: cleanHouseholdNorms(),
      identityVisibility,
      specialCategoryConsent,
    };
    if (specialCategoryConsent) {
      body.pronouns = pronouns;
      body.genderIdentity = genderIdentity;
      body.safeSpaceNeeds = Array.from(safeSpaceNeeds);
      body.identityHousehold = cleanIdentityHousehold();
    }
    applyMoveInSelection(body, moveInOption);
    return body;
  };

  return {
    listingType,
    setListingType,
    pronouns,
    setPronouns,
    neighbourhood,
    setNeighbourhood,
    budget,
    setBudget,
    moveInOption,
    setMoveInOption,
    about,
    setAbout,
    selectedLifestyleTags,
    toggleLifestyleTag,
    householdNorms,
    setHouseholdNorm,
    specialCategoryConsent,
    setSpecialCategoryConsent: updateSpecialCategoryConsent,
    genderIdentity,
    setGenderIdentity,
    safeSpaceNeeds,
    toggleSafeSpaceNeed,
    identityHousehold,
    setIdentityHouseholdField,
    identityVisibility,
    setIdentityVisibility,
    canSubmit,
    buildBody,
  };
}
