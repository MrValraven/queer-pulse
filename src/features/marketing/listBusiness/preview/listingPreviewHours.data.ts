import type { Language, TFunction } from "../../../../shared/i18n/types";
import { DAYS, formatDayHours, type DayHours } from "../listBusiness.data";

const HOURS = "marketing:listBusiness.livePreview.hours";

/** Languages that write weekday names in lowercase mid-sentence ("de
 *  segunda-feira a sexta-feira"). The line's first letter is capitalised
 *  afterwards, which leaves English unchanged. */
const LOWERCASE_WEEKDAY_LANGUAGES: ReadonlySet<Language> = new Set(["pt"]);

/** Days that share the exact same hours, in week order. */
interface HoursGroup {
  hoursLabel: string;
  dayIndexes: number[];
}

/**
 * The days of one group as short runs: a single day by name, two neighbours
 * as a pair, three or more in a row as a range ("Tuesday to Saturday"). A
 * group of exactly two days (contiguous or not) reads as a pair joined by a
 * translated "and" ("Saturday and Sunday"); three or more non-contiguous
 * days keep commas between them.
 */
function dayRunsLabel(
  dayIndexes: readonly number[],
  t: TFunction,
  language: Language,
): string {
  const isLowercase = LOWERCASE_WEEKDAY_LANGUAGES.has(language);
  const dayLabel = (dayIndex: number) => {
    const label = t(DAYS[dayIndex]?.labelKey ?? "");
    return isLowercase ? label.toLocaleLowerCase(language) : label;
  };

  if (dayIndexes.length === 2) {
    const [firstIndex, secondIndex] = dayIndexes;
    return t(`${HOURS}.pair`, {
      first: dayLabel(firstIndex ?? 0),
      second: dayLabel(secondIndex ?? 0),
    });
  }

  const runs: number[][] = [];
  dayIndexes.forEach((dayIndex) => {
    const currentRun = runs[runs.length - 1];
    const lastIndex = currentRun?.[currentRun.length - 1];
    if (currentRun && lastIndex === dayIndex - 1) currentRun.push(dayIndex);
    else runs.push([dayIndex]);
  });

  return runs
    .map((run) => {
      const firstIndex = run[0] ?? 0;
      const lastIndex = run[run.length - 1] ?? firstIndex;
      if (run.length >= 3) {
        return t(`${HOURS}.dayRange`, {
          from: dayLabel(firstIndex),
          to: dayLabel(lastIndex),
        });
      }
      return run.map(dayLabel).join(", ");
    })
    .join(", ");
}

/**
 * The week's hours as one compact, translated line for the preview excerpt:
 * days with identical hours are grouped, so "Monday to Friday: 09:00–18:00;
 * Saturday: 10:00–14:00". An open day with no times reads as closed, the way
 * the detail page's hours table treats it. Null when no day has hours.
 */
export function listingHoursSummary(
  hours: Record<string, DayHours>,
  t: TFunction,
  language: Language,
): string | null {
  const groups: HoursGroup[] = [];
  DAYS.forEach((day, dayIndex) => {
    const hoursLabel = formatDayHours(hours[day.id]);
    if (hoursLabel === null) return;
    const group = groups.find((entry) => entry.hoursLabel === hoursLabel);
    if (group) group.dayIndexes.push(dayIndex);
    else groups.push({ hoursLabel, dayIndexes: [dayIndex] });
  });
  if (groups.length === 0) return null;

  const line = groups
    .map((group) =>
      t(`${HOURS}.group`, {
        days: dayRunsLabel(group.dayIndexes, t, language),
        hours: group.hoursLabel,
      }),
    )
    .join("; ");
  return line.charAt(0).toLocaleUpperCase(language) + line.slice(1);
}
