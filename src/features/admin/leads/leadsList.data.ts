import type { IconType } from "react-icons";
import { FiCalendar, FiClock, FiPlus } from "react-icons/fi";
import type { LeadRowFollowUpState } from "./leadRowDates";

/** Row-shaped placeholders while the first page of leads loads. */
export const LEAD_LIST_SKELETON_ROWS = [0, 1, 2, 3] as const;

/** The value of the stage chip that lifts the stage filter. */
export const ALL_STAGES_CHIP = "all";

/** The search params the list keeps its filters in. */
export const LEAD_LIST_PARAM = {
  query: "q",
  stage: "stage",
  type: "type",
  isDueOnly: "due",
  assignedTo: "assignedTo",
} as const;

/** `due=1` turns the due filter on; any other value reads as off. */
export const DUE_ONLY_PARAM_VALUE = "1";

/** The pause in typing before the search reaches the URL and the list. */
export const LEAD_SEARCH_DEBOUNCE_MS = 250;

/** How a follow-up day reads on a row: "30 Oct 2026". */
export const LEAD_FOLLOW_UP_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

/** How a day reads in a list cell this year: "Nov 8". */
export const LEAD_ROW_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};

/** How a day from another year reads in a list cell: "Nov 8, 2025". */
export const LEAD_ROW_DATE_WITH_YEAR_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

/** How many days back the Last activity column still reads as a span of
 *  time ("3 days ago"); anything older reads as its date. */
export const LEAD_ACTIVITY_RELATIVE_DAYS = 28;

/** The quick follow-up choices on a row, as days after today in Lisbon.
 *  Each key names its label under `admin:leads.quick.followUp.*`. */
export const LEAD_FOLLOW_UP_PRESETS = [
  { key: "tomorrow", days: 1 },
  { key: "inThreeDays", days: 3 },
  { key: "nextWeek", days: 7 },
  { key: "inTwoWeeks", days: 14 },
  { key: "inAMonth", days: 30 },
] as const;

/** The keys that work anywhere on the list page (not while typing). */
export const LEAD_LIST_SHORTCUT = {
  search: "/",
  add: "n",
} as const;

/** How long a quick change's toast keeps its Undo, in ms. */
export const LEAD_UNDO_TOAST_MS = 8000;

/** The icon before a row's follow-up, by where it stands. "Set follow-up"
 *  carries a plus, so it reads as an action; a closed lead's kept date keeps
 *  the calendar (dimmed) so its text lines up with the dates above it. */
export const LEAD_FOLLOW_UP_STATE_ICON: Record<LeadRowFollowUpState, IconType> =
  {
    none: FiPlus,
    overdue: FiClock,
    today: FiClock,
    upcoming: FiCalendar,
    closed: FiCalendar,
  };
