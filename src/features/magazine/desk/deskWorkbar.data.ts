import type { IconType } from "react-icons";
import { FiCalendar, FiFileText, FiGrid, FiList } from "react-icons/fi";
import type { Editor, Stage } from "../data/desk.data";
import type { DeskLayoutOption } from "./DeskWorkbar";
import type { DeskGroupBy } from "./pipelineGroups";
import type {
  DeskDensity,
  PieceFormatFilter,
  PieceSortOption,
} from "./useDeskState";

/** One choice in a workbar menu: the value it sets and its label key. */
export interface DeskWorkbarOption<Value extends string> {
  value: Value;
  labelKey: string;
}

/** One work-area layout: the segmented switch on wide screens and the
 *  layout menu on a phone both read this list, so they always offer the same
 *  layouts under the same names and icons. */
export interface DeskLayoutChoice extends DeskWorkbarOption<DeskLayoutOption> {
  icon: IconType;
}

const DESK_LAYOUT_CHOICES: DeskLayoutChoice[] = [
  {
    value: "list",
    labelKey: "magazine:desk.header.layout.pipeline",
    icon: FiList,
  },
  {
    value: "board",
    labelKey: "magazine:desk.header.layout.board",
    icon: FiGrid,
  },
  {
    value: "plan",
    labelKey: "magazine:desk.header.layout.issuePlan",
    icon: FiFileText,
  },
  {
    value: "calendar",
    labelKey: "magazine:desk.workbar.layout.calendar",
    icon: FiCalendar,
  },
];

/** The layouts on offer: Calendar only while `isCalendarAvailable`. */
export function deskLayoutChoices(
  isCalendarAvailable: boolean,
): DeskLayoutChoice[] {
  return DESK_LAYOUT_CHOICES.filter(
    (choice) => isCalendarAvailable || choice.value !== "calendar",
  );
}

/** The search field's placeholders, longest first: the workbar shows the
 *  first one its field can hold whole (`useDeskWorkbarFit`). */
export const DESK_SEARCH_PLACEHOLDER_KEYS = [
  "magazine:desk.workbar.searchPlaceholder",
  "magazine:desk.workbar.searchPlaceholderMedium",
  "magazine:desk.workbar.searchPlaceholderShort",
] as const;

/** Filter menu, Format radios. Reuses the old toolbar's format labels. */
export const DESK_FORMAT_OPTIONS: DeskWorkbarOption<PieceFormatFilter>[] = [
  { value: "all", labelKey: "magazine:desk.toolbar.format.everything" },
  { value: "article", labelKey: "magazine:desk.toolbar.format.articles" },
  { value: "deck", labelKey: "magazine:desk.toolbar.format.decks" },
];

/** Sort menu, "Sort by" radios. The old toolbar's labels carried a "Sort ·"
 *  prefix for a bare select; under a heading the plain noun reads better. */
export const DESK_SORT_OPTIONS: DeskWorkbarOption<PieceSortOption>[] = [
  { value: "due", labelKey: "magazine:desk.workbar.sort.due" },
  { value: "stage", labelKey: "magazine:desk.workbar.field.stage" },
  { value: "sec", labelKey: "magazine:desk.workbar.field.section" },
];

/** Sort menu, "Group by" radios, in the order `DeskGroupBy` is documented. */
export const DESK_GROUP_OPTIONS: DeskWorkbarOption<DeskGroupBy>[] = [
  { value: "waiting", labelKey: "magazine:desk.workbar.sort.waitingOn" },
  { value: "stage", labelKey: "magazine:desk.workbar.field.stage" },
  { value: "section", labelKey: "magazine:desk.workbar.field.section" },
  { value: "none", labelKey: "magazine:desk.workbar.sort.none" },
];

/** Sort menu, "Density" radios. */
export const DESK_DENSITY_OPTIONS: DeskWorkbarOption<DeskDensity>[] = [
  { value: "comfortable", labelKey: "magazine:desk.workbar.sort.comfortable" },
  { value: "compact", labelKey: "magazine:desk.workbar.sort.compact" },
];

/** The label key of `value` in `options`, or undefined for an unknown value. */
export function optionLabelKey<Value extends string>(
  options: DeskWorkbarOption<Value>[],
  value: Value,
): string | undefined {
  return options.find((option) => option.value === value)?.labelKey;
}

/** The label the desk uses for an editor in tight chrome: the first name. */
export function editorShortName(editor: Editor): string {
  return editor.name.split(" ")[0] || editor.name;
}

/** Adds `value` when absent, removes it when present. Keeps list order. */
export function toggleListValue<Value>(list: Value[], value: Value): Value[] {
  return list.includes(value)
    ? list.filter((entry) => entry !== value)
    : [...list, value];
}

/** How many Filter-menu narrowings are on: one each for a format and an
 *  editor, one per ticked section and stage. Drives the trigger's badge. */
export function countActiveDeskFilters(filters: {
  format: PieceFormatFilter;
  sectionFilter: string[];
  stageFilter: Stage[];
  editorFilter: string | null;
}): number {
  return (
    (filters.format === "all" ? 0 : 1) +
    filters.sectionFilter.length +
    filters.stageFilter.length +
    (filters.editorFilter === null ? 0 : 1)
  );
}
