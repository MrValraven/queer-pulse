import type { IconType } from "react-icons";
import { FiLayers, FiMapPin, FiMonitor } from "react-icons/fi";
import type {
  CardTableSummary,
  SafetyTool,
  SubprofileKind,
  TableFormat,
  TableVibe,
} from "./api/subprofiles.api";
import { SKIN_OF } from "./subprofile-skins";

/**
 * The fixed vocabularies of a Quest persona's "At the table" block, in the
 * order they display. The editor's chips, the page renderer, the directory's
 * Refine group and the demo card summary all read these, so a value can only
 * mean one thing. The backend keeps the same lists in
 * `subprofile-table-summary.ts`.
 */
export const TABLE_FORMATS: readonly TableFormat[] = [
  "online",
  "in_person",
  "both",
];
export const TABLE_VIBES: readonly TableVibe[] = [
  "queer_led",
  "trans_led",
  "beginner_friendly",
  "adults_only",
  "neurodivergent_friendly",
  "accessible_venue",
];
export const SAFETY_TOOLS: readonly SafetyTool[] = [
  "session_zero",
  "lines_and_veils",
  "x_card",
  "open_door",
  "check_ins",
  "content_warnings",
];

export const TABLE_FORMAT_LABEL_KEY: Record<TableFormat, string> = {
  online: "subprofiles:quest.format.online",
  in_person: "subprofiles:quest.format.in_person",
  both: "subprofiles:quest.format.both",
};
/** What each format means at the table, under its tile in the editor. */
export const TABLE_FORMAT_DESCRIPTION_KEY: Record<TableFormat, string> = {
  online: "subprofiles:quest.formatDescription.online",
  in_person: "subprofiles:quest.formatDescription.in_person",
  both: "subprofiles:quest.formatDescription.both",
};
export const TABLE_FORMAT_ICON: Record<TableFormat, IconType> = {
  online: FiMonitor,
  in_person: FiMapPin,
  both: FiLayers,
};
export const TABLE_VIBE_LABEL_KEY: Record<TableVibe, string> = {
  queer_led: "subprofiles:quest.vibe.queer_led",
  trans_led: "subprofiles:quest.vibe.trans_led",
  beginner_friendly: "subprofiles:quest.vibe.beginner_friendly",
  adults_only: "subprofiles:quest.vibe.adults_only",
  neurodivergent_friendly: "subprofiles:quest.vibe.neurodivergent_friendly",
  accessible_venue: "subprofiles:quest.vibe.accessible_venue",
};
export const SAFETY_TOOL_LABEL_KEY: Record<SafetyTool, string> = {
  session_zero: "subprofiles:quest.safety.session_zero",
  lines_and_veils: "subprofiles:quest.safety.lines_and_veils",
  x_card: "subprofiles:quest.safety.x_card",
  open_door: "subprofiles:quest.safety.open_door",
  check_ins: "subprofiles:quest.safety.check_ins",
  content_warnings: "subprofiles:quest.safety.content_warnings",
};

/** One line per safety tool, under its tile in the editor: someone new to
 *  running a table may not know what "lines and veils" asks of them. */
export const SAFETY_TOOL_DESCRIPTION_KEY: Record<SafetyTool, string> = {
  session_zero: "subprofiles:quest.safetyDescription.session_zero",
  lines_and_veils: "subprofiles:quest.safetyDescription.lines_and_veils",
  x_card: "subprofiles:quest.safetyDescription.x_card",
  open_door: "subprofiles:quest.safetyDescription.open_door",
  check_ins: "subprofiles:quest.safetyDescription.check_ins",
  content_warnings: "subprofiles:quest.safetyDescription.content_warnings",
};

/** Game systems offered as one-tap chips under "Systems you run": the ones
 *  queer tables in Lisbon run most, plus the big names. Proper names, so
 *  they are not translated; an owner's own system is typed in as before. */
export const POPULAR_SYSTEMS: readonly string[] = [
  "D&D 5e",
  "Pathfinder 2e",
  "Daggerheart",
  "Call of Cthulhu",
  "Blades in the Dark",
  "Monsterhearts",
  "Thirsty Sword Lesbians",
  "Masks",
  "Dungeon World",
  "Vampire: The Masquerade",
  "Mothership",
  "Wanderhome",
  "Avatar Legends",
  "Delta Green",
];

export const isQuestKind = (kind: SubprofileKind): boolean =>
  SKIN_OF[kind] === "quest";

/** The entries of `values` that `allowed` knows, in `allowed`'s order, once
 *  each. Anything that is not an array yields none. `skinData` has no server
 *  schema, so every reader of the block goes through this. */
export function knownOptions<T extends string>(
  values: unknown,
  allowed: readonly T[],
): T[] {
  if (!Array.isArray(values)) return [];
  return allowed.filter((option) => values.includes(option));
}

/** The directory card's table summary, cleaned exactly like the backend's
 *  `toCardTableSummary`. Undefined outside Quest or when nothing is set. */
export function toCardTableSummary(
  kind: SubprofileKind,
  raw: unknown,
): CardTableSummary | undefined {
  if (!isQuestKind(kind) || !raw || typeof raw !== "object") return undefined;
  const block = raw as { format?: unknown; vibe?: unknown };
  const format = TABLE_FORMATS.find((value) => value === block.format) ?? null;
  const vibe = knownOptions(block.vibe, TABLE_VIBES);
  if (format === null && vibe.length === 0) return undefined;
  return { format, vibe };
}
