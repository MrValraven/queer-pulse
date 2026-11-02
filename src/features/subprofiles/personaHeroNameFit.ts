// How the persona hero fits its display name. The poster skins size the name
// from the container width alone, so a long name ("Event Producer - Lisbon
// Drawing Club") filled the whole first screen. The hero exposes a length tier
// for persona-skins.css to step the size down by.

export type PersonaNameLengthTier = "short" | "long" | "xlong";

/** Up to this many characters a name keeps the full poster size. */
export const SHORT_NAME_MAX_CHARACTERS = 16;
/** Up to this many characters a name is "long"; past it, "xlong". */
export const LONG_NAME_MAX_CHARACTERS = 28;

/** The length tier of a display name, counted in characters as typed. */
export function personaNameLengthTier(name: string): PersonaNameLengthTier {
  // Spread so an emoji or accented letter built from code points counts once.
  const characterCount = [...name.trim()].length;
  if (characterCount <= SHORT_NAME_MAX_CHARACTERS) return "short";
  if (characterCount <= LONG_NAME_MAX_CHARACTERS) return "long";
  return "xlong";
}

// A spaced separator: hyphen, en dash, em dash, pipe or middle dot.
const SPACED_SEPARATOR = /\s+([-–—|·])(?=\s)/g;

/** Glues a spaced separator to the word before it with a no-break space, so a
 *  wrapped name ends a line on "PRODUCER -" and never starts one with a lone
 *  dash. */
export function bindSeparatorsToPrecedingWord(name: string): string {
  return name.replace(SPACED_SEPARATOR, " $1");
}
