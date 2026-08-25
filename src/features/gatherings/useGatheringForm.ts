import { useState } from "react";
import type { IconType } from "react-icons";
import type {
  EventVisibility,
  RecurrenceCadence,
  RecurrenceEndType,
} from "./api/events.api";
import {
  LANGS,
  MAX_RECURRENCE_OCCURRENCES,
  MIN_RECURRENCE_OCCURRENCES,
} from "./createGathering.data";

/** What the wizard may start out with, rather than empty. Today that is only
 *  the community a gathering is filed to, seeded from the
 *  `/create-gathering?community=<slug>` deep link (see `createGatheringPath`
 *  in data.ts) so a community's Events tab can offer "host a gathering here".
 *  Read once, on mount: the host can still change or clear it in the wizard. */
export interface GatheringFormInitial {
  communitySlug?: string;
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
  const [cap, setCap] = useState("14");
  const [lang, setLang] = useState(LANGS[0]!.value);
  const [access, setAccess] = useState<Set<string>>(new Set());
  const [accessNotes, setAccessNotes] = useState("");
  // Two publish-gating confirmations (Code of Care + accessibility accuracy)
  // — matches `CONFIRM_CHECK_KEYS.length` (createGathering.data.ts). The
  // third, pricing-honesty confirmation was dropped along with the pricing
  // step: see `TOTAL_STEPS`'s doc there.
  const [checks, setChecks] = useState<boolean[]>([false, false]);

  const selectType = (name: string, icon: IconType) => {
    setType(name);
    setTypeIcon(() => icon);
  };
  const toggleAccess = (name: string) =>
    setAccess((prev) => {
      const n = new Set(prev);
      if (n.has(name)) n.delete(name);
      else n.add(name);
      return n;
    });
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
    accessNotes.trim().length > 0 ||
    access.size > 0 ||
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
    cap,
    setCap,
    lang,
    setLang,
    access,
    accessNotes,
    setAccessNotes,
    checks,
    allChecked,
    checkedCount,
    dateValid,
    dirty,
    selectType,
    toggleAccess,
    toggleCheck,
  };
}

export type GatheringForm = ReturnType<typeof useGatheringForm>;
