import { useMemo, useState } from "react";
import {
  emptyAccessibilityAnswers,
  normalizeAccessibilityAnswers,
  type AccessibilityAnswer,
  type AccessibilityAnswerMap,
  type AccessibilitySlug,
} from "../marketing/listBusiness/listingAccessibility.data";
import type {
  EventVisibility,
  RecurrenceCadence,
  RecurrenceEndType,
} from "./api/events.api";
import {
  LANGS,
  MAX_GATHERING_SPAN_DAYS,
  MAX_RECURRENCE_OCCURRENCES,
  MIN_RECURRENCE_OCCURRENCES,
} from "./createGathering.data";
import {
  findFamily,
  findFormat,
  familyForLegacyLabel,
  formatKeyForLegacyLabel,
  MAX_OTHER_FORMAT_LENGTH,
  OTHER_FORMAT_KEY,
  stripDisallowedDetails,
  type FormatDetailKey,
  type FormatDetails,
  type GatheringFamily,
} from "./gatheringCatalog";
import {
  DEFAULT_RSVP_QUESTIONS,
  defaultRsvpCutoffForFamily,
  hiddenThemeKeysForFamily,
  isCostKind,
  isRsvpCutoff,
  MAX_CUSTOM_RSVP_QUESTION_LENGTH,
  MAX_GATHERING_THEMES,
  MAX_HOUSE_RULES_LENGTH,
  normalizeRsvpQuestions,
  sanitizeContentNotes,
  sanitizeThemes,
  type ContentNoteKey,
  type CostKind,
  type GatheringThemeKey,
  type RsvpCutoff,
  type RsvpQuestionKey,
  type RsvpQuestions,
} from "./gatheringExtras";
import { scheduleInstants } from "./steps/schedulePair";

/**
 * Everything "Duplicate this gathering" copies forward (PRD-190), and the
 * source of "same as last time" (`applyLastGatheringSeed`).
 *
 * NOT the date or the two publish confirmations. A duplicate exists precisely
 * because the next one is on a different night, and the Code of Care and
 * accessibility-accuracy pledges are statements the host makes about THIS
 * gathering; re-using a tick from a previous one would turn a promise into a
 * default. The clock times ride along as `startTime` / `endTime`, and only
 * "same as last time" reads them: a duplicate still starts on the wizard's own
 * default time.
 */
export interface GatheringFormSeed {
  /** The gathering's family, or null when the source carried none and no
   *  legacy label resolved to one. */
  family: GatheringFamily | null;
  /** The source's stored format key, or null when it carried the host's own
   *  words (which then ride in `otherText`). */
  format: string | null;
  otherText: string;
  formatDetails: FormatDetails | null;
  /** The source's "show how many people are going" setting. */
  showAttendeeCount?: boolean;
  title: string;
  description: string;
  hood: string;
  venue: string;
  venueListingId: string | null;
  venueListing: { slug: string; name: string } | null;
  address: string;
  directions: string;
  onlineUrl: string;
  capacity: string;
  language: string;
  cost: string;
  accessibilityAnswers: AccessibilityAnswerMap;
  accessNotes: string;
  audienceScope: EventVisibility;
  communitySlug: string;
  // ── Care and access (Create Gathering v2) ───────────────────────────────
  /** Already narrowed to the vocabulary and to the seed's own family (R6). */
  themes: GatheringThemeKey[];
  contentNotes: ContentNoteKey[];
  houseRules: string;
  costKind: CostKind;
  /** The source's cutoff. `undefined` (the source carried no field) leaves
   *  the family default applying. `null` is "When it ends", copied as the
   *  host's own answer. */
  rsvpCutoff?: RsvpCutoff | null;
  rsvpQuestions: RsvpQuestions;
  customRsvpQuestion: string;
  allowWaitlist: boolean;
  /** The source's start clock as `"HH:MM"` in its own zone. Read only by
   *  "same as last time"; absent when the source had no readable start. */
  startTime?: string;
  /** The source's end clock as `"HH:MM"`, absent when it had no end. */
  endTime?: string;
}

/**
 * Everything the wizard needs to put a half-finished gathering back exactly as
 * the host left it (`draftSnapshot` out, `restoreDraft` in).
 *
 * Plain JSON on purpose, so it survives a trip through storage: strings,
 * booleans, arrays and plain objects, with every date kept as a string. Three
 * things are deliberately left out. The two publish confirmations are
 * promises made at the moment of publishing, and a resumed tick would turn
 * them into defaults. The cover points at an upload that may since have been
 * cleaned up, and its preview URL is a local blob that does not outlive the
 * page. Co-hosts are people, and inviting someone should be a choice made in
 * the session that sends the invite.
 *
 * The three touched flags are optional: a snapshot this hook wrote always
 * carries them, and one that lacks them restores as touched, so a restored
 * value holds against a family default the host did not ask for.
 */
export interface GatheringDraftSnapshot {
  title: string;
  description: string;
  family: GatheringFamily | "";
  format: string;
  otherText: string;
  formatDetails: FormatDetails;
  cap: string;
  isCapTouched?: boolean;
  showAttendeeCount: boolean;
  isAttendeeCountTouched?: boolean;
  date: string;
  time: string;
  endDate: string;
  endTime: string;
  repeats: boolean;
  cadence: RecurrenceCadence;
  endType: RecurrenceEndType;
  endCount: string;
  endUntil: string;
  hood: string;
  communitySlug: string;
  audienceScope: EventVisibility;
  venue: string;
  venueListingId: string | null;
  venueListing: { slug: string; name: string } | null;
  address: string;
  directions: string;
  onlineUrl: string;
  lang: string;
  cost: string;
  costKind: CostKind;
  accessibilityAnswers: AccessibilityAnswerMap;
  accessNotes: string;
  themes: GatheringThemeKey[];
  contentNotes: ContentNoteKey[];
  houseRules: string;
  /** `null` is "When it ends". */
  rsvpCutoff: RsvpCutoff | null;
  isRsvpCutoffTouched?: boolean;
  rsvpQuestions: RsvpQuestions;
  customRsvpQuestion: string;
  allowWaitlist: boolean;
}

/** What the wizard may start out with, rather than empty.
 *
 *  `communitySlug` is seeded from the `/create-gathering?community=<slug>`
 *  deep link (see `createGatheringPath` in data.ts) so a community's Events tab
 *  can offer "host a gathering here". Read once, on mount: the host can still
 *  change or clear it in the wizard.
 *
 *  `seed` is the duplicate flow (PRD-190) and arrives ASYNCHRONOUSLY — the
 *  source gathering has to be fetched first — so unlike `communitySlug` it is
 *  applied whenever a new one lands rather than only on mount. */
export interface GatheringFormInitial {
  communitySlug?: string;
  seed?: GatheringFormSeed;
}

/** A member the host picked as a would-be co-host, with what the picker and
 *  the preview show for them. Invited by slug once the gathering exists. */
export interface CohostPick {
  slug: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
}

// ── Local calendar-day arithmetic ──────────────────────────────────
// The wizard stores dates as `"YYYY-MM-DD"` and reads them back as LOCAL
// calendar days, matching how the rest of this file builds
// `new Date(`${date}T${time}`)`. `new Date("2026-10-17")` is parsed as UTC
// midnight instead, which lands on 16 October in every zone behind UTC, so the
// year/month/day parts are handed to the constructor explicitly here. This is
// exactly the kind of code a later reader "simplifies" straight back into an
// off-by-one-day bug.

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** A `"YYYY-MM-DD"` string as a local calendar day, or null when it is not
 *  one. */
