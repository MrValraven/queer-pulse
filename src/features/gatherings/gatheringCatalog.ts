import type { IconType } from "react-icons";
import {
  FiActivity,
  FiAlignLeft,
  FiAnchor,
  FiBook,
  FiBookOpen,
  FiBox,
  FiCheckSquare,
  FiClipboard,
  FiClock,
  FiCoffee,
  FiCompass,
  FiDroplet,
  FiEdit3,
  FiEye,
  FiFeather,
  FiFileText,
  FiFilm,
  FiFlag,
  FiGift,
  FiGlobe,
  FiGrid,
  FiHeadphones,
  FiHeart,
  FiHelpCircle,
  FiHome,
  FiInfo,
  FiLayers,
  FiLifeBuoy,
  FiMap,
  FiMessageCircle,
  FiMessageSquare,
  FiMic,
  FiMoon,
  FiMoreHorizontal,
  FiMusic,
  FiNavigation,
  FiPenTool,
  FiPlayCircle,
  FiRadio,
  FiRepeat,
  FiScissors,
  FiShare2,
  FiShield,
  FiShoppingBag,
  FiSmile,
  FiSpeaker,
  FiStar,
  FiSun,
  FiSunrise,
  FiSunset,
  FiTarget,
  FiThermometer,
  FiTool,
  FiType,
  FiUmbrella,
  FiUserPlus,
  FiUsers,
  FiVolume2,
  FiWind,
  FiZap,
} from "react-icons/fi";
import type { TFunction } from "../../shared/i18n/types";

/**
 * The ONE place a gathering's vocabulary is declared.
 *
 * A gathering carries two things. A FAMILY: a nine-value closed set, each a
 * distinct energy an attendee can read at a glance, and the only half that
 * drives behaviour (the capacity default, whether the headcount shows, which
 * questions the wizard asks, the browse board's primary facet, and the
 * detail page's conditional modules). And a FORMAT: a curated, stable
 * kebab-case key inside that family, or the host's own text.
 *
 * KEYS ARE STORED VALUES. A format key goes into `events.event_type` and comes
 * back out of it; a family key goes into `events.gathering_family`. Renaming
 * one silently reclassifies every gathering already carrying it, so keys never
 * change even when the copy does. The copy lives in the i18n catalogs.
 *
 * The backend mirrors the family half in `src/events/gathering-family.ts`
 * (queerpulse-backend), including the same per-family detail-key table and the
 * same eight-label legacy backfill. Change one, change the other.
 *
 * i18n Pattern A: every `nameKey`/`subKey` below is a LITERAL string rather
 * than a template built from `key`, so `scripts/report-unused-i18n.mjs` can
 * see each one and never reports the catalog block as dead.
 */

export type GatheringFamily =
  | "meet"
  | "eat"
  | "party"
  | "make"
  | "learn"
  | "watch"
  | "move"
  | "care"
  | "organise";

export const TERRAIN_VALUES = ["flat", "mixed", "steep"] as const;
export type Terrain = (typeof TERRAIN_VALUES)[number];

export const TERRAIN_LABEL_KEYS: Record<Terrain, string> = {
  flat: "gatherings:catalog.details.terrain.flat",
  mixed: "gatherings:catalog.details.terrain.mixed",
  steep: "gatherings:catalog.details.terrain.steep",
};

/**
 * The one or two questions a family raises, answered. Mirrors the backend's
 * `FormatDetails` field for field. Every field optional; a bag with nothing in
 * it is `null`, never `{}`.
 */
export interface FormatDetails {
  bring?: string;
  isAdultsOnly?: boolean;
  isSoberFriendly?: boolean;
  terrain?: Terrain;
  isBeginnerFriendly?: boolean;
  runtimeMinutes?: number;
}

export type FormatDetailKey = keyof FormatDetails;

export const FORMAT_DETAIL_LABEL_KEYS: Record<FormatDetailKey, string> = {
  bring: "gatherings:catalog.details.bring.label",
  isAdultsOnly: "gatherings:catalog.details.isAdultsOnly.label",
  isSoberFriendly: "gatherings:catalog.details.isSoberFriendly.label",
  terrain: "gatherings:catalog.details.terrain.label",
  isBeginnerFriendly: "gatherings:catalog.details.isBeginnerFriendly.label",
  runtimeMinutes: "gatherings:catalog.details.runtimeMinutes.label",
};

