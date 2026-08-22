import { useMemo } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";

// 2024-01-01 was a Monday, and both availability grids are Monday-first.
const FIRST_MONDAY_UTC = Date.UTC(2024, 0, 1);
const DAY_MS = 86_400_000;

/**
 * Monday-first narrow weekday initials in the member's own language, e.g.
 * "S T Q Q S S D" in pt-PT.
 *
 * These render as visible text on the therapist availability grid (public
 * page) and again in its editor, where they used to come from a frozen
 * `["M","T","W","T","F","S","S"]` table: PT readers saw English initials on a
 * Portuguese page. `Intl` owns the answer for every language the app adds.
 */
export function useWeekdayLetters(): string[] {
  const { language } = useTranslation();
  return useMemo(() => {
    const formatter = new Intl.DateTimeFormat(language, {
      weekday: "narrow",
      timeZone: "UTC",
    });
    return Array.from({ length: 7 }, (_, index) =>
      formatter.format(new Date(FIRST_MONDAY_UTC + index * DAY_MS)),
    );
  }, [language]);
}
