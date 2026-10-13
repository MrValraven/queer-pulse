import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { ListingDraft } from "./listBusiness.data";
import { withEntryModeLinked } from "./listingAppointmentLink";
import {
  withAttributeToggled,
  withHighlightToggled,
} from "./listingAttributes.data";
import {
  LANGS_OTHER_MAX_LENGTH,
  LISTING_INCLUSION_PRACTICES,
  LISTING_LANGUAGE_CODES,
  LISTING_PAYMENT_METHODS,
  normalizeLanguageCodes,
  toggleInOrder,
  type ListingCoverPolicy,
  type ListingEntryMode,
  type ListingInclusionPractice,
  type ListingLanguageCode,
  type ListingPaymentMethod,
} from "./listingFacts.data";

/**
 * The setters of the attribute picker, the highlights, the inclusion
 * practices, the languages and the "Getting in and paying" fields. Kept out
 * of `useListingForm` like the other sub-editors' setters. Every toggle
 * reads the current draft, so two quick taps never drop the first.
 */
export function useListingFactSetters(
  setDraft: Dispatch<SetStateAction<ListingDraft>>,
) {
  const toggleAttribute = useCallback(
    (slug: string) =>
      setDraft((current) => ({
        ...current,
        ...withAttributeToggled(
          {
            attributes: current.attributes ?? [],
            highlights: current.highlights ?? [],
          },
          slug,
        ),
      })),
    [setDraft],
  );
  const toggleHighlight = useCallback(
    (slug: string) =>
      setDraft((current) => ({
        ...current,
        highlights: withHighlightToggled(
          {
            attributes: current.attributes ?? [],
            highlights: current.highlights ?? [],
          },
          slug,
        ),
      })),
    [setDraft],
  );
  const setEntryMode = useCallback(
    (entryMode: ListingEntryMode | null) =>
      setDraft((current) => withEntryModeLinked(current, entryMode)),
    [setDraft],
  );
  const setCoverPolicy = useCallback(
    (coverPolicy: ListingCoverPolicy | null) =>
      setDraft((current) => ({ ...current, coverPolicy })),
    [setDraft],
  );
  const setCoverFreeBefore = useCallback(
    (coverFreeBefore: string) =>
      setDraft((current) => ({ ...current, coverFreeBefore })),
    [setDraft],
  );
  const toggleWayToPay = useCallback(
    (method: ListingPaymentMethod) =>
      setDraft((current) => ({
        ...current,
        payments: toggleInOrder(
          current.payments ?? [],
          method,
          LISTING_PAYMENT_METHODS,
        ),
      })),
    [setDraft],
  );
  const setIssuesNifInvoices = useCallback(
    (issuesNifInvoices: boolean | null) =>
      setDraft((current) => ({ ...current, issuesNifInvoices })),
    [setDraft],
  );
  const toggleInclusionPractice = useCallback(
    (practice: ListingInclusionPractice) =>
      setDraft((current) => ({
        ...current,
        inclusionPractices: toggleInOrder(
          current.inclusionPractices ?? [],
          practice,
          LISTING_INCLUSION_PRACTICES,
        ),
      })),
    [setDraft],
  );
  const setSaferSpacePolicyUrl = useCallback(
    (saferSpacePolicyUrl: string) =>
      setDraft((current) => ({ ...current, saferSpacePolicyUrl })),
    [setDraft],
  );
  const toggleLanguage = useCallback(
    (code: ListingLanguageCode) =>
      setDraft((current) => ({
        ...current,
        langs: toggleInOrder(
          normalizeLanguageCodes(current.langs),
          code,
          LISTING_LANGUAGE_CODES,
        ),
      })),
    [setDraft],
  );
  const setLangsOther = useCallback(
    (text: string) =>
      setDraft((current) => ({
        ...current,
        langsOther: text.slice(0, LANGS_OTHER_MAX_LENGTH),
      })),
    [setDraft],
  );
  return {
    toggleAttribute,
    toggleHighlight,
    setEntryMode,
    setCoverPolicy,
    setCoverFreeBefore,
    toggleWayToPay,
    setIssuesNifInvoices,
    toggleInclusionPractice,
    setSaferSpacePolicyUrl,
    toggleLanguage,
    setLangsOther,
  };
}
