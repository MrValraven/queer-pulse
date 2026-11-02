import { isUpcoming } from "../personaSkinRender";

/** How much of a calendar date a stored gig date pins down. `unknown` is
 *  free text that is not a date ("Sundays"), `none` is an empty string. */
export type GigDatePrecision = "day" | "month" | "year" | "unknown" | "none";

/** Everything a date block needs to render one stored gig date. */
export interface GigDateParts {
  precision: GigDatePrecision;
  /** Short uppercase month ("MAR"); "" for year precision, unknown and none. */
  monthLabel: string;
  /** Day of month ("14"); "" unless the precision is `day`. */
  dayLabel: string;
  /** Year when it differs from the current year, else the weekday (day
   *  precision). Month and year precision always show the year. */
  bottomLabel: string;
  /** The stored string, untouched. */
  rawText: string;
  /** The result of the shared `isUpcoming` rule the public stage page uses. */
  isUpcoming: boolean;
}

/** A calendar date read from stored text, built from local date parts. */
interface ParsedGigDate {
  precision: "day" | "month" | "year";
  date: Date;
}

const MILLISECONDS_PER_DAY = 86_400_000;
const COUNTDOWN_WINDOW_DAYS = 30;

const DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_PATTERN = /^(\d{4})-(\d{2})$/;
const YEAR_PATTERN = /^(\d{4})$/;
const DAY_FIRST_PATTERN =
  /^(\d{1,2})(?:st|nd|rd|th)?\s+([^\W\d_]+)\.?,?\s+(\d{4})$/u;
const MONTH_FIRST_PATTERN =
  /^([^\W\d_]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/u;
const MONTH_YEAR_PATTERN = /^([^\W\d_]+)\.?,?\s+(\d{4})$/u;
const FOUR_DIGIT_YEAR_PATTERN = /\d{4}/;

/** Month names (English and Portuguese, accents stripped) mapped to 0..11. */
const MONTH_INDEX_BY_NAME: Record<string, number> = buildMonthIndexByName();

function buildMonthIndexByName(): Record<string, number> {
  const namesByMonth: string[][] = [
    ["jan", "january", "janeiro"],
    ["feb", "fev", "february", "fevereiro"],
    ["mar", "march", "marco"],
    ["apr", "abr", "april", "abril"],
    ["may", "mai", "maio"],
    ["jun", "june", "junho"],
    ["jul", "july", "julho"],
    ["aug", "ago", "august", "agosto"],
    ["sep", "set", "sept", "september", "setembro"],
    ["oct", "out", "october", "outubro"],
    ["nov", "november", "novembro"],
    ["dec", "dez", "december", "dezembro"],
  ];
  const indexByName: Record<string, number> = {};
  namesByMonth.forEach((names, monthIndex) => {
    names.forEach((name) => {
      indexByName[name] = monthIndex;
    });
  });
  return indexByName;
}

/** Zero-padded two digits, for building `yyyy-mm-dd` strings. */
function padTwoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

/** Month index (0..11) for an English or Portuguese month name, or null. */
function monthIndexFromName(rawName: string): number | null {
  const normalizedName = rawName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return MONTH_INDEX_BY_NAME[normalizedName] ?? null;
}

/** A local-time date that survives the round trip, so "2027-02-31" comes back
 *  as null and never rolls over into March. */
function buildLocalDate(
  year: number,
  monthIndex: number,
  day: number,
): Date | null {
  if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) return null;
  const date = new Date(year, monthIndex, day);
  const isRealDate =
    date.getFullYear() === year &&
    date.getMonth() === monthIndex &&
    date.getDate() === day;
  return isRealDate ? date : null;
}

/** Reads a stored gig date into local date parts. Returns null for empty or
 *  unparseable text; never throws. */
function parseGigDate(rawDate: string): ParsedGigDate | null {
  const text = rawDate.trim();
  if (text === "") return null;

  const dayMatch = DAY_PATTERN.exec(text);
  if (dayMatch) {
    const date = buildLocalDate(
      Number(dayMatch[1]),
      Number(dayMatch[2]) - 1,
      Number(dayMatch[3]),
    );
    return date ? { precision: "day", date } : null;
  }
  const monthMatch = MONTH_PATTERN.exec(text);
  if (monthMatch) {
    const date = buildLocalDate(
      Number(monthMatch[1]),
      Number(monthMatch[2]) - 1,
      1,
    );
    return date ? { precision: "month", date } : null;
  }
  const yearMatch = YEAR_PATTERN.exec(text);
  if (yearMatch) {
    const date = buildLocalDate(Number(yearMatch[1]), 0, 1);
    return date ? { precision: "year", date } : null;
  }

  const dayFirstMatch = DAY_FIRST_PATTERN.exec(text);
  if (dayFirstMatch) {
    const monthIndex = monthIndexFromName(dayFirstMatch[2]!);
    const date =
      monthIndex === null
        ? null
        : buildLocalDate(
            Number(dayFirstMatch[3]),
            monthIndex,
            Number(dayFirstMatch[1]),
          );
    if (date) return { precision: "day", date };
  }
  const monthFirstMatch = MONTH_FIRST_PATTERN.exec(text);
  if (monthFirstMatch) {
    const monthIndex = monthIndexFromName(monthFirstMatch[1]!);
    const date =
      monthIndex === null
        ? null
        : buildLocalDate(
            Number(monthFirstMatch[3]),
            monthIndex,
            Number(monthFirstMatch[2]),
          );
    if (date) return { precision: "day", date };
  }
  const monthYearMatch = MONTH_YEAR_PATTERN.exec(text);
  if (monthYearMatch) {
    const monthIndex = monthIndexFromName(monthYearMatch[1]!);
    const date =
      monthIndex === null
        ? null
        : buildLocalDate(Number(monthYearMatch[2]), monthIndex, 1);
    if (date) return { precision: "month", date };
  }

  // Anything else the engine can read (a full ISO timestamp, "03/14/2027").
  // A year is required so "Mar 14" cannot silently become the year 2001.
  if (!FOUR_DIGIT_YEAR_PATTERN.test(text)) return null;
  const parsedTime = Date.parse(text);
  if (Number.isNaN(parsedTime)) return null;
  const parsedDate = new Date(parsedTime);
  const date = buildLocalDate(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate(),
  );
  return date ? { precision: "day", date } : null;
}

