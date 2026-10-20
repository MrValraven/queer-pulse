import type { SubprofileItemView } from "../../api/subprofiles.adapters";
import { isTattooBodyPhotoSection } from "./tattooVocab.data";

type ItemImageCarrier = Pick<SubprofileItemView, "imageUrl" | "structured">;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/** The FE mirror of the backend's listItemImageRefs: imageUrl,
 *  structured.coverUp.beforeImageUrl, every structured.sessions[].imageUrl;
 *  non-empty strings, stored order, duplicates kept. */
export function itemImageUrls(item: ItemImageCarrier): string[] {
  const candidates: unknown[] = [
    item.imageUrl,
    item.structured?.coverUp?.beforeImageUrl,
    ...(item.structured?.sessions ?? []).map((session) => session?.imageUrl),
  ];
  return candidates.filter(isNonEmptyString);
}

/** Body-photo sections only: the stored flag, else true for scar_work and
 *  false for the other three. */
export function isItemPhotoBlurred(
  item: Pick<SubprofileItemView, "section" | "structured">,
): boolean {
  if (!isTattooBodyPhotoSection(item.section)) return false;
  const storedFlag = item.structured?.photo?.isBlurred;
  if (typeof storedFlag === "boolean") return storedFlag;
  return item.section === "scar_work";
}

/** The consent tick is required: a new item with any image, or any image the
 *  item did not open with. */
export function hasNewItemImages(
  draft: ItemImageCarrier,
  original: ItemImageCarrier,
  isNew: boolean,
): boolean {
  const draftUrls = itemImageUrls(draft);
  if (isNew) return draftUrls.length > 0;
  const originalUrls = new Set(itemImageUrls(original));
  return draftUrls.some((url) => !originalUrls.has(url));
}

/** Owner nudge: a body-photo item with an image and no
 *  hasClientConsent === true. */
export function needsConsentNudge(
  item: Pick<SubprofileItemView, "section" | "imageUrl" | "structured">,
): boolean {
  if (!isTattooBodyPhotoSection(item.section)) return false;
  if (itemImageUrls(item).length === 0) return false;
  return item.structured?.photo?.hasClientConsent !== true;
}

/** The picture a tile or the spotlight shows: imageUrl, else the last
 *  session photo, else "". */
export function itemCoverUrl(item: ItemImageCarrier): string {
  if (isNonEmptyString(item.imageUrl)) return item.imageUrl;
  const sessionUrls = (item.structured?.sessions ?? [])
    .map((session) => session?.imageUrl)
    .filter(isNonEmptyString);
  return sessionUrls[sessionUrls.length - 1] ?? "";
}
