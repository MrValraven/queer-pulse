import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { slugify } from "./poem/poemModel";
import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "./api/subprofiles.adapters";

export interface PoemDeepLink {
  /** The poem the reader is open on, or null when it's closed. */
  poemItem: SubprofileItemView | null;
  /** Open the reader on `item` and put `?poem=<slug>` in the URL. */
  openPoem: (item: SubprofileItemView) => void;
  /** Close the reader and drop the `?poem=` param. */
  closePoem: () => void;
}

/**
 * `?poem=<slug>` reader state for a persona page: the open poem, and the two
 * transitions that keep the modal and the URL in step.
 *
 * The param resolves against the poems section's items (both demo and live
 * share the same `sections` view, so there's no mock-only branch) on mount and
 * whenever it changes externally: initial load, back/forward, a pasted or
 * shared URL. A param that doesn't resolve to a poem is a silent no-op, never
 * a crash or an empty modal.
 *
 * Both callbacks are memoized, so handing `closePoem` straight to a modal
 * can't churn that modal's focus/keyboard setup on every parent render.
 */
export function usePoemDeepLink(
  sections: SubprofileSectionView[] | undefined,
): PoemDeepLink {
  const [poemItem, setPoemItem] = useState<SubprofileItemView | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const poemSlugParam = searchParams.get("poem");
  // The slug `openPoem` itself just set, so the resolve effect below can tell
  // "the param changed because we opened this exact item" apart from "the
  // param changed some other way". Without this, a title collision (two poems
  // slugify the same, realistic with no id: two "Untitled" poems) would have
  // the effect immediately re-resolve the just-set slug via first-match and
  // silently swap the reader to the WRONG same-titled poem right after
  // opening the second one.
  const internalSlugRef = useRef<string | null>(null);

  useEffect(() => {
    if (!poemSlugParam) return;
    if (internalSlugRef.current === poemSlugParam) return;
    const poemsSection = sections?.find(
      (section) => section.section === "poems",
    );
    if (!poemsSection) return;
    const targetSlug = poemSlugParam.toLowerCase();
    const matchedPoem = poemsSection.items.find(
      (item) => slugify(item.title) === targetSlug,
    );
    if (matchedPoem) setPoemItem(matchedPoem);
  }, [poemSlugParam, sections]);

  const openPoem = useCallback(
    (item: SubprofileItemView) => {
      const slug = slugify(item.title);
      internalSlugRef.current = slug;
      setPoemItem(item);
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set("poem", slug);
          return next;
        },
        // Replace, so the back button doesn't have to step through every poem
        // opened during the session.
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const closePoem = useCallback(() => {
    internalSlugRef.current = null;
    setPoemItem(null);
    // Clear the param alongside the reader, so the URL never points at a
    // closed reader.
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("poem");
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  return { poemItem, openPoem, closePoem };
}