export const FORMAT_DETAIL_HINT_KEYS: Record<FormatDetailKey, string> = {
  bring: "gatherings:catalog.details.bring.hint",
  isAdultsOnly: "gatherings:catalog.details.isAdultsOnly.hint",
  isSoberFriendly: "gatherings:catalog.details.isSoberFriendly.hint",
  terrain: "gatherings:catalog.details.terrain.hint",
  isBeginnerFriendly: "gatherings:catalog.details.isBeginnerFriendly.hint",
  runtimeMinutes: "gatherings:catalog.details.runtimeMinutes.hint",
};

/** Bounds mirrored from the backend's `FormatDetailsDto`, so the wizard never
 *  offers a value the API would reject. */
export const MAX_BRING_LENGTH = 200;
export const MIN_RUNTIME_MINUTES = 1;
export const MAX_RUNTIME_MINUTES = 600;

/** The host's own format. One key for all nine families: the family is
 *  already stored separately, so there is nothing to disambiguate. */
export const OTHER_FORMAT_KEY = "other" as const;
export const OTHER_FORMAT_ICON: IconType = FiMoreHorizontal;
export const OTHER_FORMAT_NAME_KEY = "gatherings:catalog.format.other.name";
export const OTHER_FORMAT_SUB_KEY = "gatherings:catalog.format.other.sub";
/** Matches `events.event_type`'s varchar(80) and the DTO's `@MaxLength(80)`. */
export const MAX_OTHER_FORMAT_LENGTH = 80;

export interface GatheringFamilyEntry {
  key: GatheringFamily;
  icon: IconType;
  nameKey: string;
  /** Seats the capacity field starts at while the host has not touched it. */
  capacityDefault: number;
  /** Whether "show how many people are going" starts on. */
  isAttendeeCountShownByDefault: boolean;
  /** Which of the six questions this family asks. */
  detailKeys: readonly FormatDetailKey[];
}

export interface GatheringFormatEntry {
  key: string;
  family: GatheringFamily;
  icon: IconType;
  nameKey: string;
  subKey: string;
}

/**
 * The nine families, in the order the wizard's family row and the browse chip
 * row show them. A family icon may coincide with one format's icon; format
 * icons never coincide with each other (pinned by the test).
 *
 * The capacity defaults are the spec's, and they are OPINIONS about how many
 * seats a format wants: a support circle of forty is not a support circle,
 * and a club night capped at ten is not a club night. They apply only while
 * the host has never touched the field, so they are a starting point rather
 * than a rule.
 *
 * `isAttendeeCountShownByDefault` is false for `care` alone. A support circle
 * whose page says "3 going" tells anyone reading how few people are there,
 * and turns arriving into being counted.
 */
export const GATHERING_FAMILIES: readonly GatheringFamilyEntry[] = [
  {
    key: "meet",
    icon: FiUsers,
    nameKey: "gatherings:catalog.family.meet.name",
    capacityDefault: 30,
    isAttendeeCountShownByDefault: true,
    detailKeys: [],
  },
  {
    key: "eat",
    icon: FiCoffee,
    nameKey: "gatherings:catalog.family.eat.name",
    capacityDefault: 12,
    isAttendeeCountShownByDefault: true,
    detailKeys: ["bring"],
  },
  {
    key: "party",
    icon: FiMoon,
    nameKey: "gatherings:catalog.family.party.name",
    capacityDefault: 40,
    isAttendeeCountShownByDefault: true,
    detailKeys: ["isAdultsOnly", "isSoberFriendly"],
  },
  {
    key: "make",
    icon: FiPenTool,
    nameKey: "gatherings:catalog.family.make.name",
    capacityDefault: 12,
    isAttendeeCountShownByDefault: true,
    detailKeys: ["bring"],
  },
  {
    key: "learn",
    icon: FiBookOpen,
    nameKey: "gatherings:catalog.family.learn.name",
    capacityDefault: 20,
    isAttendeeCountShownByDefault: true,
    detailKeys: [],
  },
  {
    key: "watch",
    icon: FiFilm,
    nameKey: "gatherings:catalog.family.watch.name",
    capacityDefault: 30,
    isAttendeeCountShownByDefault: true,
    detailKeys: ["runtimeMinutes"],
  },
  {
    key: "move",
    icon: FiNavigation,
    nameKey: "gatherings:catalog.family.move.name",
    capacityDefault: 15,
    isAttendeeCountShownByDefault: true,
    detailKeys: ["terrain", "isBeginnerFriendly"],
  },
  {
    key: "care",
    icon: FiHeart,
    nameKey: "gatherings:catalog.family.care.name",
    capacityDefault: 10,
    isAttendeeCountShownByDefault: false,
    detailKeys: [],
  },
  {
    key: "organise",
    icon: FiFlag,
    nameKey: "gatherings:catalog.family.organise.name",
    capacityDefault: 25,
    isAttendeeCountShownByDefault: true,
    detailKeys: [],
  },
];

