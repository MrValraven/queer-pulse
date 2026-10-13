import { useFormat } from "../../shared/i18n/format";

/**
 * A euro amount in the active locale ("€5" in EN, "5 €" in PT), through the
 * same `fmt.currency` the tip buttons use. Whole euros drop the cents; a
 * fraction keeps at least the cents and up to four places, so per-play rates
 * like 0.003 survive. `isCompact` shortens big figures ("€11.4K" / "11,4 mil €").
 * `shouldEmphasizeNumber` wraps the figure in `<em>` and leaves the euro
 * mark outside it, on whichever side the locale puts it ("€<em>0.80</em>" /
 * "<em>0,80</em> €").
 */
export function StudioEuroAmount({
  value,
  isCompact = false,
  shouldEmphasizeNumber = false,
}: {
  value: number;
  isCompact?: boolean;
  shouldEmphasizeNumber?: boolean;
}) {
  const fmt = useFormat();
  const isWholeEuros = Number.isInteger(value);
  const options: Intl.NumberFormatOptions = isCompact
    ? { notation: "compact", maximumFractionDigits: 1 }
    : {
        minimumFractionDigits: isWholeEuros ? 0 : 2,
        maximumFractionDigits: isWholeEuros ? 0 : 4,
      };
  const formatted = fmt.currency(value, "EUR", options);
  const euroMarkIndex = formatted.indexOf("€");
  if (!shouldEmphasizeNumber || euroMarkIndex < 0) return <>{formatted}</>;
  if (euroMarkIndex === 0) {
    return (
      <>
        €<em>{formatted.slice(1)}</em>
      </>
    );
  }
  const figure = formatted.slice(0, euroMarkIndex).trimEnd();
  return (
    <>
      <em>{figure}</em>
      {formatted.slice(figure.length)}
    </>
  );
}
