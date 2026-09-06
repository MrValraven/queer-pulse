import { useState } from "react";
import type { IconType } from "react-icons";
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
  MAX_RECURRENCE_OCCURRENCES,
  MIN_RECURRENCE_OCCURRENCES,
  TYPES,
} from "./createGathering.data";

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
  type: string;
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

/** All wizard form state + helpers, shared by the page and its step components. */
export function useGatheringForm(initial: GatheringFormInitial = {}) {
  const [type, setType] = useState("");
  const [typeIcon, setTypeIcon] = useState<IconType | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDateValue] = useState("");
  const [time, setTimeValue] = useState("19:00");
  // Snapshot of "now" used by the future-start check below. Reading a live
  // `Date.now()` during render is non-idempotent (impure); instead we capture the
  // clock once and refresh it whenever the organiser edits the date or time — the
  // only fields that affect whether the start is still in the future — so the
  // validity the user sees always reflects the moment they changed the value.
  const [now, setNow] = useState(() => Date.now());
  const setDate = (value: string) => {
    setNow(Date.now());
    setDateValue(value);
  };
  const setTime = (value: string) => {
    setNow(Date.now());
    setTimeValue(value);
  };
  const [endTime, setEndTime] = useState("22:00");
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
  const [cap, setCap] = useState("14");
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
    setType(initial.seed.type);
    // The icon is part of the same pick, so it is resolved from the canonical
    // type list rather than left null — the review step renders it, and a
    // duplicate landing there with a missing glyph would read as broken.
    const seededType = initial.seed.type;
    setTypeIcon(
      TYPES.find((gatheringType) => gatheringType.value === seededType)?.icon ??
        null,
    );
    setTitle(initial.seed.title);
    setDescription(initial.seed.description);
    setHood(initial.seed.hood);
    setVenue(initial.seed.venue);
    setVenueListingId(initial.seed.venueListingId);
    setVenueListing(initial.seed.venueListing);
    setAddress(initial.seed.address);
    setDirections(initial.seed.directions);
    setOnlineUrl(initial.seed.onlineUrl);
    setCap(initial.seed.capacity);
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

  const selectType = (name: string, icon: IconType) => {
    setType(name);
    setTypeIcon(() => icon);
  };
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

  // A gathering must have a real start that's still in the future: the backend
  // rejects both a missing date and a past one, so the wizard gates step 2 on
  // this. Mirrors the adapter's `time || "19:00"` fallback so the check matches
  // exactly what gets submitted.
  const startAt = date ? new Date(`${date}T${time || "19:00"}`) : null;
  const dateValid =
    !!startAt && !Number.isNaN(startAt.getTime()) && startAt.getTime() > now;

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
    Boolean(type) ||
    title.trim().length > 0 ||
    description.trim().length > 0 ||
    date.length > 0 ||
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
    type,
    typeIcon,
    title,
    setTitle,
    description,
    setDescription,
    date,
    setDate,
    time,
    setTime,
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
    cap,
    setCap,
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
    dirty,
    selectType,
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
