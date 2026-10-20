import { useFormat } from "../../shared/i18n/format";

const DATE_FORMAT = {
  day: "numeric",
  month: "short",
  year: "numeric",
} as const;

/** The staff review cards' dates ("Oct 12, 2026" in the active locale), and
 *  an empty string when the date is missing. */
export function useReviewDate() {
  const format = useFormat();
  return (iso: string | null) =>
    iso ? format.date(new Date(iso), DATE_FORMAT) : "";
}
