import { ApiError } from "../../../shared/api/client";
import { ANCHOR } from "./listBusiness.data";

/* ===========================================================================
   Server-side validation (422) → wizard step + field routing (item #4).

   When a submit/save is rejected with a typed 422 validation error, we jump to
   the wizard step that OWNS the first offending field and surface the server's
   message inline there, instead of dumping the member on a hardcoded review
   step with a generic toast. The map below is the single source of truth for
   "which step owns which field", keyed by the top-level `ListingDraft` field.
   =========================================================================== */

/** Where a given `ListingDraft` field lives: its wizard step + the DOM anchor
 *  (see `ANCHOR`) to scroll/flash. Nested fields (`social.website`,
 *  `photos.wide`, `hours.Mon`) route by their FIRST path segment. */
interface FieldLocation {
  step: number;
  anchor: string;
}

const FIELD_TO_STEP: Record<string, FieldLocation> = {
  // Step 0 — path / verification
  verify: { step: 0, anchor: ANCHOR.verify },
  // Step 1 — basics
  name: { step: 1, anchor: ANCHOR.name },
  cats: { step: 1, anchor: ANCHOR.cats },
  hood: { step: 1, anchor: ANCHOR.hood },
  badge: { step: 1, anchor: ANCHOR.badge },
  price: { step: 1, anchor: ANCHOR.price },
  blurb: { step: 1, anchor: ANCHOR.blurb },
  // Step 2 — story
  tagline: { step: 2, anchor: ANCHOR.tagline },
  whatItIs: { step: 2, anchor: ANCHOR.whatItIs },
  // Step 3 — practical
  address: { step: 3, anchor: ANCHOR.address },
  latitude: { step: 3, anchor: ANCHOR.address },
  longitude: { step: 3, anchor: ANCHOR.address },
  hours: { step: 3, anchor: ANCHOR.hours },
  social: { step: 3, anchor: ANCHOR.social },
  // Step 4 — photos & you
  rel: { step: 4, anchor: ANCHOR.rel },
  ownerName: { step: 4, anchor: ANCHOR.ownerName },
  ownerRole: { step: 4, anchor: ANCHOR.ownerRole },
  contactEmail: { step: 4, anchor: ANCHOR.contactEmail },
  photos: { step: 4, anchor: ANCHOR.photos },
  alt: { step: 4, anchor: ANCHOR.photos },
  // Step 5 — review / consents
  consentOuting: { step: 5, anchor: ANCHOR.consent },
  consentGuide: { step: 5, anchor: ANCHOR.consent },
};

/** The resolved target of a 422: the step to show, the field to scroll to, and
 *  the server message to surface inline. */
export interface Listing422Target {
  step: number;
  anchor: string;
  message: string;
}

interface RawFieldError {
  field: string;
  message: string;
}

/** `"social.website"` / `"photos[wide]"` → `"social"` / `"photos"`. */
function firstPathSegment(name: string): string {
  return name.split(/[.[]/)[0]?.trim() ?? name;
}

/** The value as a trimmed string, or `""` for anything non-string — so a
 *  malformed body never stringifies an object to `"[object Object]"`. */
function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** class-validator messages begin with the offending property path, e.g.
 *  `"name should not be empty"`, `"social.website must be a URL"`. Read that
 *  leading token so an array-of-strings body still routes to a field. */
function fieldFromMessage(message: string): string {
  const match = message.trim().match(/^([A-Za-z0-9_.[\]]+)/);
  return match?.[1] ? firstPathSegment(match[1]) : "";
}

/**
 * Pull `{ field, message }` pairs out of an error body, tolerating the shapes a
 * NestJS backend realistically emits:
 *  - `{ message: string[] }` — class-validator default (field read from each
 *    line's leading property path);
 *  - `{ errors | violations | fields: { field: msg | msg[] } }` — a keyed map;
 *  - `{ errors | violations | fields: [{ field|property|path, message }] }`.
 */
function extractFieldErrors(data: unknown): RawFieldError[] {
  if (!data || typeof data !== "object") return [];
  const body = data as Record<string, unknown>;
  const found: RawFieldError[] = [];

  if (Array.isArray(body.message)) {
    for (const entry of body.message) {
      if (typeof entry === "string")
        found.push({ field: fieldFromMessage(entry), message: entry });
    }
  } else if (typeof body.message === "string" && body.message.trim()) {
    found.push({
      field: fieldFromMessage(body.message),
      message: body.message,
    });
  }

  const keyed = body.errors ?? body.violations ?? body.fields;
  if (keyed && typeof keyed === "object") {
    if (Array.isArray(keyed)) {
      for (const item of keyed) {
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const field =
            asString(record.field) ||
            asString(record.property) ||
            asString(record.path);
          const message = asString(record.message) || asString(record.error);
          if (field) found.push({ field: firstPathSegment(field), message });
        }
      }
    } else {
      for (const [field, value] of Object.entries(
        keyed as Record<string, unknown>,
      )) {
        const message = Array.isArray(value)
          ? asString(value[0])
          : asString(value);
        found.push({ field: firstPathSegment(field), message });
      }
    }
  }

  return found;
}

/**
 * Resolve a caught error into the step/field/message to route to, or `null`
 * when it isn't a field-mapped 422 (the caller then falls back to its generic
 * toast + review step). Only a real `ApiError(422)` is inspected — a demo
 * fabricated record, a network throw, or any non-422 returns `null`, so the
 * demo path is entirely unaffected.
 */
export function resolveListing422(error: unknown): Listing422Target | null {
  if (!(error instanceof ApiError) || error.status !== 422) return null;
  for (const { field, message } of extractFieldErrors(error.data)) {
    const location = FIELD_TO_STEP[field];
    if (location) {
      return {
        step: location.step,
        anchor: location.anchor,
        message: message.trim() || error.message,
      };
    }
  }
  return null;
}

/**
 * Scroll a field into view and flash it — reused after a 422 jump so the member
 * sees exactly which field the server rejected. `flashClass` is passed in (it
 * lives on the page CSS module) so this stays a plain DOM util with no styles
 * import of its own.
 */
export function flashField(anchor: string, flashClass?: string): void {
  const element = document.getElementById(anchor);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "center" });
  if (!flashClass) return;
  // Restart the animation even if the same field is targeted twice in a row.
  element.classList.remove(flashClass);
  void element.offsetWidth;
  element.classList.add(flashClass);
  window.setTimeout(() => element.classList.remove(flashClass), 1400);
}