/**
 * The 56 curated formats, grouped by family in the order each family's grid
 * shows them. "Something else" is deliberately NOT in this list: it is one
 * option offered inside every family (see `OTHER_FORMAT_KEY`) rather than a
 * fifty-seventh row that would need a family of its own.
 */
export const GATHERING_FORMATS: readonly GatheringFormatEntry[] = [
  // ── meet ────────────────────────────────────────────────────────────────
  {
    key: "mixer",
    family: "meet",
    icon: FiSmile,
    nameKey: "gatherings:catalog.format.mixer.name",
    subKey: "gatherings:catalog.format.mixer.sub",
  },
  {
    key: "meetup",
    family: "meet",
    icon: FiUsers,
    nameKey: "gatherings:catalog.format.meetup.name",
    subKey: "gatherings:catalog.format.meetup.sub",
  },
  {
    key: "coffee-morning",
    family: "meet",
    icon: FiCoffee,
    nameKey: "gatherings:catalog.format.coffee-morning.name",
    subKey: "gatherings:catalog.format.coffee-morning.sub",
  },
  {
    key: "newcomers-night",
    family: "meet",
    icon: FiUserPlus,
    nameKey: "gatherings:catalog.format.newcomers-night.name",
    subKey: "gatherings:catalog.format.newcomers-night.sub",
  },
  {
    key: "elders-tea",
    family: "meet",
    icon: FiSunset,
    nameKey: "gatherings:catalog.format.elders-tea.name",
    subKey: "gatherings:catalog.format.elders-tea.sub",
  },
  {
    key: "games-night",
    family: "meet",
    icon: FiGrid,
    nameKey: "gatherings:catalog.format.games-night.name",
    subKey: "gatherings:catalog.format.games-night.sub",
  },
  {
    key: "quiz",
    family: "meet",
    icon: FiHelpCircle,
    nameKey: "gatherings:catalog.format.quiz.name",
    subKey: "gatherings:catalog.format.quiz.sub",
  },
  // ── eat ─────────────────────────────────────────────────────────────────
  {
    key: "supper-club",
    family: "eat",
    icon: FiHome,
    nameKey: "gatherings:catalog.format.supper-club.name",
    subKey: "gatherings:catalog.format.supper-club.sub",
  },
  {
    key: "potluck",
    family: "eat",
    icon: FiBox,
    nameKey: "gatherings:catalog.format.potluck.name",
    subKey: "gatherings:catalog.format.potluck.sub",
  },
  {
    key: "picnic",
    family: "eat",
    icon: FiSun,
    nameKey: "gatherings:catalog.format.picnic.name",
    subKey: "gatherings:catalog.format.picnic.sub",
  },
  {
    key: "brunch",
    family: "eat",
    icon: FiSunrise,
    nameKey: "gatherings:catalog.format.brunch.name",
    subKey: "gatherings:catalog.format.brunch.sub",
  },
  {
    key: "cooking-together",
    family: "eat",
    icon: FiThermometer,
    nameKey: "gatherings:catalog.format.cooking-together.name",
    subKey: "gatherings:catalog.format.cooking-together.sub",
  },
  {
    key: "drinks",
    family: "eat",
    icon: FiDroplet,
    nameKey: "gatherings:catalog.format.drinks.name",
    subKey: "gatherings:catalog.format.drinks.sub",
  },
  // ── party ───────────────────────────────────────────────────────────────
  {
    key: "house-party",
    family: "party",
    icon: FiSpeaker,
    nameKey: "gatherings:catalog.format.house-party.name",
    subKey: "gatherings:catalog.format.house-party.sub",
  },
  {
    key: "club-night",
    family: "party",
    icon: FiMoon,
    nameKey: "gatherings:catalog.format.club-night.name",
    subKey: "gatherings:catalog.format.club-night.sub",
  },
  {
    key: "listening-party",
    family: "party",
    icon: FiHeadphones,
    nameKey: "gatherings:catalog.format.listening-party.name",
    subKey: "gatherings:catalog.format.listening-party.sub",
  },
  {
    key: "karaoke",
    family: "party",
    icon: FiMic,
    nameKey: "gatherings:catalog.format.karaoke.name",
    subKey: "gatherings:catalog.format.karaoke.sub",
  },
  {
    key: "drag-night",
    family: "party",
    icon: FiStar,
    nameKey: "gatherings:catalog.format.drag-night.name",
    subKey: "gatherings:catalog.format.drag-night.sub",
  },
  {
    key: "dance",
    family: "party",
    icon: FiMusic,
    nameKey: "gatherings:catalog.format.dance.name",
    subKey: "gatherings:catalog.format.dance.sub",
  },
  // ── make ────────────────────────────────────────────────────────────────
  {
    key: "collage-night",
    family: "make",
    icon: FiScissors,
    nameKey: "gatherings:catalog.format.collage-night.name",
    subKey: "gatherings:catalog.format.collage-night.sub",
  },
  {
    key: "craft-circle",
    family: "make",
    icon: FiTool,
    nameKey: "gatherings:catalog.format.craft-circle.name",
    subKey: "gatherings:catalog.format.craft-circle.sub",
  },
  {
    key: "zine-making",
    family: "make",
    icon: FiFileText,
    nameKey: "gatherings:catalog.format.zine-making.name",
    subKey: "gatherings:catalog.format.zine-making.sub",
  },
  {
    key: "life-drawing",
    family: "make",
    icon: FiEdit3,
    nameKey: "gatherings:catalog.format.life-drawing.name",
    subKey: "gatherings:catalog.format.life-drawing.sub",
  },
  {
    key: "writing-circle",
    family: "make",
    icon: FiType,
    nameKey: "gatherings:catalog.format.writing-circle.name",
    subKey: "gatherings:catalog.format.writing-circle.sub",
  },
  {
    key: "jam-session",
    family: "make",
    icon: FiRadio,
    nameKey: "gatherings:catalog.format.jam-session.name",
    subKey: "gatherings:catalog.format.jam-session.sub",
  },
  {
    key: "studio-visit",
    family: "make",
    icon: FiFeather,
    nameKey: "gatherings:catalog.format.studio-visit.name",
    subKey: "gatherings:catalog.format.studio-visit.sub",
  },
  // ── learn ───────────────────────────────────────────────────────────────
  {
    key: "workshop",
    family: "learn",
    icon: FiBook,
    nameKey: "gatherings:catalog.format.workshop.name",
    subKey: "gatherings:catalog.format.workshop.sub",
  },
  {
    key: "talk-or-panel",
    family: "learn",
    icon: FiMessageSquare,
    nameKey: "gatherings:catalog.format.talk-or-panel.name",
    subKey: "gatherings:catalog.format.talk-or-panel.sub",
  },
  {
    key: "skills-exchange",
    family: "learn",
    icon: FiRepeat,
    nameKey: "gatherings:catalog.format.skills-exchange.name",
    subKey: "gatherings:catalog.format.skills-exchange.sub",
  },
  {
    key: "book-club",
    family: "learn",
    icon: FiBookOpen,
    nameKey: "gatherings:catalog.format.book-club.name",
    subKey: "gatherings:catalog.format.book-club.sub",
  },
  {
    key: "language-exchange",
    family: "learn",
    icon: FiGlobe,
    nameKey: "gatherings:catalog.format.language-exchange.name",
    subKey: "gatherings:catalog.format.language-exchange.sub",
  },
  {
    key: "discussion",
    family: "learn",
    icon: FiMessageCircle,
    nameKey: "gatherings:catalog.format.discussion.name",
    subKey: "gatherings:catalog.format.discussion.sub",
  },
  {
    key: "info-night",
    family: "learn",
    icon: FiInfo,
    nameKey: "gatherings:catalog.format.info-night.name",
    subKey: "gatherings:catalog.format.info-night.sub",
  },
  // ── watch ───────────────────────────────────────────────────────────────
  {
    key: "screening",
    family: "watch",
    icon: FiFilm,
    nameKey: "gatherings:catalog.format.screening.name",
    subKey: "gatherings:catalog.format.screening.sub",
  },
  {
    key: "live-performance",
    family: "watch",
    icon: FiPlayCircle,
    nameKey: "gatherings:catalog.format.live-performance.name",
    subKey: "gatherings:catalog.format.live-performance.sub",
  },
  {
    key: "open-mic",
    family: "watch",
    icon: FiVolume2,
    nameKey: "gatherings:catalog.format.open-mic.name",
    subKey: "gatherings:catalog.format.open-mic.sub",
  },
  {
    key: "poetry-reading",
    family: "watch",
    icon: FiAlignLeft,
    nameKey: "gatherings:catalog.format.poetry-reading.name",
    subKey: "gatherings:catalog.format.poetry-reading.sub",
  },
  {
    key: "open-rehearsal",
    family: "watch",
    icon: FiEye,
    nameKey: "gatherings:catalog.format.open-rehearsal.name",
    subKey: "gatherings:catalog.format.open-rehearsal.sub",
  },
  // ── move ────────────────────────────────────────────────────────────────
  {
    key: "walk-or-hike",
    family: "move",
    icon: FiMap,
    nameKey: "gatherings:catalog.format.walk-or-hike.name",
    subKey: "gatherings:catalog.format.walk-or-hike.sub",
  },
  {
    key: "run-club",
    family: "move",
    icon: FiActivity,
    nameKey: "gatherings:catalog.format.run-club.name",
    subKey: "gatherings:catalog.format.run-club.sub",
  },
  {
    key: "swim",
    family: "move",
    icon: FiAnchor,
    nameKey: "gatherings:catalog.format.swim.name",
    subKey: "gatherings:catalog.format.swim.sub",
  },
  {
    key: "beach-day",
    family: "move",
    icon: FiUmbrella,
    nameKey: "gatherings:catalog.format.beach-day.name",
    subKey: "gatherings:catalog.format.beach-day.sub",
  },
  {
    key: "bike-ride",
    family: "move",
    icon: FiCompass,
    nameKey: "gatherings:catalog.format.bike-ride.name",
    subKey: "gatherings:catalog.format.bike-ride.sub",
  },
  {
    key: "yoga-or-movement",
    family: "move",
    icon: FiWind,
    nameKey: "gatherings:catalog.format.yoga-or-movement.name",
    subKey: "gatherings:catalog.format.yoga-or-movement.sub",
  },
  {
    key: "pickup-sport",
    family: "move",
    icon: FiTarget,
    nameKey: "gatherings:catalog.format.pickup-sport.name",
    subKey: "gatherings:catalog.format.pickup-sport.sub",
  },
  // ── care ────────────────────────────────────────────────────────────────
  {
    key: "support-circle",
    family: "care",
    icon: FiHeart,
    nameKey: "gatherings:catalog.format.support-circle.name",
    subKey: "gatherings:catalog.format.support-circle.sub",
  },
  {
    key: "peer-group",
    family: "care",
    icon: FiLifeBuoy,
    nameKey: "gatherings:catalog.format.peer-group.name",
    subKey: "gatherings:catalog.format.peer-group.sub",
  },
  {
    key: "clinic",
    family: "care",
    icon: FiShield,
    nameKey: "gatherings:catalog.format.clinic.name",
    subKey: "gatherings:catalog.format.clinic.sub",
  },
  {
    key: "mutual-aid",
    family: "care",
    icon: FiShare2,
    nameKey: "gatherings:catalog.format.mutual-aid.name",
    subKey: "gatherings:catalog.format.mutual-aid.sub",
  },
  {
    key: "office-hours",
    family: "care",
    icon: FiClock,
    nameKey: "gatherings:catalog.format.office-hours.name",
    subKey: "gatherings:catalog.format.office-hours.sub",
  },
  // ── organise ────────────────────────────────────────────────────────────
  {
    key: "meeting",
    family: "organise",
    icon: FiClipboard,
    nameKey: "gatherings:catalog.format.meeting.name",
    subKey: "gatherings:catalog.format.meeting.sub",
  },
  {
    key: "assembly",
    family: "organise",
    icon: FiLayers,
    nameKey: "gatherings:catalog.format.assembly.name",
    subKey: "gatherings:catalog.format.assembly.sub",
  },
  {
    key: "volunteer-shift",
    family: "organise",
    icon: FiCheckSquare,
    nameKey: "gatherings:catalog.format.volunteer-shift.name",
    subKey: "gatherings:catalog.format.volunteer-shift.sub",
  },
  {
    key: "fundraiser",
    family: "organise",
    icon: FiGift,
    nameKey: "gatherings:catalog.format.fundraiser.name",
    subKey: "gatherings:catalog.format.fundraiser.sub",
  },
  {
    key: "market",
    family: "organise",
    icon: FiShoppingBag,
    nameKey: "gatherings:catalog.format.market.name",
    subKey: "gatherings:catalog.format.market.sub",
  },
  {
    key: "launch",
    family: "organise",
    icon: FiZap,
    nameKey: "gatherings:catalog.format.launch.name",
    subKey: "gatherings:catalog.format.launch.sub",
  },
];

