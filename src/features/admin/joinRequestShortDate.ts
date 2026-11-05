import { useFormat } from "../../shared/i18n/format";

/**
 * "20 Jun 2026" in the app language: the absolute date a join-request row is
 * read for (applied, decided, welcome email last sent). Its spaces are
 * non-breaking so a narrow row wraps between words of the sentence and keeps
 * each date whole. The formatter returns null for a missing or unreadable
 * timestamp.
 */
export function useJoinRequestShortDate(): (
  value: string | null,
) => string | null {
  const format = useFormat();
  return (value) => {
    if (!value) return null;
    const at = new Date(value);
    if (Number.isNaN(at.getTime())) return null;
    return format
      .date(at, { day: "numeric", month: "short", year: "numeric" })
      .replace(/ /g, " ");
  };
}
