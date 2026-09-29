import tabStyles from "./pieceTabs.module.css";
import styles from "./KV.module.css";

export interface KVProps {
  label: string;
  value: string;
  warn?: boolean;
}

/**
 * A single key/value row for the piece-record tabs (Brief, Money). Shared so
 * `BriefTab` and `MoneyTab` don't each hand-roll the same markup.
 *
 * The base row layout stays `pieceTabs.module.css`'s `.kv`; `warn` uses this
 * component's own small stylesheet instead of that file's `.warn` (the
 * shared rule painted coral, the Write button's colour, as a warning).
 */
export function KV({ label, value, warn }: KVProps) {
  return (
    <div className={tabStyles.kv}>
      <span>{label}</span>
      <b className={warn ? styles.warn : undefined}>{value}</b>
    </div>
  );
}