/** The family entry for a key, or undefined for an unclassified gathering. */
export function findFamily(
  key: string | null | undefined,
): GatheringFamilyEntry | undefined {
  if (!key) return undefined;
  return GATHERING_FAMILIES.find((family) => family.key === key);
}

/** Every curated format inside one family, in grid order. */
export function formatsForFamily(
  family: GatheringFamily,
): readonly GatheringFormatEntry[] {
  return GATHERING_FORMATS.filter((format) => format.family === family);
}

/** The catalog entry for a stored format key, or undefined when the stored
 *  value is a host's own words (or nothing at all). */
export function findFormat(
  key: string | null | undefined,
): GatheringFormatEntry | undefined {
  if (!key) return undefined;
  return GATHERING_FORMATS.find((format) => format.key === key);
}

/**
 * How a stored `event_type` reads on screen, in three cases and in this order:
 * a curated key resolves to its translated name; anything else the host wrote
 * shows verbatim (it is their sentence, and translating it would be inventing
 * one); nothing at all reads as the generic word rather than a blank line.
 */
export function formatLabel(
  t: TFunction,
  storedType: string | null | undefined,
): string {
  const trimmed = storedType?.trim() ?? "";
  if (!trimmed) return t("gatherings:catalog.format.unset");
  const format = findFormat(trimmed);
  return format ? t(format.nameKey) : trimmed;
}

