import {
  useId,
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useFormat } from "../../i18n/format";
import { useTranslation } from "../../i18n/useTranslation";
import { RollingNumber } from "./RollingNumber";
import styles from "./Tabs.module.css";
import { tabIds } from "./tabIds";

export interface Tab {
  id: string;
  label: string;
  /** Badge beside the label (corner badge on an icon-only tab). A count of 0
   *  draws nothing: a filter reading "0" is noise, and every caller that
   *  already writes `count || undefined` was working around this. */
  count?: number;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** With `icon`, renders the tab as an icon-only square pill: `label` stops
   *  being drawn and becomes the tab's accessible name plus the text of a
   *  tooltip revealed on hover/focus. For filter rows that must fit one line
   *  (the messages inbox) — never for a tab whose icon isn't self-evident. */
  hideLabel?: boolean;
}

type IndicatorPlacement = {
  tabId: string;
  left: number;
  bottomEdge: number;
  width: number;
};

/**
 * Fractional geometry of a tab in its tablist's padding-box coordinates, the
 * box the absolute indicator is laid out in. Integer offset* values left the
 * line up to a pixel short of the tab's real bottom edge, a visible gap on a
 * high-density screen. Bounding rects come back in zoomed screen pixels on a
 * CSS-zoomed (or scaled) preview page, so they are scaled back by the ratio
 * of the tablist's layout width to its rendered width. The border is
 * subtracted and the scroll offset added, so the line still sits under its
 * tab inside a scrolled row.
 */
function measureTabInTablist(
  tabButton: HTMLElement,
  tablist: HTMLElement,
): Omit<IndicatorPlacement, "tabId"> {
  const tablistRect = tablist.getBoundingClientRect();
  const buttonRect = tabButton.getBoundingClientRect();
  const zoomScale =
    tablistRect.width > 0 ? tablist.offsetWidth / tablistRect.width : 1;
  return {
    left:
      (buttonRect.left - tablistRect.left) * zoomScale -
      tablist.clientLeft +
      tablist.scrollLeft,
    bottomEdge:
      (buttonRect.bottom - tablistRect.top) * zoomScale -
      tablist.clientTop +
      tablist.scrollTop,
    width: buttonRect.width * zoomScale,
  };
}

/**
 * Underline variant: one indicator shared by every tab glides to each newly
 * selected tab. The ResizeObserver keeps it glued to the tab when geometry
 * changes later: a web font landing, a count badge rolling, a label swap, the
 * row wrapping at a new container width.
 */
function useSlidingIndicator({
  isUnderline,
  tabRefs,
  activeIndex,
  activeTabId,
  tabIdsKey,
}: {
  isUnderline: boolean;
  tabRefs: RefObject<(HTMLButtonElement | null)[]>;
  activeIndex: number;
  activeTabId: string | null;
  /** Changes whenever the set of tab buttons does, so new ones get observed. */
  tabIdsKey: string;
}) {
  const tablistRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  // Where the underline indicator was last put, and for which tab. Lets the
  // placement below tell a switch to another tab (which may glide) from a
  // re-measure of the same tab (which snaps).
  const placedIndicatorRef = useRef<IndicatorPlacement | null>(null);

  useLayoutEffect(() => {
    const tablist = tablistRef.current;
    const indicator = indicatorRef.current;
    if (!isUnderline || !tablist || !indicator || activeTabId === null) {
      placedIndicatorRef.current = null;
      return;
    }

    // Only a switch to another tab on the same row glides. Everything else
    // snaps: the first placement (so the line never slides in from the row's
    // start), a re-measure of the same tab, and a switch across wrapped rows,
    // where moving x and y together would drag the line diagonally through
    // the labels between. A snap drops `data-glide` and flushes the new
    // position into the computed style, so the next glide starts from it.
    const placeIndicator = () => {
      const activeButton = tabRefs.current[activeIndex];
      if (!activeButton) return;
      const position = {
        tabId: activeTabId,
        ...measureTabInTablist(activeButton, tablist),
      };
      const placed = placedIndicatorRef.current;
      const isUnchanged =
        placed !== null &&
        placed.tabId === position.tabId &&
        Math.abs(placed.left - position.left) < 0.01 &&
        Math.abs(placed.bottomEdge - position.bottomEdge) < 0.01 &&
        Math.abs(placed.width - position.width) < 0.01;
      // Also what keeps the observer's first callback from cutting a glide
      // short: it re-measures the tab the glide is already heading for.
      if (isUnchanged) return;
      const shouldGlide =
        placed !== null &&
        placed.tabId !== position.tabId &&
        Math.abs(placed.bottomEdge - position.bottomEdge) < 1;
      if (shouldGlide) {
        indicator.dataset.glide = "true";
      } else {
        delete indicator.dataset.glide;
      }
      indicator.style.setProperty("--indicator-x", `${position.left}px`);
      indicator.style.setProperty("--indicator-y", `${position.bottomEdge}px`);
      indicator.style.setProperty("--indicator-w", `${position.width}px`);
      if (!shouldGlide) indicator.getBoundingClientRect();
      placedIndicatorRef.current = position;
    };
    placeIndicator();

    if (typeof ResizeObserver === "undefined") return;
    const resizeObserver = new ResizeObserver(placeIndicator);
    resizeObserver.observe(tablist);
    // A removed tab's ref slot is reset to null, so this observes exactly
    // the buttons on screen.
    for (const tabButton of tabRefs.current) {
      if (tabButton) resizeObserver.observe(tabButton);
    }
    return () => resizeObserver.disconnect();
  }, [isUnderline, tabRefs, activeIndex, activeTabId, tabIdsKey]);

  return { tablistRef, indicatorRef };
}