/** A BCP 47 tag `Intl` accepts, falling back to English for a bad tag. */
function safeLocale(language: string): string {
  try {
    return Intl.DateTimeFormat.supportedLocalesOf(language)[0] ?? "en";
  } catch {
    return "en";
  }
}

/**
 * Splits a stored gig date into the labels a date block shows. Legacy free
 * text ("14 Mar 2027", "Sep 2025", "2025") parses where possible. Text that is
 * not a date keeps precision `unknown` with `rawText` intact, an empty string
 * is `none`, and nothing here ever throws. `now` only decides which year is
 * "current" for the bottom label.
 */
export function gigDateParts(
  rawDate: string,
  language: string,
  now: Date = new Date(),
): GigDateParts {
  const rawText = rawDate;
  const isUpcomingDate = isUpcoming(rawDate);
  const emptyLabels = { monthLabel: "", dayLabel: "", bottomLabel: "" };
  if (rawDate.trim() === "") {
    return {
      precision: "none",
      ...emptyLabels,
      rawText,
      isUpcoming: isUpcomingDate,
    };
  }
  const parsed = parseGigDate(rawDate);
  if (!parsed) {
    return {
      precision: "unknown",
      ...emptyLabels,
      rawText,
      isUpcoming: isUpcomingDate,
    };
  }
  const locale = safeLocale(language);
  const { precision, date } = parsed;
  const yearLabel = String(date.getFullYear());
  const monthLabel =
    precision === "year"
      ? ""
      : new Intl.DateTimeFormat(locale, { month: "short" })
          .format(date)
          .replace(/\.$/, "")
          .toLocaleUpperCase(locale);
  if (precision !== "day") {
    return {
      precision,
      monthLabel,
      dayLabel: "",
      bottomLabel: yearLabel,
      rawText,
      isUpcoming: isUpcomingDate,
    };
  }
  const isCurrentYear = date.getFullYear() === now.getFullYear();
  const weekdayLabel = new Intl.DateTimeFormat(locale, {
    weekday: "short",
  })
    .format(date)
    .replace(/\.$/, "");
  return {
    precision,
    monthLabel,
    dayLabel: String(date.getDate()),
    bottomLabel: isCurrentYear ? weekdayLabel : yearLabel,
    rawText,
    isUpcoming: isUpcomingDate,
  };
}

/**
 * The `yyyy-mm-dd` value a day picker should open on, built from LOCAL date
 * parts. Returns "" for empty text, for text that is not a date, and for
 * month or year precision (a picker value would invent a day the stored text
 * never named), so the stored value is kept until a new day is picked.
 */
export function toGigDayValue(rawDate: string): string {
  const parsed = parseGigDate(rawDate);
  if (!parsed || parsed.precision !== "day") return "";
  const { date } = parsed;
  return `${date.getFullYear()}-${padTwoDigits(date.getMonth() + 1)}-${padTwoDigits(date.getDate())}`;
}

/**
 * Sort key in milliseconds (local midnight of the first day the text names),
 * or null when the text is empty or not a date. Month precision sorts at the
 * first of the month and year precision at the first of the year.
 */
export function gigSortTime(rawDate: string): number | null {
  const parsed = parseGigDate(rawDate);
  return parsed ? parsed.date.getTime() : null;
}

/** First letter upper-cased, for one-word relative labels ("Today"). */
function capitalizeSingleWord(text: string, locale: string): string {
  if (text.includes(" ") || text === "") return text;
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}

/**
 * "Today", "Tomorrow" or "in 3 days" for a day-precision gig that falls
 * between today and 30 days ahead, localized through `Intl.RelativeTimeFormat`.
 * Returns null for past gigs, gigs further out, and any date without a day.
 */
export function gigCountdown(
  rawDate: string,
  language: string,
  now: Date = new Date(),
): string | null {
  const parsed = parseGigDate(rawDate);
  if (!parsed || parsed.precision !== "day") return null;
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const daysAhead = Math.round(
    (parsed.date.getTime() - startOfToday.getTime()) / MILLISECONDS_PER_DAY,
  );
  if (daysAhead < 0 || daysAhead > COUNTDOWN_WINDOW_DAYS) return null;
  const locale = safeLocale(language);
  const label = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
  }).format(daysAhead, "day");
  return capitalizeSingleWord(label, locale);
}
