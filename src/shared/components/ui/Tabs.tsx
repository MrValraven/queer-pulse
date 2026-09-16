import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { useTranslation } from "../../i18n/useTranslation";
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

/**
 * Tab row with `role="tablist"` semantics and optional count badges.
 * `variant="pill"` (default) is the filled-pill style; `variant="underline"`
 * is the bottom-border style. Use `tint="dark"` for underline tabs on a
 * dark/plum hero.
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
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const fallbackId = useId();
  const prefix = idPrefix ?? fallbackId;

  // APG tablist keyboard contract (automatic activation): roving tabIndex plus
  // Arrow/Home/End move focus AND select, so keyboard users can traverse tabs.
  const moveTo = (index: number) => {
    const nextIndex = (index + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    if (!nextTab) return;
    onChange(nextTab.id);
    tabRefs.current[nextIndex]?.focus();
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
        variant === "underline" && styles.underline,
        tint === "dark" && styles.dark,
        density === "compact" && styles.compact,
        shouldAlignIconTabsEnd && styles.iconsEnd,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
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
              <span className={styles.tabCount}>{tab.count}</span>
            ) : null}
            {isIconOnly && (
              <span role="tooltip" aria-hidden className={styles.tabTip}>
                {tab.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
