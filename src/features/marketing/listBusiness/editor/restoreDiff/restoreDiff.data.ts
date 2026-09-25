import type { TFunction } from "../../../../../shared/i18n/types";
import type { ListingDraft, PhotoKey } from "../../listBusiness.data";
import type {
  ListingEditorSectionDefinition,
  ListingEditorSectionKey,
} from "../listingEditor.data";
import { healListingDraft } from "./healListingDraft";
import type {
  RestoreAreaKey,
  RestoreDiffArea,
  RestoreFieldAreaMap,
  RestoreFieldChange,
} from "./restoreDiff.types";
import { FIELD_BUILDERS } from "./restoreDiffFieldBuilders.data";
import {
  fieldLabelKey,
  isFieldChanged,
  isPinned,
  type RestoreDiffContext,
} from "./restoreDiffFields.data";
import {
  fallbackFieldChange,
  isVisibleFieldChange,
} from "./restoreDiffSafetyNet.data";

/**
 * The restore review's data layer: which editor area every draft field
 * belongs to, what bringing a saved local copy back would change in each
 * area, and the merge that brings back only the areas the owner picked.
 *
 * Written in editor order, area by area, and read in that order: the fields
 * inside one review block appear exactly as they are listed here. Coupled
 * fields share an area on purpose (address with its pin, the pricing mode
 * with both priced lists, photos with their alt text), so a partial restore
 * can never pair a new address with an old pin.
 */
export const RESTORE_FIELD_AREAS: RestoreFieldAreaMap = {
  name: "basics",
  cats: "basics",
  hood: "basics",
  badge: "basics",
  evidence: "basics",
  price: "basics",
  blurb: "basics",
  tagline: "story",
  whatItIs: "story",
  tags: "story",
  goodFor: "story",
  langs: "story",
  services: "services",
  pricingMode: "services",
  menu: "services",
  online: "practical",
  address: "practical",
  geocoded: "practical",
  latitude: "practical",
  longitude: "practical",
  hours: "practical",
  hoursNote: "practical",
  hoursExceptions: "practical",
  social: "practical",
  accessibility: "accessibility",
  photos: "photos",
  alt: "photos",
  rel: "aboutYou",
  ownerName: "aboutYou",
  ownerRole: "aboutYou",
  ownerBio: "aboutYou",
  visibility: "aboutYou",
  linkToProfile: "aboutYou",
  consentOuting: "permissions",
  consentGuide: "permissions",
  // Fixed at creation or by who is signed in. An edit leaves them alone, so a
  // local copy has nothing to say about them.
  path: "notRestorable",
  affirmingBaselineAccepted: "notRestorable",
  managementRole: "notRestorable",
  isStaffAuthored: "notRestorable",
};

const RESTORE_AREA_KEYS: ReadonlySet<ListingEditorSectionKey> =
  new Set<ListingEditorSectionKey>([
    "basics",
    "story",
    "services",
    "practical",
    "accessibility",
    "photos",
    "aboutYou",
    "permissions",
  ] satisfies RestoreAreaKey[]);

function isRestoreAreaKey(key: ListingEditorSectionKey): key is RestoreAreaKey {
  return RESTORE_AREA_KEYS.has(key);
}

const DRAFT_KEYS = Object.keys(RESTORE_FIELD_AREAS) as Array<
  keyof ListingDraft
>;

/** Keys shown inside a sibling's entry (the pin's coordinates with the map
 *  pin, alt text on its photo's row), mapped to that sibling. */
const SHOWN_WITH: Partial<Record<keyof ListingDraft, keyof ListingDraft>> = {
  latitude: "geocoded",
  longitude: "geocoded",
  alt: "photos",
};

/** Each area's shown fields, in the order the map above lists them. */
function fieldKeysOf(area: RestoreAreaKey): Array<keyof ListingDraft> {
  return DRAFT_KEYS.filter(
    (key) => RESTORE_FIELD_AREAS[key] === area && !SHOWN_WITH[key],
  );
}

/** The field plus every key it shows on behalf of a sibling. */
function unitKeysOf(key: keyof ListingDraft): Array<keyof ListingDraft> {
  return [key, ...DRAFT_KEYS.filter((other) => SHOWN_WITH[other] === key)];
}

