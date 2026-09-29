/**
 * TEMPORARY. Removed once the user picks one look for the Ambassador tag:
 * delete this file, keep the chosen tone class in `AmbassadorTag.module.css`
 * as the only one, and drop the variant lookup in `AmbassadorTag.tsx`.
 *
 * Append `?ambassadorTag=gold|outline|pride` to any URL to compare the three
 * looks live. Anything else (or nothing) shows the default.
 */
export type AmbassadorTagVariant = "gold" | "outline" | "pride";

const AMBASSADOR_TAG_VARIANTS: readonly AmbassadorTagVariant[] = [
  "gold",
  "outline",
  "pride",
];

const DEFAULT_AMBASSADOR_TAG_VARIANT: AmbassadorTagVariant = "gold";

/** Reads the `?ambassadorTag=` switch. Called once per tag render. */
export function readAmbassadorTagVariant(): AmbassadorTagVariant {
  if (typeof window === "undefined") return DEFAULT_AMBASSADOR_TAG_VARIANT;
  const requestedVariant = new URLSearchParams(window.location.search).get(
    "ambassadorTag",
  );
  return (
    AMBASSADOR_TAG_VARIANTS.find((variant) => variant === requestedVariant) ??
    DEFAULT_AMBASSADOR_TAG_VARIANT
  );
}
