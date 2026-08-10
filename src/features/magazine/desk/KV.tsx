import styles from "./pieceTabs.module.css";

export interface KVProps {
  label: string;
  value: string;
  warn?: boolean;
}

/**
 * A single key/value row for the piece-record tabs (Brief, Money). Shared so
 * `BriefTab` and `MoneyTab` don't each hand-roll the same markup.
 */
export function KV({ label, value, warn }: KVProps) {
  return (
    <div className={styles.kv}>
      <span>{label}</span>
      <b className={warn ? styles.warn : undefined}>{value}</b>
    </div>
  );
}
