import type { ReactNode } from "react";

/** How far a detail hero's h1 steps down; "default" keeps today's size. */
export type StudioHeroTitleLength = "default" | "long" | "very-long";

/** Up to this many characters the h1 keeps its full size. */
const LONG_FROM_LENGTH = 29;
/** From this many characters it steps down a second time. */
const VERY_LONG_FROM_LENGTH = 49;

/**
 * The size step for a hero title, from its character count. Only a plain
 * string can be measured; a title with markup (an `<em>`) stays "default".
 */
export function studioHeroTitleLength(title: ReactNode): StudioHeroTitleLength {
  if (typeof title !== "string") return "default";
  const characterCount = title.trim().length;
  if (characterCount >= VERY_LONG_FROM_LENGTH) return "very-long";
  if (characterCount >= LONG_FROM_LENGTH) return "long";
  return "default";
}
