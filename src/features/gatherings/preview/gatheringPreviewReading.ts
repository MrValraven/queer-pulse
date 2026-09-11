import type { IconType } from "react-icons";
import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import {
  CADENCE_OPTIONS,
  hoodLabelKey,
  langLabelKey,
} from "../createGathering.data";
import {
  findFamily,
  findFormat,
  OTHER_FORMAT_ICON,
  OTHER_FORMAT_KEY,
  OTHER_FORMAT_NAME_KEY,
} from "../gatheringCatalog";
import {
  COST_KIND_LABEL_KEYS,
  RSVP_CUTOFF_LABEL_KEYS,
  RSVP_QUESTION_KEYS,
  rsvpClosesAt,
} from "../gatheringExtras";
import { gatheringWhen } from "../gatheringSchedule";
import { scheduleInstants } from "../steps/schedulePair";
import type { GatheringForm } from "../useGatheringForm";
import {
  PREVIEW_CLOSES_OPTIONS,
  PREVIEW_DAY_OPTIONS,
  PREVIEW_LANGUAGE_LABEL_KEYS,
  PREVIEW_MONTH_OPTIONS,
  PREVIEW_RANGE_OPTIONS,
  PREVIEW_WEEKDAY_OPTIONS,
  RSVP_QUESTION_CHIP_KEYS,
} from "./gatheringPreview.data";

/**
 * Pure readings of the form for the preview card: each one turns form state
 * into the text a line of the card shows, or null when the line has nothing
 * to say yet and the card shows its placeholder instead.
 */

/** The neighbourhood value the payload builder treats as an online gathering. */
const ONLINE_HOOD = "Online";

export function isOnlineGathering(form: GatheringForm): boolean {
  return form.hood === ONLINE_HOOD;
}

/** The format chip: the catalog icon and name, or null before a pick. */
export function previewKind(
  form: GatheringForm,
  t: TFunction,
): { icon: IconType | undefined; label: string | null } {
  const familyEntry = findFamily(form.family);
  if (form.format === OTHER_FORMAT_KEY) {
    return {
      icon: OTHER_FORMAT_ICON,
      label: form.otherText.trim() || t(OTHER_FORMAT_NAME_KEY),
    };
  }
  const formatEntry = findFormat(form.format);
  if (formatEntry) {
    return { icon: formatEntry.icon, label: t(formatEntry.nameKey) };
  }
  if (familyEntry) {
    return { icon: familyEntry.icon, label: t(familyEntry.nameKey) };
  }
  return { icon: undefined, label: null };
}

/** An `"HH:MM"` clock on its own, in the reader's locale, or null. */
function clockText(time: string, fmt: Formatters): string | null {
  const clockParts = /^(\d{2}):(\d{2})/.exec(time);
  if (!clockParts) return null;
  const instant = new Date(
    2000,
    0,
    1,
    Number(clockParts[1]!),
    Number(clockParts[2]!),
  );
  return fmt.time(instant);
}

/** The clock line before a date exists: the start, and the end when set. */
function undatedTimeText(
  form: GatheringForm,
  fmt: Formatters,
  t: TFunction,
): string | null {
  const start = clockText(form.time, fmt);
  const end = clockText(form.endTime, fmt);
  if (start && end) return t("gatherings:common.timeRange", { start, end });
  return start;
}

export interface PreviewSchedule {
  /** The big day number, or null for the "Date" placeholder. */
  dayText: string | null;
  /** "Thursday, September", or null before a date. */
  weekdayMonthText: string | null;
  /** "19:30 – 22:30", with a next-day note or a date range when the gathering
   *  runs past its first day. */
  timeText: string | null;
}

/** The date block, read from the first occurrence the form will publish. */
export function previewSchedule(
  form: GatheringForm,
  startAt: Date | null,
  fmt: Formatters,
  t: TFunction,
): PreviewSchedule {
  if (!startAt) {
    return {
      dayText: null,
      weekdayMonthText: null,
      timeText: undatedTimeText(form, fmt, t),
    };
  }
  // The same end instant chapter 2's gate and "Runs" line read, overnight
  // roll-forward included. `scheduleValid` is chapter 2's own rule about a
  // usable end, so the card reads a backwards or over-long span as no end.
  const { endInstant: endAt } = scheduleInstants(form);
  const hasReadableEnd = form.scheduleValid && endAt !== null;
  const when = gatheringWhen(
    startAt,
    hasReadableEnd ? endAt : null,
    fmt,
    t,
    PREVIEW_RANGE_OPTIONS,
  );
  const clockLine = when.nextDayNote
    ? t("gatherings:create.v2.preview.timeWithNote", {
        time: when.timeText,
        note: when.nextDayNote,
      })
    : when.timeText;
  const isLongSpan = when.isMultiDay && !when.isNextDay;
  return {
    dayText: fmt.date(startAt, PREVIEW_DAY_OPTIONS),
    weekdayMonthText: t("gatherings:create.v2.preview.weekdayMonth", {
      weekday: fmt.date(startAt, PREVIEW_WEEKDAY_OPTIONS),
      month: fmt.date(startAt, PREVIEW_MONTH_OPTIONS),
    }),
    timeText: isLongSpan
      ? t("gatherings:create.v2.preview.dateAndTime", {
          date: when.dateText,
          time: clockLine,
        })
      : clockLine,
  };
}

/** "Damas, Graça", the venue or the neighbourhood alone, or null. An online
 *  gathering reads as "Online", since its venue is a link. */
