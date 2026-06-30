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
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          className={[styles.tab, active === t.id && styles.tabOn]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {t.count != null && (
            <span className={styles.tabCount}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