function parseLocalDate(value: string): Date | null {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!parts) return null;
  const year = Number(parts[1]!);
  const month = Number(parts[2]!);
  const day = Number(parts[3]!);
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** A local calendar day back as the `"YYYY-MM-DD"` string the wizard stores. */
function toDateInputValue(value: Date): string {
  const year = String(value.getFullYear()).padStart(4, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** The same calendar day moved by whole days. A value that is not a real date
 *  comes back untouched, so a half-typed field never becomes a wrong one. */
function addDays(value: string, days: number): string {
  const parsed = parseLocalDate(value);
  if (!parsed) return value;
  parsed.setDate(parsed.getDate() + days);
  return toDateInputValue(parsed);
}

/** Whole days from one calendar day to another, or null when either side is
 *  not a real date. Rounded, so the 23-hour and 25-hour days a daylight-saving
 *  change makes still count as one day each. */
function wholeDaysBetween(from: string, to: string): number | null {
  const fromDate = parseLocalDate(from);
  const toDate = parseLocalDate(to);
  if (!fromDate || !toDate) return null;
  return Math.round(
    (toDate.getTime() - fromDate.getTime()) / MILLISECONDS_PER_DAY,
  );
}

// ── Auto-adjusting the end date ────────────────────────────────────
// The end date only ever moves LATER on its own. It never shrinks
// automatically: an end date that silently pulled back would fight a host who
// set a three-day span and then nudged the start time. Shortening a gathering
// is the host's own edit, made directly in the end date field.
//
// These are pure: they take the current schedule and answer with the end date
// it implies, so the hook below stays a thin layer of state around them.

/** The end date a start date implies on its own: the same day when the end
 *  time is strictly after the start time, and the day after when the evening
 *  runs past midnight. A form with no end time has no end instant to roll
 *  over, so it stays on the start day. */
function autoEndDateFor(
  startDate: string,
  startTime: string,
  endsAt: string,
): string {
  if (!endsAt) return startDate;
  // Both are zero-padded `"HH:MM"`, so a plain string comparison is a clock
  // comparison. The start fallback mirrors `dateValid`'s.
  return endsAt > (startTime || "19:00") ? startDate : addDays(startDate, 1);
}

/** The end date after the START DATE moved: derived from the new start when
 *  there is nothing to preserve yet, and otherwise shifted by exactly as many
 *  days as the start moved, so a three-day span stays three days. */
function endDateAfterStartDateChange(
  previousDate: string,
  nextDate: string,
  currentEndDate: string,
  startTime: string,
  endsAt: string,
): string {
  if (!currentEndDate || !previousDate) {
    return autoEndDateFor(nextDate, startTime, endsAt);
  }
  const shiftInDays = wholeDaysBetween(previousDate, nextDate);
  return shiftInDays === null
    ? autoEndDateFor(nextDate, startTime, endsAt)
    : addDays(currentEndDate, shiftInDays);
}

/** The end date after a TIME edit: pushed to the day after the start date when
 *  the end instant would otherwise land at or before the start instant, and
 *  left exactly where the host put it in every other case. */
function endDateAfterTimeChange(
  startDate: string,
  currentEndDate: string,
  startTime: string,
  endsAt: string,
): string {
  if (!startDate || !endsAt) return currentEndDate;
  const startInstant = new Date(`${startDate}T${startTime || "19:00"}`);
  const endInstant = new Date(`${currentEndDate || startDate}T${endsAt}`);
  if (
    Number.isNaN(startInstant.getTime()) ||
    Number.isNaN(endInstant.getTime())
  ) {
    return currentEndDate;
  }
  return endInstant.getTime() > startInstant.getTime()
    ? currentEndDate
    : addDays(startDate, 1);
}

/**
 * How long the gathering runs, and whether that is a schedule the API accepts.
 *
 * The end instant has to fall strictly after the start instant, and the ELAPSED
 * TIME between the two instants has to fit inside `MAX_GATHERING_SPAN_DAYS`.
 * Both rules mirror the backend's `assertScheduleValid` (events.service.ts)
 * exactly, so the wizard never submits a schedule the server would answer 400
 * to, and the server stays the authority on both.
 *
 * An end time is optional and always has been, so a form without one is valid
 * by definition. Both instants come from `scheduleInstants`
 * (steps/schedulePair.ts), its `time || "19:00"` start fallback included.
 */
function evaluateSchedule(
  schedule: Pick<
    GatheringDraftSnapshot,
    "date" | "time" | "endDate" | "endTime"
  >,
): { spanDays: number; isValid: boolean } {
  // The two instants the wizard would actually put on the wire, read through
  // `scheduleInstants` (steps/schedulePair.ts). A form that has no end date
  // yet (a seeded duplicate, or a host who cleared the field) gets the
  // adapter's own fallback there: the start day, rolled forward when the end
  // time lands at or before the start time.
  //
  // THAT FALLBACK MUST MATCH `combineEndDateTime` in api/events.adapters.ts. A
  // gate that disagrees with the payload builder refuses a schedule the wire
  // would have taken happily, and the host meets a step that will not advance
  // with nothing on screen saying why.
  const { startInstant: startAt, endInstant: endAt } =
    scheduleInstants(schedule);
  const effectiveEndDate = endAt
    ? toDateInputValue(endAt)
    : schedule.endDate || schedule.date;
  // Descriptive only: 0 for a gathering that begins and ends on one day, 2 for
  // a Friday-to-Sunday festival. It is what the step renders, and the cap below
  // deliberately does not consult it.
  const spanDays = wholeDaysBetween(schedule.date, effectiveEndDate) ?? 0;
  if (!schedule.endTime) return { spanDays, isValid: true };
  const isValid =
    !!startAt &&
    !!endAt &&
    endAt.getTime() > startAt.getTime() &&
    // The cap is ELAPSED MILLISECONDS between the two instants, which is what
    // `assertScheduleValid` measures. Counting calendar days instead would
    // wave through 09:00 on the 17th to 23:00 on the 31st: fourteen days on
    // the calendar, fourteen days and fourteen hours on the clock, every
    // wizard step ticked and a 400 the host has nothing to act on. This
    // arithmetic is deliberate; do not simplify it back to `spanDays`.
    endAt.getTime() - startAt.getTime() <=
      MAX_GATHERING_SPAN_DAYS * MILLISECONDS_PER_DAY;
  return { spanDays, isValid };
}

/**
 * The WHEN of a gathering: start date, start time, end date, end time, and the
 * two validity answers that depend on them.
 *
 * Its own hook because the schedule is the one cluster of wizard state whose
 * fields move each other: three of the four setters adjust the end date. Every
 * other field in the form is independent state behind a plain `useState`.
 */
function useGatheringSchedule() {
  const [date, setDateValue] = useState("");
  const [time, setTimeValue] = useState("19:00");
  // The calendar day the gathering ends on, as a `"YYYY-MM-DD"` string, or ""
  // while it is unset. It sits beside the start date so an overnight party
  // (23:00 Friday to 04:00 Saturday) and a three-day festival are both
  // sayable. The backend has always stored `endAt` as a full timestamp; only
  // the wizard was ever single-day.
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTimeValue] = useState("22:00");
  // Snapshot of "now" used by the future-start check below. Reading a live
  // `Date.now()` during render is impure, so the clock is captured once and
  // refreshed whenever the organiser edits the date or time. Those are the
  // only fields that decide whether the start is still in the future, so the
  // validity the user sees reflects the moment they changed the value.
  const [now, setNow] = useState(() => Date.now());
  const setDate = (value: string) => {
    setNow(Date.now());
    const previousDate = date;
    setEndDate((currentEndDate) =>
      endDateAfterStartDateChange(
        previousDate,
        value,
        currentEndDate,
        time,
        endTime,
      ),
    );
    setDateValue(value);
  };
  const setTime = (value: string) => {
    setNow(Date.now());
    setTimeValue(value);
    setEndDate((currentEndDate) =>
      endDateAfterTimeChange(date, currentEndDate, value, endTime),
    );
  };
  const setEndTime = (value: string) => {
    setEndTimeValue(value);
    setEndDate((currentEndDate) =>
      endDateAfterTimeChange(date, currentEndDate, time, value),
    );
  };

  /**
   * Both clock times at once, for "same as last time".
   *
   * One end-date adjustment against the NEW pair. Calling `setTime` and then
   * `setEndTime` in one handler would have the second read the start time
   * from before the first, and roll the end date against a clock the form no
   * longer holds. `undefined` leaves that side as it is.
   */
  const applyTimes = (
    nextStartTime: string | undefined,
    nextEndTime: string | undefined,
  ) => {
    if (nextStartTime === undefined && nextEndTime === undefined) return;
    const startTimeValue = nextStartTime ?? time;
    const endTimeValue = nextEndTime ?? endTime;
    setNow(Date.now());
    setTimeValue(startTimeValue);
    setEndTimeValue(endTimeValue);
    setEndDate((currentEndDate) =>
      endDateAfterTimeChange(
        date,
        currentEndDate,
        startTimeValue,
        endTimeValue,
      ),
    );
  };

  /** A saved draft's schedule, verbatim. No auto-adjusting: the four values
   *  already agreed with each other when the draft was saved, and nudging one
   *  on the way back in would hand the host a schedule other than the one
   *  they set. */
  const restoreSchedule = (
    snapshot: Pick<
      GatheringDraftSnapshot,
      "date" | "time" | "endDate" | "endTime"
    >,
  ) => {
    setNow(Date.now());
    setDateValue(snapshot.date);
    setTimeValue(snapshot.time);
    setEndDate(snapshot.endDate);
    setEndTimeValue(snapshot.endTime);
  };

  // A gathering must have a real start that's still in the future: the backend
  // rejects both a missing date and a past one, so the wizard gates step 2 on
  // this. Mirrors the adapter's `time || "19:00"` fallback so the check matches
  // exactly what gets submitted.
  const startAt = date ? new Date(`${date}T${time || "19:00"}`) : null;
  const dateValid =
    !!startAt && !Number.isNaN(startAt.getTime()) && startAt.getTime() > now;

  // How long it runs and whether the API would take it. See
  // `evaluateSchedule`: it mirrors the backend's own `assertScheduleValid`.
  const schedule = evaluateSchedule({ date, time, endDate, endTime });
  const spanDays = schedule.spanDays;
  const scheduleValid = schedule.isValid;

  return {
    date,
    setDate,
    time,
    setTime,
    endDate,
    setEndDate,
    endTime,
    setEndTime,
    /** The start instant, or null with no date. Also the reference point the
     *  recurrence end-date check measures against. */
    startAt,
    dateValid,
    spanDays,
    scheduleValid,
    applyTimes,
    restoreSchedule,
  };
}

/**
 * The WHAT of a gathering: its family, its format, the host's own words when
 * they picked "something else", the family's one or two extra questions, and
 * the two fields a family sets a starting value for (capacity and whether the
 * headcount shows).
 *
 * Its own hook for the same reason `useGatheringSchedule` is: these fields
 * move each other. Picking a format rewrites the capacity, flips the headcount
 * switch and throws away answers the new family never asks for, which is a
 * cluster of coupled state rather than five independent `useState` calls.
 *
 * The COUPLING RULE is the same everywhere in here: a family's default only
 * applies while the host has never taken a position of their own. `cap` lives
 * in this hook rather than beside the other capacity-step fields precisely
 * because of that rule; the family is what starts it.
 */
function useGatheringFormatState(
  onFamilySelected?: (family: GatheringFamily) => void,
) {
  // A gathering is described by a FAMILY (a closed nine-value set that drives
  // behaviour) and a FORMAT inside it (a curated key, or `"other"` plus the
  // host's own words). This pair is the whole vocabulary: the single `type`
  // string that preceded it is gone.
  const [family, setFamily] = useState<GatheringFamily | "">("");
  const [format, setFormat] = useState("");
  const [otherText, setOtherTextValue] = useState("");
  const [formatDetails, setFormatDetails] = useState<FormatDetails>({});
  const [cap, setCap] = useState("14");
  // Has the host taken a position on how many seats, or is the number on screen
  // still the one the format suggested? Only an untouched field follows the
  // family, which is what makes the default a starting point rather than a
  // value that fights the host every time they change their mind about format.
  const [isCapTouched, setIsCapTouched] = useState(false);
  const [showAttendeeCount, setShowAttendeeCountValue] = useState(true);
  const [isAttendeeCountTouched, setIsAttendeeCountTouched] = useState(false);

  /** The host typed in the capacity field. From here on the format's default
   *  never moves it again. */
  const setCapTouched = (value: string) => {
    setIsCapTouched(true);
    setCap(value);
  };

  const setShowAttendeeCount = (value: boolean) => {
    setIsAttendeeCountTouched(true);
    setShowAttendeeCountValue(value);
  };

  /** The host's own words for a format, capped at what the column takes. */
  const setOtherText = (value: string) =>
    setOtherTextValue(value.slice(0, MAX_OTHER_FORMAT_LENGTH));

  /** One answer to one of the family's questions. `undefined` clears it, so a
   *  host who empties the "what to bring" field leaves no stored hole. */
  const setFormatDetail = <Key extends FormatDetailKey>(
    key: Key,
    value: FormatDetails[Key],
  ) =>
    setFormatDetails((previous) => {
      const next: FormatDetails = { ...previous };
      if (value === undefined || value === "") delete next[key];
      else next[key] = value;
      return next;
    });

  /**
   * Pick a family and a format together, and let the family set what it sets.
   *
   * Three things happen, in this order. The pair is stored. The capacity and
   * the attendee-count switch take the family's defaults, but ONLY while the
   * host has never touched either: a host who typed 6 keeps 6 through every
   * subsequent format change. And any answer belonging to a question the new
   * family does not ask is dropped, so a "what to bring" left over from a
   * potluck never travels to a screening.
   */
  const selectFormat = (nextFamily: GatheringFamily, nextFormat: string) => {
    setFamily(nextFamily);
    setFormat(nextFormat);
    const familyEntry = findFamily(nextFamily);
    if (familyEntry) {
      if (!isCapTouched) setCap(String(familyEntry.capacityDefault));
      if (!isAttendeeCountTouched) {
        setShowAttendeeCountValue(familyEntry.isAttendeeCountShownByDefault);
      }
    }
    setFormatDetails(
      (previous) => stripDisallowedDetails(nextFamily, previous) ?? {},
    );
    // The fields outside this hook that a family also sets (the RSVP cutoff,
    // and the themes ruling R6 hides). Same coupling rule, applied by their
    // own hook: see `useGatheringCareState.applyFamilyToCare`.
    onFamilySelected?.(nextFamily);
  };

  /** Switching family in the family row alone: the format goes with it, since
   *  a format only means anything inside its own family. */
  const selectFamily = (nextFamily: GatheringFamily) => {
    if (nextFamily === family) return;
    selectFormat(nextFamily, "");
  };

  /**
   * Everything a duplicate's seed says about the format half of the form
   * (PRD-190), applied during render alongside the rest of the seed.
   *
   * The family and format are read in order: an explicit family/format pair
   * from a live detail; else the eight-label legacy map, so a gathering
   * written before families existed still opens on the right family; else the
   * host's own words, kept verbatim under "something else" rather than
   * silently dropped.
   */
  const applyFormatSeed = (seed: GatheringFormSeed) => {
    // A seed carries the stored format string in exactly one of two places: as
    // a curated `format` key, or, when nothing in the catalog matched it, as
    // the host's own words in `otherText` (see `gatheringToFormSeed`). Reading
    // only `format` here would send every gathering written in the old
    // eight-label vocabulary down the "something else" path instead of through
    // the legacy map below.
    const seededFormatKey = seed.format ?? seed.otherText;
    const seededFamily = seed.family ?? familyForLegacyLabel(seededFormatKey);
    const catalogFormat = findFormat(seededFormatKey);
    if (catalogFormat) {
      setFamily(catalogFormat.family);
      setFormat(catalogFormat.key);
      setOtherTextValue("");
    } else if (seededFamily) {
      setFamily(seededFamily);
      const legacyFormatKey = formatKeyForLegacyLabel(seededFormatKey);
      if (legacyFormatKey) {
        setFormat(legacyFormatKey);
        setOtherTextValue("");
      } else {
        setFormat(OTHER_FORMAT_KEY);
        setOtherTextValue(seed.otherText);
      }
    } else if (seededFormatKey) {
      setFormat(OTHER_FORMAT_KEY);
      setOtherTextValue(seed.otherText);
    }
    // Stripped against the family the form is ACTUALLY left holding, which is
    // the curated format's OWN family whenever one matched above. Reading the
    // seed's family field instead would drop a live "what to bring" from any
    // seed that carried a curated format key without a family beside it: the
    // legacy map only knows the eight old labels, so `potluck` resolves to no
    // family there and the whole bag strips to nothing.
    const appliedFamily = catalogFormat?.family ?? seededFamily ?? null;
    setFormatDetails(
      stripDisallowedDetails(appliedFamily, seed.formatDetails) ?? {},
    );
    // A duplicate copies the source's answer, and copying it counts as the
    // host having one: the family default must not overwrite a setting the
    // host already made on the gathering being duplicated.
    if (seed.showAttendeeCount !== undefined) {
      setShowAttendeeCountValue(seed.showAttendeeCount);
      setIsAttendeeCountTouched(true);
    }
    applyCapacitySeed(seed.capacity);
    // Handed back so the care fields can narrow their themes against the
    // family the form actually ended up on (ruling R6).
    return appliedFamily;
  };

  /** A copied capacity. A real number counts as the host's own answer, so no
   *  later format pick overwrites it; an empty one (the source had no limit)
   *  leaves the family default free to apply. */
  const applyCapacitySeed = (capacity: string) => {
    setCap(capacity);
    if (capacity) setIsCapTouched(true);
  };

  /**
   * A saved draft's format half, verbatim, touched flags included.
   *
   * No `selectFormat` here: that would re-apply the family's defaults over the
   * very values being restored. A flag the snapshot does not carry restores as
   * touched, for the same reason.
   */
  const restoreFormatState = (snapshot: GatheringDraftSnapshot) => {
    const restoredFamily = findFamily(snapshot.family) ? snapshot.family : "";
    setFamily(restoredFamily);
    // A draft can sit in storage across a catalog change. The format comes
    // back only while it still belongs to the restored family, or is
    // "something else"; any other value restores as no format picked.
    const isFormatInRestoredFamily =
      snapshot.format === OTHER_FORMAT_KEY ||
      findFormat(snapshot.format)?.family === restoredFamily;
    setFormat(isFormatInRestoredFamily ? snapshot.format : "");
    setOtherTextValue(snapshot.otherText.slice(0, MAX_OTHER_FORMAT_LENGTH));
    setFormatDetails(snapshot.formatDetails ?? {});
    setCap(snapshot.cap);
    setIsCapTouched(snapshot.isCapTouched ?? true);
    setShowAttendeeCountValue(snapshot.showAttendeeCount);
    setIsAttendeeCountTouched(snapshot.isAttendeeCountTouched ?? true);
  };

  // Has the host finished answering step 1's format question? A curated
  // format needs nothing more; "something else" needs the words that go with
  // it, or the gathering would publish carrying the literal key "other".
  const isFormatChosen =
    Boolean(family) &&
    (format === OTHER_FORMAT_KEY
      ? otherText.trim().length > 0
      : Boolean(format));

  /** The size this format suggests, while the host has not overridden
   *  it. Null once they have, so the hint under the field stops claiming a
   *  default that no longer applies. */
  const capacityDefault =
    !isCapTouched && family
      ? (findFamily(family)?.capacityDefault ?? null)
      : null;

  /** The bag as it will actually go on the wire: stripped to this family's
   *  own questions, `null` when nothing is answered. The review step reads
   *  this rather than raw `formatDetails`, so it says what will be stored. */
  const submittedFormatDetails = stripDisallowedDetails(
    family || null,
    formatDetails,
  );

  return {
    family,
    format,
    otherText,
    setOtherText,
    formatDetails,
    setFormatDetail,
    selectFormat,
    selectFamily,
    isFormatChosen,
    cap,
    isCapTouched,
    setCapTouched,
    capacityDefault,
    submittedFormatDetails,
    isAttendeeCountTouched,
    showAttendeeCount,
    setShowAttendeeCount,
    applyFormatSeed,
    applyCapacitySeed,
    restoreFormatState,
  };
}

/**
 * The CARE of a gathering: its themes, content notes and house rules, when
 * RSVPs close, which questions the RSVP details form asks, and whether a full
 * gathering keeps a waitlist.
 *
 * Its own hook because two of these move with the family, under the same
 * coupling rule `cap` follows. The RSVP cutoff takes the family's default only
 * until the host picks one, and a theme the family's own details
 * already ask about (ruling R6) is dropped the moment that family is chosen.
 * `selectFormat` calls `applyFamilyToCare`, so picking a family still happens
 * in exactly one place.
 */
function useGatheringCareState() {
  const [themes, setThemes] = useState<GatheringThemeKey[]>([]);
  const [contentNotes, setContentNotes] = useState<ContentNoteKey[]>([]);
  const [houseRules, setHouseRulesValue] = useState("");
  // Starts on the default for no family, which is also every family's default
  // but one. `null` is "When it ends": RSVPs stay open until the gathering
  // ends.
  const [rsvpCutoff, setRsvpCutoffValue] = useState<RsvpCutoff | null>(() =>
    defaultRsvpCutoffForFamily(null),
  );
  // Has the host picked a cutoff, or is the one on screen still the family's?
  const [isRsvpCutoffTouched, setIsRsvpCutoffTouched] = useState(false);
  const [rsvpQuestions, setRsvpQuestions] = useState<RsvpQuestions>(
    DEFAULT_RSVP_QUESTIONS,
  );
  const [customRsvpQuestion, setCustomRsvpQuestionValue] = useState("");
  const [allowWaitlist, setAllowWaitlist] = useState(true);

  /** Pin or unpin a theme. A fourth pin does nothing: the card has room for
   *  three. */
  const toggleTheme = (key: GatheringThemeKey) =>
    setThemes((previous) => {
      if (previous.includes(key)) {
        return previous.filter((theme) => theme !== key);
      }
      if (previous.length >= MAX_GATHERING_THEMES) return previous;
      return [...previous, key];
    });

  const toggleContentNote = (key: ContentNoteKey) =>
    setContentNotes((previous) =>
      previous.includes(key)
        ? previous.filter((note) => note !== key)
        : [...previous, key],
    );

  /** The host's house rules, capped at what the column takes. */
  const setHouseRules = (value: string) =>
    setHouseRulesValue(value.slice(0, MAX_HOUSE_RULES_LENGTH));

  /** The host picked a cutoff, `null` for "When it ends". From here on it
   *  stays the host's own value, whatever family they pick next. */
  const setRsvpCutoff = (value: RsvpCutoff | null) => {
    setIsRsvpCutoffTouched(true);
    setRsvpCutoffValue(value);
  };

  const toggleRsvpQuestion = (key: RsvpQuestionKey) =>
    setRsvpQuestions((previous) => ({ ...previous, [key]: !previous[key] }));

  /** The host's own RSVP question, capped at what the column takes. */
  const setCustomRsvpQuestion = (value: string) =>
    setCustomRsvpQuestionValue(value.slice(0, MAX_CUSTOM_RSVP_QUESTION_LENGTH));

  /** What picking a family does to these fields. Called from `selectFormat`
   *  and nowhere else. */
  const applyFamilyToCare = (nextFamily: GatheringFamily) => {
    if (!isRsvpCutoffTouched) {
      setRsvpCutoffValue(defaultRsvpCutoffForFamily(nextFamily));
    }
    const hiddenThemeKeys = hiddenThemeKeysForFamily(nextFamily);
    if (hiddenThemeKeys.length > 0) {
      setThemes((previous) =>
        previous.filter((theme) => !hiddenThemeKeys.includes(theme)),
      );
    }
  };

  /** The RSVP-form half "same as last time" copies: the house rules and the
   *  questions asked, which describe how this host runs their gatherings. */
  const applyRsvpFormSeed = (seed: GatheringFormSeed) => {
    setHouseRules(seed.houseRules);
    setRsvpQuestions(
      normalizeRsvpQuestions(seed.rsvpQuestions, DEFAULT_RSVP_QUESTIONS),
    );
    setCustomRsvpQuestion(seed.customRsvpQuestion);
  };

  /**
   * Everything a duplicate copies into these fields (PRD-190).
   *
   * A copied cutoff counts as the host's own answer, exactly like a copied
   * capacity, and a copied `null` ("When it ends") is a cutoff like any
   * other. A seed that carries no cutoff at all (`undefined`) leaves the field
   * following the family, and since a seed skips `selectFormat`, that family's
   * default is applied here.
   */
  const applyCareSeed = (
    seed: GatheringFormSeed,
    appliedFamily: GatheringFamily | null,
  ) => {
    applyRsvpFormSeed(seed);
    setThemes(sanitizeThemes(seed.themes, appliedFamily));
    setContentNotes(sanitizeContentNotes(seed.contentNotes));
    if (seed.rsvpCutoff !== undefined) {
      setRsvpCutoffValue(seed.rsvpCutoff);
      setIsRsvpCutoffTouched(true);
    } else if (!isRsvpCutoffTouched) {
      setRsvpCutoffValue(defaultRsvpCutoffForFamily(appliedFamily));
    }
    setAllowWaitlist(seed.allowWaitlist);
  };

  /** A saved draft's care fields. Themes are narrowed against the restored
   *  family (R6), every vocabulary value is checked, and a missing touched
   *  flag restores as touched so no family default overwrites the draft. */
  const restoreCareState = (snapshot: GatheringDraftSnapshot) => {
    const restoredFamily = snapshot.family || null;
    setThemes(sanitizeThemes(snapshot.themes, restoredFamily));
    setContentNotes(sanitizeContentNotes(snapshot.contentNotes));
    setHouseRules(snapshot.houseRules);
    // `null` is a real answer ("When it ends") and comes back as `null`. A
    // value this release does not know restores as the family default.
    setRsvpCutoffValue(
      snapshot.rsvpCutoff === null || isRsvpCutoff(snapshot.rsvpCutoff)
        ? snapshot.rsvpCutoff
        : defaultRsvpCutoffForFamily(restoredFamily),
    );
    setIsRsvpCutoffTouched(snapshot.isRsvpCutoffTouched ?? true);
    setRsvpQuestions(
      normalizeRsvpQuestions(snapshot.rsvpQuestions, DEFAULT_RSVP_QUESTIONS),
    );
    setCustomRsvpQuestion(snapshot.customRsvpQuestion);
    setAllowWaitlist(snapshot.allowWaitlist !== false);
  };

  /** Has the host said anything here? A cutoff still on the family default
   *  and the questions all off are the form's own starting state. */
  const isCareDirty =
    themes.length > 0 ||
    contentNotes.length > 0 ||
    houseRules.trim().length > 0 ||
    customRsvpQuestion.trim().length > 0 ||
    Object.values(rsvpQuestions).some(Boolean) ||
    isRsvpCutoffTouched ||
    !allowWaitlist;

  return {
    themes,
    toggleTheme,
    contentNotes,
    toggleContentNote,
    houseRules,
    setHouseRules,
    rsvpCutoff,
    setRsvpCutoff,
    isRsvpCutoffTouched,
    rsvpQuestions,
    toggleRsvpQuestion,
    customRsvpQuestion,
    setCustomRsvpQuestion,
    allowWaitlist,
    setAllowWaitlist,
    applyFamilyToCare,
    applyRsvpFormSeed,
    applyCareSeed,
    restoreCareState,
    isCareDirty,
  };
}

/**
 * The REPEATS of a gathering (MSG-10): a deliberately minimal cadence and
 * end-condition pair in place of a full RFC5545/RRULE picker. `repeats` off
 * (the default) means a normal one-off gathering; `formToCreateEventDto`
 * (events.adapters.ts) only sends `recurrence` at all when it is on.
 *
 * Its own hook because the five fields answer one question together, and
 * whether that answer is valid depends only on the start instant handed in.
 * `gatheringOccurrences.ts` turns the same five fields into the list of dates.
 */
function useGatheringRecurrenceState(startAt: Date | null) {
  const [repeats, setRepeats] = useState(false);
  const [cadence, setCadence] = useState<RecurrenceCadence>("weekly");
  const [endType, setEndType] = useState<RecurrenceEndType>("count");
  const [endCount, setEndCount] = useState("8");
  const [endUntil, setEndUntil] = useState("");

  // Off (the common case) is always valid. On, the chosen end condition must
  // itself be well-formed: a count in `[MIN_RECURRENCE_OCCURRENCES,
  // MAX_RECURRENCE_OCCURRENCES]`, or an end date strictly after the
  // gathering's own start. Mirrors the backend's own `resolveOccurrences`
  // checks (events.service.ts) so every rule the wizard submits is one the
  // server accepts.
  const endCountNumber = Number.parseInt(endCount, 10);
  const endUntilDate = endUntil ? new Date(endUntil) : null;
  const recurrenceValid =
    !repeats ||
    (endType === "count"
      ? Number.isFinite(endCountNumber) &&
        endCountNumber >= MIN_RECURRENCE_OCCURRENCES &&
        endCountNumber <= MAX_RECURRENCE_OCCURRENCES
      : !!endUntilDate &&
        !!startAt &&
        !Number.isNaN(endUntilDate.getTime()) &&
        endUntilDate.getTime() > startAt.getTime());

  /** A saved draft's repeat rule, verbatim. */
  const restoreRecurrence = (
    snapshot: Pick<
      GatheringDraftSnapshot,
      "repeats" | "cadence" | "endType" | "endCount" | "endUntil"
    >,
  ) => {
    setRepeats(snapshot.repeats);
    setCadence(snapshot.cadence);
    setEndType(snapshot.endType);
    setEndCount(snapshot.endCount);
    setEndUntil(snapshot.endUntil);
  };

  return {
    repeats,
    setRepeats,
    cadence,
    setCadence,
    endType,
    setEndType,
    endCount,
    setEndCount,
    endUntil,
    setEndUntil,
    recurrenceValid,
    restoreRecurrence,
  };
}

/**
 * The WHERE and WHO of a gathering: the neighbourhood, the venue with its
 * directory link, the street address, arrival directions and join link, and
 * the community and audience it is posted to.
 *
 * Its own hook because two of these move each other (clearing the community
 * pulls the audience off the "Community members" tier), and because the venue
 * half is exactly what a duplicate and "same as last time" both copy.
 */
function useGatheringWhereState(initialCommunitySlug: string) {
  const [hood, setHood] = useState("");
  const [venue, setVenue] = useState("");
  // The venue's directory link, when the organiser picked a real listing from
  // the venue picker, which sets all three of
  // `venue`/`venueListingId`/`venueListing` together. Cleared (`null`)
  // whenever the organiser types their own text.
  const [venueListingId, setVenueListingId] = useState<string | null>(null);
  const [venueListing, setVenueListing] = useState<{
    slug: string;
    name: string;
  } | null>(null);
  // The community this gathering is posted to, or "" for a public gathering
  // visible to everyone (the wizard's default, matching prior behaviour).
  // Seeded from `initial.communitySlug` when the host arrived through a
  // community's "host a gathering here" link.
  const [communitySlug, setCommunitySlugValue] = useState(initialCommunitySlug);
  // Who can find and RSVP to this gathering. Defaults to "members", the
  // wizard's "Public" tier (any signed-in member; see events.api.ts for why
  // the backend's anonymous "public" value is never used here). "community"
  // is only ever a valid selection while `communitySlug` is set: see
  // `setCommunitySlug` below for the fallback when it is cleared.
  const [audienceScope, setAudienceScope] =
    useState<EventVisibility>("members");
  const setCommunitySlug = (value: string) => {
    setCommunitySlugValue(value);
    // The "Community members" tier needs a community. If the host clears
    // their community pick after choosing it, the scope drops back to the
    // wizard's default so it always points at an audience that exists.
    if (!value) {
      setAudienceScope((current) =>
        current === "community" ? "members" : current,
      );
    }
  };
  const [address, setAddress] = useState("");
  const [directions, setDirections] = useState("");
  // The video link for an online gathering (PRD-182). Only ever sent when the
  // host picked the "Online" neighbourhood: a gathering with a door has an
  // address, and `formToCreateEventDto` drops the link for one.
  const [onlineUrl, setOnlineUrl] = useState("");
  // An online gathering's join link has to be a real absolute http(s) URL: the
  // backend's `@IsUrl({ require_protocol: true })` refuses anything else, so
  // catching it here turns a 400 on submit into a hint under the field. Empty
  // is valid, since a host can publish first and add the link later.
  const onlineUrlValid = isValidJoinLink(onlineUrl);

  /** Where the source gathering happened. Copied by a duplicate and by "same
   *  as last time" alike. */
  const applyVenueSeed = (seed: GatheringFormSeed) => {
    setHood(seed.hood);
    setVenue(seed.venue);
    setVenueListingId(seed.venueListingId);
    setVenueListing(seed.venueListing);
    setAddress(seed.address);
    setDirections(seed.directions);
    setOnlineUrl(seed.onlineUrl);
  };

  /** Who the source gathering was for. Copied by a duplicate only. */
  const applyAudienceSeed = (seed: GatheringFormSeed) => {
    setAudienceScope(seed.audienceScope);
    setCommunitySlugValue(seed.communitySlug);
  };

  /** A saved draft's where and who, verbatim, with the one fallback
   *  `setCommunitySlug` also applies. */
  const restoreWhereState = (snapshot: GatheringDraftSnapshot) => {
    setHood(snapshot.hood);
    setVenue(snapshot.venue);
    setVenueListingId(snapshot.venueListingId);
    setVenueListing(snapshot.venueListing);
    setAddress(snapshot.address);
    setDirections(snapshot.directions);
    setOnlineUrl(snapshot.onlineUrl);
    setCommunitySlugValue(snapshot.communitySlug);
    setAudienceScope(
      snapshot.audienceScope === "community" && !snapshot.communitySlug
        ? "members"
        : snapshot.audienceScope,
    );
  };

  const isWhereDirty =
    hood.length > 0 ||
    venue.trim().length > 0 ||
    address.trim().length > 0 ||
    directions.trim().length > 0 ||
    onlineUrl.trim().length > 0 ||
    audienceScope !== "members";

  return {
    hood,
    setHood,
    communitySlug,
    setCommunitySlug,
    audienceScope,
    setAudienceScope,
    venue,
    setVenue,
    venueListingId,
    setVenueListingId,
    venueListing,
    setVenueListing,
    address,
    setAddress,
    directions,
    setDirections,
    onlineUrl,
    setOnlineUrl,
    onlineUrlValid,
    applyVenueSeed,
    applyAudienceSeed,
    restoreWhereState,
    isWhereDirty,
  };
}

/**
 * The ACCESS details of a gathering: its language, what it costs and how it is
 * paid for, and the six accessibility answers with the host's note.
 *
 * Grouped because a duplicate, "same as last time" and a restored draft each
 * copy them as one block.
 */
function useGatheringAccessState() {
  const [lang, setLang] = useState(LANGS[0]!.value);
  // Free-text door price (LOC-18): "5 to 15 EUR sliding scale", "pay what you
  // can at the door", "free". DISPLAY ONLY. There is no payment integration
  // behind this field and nothing in the wizard may suggest otherwise.
  const [cost, setCost] = useState("");
  // How it is paid for. "free" (the default) keeps `cost` off the wire even
  // when text sits in the field, so a price typed before the host switched
  // back to free stays off the card. DISPLAY ONLY, like `cost`.
  const [costKind, setCostKind] = useState<CostKind>("free");
  // The six canonical accessibility questions, three-valued, exactly as a
  // business listing answers them. A checkbox list used to stand here, which
  // could only ever say "yes" or say nothing: "there is a step at the door"
  // and "nobody has told us" came out as the same blank, and a wheelchair user
  // cannot plan an evening around that. Starts as a complete map of `unknown`,
  // which is a real answer in its own right.
  const [accessibilityAnswers, setAccessibilityAnswers] =
    useState<AccessibilityAnswerMap>(emptyAccessibilityAnswers);
  const [accessNotes, setAccessNotes] = useState("");

  const setAccessibilityAnswer = (
    slug: AccessibilitySlug,
    answer: AccessibilityAnswer,
  ) => setAccessibilityAnswers((previous) => ({ ...previous, [slug]: answer }));
  /** How many of the six the host has actually answered, so the review step
   *  can say what is still unanswered and keep it apart from a confident
   *  no. */
  const answeredAccessibilityCount = Object.values(accessibilityAnswers).filter(
    (answer) => answer !== "unknown",
  ).length;

  /** The cost and accessibility half of a seed. The language is each
   *  caller's own call: a duplicate copies it as it stands, and "same as last
   *  time" keeps the form's choice when the source has none. */
  const applyAccessSeed = (seed: GatheringFormSeed) => {
    setCost(seed.cost);
    setCostKind(seed.costKind);
    setAccessibilityAnswers(
      normalizeAccessibilityAnswers(seed.accessibilityAnswers),
    );
    setAccessNotes(seed.accessNotes);
  };

  /** A saved draft's access details, with the cost kind and the six answers
   *  checked on the way in. */
  const restoreAccessState = (snapshot: GatheringDraftSnapshot) => {
    // A language this release does not offer restores as the first option,
    // since the select has no empty choice to show it as.
    const isKnownLanguage = LANGS.some(
      (language) => language.value === snapshot.lang,
    );
    setLang(isKnownLanguage ? snapshot.lang : LANGS[0]!.value);
    setCost(snapshot.cost);
    setCostKind(isCostKind(snapshot.costKind) ? snapshot.costKind : "free");
    setAccessibilityAnswers(
      normalizeAccessibilityAnswers(snapshot.accessibilityAnswers),
    );
    setAccessNotes(snapshot.accessNotes);
  };

  const isAccessDirty =
    accessNotes.trim().length > 0 ||
    cost.trim().length > 0 ||
    costKind !== "free" ||
    answeredAccessibilityCount > 0;

  return {
    lang,
    setLang,
    cost,
    setCost,
    costKind,
    setCostKind,
    accessibilityAnswers,
    setAccessibilityAnswer,
    answeredAccessibilityCount,
    accessNotes,
    setAccessNotes,
    applyAccessSeed,
    restoreAccessState,
    isAccessDirty,
  };
}

/**
 * The draft snapshot's own fields, picked out of the whole form so the
 * snapshot holds plain values only: no setters, no derived answers, none of
 * the fields `GatheringDraftSnapshot` leaves out. Every key is named, so a
 * required field added to the snapshot type fails to compile until it is
 * listed here.
 */
function pickDraftSnapshot(
  form: Required<GatheringDraftSnapshot>,
): GatheringDraftSnapshot {
  return {
    title: form.title,
    description: form.description,
    family: form.family,
    format: form.format,
    otherText: form.otherText,
    formatDetails: form.formatDetails,
    cap: form.cap,
    isCapTouched: form.isCapTouched,
    showAttendeeCount: form.showAttendeeCount,
    isAttendeeCountTouched: form.isAttendeeCountTouched,
    date: form.date,
    time: form.time,
    endDate: form.endDate,
    endTime: form.endTime,
    repeats: form.repeats,
    cadence: form.cadence,
    endType: form.endType,
    endCount: form.endCount,
    endUntil: form.endUntil,
    hood: form.hood,
    communitySlug: form.communitySlug,
    audienceScope: form.audienceScope,
    venue: form.venue,
    venueListingId: form.venueListingId,
    venueListing: form.venueListing,
    address: form.address,
    directions: form.directions,
    onlineUrl: form.onlineUrl,
    lang: form.lang,
    cost: form.cost,
    costKind: form.costKind,
    accessibilityAnswers: form.accessibilityAnswers,
    accessNotes: form.accessNotes,
    themes: form.themes,
    contentNotes: form.contentNotes,
    houseRules: form.houseRules,
    rsvpCutoff: form.rsvpCutoff,
    isRsvpCutoffTouched: form.isRsvpCutoffTouched,
    rsvpQuestions: form.rsvpQuestions,
    customRsvpQuestion: form.customRsvpQuestion,
    allowWaitlist: form.allowWaitlist,
  };
}

/** All wizard form state + helpers, shared by the page and its step
 *  components. */
export function useGatheringForm(initial: GatheringFormInitial = {}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // The schedule. `startAt` feeds the repeats check and sits outside the
  // form's public shape; the other two are seed and draft plumbing.
  const { startAt, applyTimes, restoreSchedule, ...scheduleState } =
    useGatheringSchedule();
  // The care fields, declared before the format half because picking a family
  // reaches into them (`applyFamilyToCare`). The entry points pulled out of the
  // spread are family, seed and draft plumbing, used only inside this hook.
  const {
    applyFamilyToCare,
    applyRsvpFormSeed,
    applyCareSeed,
    restoreCareState,
    isCareDirty,
    ...careState
  } = useGatheringCareState();
  // The family, the format, and the two fields a family sets a starting value
  // for. `applyFormatSeed`, `applyCapacitySeed` and `restoreFormatState` are
  // pulled out of the spread below because they are the duplicate, "same as
  // last time" and draft flows' own entry points, used only inside this hook.
  const {
    applyFormatSeed,
    applyCapacitySeed,
    restoreFormatState,
    ...formatState
  } = useGatheringFormatState(applyFamilyToCare);
  const { restoreRecurrence, ...recurrenceState } =
    useGatheringRecurrenceState(startAt);
  const {
    applyVenueSeed,
    applyAudienceSeed,
    restoreWhereState,
    isWhereDirty,
    ...whereState
  } = useGatheringWhereState(initial.communitySlug ?? "");
  const { applyAccessSeed, restoreAccessState, isAccessDirty, ...accessState } =
    useGatheringAccessState();
  // The cover, in two halves. `coverImageUrl` is the storage key the
  // `event-cover` upload returns, and it is what the payload sends.
  // `coverPreviewUrl` is whatever the preview card can paint straight away
  // (a local object URL, say) and stays in the browser.
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  // Members the host wants as co-hosts, with the name, initials and photo the
  // picker and the preview show for them. Not part of the create payload: each
  // is invited through `POST /events/:slug/cohost-invites` once the create has
  // returned a slug (ruling R12).
  const [cohosts, setCohosts] = useState<CohostPick[]>([]);
  // The slugs alone, which the invites and the readiness count read. Kept on
  // the list's identity, so a render that changed no pick hands back the same
  // array.
  const cohostSlugs = useMemo(
    () => cohosts.map((cohost) => cohost.slug),
    [cohosts],
  );
  // Apply a duplicate's seed the moment it lands (PRD-190). Adjusted during
  // render, React's documented way to reset state when an input changes, keyed
  // on the seed object's own identity so it applies exactly once per fetch and
  // never overwrites an edit the host has since made.
  const [appliedSeed, setAppliedSeed] = useState<GatheringFormSeed | undefined>(
    undefined,
  );
  if (initial.seed && initial.seed !== appliedSeed) {
    setAppliedSeed(initial.seed);
    setTitle(initial.seed.title);
    setDescription(initial.seed.description);
    applyVenueSeed(initial.seed);
    // The family, the format, the host's own words, the details bag, the
    // capacity and the headcount switch, all in one call. See
    // `applyFormatSeed`: the capacity is set there because the family is what
    // would otherwise overwrite it.
    const seededFamily = applyFormatSeed(initial.seed);
    // The care fields, themes narrowed against the family just applied. The
    // clock times the seed also carries are "same as last time" only: a
    // duplicate is a different night, so it keeps the wizard's own default.
    applyCareSeed(initial.seed, seededFamily);
    accessState.setLang(initial.seed.language);
    applyAccessSeed(initial.seed);
    applyAudienceSeed(initial.seed);
  }

  // Two publish-gating confirmations (Code of Care + accessibility accuracy),
  // matching `PLEDGE_TEXT_KEYS.length` (createGathering.data.ts). The
  // third, pricing-honesty confirmation was dropped along with the pricing
  // step.
  const [checks, setChecks] = useState<boolean[]>([false, false]);
  const toggleCheck = (checkIndex: number) =>
    setChecks((previous) =>
      previous.map((isChecked, index) =>
        index === checkIndex ? !isChecked : isChecked,
      ),
    );
  const allChecked = checks.every(Boolean);
  const checkedCount = checks.filter(Boolean).length;

  // Has the organiser entered anything worth warning them about losing? Only
  // fields they actually filled count. The pre-seeded defaults (time,
  // capacity, language, the family's cutoff) stay silent, so an untouched
  // wizard closes without a prompt.
  const dirty =
    Boolean(formatState.family) ||
    formatState.otherText.trim().length > 0 ||
    title.trim().length > 0 ||
    description.trim().length > 0 ||
    scheduleState.date.length > 0 ||
    // Redundant while the end date can only be non-empty once the start date
    // is, and load-bearing the moment the wizard shows both as fields the host
    // can fill in either order.
    scheduleState.endDate.length > 0 ||
    recurrenceState.repeats ||
    checks.some(Boolean) ||
    coverImageUrl.length > 0 ||
    cohosts.length > 0 ||
    isWhereDirty ||
    isAccessDirty ||
    isCareDirty;

  /** Ruling R6: the theme chips to hide, because the chosen family's own
   *  details already ask the same question. */
  const hiddenThemeKeys = hiddenThemeKeysForFamily(formatState.family);

  /** Add or remove one would-be co-host. Matched on the slug, so removing a
   *  person works whichever copy of their display data the caller holds. */
  const toggleCohost = (person: CohostPick) =>
    setCohosts((previous) =>
      previous.some((cohost) => cohost.slug === person.slug)
        ? previous.filter((cohost) => cohost.slug !== person.slug)
        : [...previous, person],
    );

  /**
   * "Same as last time": the logistics of the host's previous gathering, laid
   * onto the form as it stands.
   *
   * Copies where it happens and how it runs: the venue with its listing link,
   * the neighbourhood, address, directions and join link, the start and end
   * time, the capacity, language, cost and cost kind, the house rules, the RSVP
   * questions with the host's own question, and the accessibility answers and
   * note.
   *
   * The title, the date, the format and the two pledges stay exactly as they
   * are: those make this gathering a new one, and a copied pledge would be a
   * default. Themes, content notes, the cutoff and the waitlist stay too,
   * because they describe what this particular gathering is.
   */
  const applyLastGatheringSeed = (seed: GatheringFormSeed) => {
    applyVenueSeed(seed);
    applyTimes(seed.startTime, seed.endTime);
    applyCapacitySeed(seed.capacity);
    // The language select has no empty option, so an empty copy keeps the
    // form's own choice.
    if (seed.language) accessState.setLang(seed.language);
    applyAccessSeed(seed);
    applyRsvpFormSeed(seed);
  };

  /**
   * Put a saved draft back exactly as the host left it.
   *
   * Every value goes in verbatim through the sub-hooks' restore helpers, so
   * nothing auto-adjusts and no family default runs over a restored answer.
   * Vocabulary values are checked on the way in, since a draft may have sat in
   * storage across a release.
   */
  const restoreDraft = (snapshot: GatheringDraftSnapshot) => {
    setTitle(snapshot.title);
    setDescription(snapshot.description);
    restoreFormatState(snapshot);
    restoreSchedule(snapshot);
    restoreRecurrence(snapshot);
    restoreWhereState(snapshot);
    restoreAccessState(snapshot);
    restoreCareState(snapshot);
  };

  const form = {
    // `family`, `format`, `otherText`, `formatDetails`, `cap`, the two
    // touched flags, `showAttendeeCount` and their setters, plus
    // `isFormatChosen`, `capacityDefault` and `submittedFormatDetails`.
    ...formatState,
    title,
    setTitle,
    description,
    setDescription,
    // `date`, `time`, `endDate`, `endTime` and their setters, plus
    // `dateValid`, `scheduleValid` and `spanDays`.
    ...scheduleState,
    // `repeats`, `cadence`, `endType`, `endCount`, `endUntil`, their setters
    // and `recurrenceValid`.
    ...recurrenceState,
    // `hood`, `communitySlug`, `audienceScope`, `venue`, `venueListingId`,
    // `venueListing`, `address`, `directions`, `onlineUrl`, their setters and
    // `onlineUrlValid`.
    ...whereState,
    // `lang`, `cost`, `costKind`, `accessNotes` and their setters, plus
    // `accessibilityAnswers`, `setAccessibilityAnswer` and
    // `answeredAccessibilityCount`.
    ...accessState,
    // Create Gathering v2. `themes`, `toggleTheme`, `contentNotes`,
    // `toggleContentNote`, `houseRules`, `setHouseRules`, `rsvpCutoff`,
    // `setRsvpCutoff`, `isRsvpCutoffTouched`, `rsvpQuestions`,
    // `toggleRsvpQuestion`, `customRsvpQuestion`, `setCustomRsvpQuestion`,
    // `allowWaitlist` and `setAllowWaitlist`.
    ...careState,
    checks,
    allChecked,
    checkedCount,
    toggleCheck,
    dirty,
    hiddenThemeKeys,
    coverImageUrl,
    setCoverImageUrl,
    coverPreviewUrl,
    setCoverPreviewUrl,
    cohosts,
    cohostSlugs,
    toggleCohost,
    applyLastGatheringSeed,
    restoreDraft,
  };

  return {
    ...form,
    /** The form as plain JSON, for saving a draft. `GatheringDraftSnapshot`
     *  says what is left out and why. */
    draftSnapshot: pickDraftSnapshot(form),
  };
}

export type GatheringForm = ReturnType<typeof useGatheringForm>;

/**
 * Is this a join link the backend will accept?
 *
 * Mirrors `CreateEventDto.onlineUrl`'s `@IsUrl({ protocols: ['http','https'],
 * require_protocol: true })`. An empty string is valid: the link is optional,
 * and a host who has not booked the room yet should still be able to publish.
 */
export function isValidJoinLink(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
