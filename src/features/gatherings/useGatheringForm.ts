import { useState } from "react";
import {
  emptyAccessibilityAnswers,
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

/**
 * Everything "Duplicate this gathering" copies forward (PRD-190).
 *
 * NOT the date, the time or the two publish confirmations. A duplicate exists
 * precisely because the next one is on a different night, and the Code of Care
 * and accessibility-accuracy pledges are statements the host makes about THIS
 * gathering — re-using a tick from a previous one would turn a promise into a
 * default.
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

// ── Local calendar-day arithmetic ──────────────────────────────────
// The wizard stores dates as `"YYYY-MM-DD"` and reads them back as LOCAL
// calendar days, matching how the rest of this file builds
// `new Date(`${date}T${time}`)`. `new Date("2026-10-17")` is parsed as UTC
// midnight instead, which lands on 16 October in every zone behind UTC, so the
// year/month/day parts are handed to the constructor explicitly here. This is
// exactly the kind of code a later reader "simplifies" straight back into an
// off-by-one-day bug.

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** A `"YYYY-MM-DD"` string as a local calendar day, or null when it is not one. */
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
 * by definition. `startAt` is `dateValid`'s own start instant, `time || "19:00"`
 * fallback included.
 */
function evaluateSchedule(
  date: string,
  endDate: string,
  endTime: string,
  startAt: Date | null,
): { spanDays: number; isValid: boolean } {
  // The end date the wizard would actually put on the wire. A form that has no
  // end date yet (a seeded duplicate, or a host who cleared the field) gets the
  // adapter's own fallback repeated here: the start day, rolled forward when
  // the end time lands at or before the start time.
  //
  // THESE TWO FALLBACKS MUST STAY IDENTICAL. The other one is
  // `combineEndDateTime` in api/events.adapters.ts. A gate that disagrees with
  // the payload builder refuses a schedule the wire would have taken happily,
  // and the host meets a step that will not advance with nothing on screen
  // saying why.
  const rolledEndDate =
    endTime &&
    startAt &&
    new Date(`${date}T${endTime}`).getTime() <= startAt.getTime()
      ? addDays(date, 1)
      : date;
  const effectiveEndDate = endDate || rolledEndDate;
  // Descriptive only: 0 for a gathering that begins and ends on one day, 2 for
  // a Friday-to-Sunday festival. It is what the step renders, and the cap below
  // deliberately does not consult it.
  const spanDays = wholeDaysBetween(date, effectiveEndDate) ?? 0;
  if (!endTime) return { spanDays, isValid: true };
  const endAt = new Date(`${effectiveEndDate}T${endTime}`);
  const isValid =
    !!startAt &&
    !Number.isNaN(startAt.getTime()) &&
    !Number.isNaN(endAt.getTime()) &&
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
  // `Date.now()` during render is non-idempotent (impure); instead we capture the
  // clock once and refresh it whenever the organiser edits the date or time — the
  // only fields that affect whether the start is still in the future — so the
  // validity the user sees always reflects the moment they changed the value.
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

  // A gathering must have a real start that's still in the future: the backend
  // rejects both a missing date and a past one, so the wizard gates step 2 on
  // this. Mirrors the adapter's `time || "19:00"` fallback so the check matches
  // exactly what gets submitted.
  const startAt = date ? new Date(`${date}T${time || "19:00"}`) : null;
  const dateValid =
    !!startAt && !Number.isNaN(startAt.getTime()) && startAt.getTime() > now;

  // How long it runs and whether the API would take it. See
  // `evaluateSchedule`: it mirrors the backend's own `assertScheduleValid`.
  const schedule = evaluateSchedule(date, endDate, endTime, startAt);
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
function useGatheringFormatState() {
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
    setCap(seed.capacity);
    if (seed.capacity) setIsCapTouched(true);
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
  };
}

/** All wizard form state + helpers, shared by the page and its step components. */
export function useGatheringForm(initial: GatheringFormInitial = {}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const {
    date,
    setDate,
    time,
    setTime,
    endDate,
    setEndDate,
    endTime,
    setEndTime,
    startAt,
    dateValid,
    spanDays,
    scheduleValid,
  } = useGatheringSchedule();
  // The family, the format, and the two fields a family sets a starting value
  // for. `applyFormatSeed` is pulled out of the spread below because it is the
  // duplicate flow's own entry point rather than something a step renders.
  const { applyFormatSeed, ...formatState } = useGatheringFormatState();
  // ── Repeats (MSG-10) — a deliberately minimal cadence + end-condition
  // pair, never an RFC5545/RRULE picker. `repeats` off (the default) means
  // a normal one-off gathering; `formToCreateEventDto` (events.adapters.ts)
  // only sends `recurrence` at all when it's on.
  const [repeats, setRepeats] = useState(false);
  const [cadence, setCadence] = useState<RecurrenceCadence>("weekly");
  const [endType, setEndType] = useState<RecurrenceEndType>("count");
  const [endCount, setEndCount] = useState("8");
  const [endUntil, setEndUntil] = useState("");
  const [hood, setHood] = useState("");
  const [venue, setVenue] = useState("");
  // The venue's directory link, when the organiser picked a real listing
  // instead of typing free text — settable via the venue picker, which sets
  // all three of `venue`/`venueListingId`/`venueListing` together. Cleared
  // (`null`) whenever the organiser types their own text instead.
  const [venueListingId, setVenueListingId] = useState<string | null>(null);
  const [venueListing, setVenueListing] = useState<{
    slug: string;
    name: string;
  } | null>(null);
  // The community this gathering is posted to, or "" for a public gathering
  // visible to everyone (the wizard's default — matches prior behaviour).
  // Seeded from `initial.communitySlug` when the host arrived through a
  // community's "host a gathering here" link; "" (a public gathering) is the
  // default everywhere else.
  const [communitySlug, setCommunitySlugValue] = useState(
    initial.communitySlug ?? "",
  );
  // Who can find and RSVP to this gathering. Defaults to "members" — the
  // wizard's "Public" tier (any signed-in member; see events.api.ts for why
  // the backend's anonymous "public" value is never used here). "community"
  // is only ever a valid selection while `communitySlug` is set — see
  // `setCommunitySlug` below for the fallback when it's cleared.
  const [audienceScope, setAudienceScope] =
    useState<EventVisibility>("members");
  const setCommunitySlug = (value: string) => {
    setCommunitySlugValue(value);
    // The "Community members" tier is mutually exclusive with an unset
    // community — if the host clears their community pick after choosing it,
    // drop back to the wizard's default rather than leaving the scope
    // pointing at an audience that no longer exists.
    if (!value) {
      setAudienceScope((current) =>
        current === "community" ? "members" : current,
      );
    }
  };
  const [address, setAddress] = useState("");
  const [directions, setDirections] = useState("");
  // The video link for an online gathering (PRD-182). Only ever sent when the
  // host picked the "Online" neighbourhood — a gathering with a door has an
  // address, not a link, and `formToCreateEventDto` drops this for one.
  const [onlineUrl, setOnlineUrl] = useState("");
  const [lang, setLang] = useState(LANGS[0]!.value);
  // Free-text door price (LOC-18): "5 to 15 EUR sliding scale", "pay what you
  // can at the door", "free". DISPLAY ONLY. There is no payment integration
  // behind this field and nothing in the wizard may suggest otherwise.
  const [cost, setCost] = useState("");
  // The six canonical accessibility questions, three-valued, exactly as a
  // business listing answers them. A checkbox list used to stand here, which
  // could only ever say "yes" or say nothing: "there is a step at the door"
  // and "nobody has told us" came out as the same blank, and a wheelchair user
  // cannot plan an evening around that. Starts as a complete map of `unknown`,
  // which is a real answer rather than an absent key.
  const [accessibilityAnswers, setAccessibilityAnswers] =
    useState<AccessibilityAnswerMap>(emptyAccessibilityAnswers);
  const [accessNotes, setAccessNotes] = useState("");
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
    setHood(initial.seed.hood);
    setVenue(initial.seed.venue);
    setVenueListingId(initial.seed.venueListingId);
    setVenueListing(initial.seed.venueListing);
    setAddress(initial.seed.address);
    setDirections(initial.seed.directions);
    setOnlineUrl(initial.seed.onlineUrl);
    // The family, the format, the host's own words, the details bag, the
    // capacity and the headcount switch, all in one call. See
    // `applyFormatSeed`: the capacity is set there because the family is what
    // would otherwise overwrite it.
    applyFormatSeed(initial.seed);
    setLang(initial.seed.language);
    setCost(initial.seed.cost);
    setAccessibilityAnswers(initial.seed.accessibilityAnswers);
    setAccessNotes(initial.seed.accessNotes);
    setAudienceScope(initial.seed.audienceScope);
    setCommunitySlugValue(initial.seed.communitySlug);
  }

  // Two publish-gating confirmations (Code of Care + accessibility accuracy)
  // — matches `CONFIRM_CHECK_KEYS.length` (createGathering.data.ts). The
  // third, pricing-honesty confirmation was dropped along with the pricing
  // step: see `TOTAL_STEPS`'s doc there.
  const [checks, setChecks] = useState<boolean[]>([false, false]);

  const setAccessibilityAnswer = (
    slug: AccessibilitySlug,
    answer: AccessibilityAnswer,
  ) => setAccessibilityAnswers((previous) => ({ ...previous, [slug]: answer }));
  /** How many of the six the host has actually answered, so the review step
   *  can say what is still unanswered instead of implying six confident nos. */
  const answeredAccessibilityCount = Object.values(accessibilityAnswers).filter(
    (answer) => answer !== "unknown",
  ).length;
  const toggleCheck = (i: number) =>
    setChecks((prev) => prev.map((v, j) => (j === i ? !v : v)));

  const allChecked = checks.every(Boolean);
  const checkedCount = checks.filter(Boolean).length;

  // Off (the common case) is always valid. On, the chosen end condition must
  // itself be well-formed: a count in `[MIN_RECURRENCE_OCCURRENCES,
  // MAX_RECURRENCE_OCCURRENCES]`, or an end date strictly after the
  // gathering's own start — mirrors the backend's own `resolveOccurrences`
  // checks (events.service.ts) so the wizard never submits a rule the server
  // would reject.
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

  // An online gathering's join link has to be a real absolute http(s) URL: the
  // backend's `@IsUrl({ require_protocol: true })` rejects anything else, so
  // catching it here turns a 400 on submit into a hint under the field. Empty
  // is valid — a host can publish first and add the link later.
  const onlineUrlValid = isValidJoinLink(onlineUrl);

  // Has the organiser entered anything worth warning them about losing? Only
  // fields they actually filled count — the pre-seeded defaults (time, capacity,
  // language) don't, so an untouched wizard never prompts on exit.
  const dirty =
    Boolean(formatState.family) ||
    formatState.otherText.trim().length > 0 ||
    title.trim().length > 0 ||
    description.trim().length > 0 ||
    date.length > 0 ||
    // Redundant while the end date can only be non-empty once the start date
    // is, and load-bearing the moment the wizard shows both as fields the host
    // can fill in either order.
    endDate.length > 0 ||
    hood.length > 0 ||
    venue.trim().length > 0 ||
    address.trim().length > 0 ||
    directions.trim().length > 0 ||
    onlineUrl.trim().length > 0 ||
    accessNotes.trim().length > 0 ||
    cost.trim().length > 0 ||
    answeredAccessibilityCount > 0 ||
    checks.some(Boolean) ||
    audienceScope !== "members" ||
    repeats;

  return {
    // `family`, `format`, `otherText`, `formatDetails`, `cap`, the two
    // touched flags, `showAttendeeCount` and their setters, plus
    // `isFormatChosen`, `capacityDefault` and `submittedFormatDetails`.
    ...formatState,
    title,
    setTitle,
    description,
    setDescription,
    date,
    setDate,
    time,
    setTime,
    endDate,
    setEndDate,
    endTime,
    setEndTime,
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
    lang,
    setLang,
    cost,
    setCost,
    accessibilityAnswers,
    setAccessibilityAnswer,
    answeredAccessibilityCount,
    accessNotes,
    setAccessNotes,
    checks,
    allChecked,
    checkedCount,
    dateValid,
    scheduleValid,
    spanDays,
    dirty,
    toggleCheck,
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