/**
 * The eight labels the old wizard could store, and the family each becomes.
 *
 * VERBATIM from the migration's backfill table (queerpulse-backend,
 * `gathering-family.ts` and `1817080000000-AddGatheringFamilyAndFormatDetails`).
 * Used by the duplicate-a-gathering seed and by the demo registry, so a
 * gathering written before families existed still opens the wizard on the
 * right family. "Other" is deliberately absent: the literal word said nothing.
 */
const LEGACY_LABEL_ENTRIES: readonly {
  label: string;
  family: GatheringFamily;
  formatKey: string;
}[] = [
  { label: "supper club", family: "eat", formatKey: "supper-club" },
  { label: "workshop / talk", family: "learn", formatKey: "workshop" },
  { label: "screening", family: "watch", formatKey: "screening" },
  { label: "studio visit", family: "make", formatKey: "studio-visit" },
  { label: "walk or outdoor", family: "move", formatKey: "walk-or-hike" },
  { label: "discussion", family: "learn", formatKey: "discussion" },
  { label: "skills exchange", family: "learn", formatKey: "skills-exchange" },
];

/** The family one of the eight old labels maps to, matched case-insensitively
 *  exactly as the migration matches it. Undefined for anything else. */
export function familyForLegacyLabel(
  label: string | null | undefined,
): GatheringFamily | undefined {
  const normalized = label?.trim().toLowerCase() ?? "";
  if (!normalized) return undefined;
  return LEGACY_LABEL_ENTRIES.find((entry) => entry.label === normalized)
    ?.family;
}

