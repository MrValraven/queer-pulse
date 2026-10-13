import {
  ANCHOR,
  type ListingDraft,
  type MissingField,
} from "./listBusiness.data";
import {
  COVER_FREE_BEFORE_PATTERN,
  hasCoverCategory,
  normalizeCoverPolicy,
  normalizeInclusionPractices,
  SAFER_SPACE_POLICY_PRACTICE,
  SAFER_SPACE_POLICY_URL_MAX_LENGTH,
} from "./listingFacts.data";
import { listingKindOf } from "./listingMobile.data";
import { isFilledOnlineLinkValid } from "./listingOnline.data";

const HTTPS_PREFIX = "https://";
const PROTOCOL_PATTERN = /^https?:\/\//i;

/**
 * The backend's rule for the policy link (the online listing link rule):
 * http or https only, a host with a dot, no credentials, no spaces or
 * backslashes, and at most 300 characters once the server adds `https://`
 * to a link typed without one.
 */
export function isSaferSpacePolicyUrlValid(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  const ceiling = PROTOCOL_PATTERN.test(trimmed)
    ? SAFER_SPACE_POLICY_URL_MAX_LENGTH
    : SAFER_SPACE_POLICY_URL_MAX_LENGTH - HTTPS_PREFIX.length;
  return isFilledOnlineLinkValid(trimmed, ceiling);
}

/**
 * The two required pairs of the attribute fields, on every path: the
 * published policy needs its link, and "Free before" needs its time (only
 * where the cover question applies, which is what a save would send).
 */
export function factMissingFields(draft: ListingDraft): {
  step2: MissingField[];
  step3: MissingField[];
} {
  const step2: MissingField[] = [];
  const step3: MissingField[] = [];
  const practices = normalizeInclusionPractices(draft.inclusionPractices);
  if (practices.includes(SAFER_SPACE_POLICY_PRACTICE)) {
    const url = (draft.saferSpacePolicyUrl ?? "").trim();
    if (!url) {
      step2.push({
        labelKey: "marketing:listBusiness.missing.saferSpacePolicyUrl",
        anchor: ANCHOR.saferSpacePolicyUrl,
      });
    } else if (!isSaferSpacePolicyUrlValid(url)) {
      step2.push({
        labelKey: "marketing:listBusiness.missing.saferSpacePolicyUrlFormat",
        anchor: ANCHOR.saferSpacePolicyUrl,
      });
    }
  }
  const isCoverAsked =
    listingKindOf(draft) !== "online" && hasCoverCategory(draft.cats);
  if (
    isCoverAsked &&
    normalizeCoverPolicy(draft.coverPolicy) === "freeBefore" &&
    !COVER_FREE_BEFORE_PATTERN.test(draft.coverFreeBefore ?? "")
  ) {
    step3.push({
      labelKey: "marketing:listBusiness.missing.coverFreeBefore",
      anchor: ANCHOR.coverFreeBefore,
    });
  }
  return { step2, step3 };
}
