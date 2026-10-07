import { ApiError } from "../../../shared/api/client";
import type { TFunction } from "../../../shared/i18n/types";
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

/**
 * The DOM id of the admin block that the admin create page renders ABOVE the
 * wizard (publish state and the ownership offer). Those two fields belong to
 * no wizard step, so an admin-field 422 surfaces at the top of the form:
 * step 0 is the topmost step, and the inline server message is shown there.
 *
 * Kept local, because `ANCHOR` catalogs the wizard's own fields.
 * `flashField` no-ops when no element carries the id, so a member submit that
 * never renders the admin block is unaffected.
 */
const ADMIN_BLOCK_ANCHOR = "lb-admin-fields";

const FIELD_TO_STEP: Record<string, FieldLocation> = {
  // Above the wizard: the admin-only block. Mapped to step 0 so an
  // admin-field 422 surfaces at the top of the form.
  publishState: { step: 0, anchor: ADMIN_BLOCK_ANCHOR },
  // `ownerOffer.memberSlug` routes by its first path segment, the same way
  // `social.website` and `photos.wide` do.
  ownerOffer: { step: 0, anchor: ADMIN_BLOCK_ANCHOR },
  // Step 0 — how you know the place
  path: { step: 0, anchor: ANCHOR.path },
  // Step 1 — basics
  name: { step: 1, anchor: ANCHOR.name },
  cats: { step: 1, anchor: ANCHOR.cats },
  // `online` is routed in `locationOf`: a create answers it on step 0 ("Where
  // do people find it?"), an edit with the toggle at the top of the basics.
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
  ownedBy: { step: 4, anchor: ANCHOR.ownedBy },
  ownerName: { step: 4, anchor: ANCHOR.ownerName },
  ownerRole: { step: 4, anchor: ANCHOR.ownerRole },
  photos: { step: 4, anchor: ANCHOR.photos },
  alt: { step: 4, anchor: ANCHOR.photos },
  // Step 5 — review / consents
  consentOuting: { step: 5, anchor: ANCHOR.consent },
  consentGuide: { step: 5, anchor: ANCHOR.consent },
  // Step 1: the basics an online listing adds.
  city: { step: 1, anchor: ANCHOR.city },
  adultTermsAccepted: { step: 1, anchor: ANCHOR.adultTerms },
  // The priced lists are the editor's own section; step 1 is where their
  // missing-field chips sit too.
  pricingMode: { step: 1, anchor: ANCHOR.pricingMode },
  shopItems: { step: 1, anchor: ANCHOR.services },
  // Step 3: selling online.
  hasOnlineShop: { step: 3, anchor: ANCHOR.hasOnlineShop },
};

/** `onlineDetails.<field>` routes by its SECOND segment to that field. */
const ONLINE_DETAIL_ANCHORS: Record<string, string> = {
  mainLink: ANCHOR.mainLink,
  moreLinks: ANCHOR.moreLinks,
  fulfilment: ANCHOR.fulfilment,
  pickupNote: ANCHOR.pickupNote,
  shipsFrom: ANCHOR.shipsFrom,
  isVatIncluded: ANCHOR.shipsFrom,
  payments: ANCHOR.payments,
  sessionFormats: ANCHOR.sessionFormats,
  registration: ANCHOR.registration,
  replyNote: ANCHOR.replyNote,
};

const ADULT_TERMS_CODE = "adult_terms_required";

/** The category check names no property ("Category "x" is not offered to
 *  online listings"), so it is matched by its opening words. */
const CATEGORY_MESSAGE_PATTERN = /^Category "/;

/** Backend rule 5's sentence, joined with the other claim-path gaps and
 *  carrying no property path. */
const CLAIM_FULFILMENT_MESSAGE_PATTERN = /requires a way people get it/;

/** The tag check names no property path ("Unknown listing tags: "x". Pick
 *  tags from GET /directory/tags."), so it is matched by its opening words. */
const UNKNOWN_TAGS_MESSAGE_PATTERN = /^Unknown listing tags/;

