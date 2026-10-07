import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { ListingDraft } from "./listBusiness.data";
import {
  normalizeAccessibilityDraft,
  type AccessibilityAnswer,
  type ListingAccessibilitySlug,
} from "./listingAccessibility.data";

/**
 * The accessibility block's setters, kept out of `useListingForm` the same way
 * the dated hours exceptions are: a self-contained sub-editor whose state
 * rules belong next to each other rather than buried in the middle of every
 * other field's.
 *
 * Answers MERGE per question. An owner correcting one answer never blanks the
 * others, and "no" is written as a real stored answer of its own, which is
 * the whole reason this model replaced the flat amenity tags (where a "no"
 * could only be the absence of a "yes").
 *
 * Every read goes through `normalizeAccessibilityDraft`, so a draft resumed
 * from before these questions existed is healed on first edit to a full map
 * holding every question the listing's kind asks, and a missing key never
 * throws.
 */
export function useAccessibilitySetters(
  setDraft: Dispatch<SetStateAction<ListingDraft>>,
) {
  const setAccessibilityAnswer = useCallback(
    (slug: ListingAccessibilitySlug, answer: AccessibilityAnswer) => {
      setDraft((draft) => {
        const current = normalizeAccessibilityDraft(draft.accessibility);
        return {
          ...draft,
          accessibility: {
            ...current,
            answers: { ...current.answers, [slug]: answer },
          },
        };
      });
    },
    [setDraft],
  );

  const setAccessibilityNote = useCallback(
    (note: string) => {
      setDraft((draft) => ({
        ...draft,
        accessibility: {
          ...normalizeAccessibilityDraft(draft.accessibility),
          note,
        },
      }));
    },
    [setDraft],
  );

  return { setAccessibilityAnswer, setAccessibilityNote };
}
