import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { ListingDraft } from "./listBusiness.data";
import {
  normalizeAccessibilityDraft,
  type AccessibilityAnswer,
  type AccessibilitySlug,
} from "./listingAccessibility.data";

/**
 * The accessibility block's setters, kept out of `useListingForm` the same way
 * the dated hours exceptions are: a self-contained sub-editor whose state
 * rules belong next to each other rather than buried in the middle of every
 * other field's.
 *
 * Answers MERGE per question. An owner correcting one answer never blanks the
 * other five, and "no" is written as a real stored answer rather than as the
 * absence of a "yes", which is the whole reason this model replaced the flat
 * amenity tags.
 *
 * Every read goes through `normalizeAccessibilityDraft`, so a draft resumed
 * from before these questions existed is healed to the full six-question map
 * on first edit instead of throwing on a missing key.
 */
export function useAccessibilitySetters(
  setDraft: Dispatch<SetStateAction<ListingDraft>>,
) {
  const setAccessibilityAnswer = useCallback(
    (slug: AccessibilitySlug, answer: AccessibilityAnswer) => {
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
