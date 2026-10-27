/** What an artist can show at the top of their Studio page: the wide cover
 *  as a banner, the round avatar on its own, or the banner with the avatar
 *  on it. Stored in the persona's `skinData.studioHero`. */
export type StudioHeroChoice = "banner" | "portrait" | "both";

export const STUDIO_HERO_CHOICES: readonly StudioHeroChoice[] = [
  "banner",
  "portrait",
  "both",
];

/** The choice a persona with a cover gets when it never picked one. */
export const DEFAULT_STUDIO_HERO: StudioHeroChoice = "both";

/** Reads a stored `skinData.studioHero`. The first two layouts were stored as
 *  "full-bleed" (the banner alone) and "avatar" (the avatar over a dimmed
 *  photo, now drawn as both); anything else reads as never chosen. */
export function toStudioHeroChoice(stored: unknown): StudioHeroChoice | null {
  if (stored === "full-bleed") return "banner";
  if (stored === "avatar") return "both";
  return (STUDIO_HERO_CHOICES as readonly unknown[]).includes(stored)
    ? (stored as StudioHeroChoice)
    : null;
}

/** The layout the page draws: without a cover there is no banner to show,
 *  so the avatar stands alone whatever was stored. */
export function resolveStudioHero(
  coverUrl: string | null,
  stored: unknown,
): StudioHeroChoice {
  if (!coverUrl) return "portrait";
  return toStudioHeroChoice(stored) ?? DEFAULT_STUDIO_HERO;
}
