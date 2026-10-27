/**
 * The curated list staff pick an ambassador's focus from.
 *
 * Mirrors the backend's `ambassadors/ambassador-focus-areas.ts` exactly, in the
 * same order: that order is the order the admin picker and the directory's
 * focus chips list them in. A key the backend adds before this build does is
 * dropped at the API boundary (`ambassadors.api.ts`), so a raw key never paints
 * beside someone's name.
 */
export const AMBASSADOR_FOCUS_AREAS = [
  "trans_health",
  "sexual_health",
  "mental_health",
  "disability_and_access",
  "neurodivergence",
  "harm_reduction",
  "violence_support",
  "bi_and_pan",
  "asexual_and_aromantic",
  "intersex",
  "people_of_colour",
  "housing",
  "legal_support",
  "work_and_careers",
  "queer_business",
  "parents_and_families",
  "education",
  "youth",
  "elders",
  "migrants_and_refugees",
  "faith_and_spirituality",
  "newcomers",
  "events_and_hosting",
  "nightlife_safety",
  "online_safety",
  "sport",
  "arts_and_culture",
  "rights_and_activism",
] as const;

export type AmbassadorFocusArea = (typeof AMBASSADOR_FOCUS_AREAS)[number];

/** Whether a raw value off the wire is a focus area this build has a label for. */
export function isAmbassadorFocusArea(
  value: unknown,
): value is AmbassadorFocusArea {
  return (
    typeof value === "string" &&
    (AMBASSADOR_FOCUS_AREAS as readonly string[]).includes(value)
  );
}

/**
 * The visible label for each focus area. Shared by the tag's meta line, the
 * admin ambassadors page, the directory's focus filter and the notifications
 * formatter, so every surface names a focus area the same way.
 *
 * In the eagerly loaded `shared` namespace for the reason the staff grant
 * labels are: the tag renders beside names on routes that never load the
 * `members` chunk, where a lazy key would paint as a raw code on a cold load.
 */
export const AMBASSADOR_FOCUS_LABEL_KEY: Record<AmbassadorFocusArea, string> = {
  trans_health: "shared:ambassador.focus.trans_health",
  sexual_health: "shared:ambassador.focus.sexual_health",
  mental_health: "shared:ambassador.focus.mental_health",
  disability_and_access: "shared:ambassador.focus.disability_and_access",
  neurodivergence: "shared:ambassador.focus.neurodivergence",
  harm_reduction: "shared:ambassador.focus.harm_reduction",
  violence_support: "shared:ambassador.focus.violence_support",
  bi_and_pan: "shared:ambassador.focus.bi_and_pan",
  asexual_and_aromantic: "shared:ambassador.focus.asexual_and_aromantic",
  intersex: "shared:ambassador.focus.intersex",
  people_of_colour: "shared:ambassador.focus.people_of_colour",
  housing: "shared:ambassador.focus.housing",
  legal_support: "shared:ambassador.focus.legal_support",
  work_and_careers: "shared:ambassador.focus.work_and_careers",
  queer_business: "shared:ambassador.focus.queer_business",
  parents_and_families: "shared:ambassador.focus.parents_and_families",
  education: "shared:ambassador.focus.education",
  youth: "shared:ambassador.focus.youth",
  elders: "shared:ambassador.focus.elders",
  migrants_and_refugees: "shared:ambassador.focus.migrants_and_refugees",
  faith_and_spirituality: "shared:ambassador.focus.faith_and_spirituality",
  newcomers: "shared:ambassador.focus.newcomers",
  events_and_hosting: "shared:ambassador.focus.events_and_hosting",
  nightlife_safety: "shared:ambassador.focus.nightlife_safety",
  online_safety: "shared:ambassador.focus.online_safety",
  sport: "shared:ambassador.focus.sport",
  arts_and_culture: "shared:ambassador.focus.arts_and_culture",
  rights_and_activism: "shared:ambassador.focus.rights_and_activism",
};
