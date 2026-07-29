import { useRef, type KeyboardEvent } from "react";
import styles from "./Tabs.module.css";

export interface Tab {
  id: string;
  label: string;
  count?: number;
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
  className,
}: {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  variant?: "pill" | "underline";
  tint?: "light" | "dark";
  className?: string;
}) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // APG tablist keyboard contract (automatic activation): roving tabIndex plus
  // Arrow/Home/End move focus AND select, so keyboard users can traverse tabs.
  const moveTo = (index: number) => {
    const nextIndex = (index + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    if (!nextTab) return;
    onChange(nextTab.id);
    tabRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
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
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="tablist"
    >
      {tabs.map((tab, index) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={[styles.tab, isActive && styles.tabOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
            {tab.count != null && (
              <span className={styles.tabCount}>{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
