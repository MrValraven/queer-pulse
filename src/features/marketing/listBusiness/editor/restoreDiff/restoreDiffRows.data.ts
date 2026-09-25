import { API_BASE_URL } from "../../../../../shared/api/config";
import { PHOTO_KEYS } from "../../listBusiness.data";
import {
  ACCESSIBILITY_ANSWER_BY_ID,
  ACCESSIBILITY_QUESTIONS,
  normalizeAccessibilityDraft,
  type AccessibilityAnswer,
} from "../../listingAccessibility.data";
import type { ListingServiceOffering } from "../../listingServices.data";
import {
  DIFF_KEY_PREFIX,
  type RestoreDiffContext,
} from "./restoreDiffFields.data";
import {
  changedRow,
  pairsByPosition,
  summaryOf,
  untitled,
} from "./restoreDiffRowParts.data";
import type { RestoreRowChange } from "./restoreDiff.types";

/**
 * Row builders for accessibility answers, services and photo slots. The hours
 * rows and the menu rows have files of their own. Each returns only the rows
 * that differ, decided on the raw values, with every display string already
 * resolved.
 */

const ACCESSIBILITY_NOTE_LABEL_KEY =
  "marketing:listBusiness.accessibility.noteLabel";

export function accessibilityRows(
  context: RestoreDiffContext,
): RestoreRowChange[] {
  const { t } = context;
  const before = normalizeAccessibilityDraft(context.current.accessibility);
  const after = normalizeAccessibilityDraft(context.saved.accessibility);
  const answerLabel = (answer: AccessibilityAnswer) =>
    t(ACCESSIBILITY_ANSWER_BY_ID[answer].ownerKey);
  const rows = ACCESSIBILITY_QUESTIONS.flatMap((question) => {
    const beforeAnswer = before.answers[question.slug];
    const afterAnswer = after.answers[question.slug];
    if (beforeAnswer === afterAnswer) return [];
    return [
      changedRow(
        `accessibility.${question.slug}`,
        t(question.labelKey),
        answerLabel(beforeAnswer),
        answerLabel(afterAnswer),
      ),
    ];
  });
  if (before.note !== after.note) {
    rows.push(
      changedRow(
        "accessibility.note",
        t(ACCESSIBILITY_NOTE_LABEL_KEY),
        before.note || null,
        after.note || null,
      ),
    );
  }
  return rows;
}

function serviceSummary(service: ListingServiceOffering): string {
  return summaryOf([service.name, service.price, service.note]);
}

function isSameService(
  first: ListingServiceOffering,
  second: ListingServiceOffering,
): boolean {
  return (
    first.name === second.name &&
    first.price === second.price &&
    first.note === second.note
  );
}

/** Matched on position: the list has no identity beyond its client ids,
 *  which are regenerated on every load. */
export function serviceRows(context: RestoreDiffContext): RestoreRowChange[] {
  const { t } = context;
  const pairs = pairsByPosition(
    context.current.services ?? [],
    context.saved.services ?? [],
  );
  return pairs.flatMap((pair) => {
    if (pair.before && pair.after && isSameService(pair.before, pair.after))
      return [];
    return [
      changedRow(
        `services.${pair.position}`,
        untitled(t, (pair.after ?? pair.before)!.name),
        pair.before ? serviceSummary(pair.before) : null,
        pair.after ? serviceSummary(pair.after) : null,
      ),
    ];
  });
}

/**
 * A photo value as something an `<img>` can load, or null when nothing can.
 *
 * Same rule as the editor's full preview (`listingDraftPreviewSource`): a
 * served `http(s)` URL is used as it is, and a bare storage key (what an
 * upload leaves in the draft) resolves through `GET /files/<key>`. A `blob:`
 * URL only lives as long as the page that made it, so one read back from the
 * stored copy is dead and shows no thumbnail; the row keeps its label and
 * alt text.
 */
export function displayablePhotoUrl(
  value: string,
  isFromThisSession: boolean,
): string | null {
  if (!value) return null;
  if (value.startsWith("blob:")) return isFromThisSession ? value : null;
  if (/^https?:\/\//.test(value)) return value;
  return `${API_BASE_URL}/files/${value}`;
}

/**
 * One row per photo slot whose picture or alt text differs. The status
 * follows the picture (added to an empty slot, cleared, or anything else);
 * the text on each side is that slot's alt text. The screen side prefers
 * this session's upload preview, as every other display of the draft does.
 */
export function photoRows(context: RestoreDiffContext): RestoreRowChange[] {
  const { current, saved, t, photoPreviews } = context;
  return PHOTO_KEYS.flatMap((slot) => {
    const beforePhoto = current.photos[slot];
    const afterPhoto = saved.photos[slot];
    const beforeAlt = current.alt[slot];
    const afterAlt = saved.alt[slot];
    if (beforePhoto === afterPhoto && beforeAlt === afterAlt) return [];
    const isAdded = !beforePhoto && Boolean(afterPhoto);
    const isRemoved = Boolean(beforePhoto) && !afterPhoto;
    const row = changedRow(
      `photos.${slot}`,
      t(`${DIFF_KEY_PREFIX}.photo.${slot}`),
      isAdded ? null : beforeAlt,
      isRemoved ? null : afterAlt,
    );
    const beforeShown = beforePhoto ? photoPreviews?.[slot] || beforePhoto : "";
    return [
      {
        ...row,
        beforeImageUrl: displayablePhotoUrl(beforeShown, true),
        afterImageUrl: displayablePhotoUrl(afterPhoto, false),
      },
    ];
  });
}
