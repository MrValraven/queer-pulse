import type { Formatters } from "../../../shared/i18n/format";
import { formatDate, formatRelative } from "../../../shared/lib/date";
import { OPEN_LEAD_STAGES, type LeadStage } from "./api/leads.types";
import { lisbonLeadDay } from "./leadDates";
import {
  LEAD_ACTIVITY_RELATIVE_DAYS,
  LEAD_ROW_DATE_OPTIONS,
  LEAD_ROW_DATE_WITH_YEAR_OPTIONS,
} from "./leadsList.data";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Where a row's follow-up stands against today in Lisbon: none set, due
 *  before today, due today, still to come, or kept on a closed lead. */
export type LeadRowFollowUpState =
  "none" | "overdue" | "today" | "upcoming" | "closed";

/** Reads a row's follow-up day against `today` (both `YYYY-MM-DD`). A day
 *  counts as due only while the lead sits in an open stage. */
export function leadRowFollowUpState(
  stage: LeadStage,
  followUpOn: string | null,
  today: string,
): LeadRowFollowUpState {
  if (followUpOn === null) return "none";
  const isOpenStage = (OPEN_LEAD_STAGES as readonly LeadStage[]).includes(
    stage,
  );
  if (!isOpenStage) return "closed";
  if (followUpOn < today) return "overdue";
  if (followUpOn === today) return "today";
  return "upcoming";
}

/** A `YYYY-MM-DD` day in a list cell: "Nov 8" this year (in Lisbon), with
 *  the year once it falls in another one. */
export function leadRowDay(day: string, today: string, language: string) {
  const isThisYear = day.slice(0, 4) === today.slice(0, 4);
  return formatDate(
    day,
    language,
    isThisYear ? LEAD_ROW_DATE_OPTIONS : LEAD_ROW_DATE_WITH_YEAR_OPTIONS,
  );
}

/** When a lead last moved: "3 days ago" over the recent weeks, and the
 *  day itself once it is older ("Sep 2"). */
export function leadActivityText(
  lastEntryAt: string,
  today: string,
  language: string,
  formatters: Formatters,
  now: number = Date.now(),
): string {
  const then = new Date(lastEntryAt).getTime();
  if (Number.isNaN(then)) return "";
  if (now - then < LEAD_ACTIVITY_RELATIVE_DAYS * DAY_MS) {
    return formatRelative(lastEntryAt, formatters);
  }
  return leadRowDay(lisbonLeadDay(new Date(then)), today, language);
}
