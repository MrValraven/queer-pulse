import type { ReactNode, RefObject } from "react";
import { Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./DirectoryPage.module.css";

/**
 * The pieces a one-line card row (accessibility, who runs it) shares once
 * `useOneLineFit` has decided how many items show.
 *
 * The whole card is a router link, so nothing here may take focus or act as a
 * button. The "+N" chip is decorative (`aria-hidden`) and names the hidden
 * items in a hover tooltip; screen readers get those same items as visually
 * hidden list entries, so the list they hear is always complete.
 */

/** One item of a row: its stable slug (the list key) and its label. */
export interface DirectoryCardRowItem {
  slug: string;
  label: string;
}

/** The items that did not fit, kept in the list for screen readers only. */
export function DirectoryCardHiddenItems({
  items,
}: {
  items: DirectoryCardRowItem[];
}) {
  return items.map((item) => (
    <li key={item.slug} className="visuallyHidden">
      {item.label}
    </li>
  ));
}

/**
 * "+N" for the items that did not fit, with their names on hover. The bubble
 * is portaled (`floating-top`), so a clipping column around the card (the
 * listing editor's scrolling live preview) never cuts it off, and it keeps
 * inside the viewport at a screen edge.
 */
export function DirectoryCardMoreChip({
  hiddenItems,
}: {
  hiddenItems: DirectoryCardRowItem[];
}) {
  const { t } = useTranslation();
  if (hiddenItems.length === 0) return null;
  return (
    <li className={s.moreChip} aria-hidden>
      <Tooltip
        label={hiddenItems.map((item) => item.label).join(", ")}
        placement="floating-top"
      >
        <span>
          {t("marketing:directory.card.moreCount", {
            count: hiddenItems.length,
          })}
        </span>
      </Tooltip>
    </li>
  );
}

/**
 * The off-screen copy of a row that `useOneLineFit` measures: every item (each
 * child marks itself `data-fit-item`) and a "+N" sizer at the widest count the
 * row could need. It sits inside the row so the copies pick up the same type
 * and classes as the visible items, and its `<li>` clips it to an empty box so
 * the copies never add to a scroll area (the phone card rail, the page).
 */
export function DirectoryCardMeasureLayer({
  layerRef,
  itemCount,
  children,
}: {
  layerRef: RefObject<HTMLSpanElement | null>;
  itemCount: number;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <li className={s.fitMeasureClip} aria-hidden>
      <span ref={layerRef} className={s.fitMeasureLayer}>
        {children}
        <span className={s.moreChip} data-fit-more-chip="">
          {t("marketing:directory.card.moreCount", { count: itemCount })}
        </span>
      </span>
    </li>
  );
}
