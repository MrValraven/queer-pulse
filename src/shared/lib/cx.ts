/**
 * Joins truthy class names into a single `className` string, dropping any
 * `false`/`null`/`undefined` entries produced by conditional expressions
 * (`condition && styles.active`). The canonical replacement for the tiny local
 * `cx` helper that was copy-pasted into ~9 magazine files, each an identical
 * one-liner.
 *
 * Import by relative path, matching the rest of `shared/lib`
 * (e.g. `import { cx } from "../../shared/lib/cx"`). There is no barrel here.
 */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
