import type { LandingSection } from "./api/landingFeatures.api";

/** The four raw text fields every section's `copy` is built from — a superset
 *  so one shape can back a controlled form regardless of which section is
 *  active, rather than a per-section union that would force callers to
 *  narrow before rendering. */
export interface LandingCopyFieldsValue {
  quote: string;
  blurb: string;
  cause: string;
  /** Comma-separated in the UI; split into `string[]` only at submit time. */
  tagsText: string;
}

export function emptyLandingCopyValue(): LandingCopyFieldsValue {
  return { quote: "", blurb: "", cause: "", tagsText: "" };
}

/** Seeds the form from an existing feature's `copy` (edit flow). */
export function landingCopyValueFromCopy(
  copy: Record<string, unknown>,
): LandingCopyFieldsValue {
  return {
    quote: typeof copy.quote === "string" ? copy.quote : "",
    blurb: typeof copy.blurb === "string" ? copy.blurb : "",
    cause: typeof copy.cause === "string" ? copy.cause : "",
    tagsText: Array.isArray(copy.tags)
      ? (copy.tags as unknown[]).join(", ")
      : "",
  };
}

/** Trims and reshapes the form value into the exact `copy` payload the
 *  backend's `validateLandingCopy` expects for `section` — the single place
 *  this mapping happens, shared by create (picker) and edit (row editor) so
 *  the two flows can never drift apart. */
export function buildLandingCopy(
  section: LandingSection,
  value: LandingCopyFieldsValue,
): Record<string, unknown> {
  if (section === "member") return { quote: value.quote.trim() };
  if (section === "community") return { blurb: value.blurb.trim() };
  return {
    cause: value.cause.trim(),
    blurb: value.blurb.trim(),
    tags: value.tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

/** Mirrors the backend's `validateLandingCopy` requiredness client-side —
 *  member `quote` and changemaker `cause`+`blurb` are required, everything
 *  else (community `blurb`, changemaker `tags`) is optional — so a create
 *  request is never even attempted with copy the server would 400 on. */
export function isLandingCopyValid(
  section: LandingSection,
  value: LandingCopyFieldsValue,
): boolean {
  if (section === "member") return value.quote.trim().length > 0;
  if (section === "changemaker") {
    return value.cause.trim().length > 0 && value.blurb.trim().length > 0;
  }
  return true;
}
