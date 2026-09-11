import { ApiError } from "../../../shared/api/client";
import { ANCHOR, PHOTO_KEYS, type PhotoKey } from "./listBusiness.data";

/* ===========================================================================
   Server-side validation (400 / 422) → wizard step + field routing (item #4).

   When a submit/save is rejected with a validation error, we jump to the
   wizard step that OWNS the first offending field and surface the server's
   message inline there, instead of dumping the member on a hardcoded review
   step with a generic toast. The map below is the single source of truth for
   "which step owns which field", keyed by the top-level `ListingDraft` field.

   Both statuses count. NestJS's default `ValidationPipe` answers a failed DTO
   check with a 400 carrying `{ message: string[] }`, and a typed 422 carries
   the same shapes. A refused photo also names its slot (`photos.wide`), which
   is collected separately so the gallery can mark that one tile.
   =========================================================================== */

/** Where a given `ListingDraft` field lives: its wizard step + the DOM anchor
 *  (see `ANCHOR`) to scroll/flash. Nested fields (`social.website`,
 *  `photos.wide`, `hours.Mon`) route by their FIRST path segment. */
interface FieldLocation {
  step: number;
  anchor: string;
}

const FIELD_TO_STEP: Record<string, FieldLocation> = {
  // Step 0 — how you know the place
  path: { step: 0, anchor: ANCHOR.path },
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

/** HTTP statuses whose body carries per-field validation errors. */
const VALIDATION_STATUSES = new Set([400, 422]);

/** The resolved target of a validation error: the step to show, the field to
 *  scroll to, the server message to surface inline, and every photo slot the
 *  server refused (empty when no photo was named). */
export interface Listing422Target {
  step: number;
  anchor: string;
  message: string;
  photoSlots: PhotoKey[];
}

interface RawFieldError {
  /** The property path as the server wrote it, e.g. `"photos.wide"`. */
  path: string;
  /** Its first segment (`"photos"`), the key `FIELD_TO_STEP` routes by. */
  field: string;
  message: string;
}

/** `"social.website"` / `"photos[wide]"` → `"social"` / `"photos"`. */
function firstPathSegment(name: string): string {
  return name.split(/[.[]/)[0]?.trim() ?? name;
}

/** `"photos.wide"` / `"photos[wide]"` → `"wide"`; any other path → `null`. */
function photoSlotFromPath(path: string): PhotoKey | null {
  const [field, slot] = path.split(/[.[\]]/).filter(Boolean);
  if (field?.trim() !== "photos") return null;
  return PHOTO_KEYS.find((photoKey) => photoKey === slot) ?? null;
}

/** The value as a trimmed string, or `""` for anything non-string — so a
 *  malformed body never stringifies an object to `"[object Object]"`. */
function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** class-validator messages begin with the offending property path, e.g.
 *  `"name should not be empty"`, `"photos.wide must be ..."`. Read that
 *  leading token so an array-of-strings body still routes to a field. */
function pathFromMessage(message: string): string {
  const match = message.trim().match(/^([A-Za-z0-9_.[\]]+)/);
  return match?.[1] ?? "";
}

function toFieldError(path: string, message: string): RawFieldError {
  return { path, field: firstPathSegment(path), message };
}

/**
 * Pull `{ path, field, message }` out of an error body, tolerating the shapes a
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
        found.push(toFieldError(pathFromMessage(entry), entry));
    }
  } else if (typeof body.message === "string" && body.message.trim()) {
    found.push(toFieldError(pathFromMessage(body.message), body.message));
  }

  const keyed = body.errors ?? body.violations ?? body.fields;
  if (keyed && typeof keyed === "object") {
    if (Array.isArray(keyed)) {
      for (const item of keyed) {
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const path =
            asString(record.field) ||
            asString(record.property) ||
            asString(record.path);
          const message = asString(record.message) || asString(record.error);
          if (path) found.push(toFieldError(path, message));
        }
      }
    } else {
      for (const [path, value] of Object.entries(
        keyed as Record<string, unknown>,
      )) {
        const message = Array.isArray(value)
          ? asString(value[0])
          : asString(value);
        found.push(toFieldError(path, message));
      }
    }
  }

  return found;
}

/**
 * Resolve a caught error into the step/field/message to route to, or `null`
 * when it isn't a field-mapped validation error (the caller then falls back to
 * its generic toast + review step). Only a real `ApiError` with a 400 or 422 is
 * inspected; a demo fabricated record, a network throw, or any other status
 * returns `null`, so the demo path is entirely unaffected.
 */
export function resolveListing422(error: unknown): Listing422Target | null {
  if (!(error instanceof ApiError) || !VALIDATION_STATUSES.has(error.status))
    return null;
  const fieldErrors = extractFieldErrors(error.data);
  const photoSlots = [
    ...new Set(
      fieldErrors.flatMap(({ path }) => {
        const slot = photoSlotFromPath(path);
        return slot ? [slot] : [];
      }),
    ),
  ];
  for (const { field, message } of fieldErrors) {
    const location = FIELD_TO_STEP[field];
    if (location) {
      return {
        step: location.step,
        anchor: location.anchor,
        message: message.trim() || error.message,
        photoSlots,
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
