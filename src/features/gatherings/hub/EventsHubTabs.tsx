import { useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { HUB_TABS } from "./hub.data";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { usePrefersReducedMotion } from "../../../shared/hooks";
import type { HubView } from "./useEventsHubView";
import styles from "./EventsHubTabs.module.css";

/** Stable panel id per view — the parent shell should set this as the `id`
 * on whichever view it renders so `aria-controls` resolves to something real. */
function hubPanelId(view: HubView): string {
  return `events-hub-panel-${view}`;
}

/**
 * APG tablist for the Events Hub (Highlights · Browse · Calendar). Roving
 * tabindex + Left/Right/Home/End move focus AND selection (automatic
 * activation); Enter/Space also work because these are real `<button>`s, so
 * the browser fires a click on them natively — no extra key handling needed.
 * The active pill is a single element that FLIPs (transform-only) between
 * tab positions/widths, so the moving indicator never animates a layout
 * property.
 *
 * It renders inline in the `/events` header row (after the My events |
 * Discover switch, before the Host action), so it is a bare tablist with no
 * bar of its own. It used to be a sticky full-bleed bar under the hero.
 */
export function EventsHubTabs({
  active,
  onChange,
}: {
  active: HubView;
  onChange: (key: HubView) => void;
}) {
  const { t } = useTranslation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const previousRectRef = useRef<{ start: number; size: number } | null>(null);

  const activeIndex = HUB_TABS.findIndex((tab) => tab.key === active);

  // FLIP the active pill onto the newly-selected tab: place it at its real
  // (Last) position/size instantly, then invert it back to the previous
  // (First) position/size with a transform and let the transition play the
  // transform back to none — only `transform` ever animates.
  useLayoutEffect(() => {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    const node = tabRefs.current[activeIndex];
    if (!list || !indicator || !node) return;

    const listRect = list.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const nextRect = {
      start: nodeRect.left - listRect.left,
      size: nodeRect.width,
    };

    indicator.style.transition = "none";
    indicator.style.insetInlineStart = `${nextRect.start}px`;
    indicator.style.inlineSize = `${nextRect.size}px`;

    const previousRect = previousRectRef.current;
    if (previousRect && !prefersReducedMotion) {
      const deltaX = previousRect.start - nextRect.start;
      const scaleX = previousRect.size / nextRect.size;
      indicator.style.transform = `translateX(${deltaX}px) scaleX(${scaleX})`;
      // Force a reflow so the browser registers the inverted transform
      // before the transition below is re-enabled and eases it to none.
      indicator.getBoundingClientRect();
      indicator.style.transition = "";
      indicator.style.transform = "none";
    } else {
      indicator.style.transform = "none";
    }

    previousRectRef.current = nextRect;
  }, [activeIndex, prefersReducedMotion]);

  const moveTo = (index: number) => {
    const nextIndex = (index + HUB_TABS.length) % HUB_TABS.length;
    const nextTab = HUB_TABS[nextIndex];
    if (!nextTab) return;
    onChange(nextTab.key);
    tabRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        moveTo(index + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        moveTo(index - 1);
        break;
      case "Home":
        event.preventDefault();
        moveTo(0);
        break;
      case "End":
        event.preventDefault();
        moveTo(HUB_TABS.length - 1);
        break;
    }
  };

  return (
    <div
      className={styles.list}
      role="tablist"
      ref={listRef}
      aria-label={t("gatherings:hub.tabs.ariaLabel")}
    >
      <span
        ref={indicatorRef}
        className={styles.indicator}
        aria-hidden="true"
      />
      {HUB_TABS.map((tab, index) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`events-hub-tab-${tab.key}`}
            aria-selected={isActive}
            aria-controls={hubPanelId(tab.key)}
            tabIndex={isActive ? 0 : -1}
            className={[styles.tab, isActive && styles.tabOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(tab.key)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {t(tab.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
