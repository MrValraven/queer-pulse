import { useCallback, useState } from "react";
import { useStepGate } from "../../../shared/hooks/useWizardForm";
import { useHoursExceptionSetters } from "./useHoursExceptionSetters";
import { useListingFormMissing } from "./useListingFormMissing";
import { useListingHoursSetters } from "./useListingHoursSetters";
import {
  witLine,
  type ListingDraft,
  type OwnerBadge,
  type ListingPath,
  type PhotoKey,
} from "./listBusiness.data";
import { blankDraft, type ListingSeed } from "./listingFormDraft";
import { useAccessibilitySetters } from "./useAccessibilitySetters";
import { useServiceSetters } from "./useServiceSetters";

export type { ListingSeed } from "./listingFormDraft";

/** All List-Your-Business wizard state + setters, shared by page and steps. */
export function useListingForm(initial?: ListingDraft, seed?: ListingSeed) {
  const [draft, setDraft] = useState<ListingDraft>(
    () => initial ?? blankDraft(seed),
  );

  // Display-only preview values (blob for uploads, URL for pastes). Kept OUT of
  // `draft`/`ListingDraft` on purpose: `CreateListingDto = ListingDraft` and the
  // whole draft is POSTed, so anything in it would leak to the API. Every
  // display site renders `photoPreviews[key] || draft.photos[key]`.
  const [photoPreviews, setPhotoPreviews] = useState<Record<PhotoKey, string>>({
    wide: "",
    d1: "",
    d2: "",
    vibe: "",
  });

  const setPhotoPreview = useCallback((key: PhotoKey, value: string) => {
    setPhotoPreviews((previews) => ({ ...previews, [key]: value }));
  }, []);

  // Dated overrides of the weekly grid live in their own hook: they are a
  // self-contained sub-editor, and keeping them here would bury the rest.
  const hoursExceptionSetters = useHoursExceptionSetters(setDraft);
  // Same reasoning for the two structured blocks and the weekly grid: each is
  // a self-contained sub-editor with its own merge rules, so its setters live
  // beside each other in their own module.
  const accessibilitySetters = useAccessibilitySetters(setDraft);
  const serviceSetters = useServiceSetters(setDraft);
  const hoursSetters = useListingHoursSetters(setDraft);

  /** Patch one or more top-level fields. */
  const set = useCallback((patch: Partial<ListingDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const reset = useCallback(
    (next?: ListingDraft) => {
      setDraft(next ?? blankDraft(seed));
      setPhotoPreviews({ wide: "", d1: "", d2: "", vibe: "" });
    },
    [seed],
  );

  const pickPath = useCallback((path: ListingPath) => {
    setDraft((d) => ({
      ...d,
      path,
      // sensible relationship default the member can change at step 4
      rel: d.rel || (path === "claim" ? "own" : "regular"),
    }));
  }, []);

  const toggleCat = useCallback((cat: string) => {
    setDraft((d) => {
      if (d.cats.includes(cat))
        return { ...d, cats: d.cats.filter((c) => c !== cat) };
      if (d.cats.length >= 2) return d; // cap at 2
      return { ...d, cats: [...d.cats, cat] };
    });
  }, []);

  const pickBadge = useCallback((badge: OwnerBadge) => {
    setDraft((d) => ({ ...d, badge }));
  }, []);

  const toggleIn = useCallback((key: "goodFor" | "langs", id: string) => {
    setDraft((d) => {
      const arr = d[key];
      return {
        ...d,
        [key]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id],
      };
    });
  }, []);

  /* what-it-is lines (1–4) */
  const setWit = useCallback((i: number, v: string) => {
    setDraft((d) => ({
      ...d,
      whatItIs: d.whatItIs.map((w, j) => (j === i ? { ...w, text: v } : w)),
    }));
  }, []);
  const addWit = useCallback(() => {
    setDraft((d) =>
      d.whatItIs.length >= 4
        ? d
        : { ...d, whatItIs: [...d.whatItIs, witLine()] },
    );
  }, []);
  const delWit = useCallback((i: number) => {
    setDraft((d) =>
      d.whatItIs.length <= 1
        ? { ...d, whatItIs: [witLine()] }
        : { ...d, whatItIs: d.whatItIs.filter((_, j) => j !== i) },
    );
  }, []);

  /* tags (≤6) */
  const addTag = useCallback((raw: string) => {
    const t = raw.trim();
    if (!t) return;
    setDraft((d) =>
      d.tags.length >= 6 || d.tags.includes(t)
        ? d
        : { ...d, tags: [...d.tags, t] },
    );
  }, []);
  const removeTag = useCallback((t: string) => {
    setDraft((d) => ({ ...d, tags: d.tags.filter((x) => x !== t) }));
  }, []);

  const setSocial = useCallback(
    (key: keyof ListingDraft["social"], v: string) => {
      setDraft((d) => ({ ...d, social: { ...d.social, [key]: v } }));
    },
    [],
  );
  const setPhoto = useCallback((key: PhotoKey, v: string) => {
    setDraft((d) => ({ ...d, photos: { ...d.photos, [key]: v } }));
  }, []);
  const setAlt = useCallback((key: PhotoKey, v: string) => {
    setDraft((d) => ({ ...d, alt: { ...d.alt, [key]: v } }));
  }, []);

  const missing = useListingFormMissing(draft);
  const canAdvance = useStepGate(missing);

  return {
    draft,
    photoPreviews,
    setPhotoPreview,
    set,
    reset,
    pickPath,
    toggleCat,
    pickBadge,
    toggleIn,
    setWit,
    addWit,
    delWit,
    addTag,
    removeTag,
    ...hoursSetters,
    ...accessibilitySetters,
    ...serviceSetters,
    ...hoursExceptionSetters,
    setSocial,
    setPhoto,
    setAlt,
    missing,
    canAdvance,
  };
}

export type ListingForm = ReturnType<typeof useListingForm>;