export function previewPlace(form: GatheringForm, t: TFunction): string | null {
  const hoodText = form.hood ? t(hoodLabelKey(form.hood) ?? form.hood) : "";
  if (isOnlineGathering(form)) return hoodText;
  const venueText = form.venue.trim();
  if (venueText && hoodText) {
    return t("gatherings:create.v2.preview.venueInHood", {
      venue: venueText,
      hood: hoodText,
    });
  }
  return venueText || hoodText || null;
}

/** "14 spots", "14 spots · no waitlist", or null without a capacity. */
export function previewSpots(form: GatheringForm, t: TFunction): string | null {
  const capacity = Number.parseInt(form.cap, 10);
  if (!Number.isFinite(capacity) || capacity < 1) return null;
  return form.allowWaitlist
    ? t("gatherings:create.v2.preview.spots", { count: capacity })
    : t("gatherings:create.v2.preview.spotsNoWaitlist", { count: capacity });
}

export function previewLanguage(
  form: GatheringForm,
  t: TFunction,
): string | null {
  if (!form.lang) return null;
  const labelKey =
    PREVIEW_LANGUAGE_LABEL_KEYS[form.lang] ?? langLabelKey(form.lang);
  return t(labelKey ?? form.lang);
}

/** "Weekly · 8 dates" while the gathering repeats over more than one date. */
export function previewRepeatTag(
  form: GatheringForm,
  occurrenceCount: number,
  t: TFunction,
): string | null {
  if (!form.repeats || occurrenceCount < 2) return null;
  const cadenceKey = CADENCE_OPTIONS.find(
    (option) => option.value === form.cadence,
  )?.labelKey;
  if (!cadenceKey) return null;
  return t("gatherings:create.v2.preview.repeatTag", {
    cadence: t(cadenceKey),
    count: occurrenceCount,
  });
}

/** The price chip: jade "Free", or what the host said people pay. */
export function previewCost(
  form: GatheringForm,
  t: TFunction,
): { label: string; isFree: boolean } {
  const costText = form.cost.trim();
  if (form.costKind === "pay-what-you-can") {
    return {
      label: costText
        ? t("gatherings:create.v2.preview.payWhatYouCanAmount", {
            amount: costText,
          })
        : t(COST_KIND_LABEL_KEYS["pay-what-you-can"]),
      isFree: false,
    };
  }
  if (form.costKind === "fixed") {
    return {
      label: costText || t(COST_KIND_LABEL_KEYS.fixed),
      isFree: false,
    };
  }
  return { label: t(COST_KIND_LABEL_KEYS.free), isFree: true };
}

/** "Tiago", "Tiago + Beatriz", or "Tiago, Beatriz, Rui". */
export function hostNamesText(names: readonly string[]): string {
  if (names.length === 2) return `${names[0]} + ${names[1]}`;
  return names.join(", ");
}

/** The close line without the waitlist note: the instant when there is one,
 *  else the cutoff (`at-start` included, as "When it starts"), else the open
 *  line a null cutoff ("When it ends") reads as. */
function rsvpCloseText(
  cutoff: GatheringForm["rsvpCutoff"],
  closesAt: Date | null,
  fmt: Formatters,
  t: TFunction,
): string {
  if (closesAt) {
    return t("gatherings:create.v2.preview.rsvpsCloseAt", {
      date: fmt.date(closesAt, PREVIEW_CLOSES_OPTIONS),
      time: fmt.time(closesAt),
    });
  }
  if (cutoff === null) {
    return t("gatherings:create.v2.preview.rsvpsOpenUntilEnd");
  }
  return t("gatherings:create.v2.preview.rsvpsCloseBefore", {
    cutoff: t(RSVP_CUTOFF_LABEL_KEYS[cutoff]),
  });
}

/**
 * When RSVPs close. With one dated gathering this is the real instant; for a
 * series, or before a date exists, it is the cutoff itself, since it applies
 * to each date in turn. "When it starts" closes at the start instant itself.
 * "When it ends" has no closing instant, so it reads as RSVPs staying open
 * until the gathering ends.
 */
export function previewRsvpCloseLine(
  form: GatheringForm,
  startAt: Date | null,
  occurrenceCount: number,
  fmt: Formatters,
  t: TFunction,
): string {
  const closesAt =
    startAt && occurrenceCount < 2
      ? rsvpClosesAt(startAt, form.rsvpCutoff)
      : null;
  const closeLine = rsvpCloseText(form.rsvpCutoff, closesAt, fmt, t);
  return form.allowWaitlist
    ? t("gatherings:create.v2.preview.withWaitlist", { line: closeLine })
    : closeLine;
}

/** The chips under "Asked on RSVP", in the order the RSVP form asks them.
 *  Access needs are always asked (ruling R8); the host's own question last. */
export function askedOnRsvpLabels(form: GatheringForm, t: TFunction): string[] {
  const labels = RSVP_QUESTION_KEYS.filter(
    (key) => key === "access" || form.rsvpQuestions[key],
  ).map((key) => t(RSVP_QUESTION_CHIP_KEYS[key]));
  const customQuestion = form.customRsvpQuestion.trim();
  return customQuestion ? [...labels, customQuestion] : labels;
}

/** Everything the card shows, as one string, so the card can tell a change
 *  from a re-render that changed nothing. */
export function previewSignature(form: GatheringForm): string {
  return JSON.stringify([
    form.draftSnapshot,
    form.coverPreviewUrl,
    form.cohostSlugs,
  ]);
}
