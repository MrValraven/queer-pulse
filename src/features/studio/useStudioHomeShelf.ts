import { useLayoutEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioShelfLayout } from "./kit/StudioShelf";

/** `?shelf=<key>` opens one home shelf as a full grid in place. */
export const STUDIO_HOME_SHELF_PARAM = "shelf";

export interface StudioHomeShelfView {
  layout: StudioShelfLayout;
  isExpanded: boolean;
  seeAllHref: string | undefined;
  seeAllLabel: string | undefined;
  /** Show less replaces the history entry: pass to StudioShelf. */
  seeAllReplace: boolean;
  /** The See all or Show less target, also while See all hides. */
  toggleHref: string;
  /** Put on an element wrapping the StudioShelf: it measures whether the
   *  row overflows. */
  attachFrame: (element: HTMLElement | null) => void;
}

/** Whether the shelf's row hides cards past its end. Read before paint and
 *  again whenever the row resizes or its items change. */
function useRowOverflow(
  frame: HTMLElement | null,
  isEnabled: boolean,
  itemCount: number,
): boolean {
  const [isOverflowing, setIsOverflowing] = useState(false);
  useLayoutEffect(() => {
    const list = frame?.querySelector("ul");
    if (!isEnabled || !list) return;
    const measure = () =>
      setIsOverflowing(list.scrollWidth > list.clientWidth + 1);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [frame, isEnabled, itemCount]);
  return isOverflowing;
}

/**
 * See all for a home shelf with no page of its own (Continue listening,
 * Staff picks, New this week, Local scenes, Artists): the link opens the
 * same shelf as a wrapping grid of every item, in place, and Show less
 * folds it back into its row, replacing the history entry so Back leaves
 * home as expected. The shelf stays mounted across the switch, so focus
 * stays on the link. See all shows only while the row hides cards. A
 * query-only change keeps the scroll position (ScrollManager).
 */
export function useStudioHomeShelf(
  shelfKey: string,
  itemCount: number,
): StudioHomeShelfView {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const isExpanded = searchParams.get(STUDIO_HOME_SHELF_PARAM) === shelfKey;
  const isOverflowing = useRowOverflow(frame, !isExpanded, itemCount);
  const nextParams = new URLSearchParams(searchParams);
  if (isExpanded) nextParams.delete(STUDIO_HOME_SHELF_PARAM);
  else nextParams.set(STUDIO_HOME_SHELF_PARAM, shelfKey);
  const query = nextParams.toString();
  const toggleHref = `${pathname}${query ? `?${query}` : ""}`;

  return {
    layout: isExpanded ? "grid" : "row",
    isExpanded,
    seeAllHref: isExpanded || isOverflowing ? toggleHref : undefined,
    seeAllLabel: isExpanded ? t("studio:home.shelf.showLess") : undefined,
    seeAllReplace: isExpanded,
    toggleHref,
    attachFrame: setFrame,
  };
}
