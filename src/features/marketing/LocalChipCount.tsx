import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import s from "./LocalFilterBar.module.css";

/**
 * The live count a filter chip ends with: how many places the visitor would
 * see with that chip on. The digits roll as the other filters change.
 * Hidden from assistive tech, so each chip is still announced by its name and
 * pressed state alone. A count that is not known (still loading, failed, or
 * over part of the set) draws nothing, never a 0.
 */
export function LocalChipCount({ count }: { count: number | undefined }) {
  const fmt = useFormat();
  if (count === undefined) return null;
  return (
    <span className={s.count} aria-hidden>
      <RollingNumber value={fmt.number(count)} numericValue={count} />
    </span>
  );
}