/**
 * Tab row with `role="tablist"` semantics and optional count badges.
 * `variant="pill"` (default) is the filled-pill style; `variant="underline"`
 * marks the active tab with a line that slides between tabs. Use
 * `tint="dark"` for underline tabs on a dark/plum hero.
 */
export function Tabs({
  tabs,
  active,
  onChange,
  variant = "pill",
  tint = "light",
  density = "default",
  shouldAlignIconTabsEnd = false,
  className,
  idPrefix,
  label,
}: {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  variant?: "pill" | "underline";
  tint?: "light" | "dark";
  /** `"compact"` tightens the pills and the gap between them, for a row that
   *  has to fit more filters than its column has room for (the messages
   *  inbox). Pill variant only. */
  density?: "default" | "compact";
  /** Pushes a trailing run of icon-only tabs to the row's far edge, so the row
   *  reads as "filters left, utilities right" (the messages inbox). The row
   *  then spans its container instead of shrinking to its tabs. Pill variant
   *  only. */
  shouldAlignIconTabsEnd?: boolean;
  className?: string;
  /** Share this with `tabPanelProps` so each tab points at its own panel.
   *  Omit it and the tabs still get ids, they just control nothing. */
  idPrefix?: string;
  /** Accessible name for the tablist itself, e.g. "Filter members". */
  label?: string;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const fallbackId = useId();
  const prefix = idPrefix ?? fallbackId;
  const isUnderline = variant === "underline";
  const activeIndex = tabs.findIndex((tab) => tab.id === active);
  const activeTabId = activeIndex >= 0 ? active : null;
  // A stable dependency for "the set of tab buttons changed": callers rebuild
  // the `tabs` array every render, so the array itself would re-run the effect.
  const tabIdsKey = tabs.map((tab) => tab.id).join("\n");

  const { tablistRef, indicatorRef } = useSlidingIndicator({
    isUnderline,
    tabRefs,
    activeIndex,
    activeTabId,
    tabIdsKey,
  });

  // APG tablist keyboard contract (automatic activation): roving tabIndex plus
  // Arrow/Home/End move focus AND select, so keyboard users can traverse tabs.
  const moveTo = (index: number) => {
    const nextIndex = (index + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    if (!nextTab) return;
    onChange(nextTab.id);
    const nextButton = tabRefs.current[nextIndex];
    nextButton?.focus();
    // focus() only scrolls a tab that is fully out of view, so in a scrolling
    // row a tab peeking in from the edge would take focus with its ring
    // hidden. "nearest" leaves an already visible tab where it is.
    nextButton?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        moveTo(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        moveTo(index - 1);
        break;
      case "Home":
        event.preventDefault();
        moveTo(0);
        break;
      case "End":
        event.preventDefault();
        moveTo(tabs.length - 1);
        break;
    }
  };

  return (
    <div
      className={[
        styles.tabs,
        isUnderline && styles.underline,
        tint === "dark" && styles.dark,
        density === "compact" && styles.compact,
        shouldAlignIconTabsEnd && styles.iconsEnd,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      ref={tablistRef}
      role="tablist"
      aria-label={label}
    >
      {tabs.map((tab, index) => {
        const isActive = active === tab.id;
        const isIconOnly = tab.hideLabel === true && tab.icon != null;
        const ids = tabIds(prefix, tab.id);
        return (
          <button
            key={tab.id}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={ids.tab}
            // Only when the caller opted in with `idPrefix`, which is the
            // signal that it renders the matching `tabPanelProps` region. An
            // `aria-controls` pointing at an id that is not in the document is
            // invalid ARIA (axe `aria-valid-attr-value`), so a caller that has
            // not adopted the panel half gets today's behaviour unchanged.
            aria-controls={idPrefix ? ids.panel : undefined}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={[
              styles.tab,
              isActive && styles.tabOn,
              isIconOnly && styles.tabIcon,
            ]
              .filter(Boolean)
              .join(" ")}
            // Icon-only: the glyph carries no text, so the label becomes the
            // accessible name (the tooltip below it is decorative), and
            // when the tab also carries a count, the count rides along in
            // the name too (DES-191). `aria-label` replaces an element's
            // whole accessible-text subtree, so without this the visible
            // `.tabCount` badge below is drawn on screen but never reaches a
            // screen reader: a blind member hears "Requests" and never "3".
            aria-label={
              isIconOnly
                ? tab.count
                  ? t("shared:tabs.labelWithCount", {
                      label: tab.label,
                      count: tab.count,
                    })
                  : tab.label
                : undefined
            }
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.icon}
            {!isIconOnly && tab.label}
            {tab.count ? (
              <span className={styles.tabCount}>
                <RollingNumber
                  value={fmt.number(tab.count)}
                  numericValue={tab.count}
                />
              </span>
            ) : null}
            {isIconOnly && (
              <span role="tooltip" aria-hidden className={styles.tabTip}>
                {tab.label}
              </span>
            )}
          </button>
        );
      })}
      {/* Decorative: a tablist may only own role="tab" children, so the
          indicator is taken out of the accessibility tree entirely. */}
      {isUnderline && (
        <span
          ref={indicatorRef}
          role="presentation"
          aria-hidden
          hidden={activeIndex < 0}
          className={styles.indicator}
        />
      )}
    </div>
  );
}
