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
  "housing",
  "nightlife_safety",
  "work_and_careers",
  "youth",
  "elders",
  "migrants_and_refugees",
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
  housing: "shared:ambassador.focus.housing",
  nightlife_safety: "shared:ambassador.focus.nightlife_safety",
  work_and_careers: "shared:ambassador.focus.work_and_careers",
  youth: "shared:ambassador.focus.youth",
  elders: "shared:ambassador.focus.elders",
  migrants_and_refugees: "shared:ambassador.focus.migrants_and_refugees",
  sport: "shared:ambassador.focus.sport",
  arts_and_culture: "shared:ambassador.focus.arts_and_culture",
  rights_and_activism: "shared:ambassador.focus.rights_and_activism",
};
