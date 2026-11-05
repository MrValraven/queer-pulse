import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  /** Every poem in page order: the featured poem first (its Spotlight sits
   *  above the section), then the poems section's rows as listed. */
  poems: SubprofileItemView[];
  /** Where the open poem sits in `poems`, or -1 when the reader is closed. */
  poemIndex: number;
  /** Swap the reader to `poems[index]` and replace `?poem=` in place, so Back
   *  still closes the reader. An index outside the list is a no-op. */
  goTo: (index: number) => void;
}

/** The poems in the order a reader meets them on the page. */
function orderPoems(
  sections: SubprofileSectionView[] | undefined,
): SubprofileItemView[] {
  const poemsSection = sections?.find((section) => section.section === "poems");
  if (!poemsSection) return [];
  const featuredPoem = poemsSection.items.find((item) => item.isFeatured);
  if (!featuredPoem) return poemsSection.items;
  return [
    featuredPoem,
    ...poemsSection.items.filter((item) => item !== featuredPoem),
  ];
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- URL deep-link listener: resolves an externally-changed `?poem=` param (mount, back/forward, pasted link) against loaded sections, not a value derivable from props/state alone
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

  const poems = useMemo(() => orderPoems(sections), [sections]);
  // Identity first; the id match covers a refetch that rebuilt the items.
  const poemIndex = poemItem
    ? poems.includes(poemItem)
      ? poems.indexOf(poemItem)
      : poems.findIndex((item) => item.id === poemItem.id)
    : -1;

  const goTo = useCallback(
    (index: number) => {
      const targetPoem = poems[index];
      if (targetPoem) openPoem(targetPoem);
    },
    [poems, openPoem],
  );

  return { poemItem, openPoem, closePoem, poems, poemIndex, goTo };
}