/** The format key one of the eight old labels maps to. Undefined otherwise. */
export function formatKeyForLegacyLabel(
  label: string | null | undefined,
): string | undefined {
  const normalized = label?.trim().toLowerCase() ?? "";
  if (!normalized) return undefined;
  return LEGACY_LABEL_ENTRIES.find((entry) => entry.label === normalized)
    ?.formatKey;
}

/** Which of the six questions this family asks. None, for no family. */
export function allowedDetailKeys(
  family: GatheringFamily | null | undefined,
): readonly FormatDetailKey[] {
  return findFamily(family)?.detailKeys ?? [];
}

/**
 * The bag narrowed to what this family allows, or null when nothing survives.
 *
 * The client-side twin of the backend's `stripDisallowedDetails`. Both exist
 * on purpose: this one keeps the wizard from ever putting a stale answer on
 * the wire (so the review step reads what will actually be stored), and the
 * server's keeps that true for every other client.
 *
 * `bring` gets the same reading the backend gives it: a line that is blank or
 * only whitespace is what a host sends by tabbing past the field, which is the
 * same fact as leaving the question unanswered, so it is dropped rather than
 * stored as an empty string. A `bring` that does survive is stored trimmed.
 */
export function stripDisallowedDetails(
  family: GatheringFamily | null | undefined,
  details: FormatDetails | null | undefined,
): FormatDetails | null {
  if (!details) return null;
  const allowed = allowedDetailKeys(family);
  const kept: FormatDetails = {};
  let hasAnyKey = false;
  for (const key of allowed) {
    const value = details[key];
    if (value === undefined || value === null) continue;
    // Per-key assignment rather than a spread so the result is typed field by
    // field instead of widened to a partial record of unions.
    if (key === "bring") {
      // Blank is not an answer, and a surviving line is stored trimmed, which
      // is exactly what the backend twin does. A non-string is treated the
      // same way, since there is no line to store either.
      const trimmedBring = typeof value === "string" ? value.trim() : "";
      if (trimmedBring !== "") {
        kept.bring = trimmedBring;
        hasAnyKey = true;
      }
    } else if (key === "isAdultsOnly" && typeof value === "boolean") {
      kept.isAdultsOnly = value;
      hasAnyKey = true;
    } else if (key === "isSoberFriendly" && typeof value === "boolean") {
      kept.isSoberFriendly = value;
      hasAnyKey = true;
    } else if (key === "terrain" && typeof value === "string") {
      kept.terrain = value as Terrain;
      hasAnyKey = true;
    } else if (key === "isBeginnerFriendly" && typeof value === "boolean") {
      kept.isBeginnerFriendly = value;
      hasAnyKey = true;
    } else if (key === "runtimeMinutes" && typeof value === "number") {
      if (!Number.isFinite(value)) continue;
      kept.runtimeMinutes = value;
      hasAnyKey = true;
    }
  }
  return hasAnyKey ? kept : null;
}

/**
 * Has the host answered any of this family's questions? Drives whether the
 * review row and the detail page's "Good to know" block render at all.
 *
 * A whitespace-only string counts as unanswered, which is the same reading
 * `stripDisallowedDetails` gives a blank `bring`. The two have to agree, or a
 * bag that strips down to null still opens an empty "Good to know" block.
 *
 * An explicit `false` counts as unanswered too. Every boolean here is a
 * one-way fact a host turns on ("adults only", "sober friendly", "good for
 * beginners"), and none of the surfaces reading this bag print the negative:
 * a `false` renders nothing at all. So `{ isAdultsOnly: false }` would open a
 * "Good to know" block with no rows under it. A number has to be finite for
 * the same reason: `NaN` prints as no runtime anyone can read.
 */
export function hasAnyDetail(
  details: FormatDetails | null | undefined,
): boolean {
  if (!details) return false;
  return Object.values(details).some((value) => {
    if (value === undefined || value === null) return false;
    if (typeof value === "string") return value.trim() !== "";
    if (typeof value === "number") return Number.isFinite(value);
    if (typeof value === "boolean") return value;
    return true;
  });
}
