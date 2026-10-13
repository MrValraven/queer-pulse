import { useFormat } from "../../shared/i18n/format";

/** Whole digits after the last group separator ("400" in "36,400"). */
const LAST_GROUP_LENGTH = 3;

/**
 * A plain count in the active locale ("36,400" in EN, "36 400" in PT), for
 * static demo data that cannot call `useFormat` itself. `isCompact` shortens
 * big figures with the locale's own notation ("142K" / "142 mil").
 * `shouldEmphasizeLastGroup` wraps the trailing three digits of a whole
 * number in `<em>`, the big-stat look ("36,<em>400</em>").
 */
export function StudioNumber({
  value,
  isCompact = false,
  shouldEmphasizeLastGroup = false,
}: {
  value: number;
  isCompact?: boolean;
  shouldEmphasizeLastGroup?: boolean;
}) {
  const fmt = useFormat();
  const formatted = fmt.number(
    value,
    isCompact ? { notation: "compact", maximumFractionDigits: 1 } : undefined,
  );
  if (!shouldEmphasizeLastGroup || formatted.length <= LAST_GROUP_LENGTH) {
    return <>{formatted}</>;
  }
  const splitIndex = formatted.length - LAST_GROUP_LENGTH;
  return (
    <>
      {formatted.slice(0, splitIndex)}
      <em>{formatted.slice(splitIndex)}</em>
    </>
  );
}