/**
 * One field's entries with the safety net under them, which is what makes
 * "listed exactly when it would be restored differently" hold by
 * construction: an entry with nothing to see becomes a generic one, and a
 * changed field its builder said nothing about gets a generic entry too.
 *
 * The one change left unlisted on purpose is the geocoded flag flipping while
 * neither side has a pin: nothing anywhere shows that flag without a pin.
 */
function visibleFieldChanges(
  context: RestoreDiffContext,
  key: keyof ListingDraft,
): RestoreFieldChange[] {
  const { current, saved, t } = context;
  const entries = FIELD_BUILDERS[key](context).map((entry) =>
    isVisibleFieldChange(entry)
      ? entry
      : fallbackFieldChange({ t, key: entry.key, labelKey: entry.labelKey }),
  );
  if (entries.length > 0) return entries;
  const isChanged = unitKeysOf(key).some((unitKey) =>
    isFieldChanged(context, unitKey),
  );
  if (!isChanged) return [];
  const isUnseenPinFlag =
    key === "geocoded" && !isPinned(current) && !isPinned(saved);
  if (isUnseenPinFlag) return [];
  return [
    fallbackFieldChange({
      t,
      key,
      labelKey: fieldLabelKey(key),
      before: current[key],
      after: saved[key],
    }),
  ];
}

/**
 * Everything bringing `saved` back would change on screen, grouped by the
 * editor's own sections and in their order.
 *
 * `sections` is the list the editor is rendering (role-trimmed and titled
 * for the pricing mode), so each block carries the same name as the jump nav
 * and an area this member cannot see is never offered. Areas with nothing
 * to show are left out; an empty result means the saved copy reads exactly
 * like the screen.
 */
export function buildRestoreDiff({
  current,
  saved,
  sections,
  t,
  photoPreviews,
}: {
  current: ListingDraft;
  saved: ListingDraft;
  sections: ListingEditorSectionDefinition[];
  t: TFunction;
  /** This session's upload previews (`form.photoPreviews`), which the editor
   *  shows in place of the draft's photo values. */
  photoPreviews?: Record<PhotoKey, string>;
}): RestoreDiffArea[] {
  const context: RestoreDiffContext = {
    current: healListingDraft(current),
    saved: healListingDraft(saved),
    t,
    photoPreviews,
  };
  const seenAreas = new Set<RestoreAreaKey>();
  const areas: RestoreDiffArea[] = [];
  for (const section of sections) {
    if (!isRestoreAreaKey(section.key) || seenAreas.has(section.key)) continue;
    seenAreas.add(section.key);
    const fields = fieldKeysOf(section.key).flatMap((fieldKey) =>
      visibleFieldChanges(context, fieldKey),
    );
    if (fields.length === 0) continue;
    areas.push({
      key: section.key,
      labelKey: section.labelKey,
      changeCount: fields.length,
      fields,
    });
  }
  return areas;
}

/** Copy one field across, deep, so the form never shares an object with the
 *  stored copy (an edit on screen would otherwise rewrite it in place). */
function copyField<Key extends keyof ListingDraft>(
  target: ListingDraft,
  source: ListingDraft,
  key: Key,
): void {
  target[key] = structuredClone(source[key]);
}

/**
 * What is on screen with the picked areas brought back from `saved`.
 *
 * Works field by field through the area map, so coupled fields always move
 * together, and fields no edit can change always keep what is on screen. The
 * saved copy is healed first, exactly as `buildRestoreDiff` reads it, so what
 * lands is what the review described.
 */
export function mergeRestoredAreas({
  current,
  saved,
  areaKeys,
}: {
  current: ListingDraft;
  saved: ListingDraft;
  areaKeys: ReadonlySet<RestoreAreaKey>;
}): ListingDraft {
  const merged: ListingDraft = { ...current };
  const healedSaved = healListingDraft(saved);
  for (const key of DRAFT_KEYS) {
    const area = RESTORE_FIELD_AREAS[key];
    if (area === "notRestorable" || !areaKeys.has(area)) continue;
    copyField(merged, healedSaved, key);
  }
  return merged;
}
