import styles from "./MyEvents.module.css";

/**
 * The CSS module keeps the prototype's kebab-case class names. `sx` maps a
 * space-separated list of those names to their scoped equivalents, so JSX can
 * read like the original markup: `className={sx('ev-card hosting')}`.
 */
export function sx(names: string): string {
  return names
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => styles[n] ?? "")
    .filter(Boolean)
    .join(" ");
}

export { styles };