/** Whether the form is editing a listing that exists, which moves the
 *  online-only answer from step 0 to the basics. */
export interface Listing422Options {
  isEdit?: boolean;
}

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

function secondPathSegment(path: string): string {
  return (
    path
      .split(/[.[\]]/)
      .filter(Boolean)[1]
      ?.trim() ?? ""
  );
}

function locationOf(
  fieldError: RawFieldError,
  options: Listing422Options,
): FieldLocation | undefined {
  if (CATEGORY_MESSAGE_PATTERN.test(fieldError.message.trim())) {
    return { step: 1, anchor: ANCHOR.cats };
  }
  if (UNKNOWN_TAGS_MESSAGE_PATTERN.test(fieldError.message.trim())) {
    return { step: 2, anchor: ANCHOR.tags };
  }
  if (fieldError.field === "online") {
    return options.isEdit === true
      ? { step: 1, anchor: ANCHOR.online }
      : { step: 0, anchor: ANCHOR.whereFound };
  }
  if (CLAIM_FULFILMENT_MESSAGE_PATTERN.test(fieldError.message)) {
    return { step: 3, anchor: ANCHOR.fulfilment };
  }
  if (fieldError.field === "onlineDetails") {
    return {
      step: 3,
      anchor:
        ONLINE_DETAIL_ANCHORS[secondPathSegment(fieldError.path)] ??
        ANCHOR.mainLink,
    };
  }
  return FIELD_TO_STEP[fieldError.field];
}

/** True when the body says the 18+ acknowledgement is missing, in whichever
 *  of the shapes a NestJS error body carries it. */
function isAdultTermsError(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const body = data as Record<string, unknown>;
  const messages: unknown[] = Array.isArray(body.message)
    ? (body.message as unknown[])
    : [body.message];
  return [body.code, body.error, ...messages].some(
    (value) => typeof value === "string" && value.trim() === ADULT_TERMS_CODE,
  );
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

/** The reader's language and translator, from `useTranslation()`. */
export interface Listing422Translation {
  t: TFunction;
  language: string;
}

/**
 * PRD-467: the backend writes these field sentences in English only. An
 * English reader keeps the field's own sentence; every other language gets
 * `shared:apiError.reasonInvalid`, the line `reasonFor` gives any refused 400
 * or 422, read straight from the catalog so it holds before the boot bridge
 * wires `reasonFor` too. The field is still flashed, so the member sees which
 * one to fix.
 */
function memberFacingMessage(
  error: ApiError,
  fieldMessage: string,
  translation: Listing422Translation,
): string {
  if (translation.language.toLowerCase().startsWith("en")) {
    return fieldMessage.trim() || error.message;
  }
  return translation.t("shared:apiError.reasonInvalid");
}

/**
 * Resolve a caught error into the step/field/message to route to, or `null`
 * when it isn't a field-mapped validation error (the caller then falls back to
 * its generic toast + review step). Only a real `ApiError` with a 400 or 422 is
 * inspected; a demo fabricated record, a network throw, or any other status
 * returns `null`, so the demo path is entirely unaffected.
 */
export function resolveListing422(
  error: unknown,
  translation: Listing422Translation,
  options: Listing422Options = {},
): Listing422Target | null {
  if (!(error instanceof ApiError) || !VALIDATION_STATUSES.has(error.status))
    return null;
  if (isAdultTermsError(error.data)) {
    return {
      step: 1,
      anchor: ANCHOR.adultTerms,
      message: translation.t(
        "marketing:listBusiness.server.adultTermsRequired",
      ),
      photoSlots: [],
    };
  }
  const fieldErrors = extractFieldErrors(error.data);
  const photoSlots = [
    ...new Set(
      fieldErrors.flatMap(({ path }) => {
        const slot = photoSlotFromPath(path);
        return slot ? [slot] : [];
      }),
    ),
  ];
  for (const fieldError of fieldErrors) {
    const location = locationOf(fieldError, options);
    if (location) {
      return {
        step: location.step,
        anchor: location.anchor,
        message: memberFacingMessage(error, fieldError.message, translation),
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
