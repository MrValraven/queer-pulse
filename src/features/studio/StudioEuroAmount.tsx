import { useFormat } from "../../shared/i18n/format";

/**
 * A euro amount in the active locale ("€5" in EN, "5 €" in PT), through the
 * same `fmt.currency` the tip buttons use. Whole euros drop the cents; a
 * fraction keeps at least the cents and up to four places, so per-play rates
 * like 0.003 survive. `isCompact` shortens big figures ("€11.4K" / "11,4 mil €").
 */
export function StudioEuroAmount({
  value,
  isCompact = false,
}: {
  value: number;
  isCompact?: boolean;
}) {
  const fmt = useFormat();
  const isWholeEuros = Number.isInteger(value);
  const options: Intl.NumberFormatOptions = isCompact
    ? { notation: "compact", maximumFractionDigits: 1 }
    : {
        minimumFractionDigits: isWholeEuros ? 0 : 2,
        maximumFractionDigits: isWholeEuros ? 0 : 4,
      };
  return <>{fmt.currency(value, "EUR", options)}</>;
}
