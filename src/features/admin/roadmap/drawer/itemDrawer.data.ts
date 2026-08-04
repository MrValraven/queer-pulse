import type {
  AdminRoadmapItemDTO,
  RoadmapColumn,
  RoadmapGuideDTO,
  RoadmapItemWriteBody,
  RoadmapPriority,
  RoadmapTeamMemberDTO,
} from "../../api/roadmapAdmin.types";
import { getUniqueCategories } from "../roadmapChrome.data";

// Pure helpers for the item drawer's field grid + section defaults — no JSX,
// so `ItemDrawer.tsx` and the section components can import from here
// without pulling any component code along.

export const CATEGORY_KEYS = [
  "resources",
  "gatherings",
  "members",
  "safety",
  "content",
  "messaging",
  "community",
  "economy",
  "platform",
] as const;

export const COLUMN_VALUES: RoadmapColumn[] = [
  "backlog",
  "planned",
  "building",
  "shipped",
];

export const PRIORITY_VALUES: RoadmapPriority[] = ["P0", "P1", "P2", "P3"];

export interface SelectOption {
  value: string;
  label: string;
}

/** The 9 named categories (translated) plus any free-text category already
 *  present on an item that isn't one of them — `category` is admin free
 *  text (see `roadmapChrome.data.ts`'s `getUniqueCategories`), so an
 *  outlier value must still appear as a selectable option or editing that
 *  item would silently reset its category. */
export function buildCategoryOptions(
  items: AdminRoadmapItemDTO[],
  t: (key: string) => string,
): SelectOption[] {
  const named = CATEGORY_KEYS.map((category) => ({
    value: category,
    label: t(`admin:roadmap.categories.${category}`),
  }));
  const extra = getUniqueCategories(items).filter(
    (category) => !(CATEGORY_KEYS as readonly string[]).includes(category),
  );
  return [...named, ...extra.map((category) => ({ value: category, label: category }))];
}

/** `category` is admin free text — resolve to its translated label only
 *  when it's one of the 9 named categories, otherwise show it verbatim
 *  (an outlier value, same rule `buildCategoryOptions` above follows). */
export function resolveCategoryLabel(
  category: string,
  t: (key: string) => string,
): string {
  return (CATEGORY_KEYS as readonly string[]).includes(category)
    ? t(`admin:roadmap.categories.${category}`)
    : category;
}

export const COLUMN_CHIP_TONE: Record<RoadmapColumn, "ghost" | "plum" | "coral" | "jade"> = {
  backlog: "ghost",
  planned: "plum",
  building: "coral",
  shipped: "jade",
};

export function buildOwnerOptions(
  team: RoadmapTeamMemberDTO[],
  unassignedLabel: string,
): SelectOption[] {
  return [
    { value: "", label: unassignedLabel },
    ...team.map((member) => ({ value: member.userId, label: member.name })),
  ];
}

function quarterOfDate(date: Date): { quarter: number; year: number } {
  return { quarter: Math.floor(date.getMonth() / 3) + 1, year: date.getFullYear() };
}

function quarterLabel(quarter: number, year: number): string {
  return `Q${quarter} ${year}`;
}

function shiftQuarter(
  quarter: number,
  year: number,
  offset: number,
): { quarter: number; year: number } {
  const total = quarter - 1 + offset;
  const yearsToAdd = Math.floor(total / 4);
  const nextQuarter = ((total % 4) + 4) % 4;
  return { quarter: nextQuarter + 1, year: year + yearsToAdd };
}

function quarterSortKey(label: string): number {
  const match = /^Q(\d)\s+(\d{4})$/.exec(label);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[2]) * 4 + Number(match[1]);
}

/** One quarter back through four quarters ahead of today, unioned with
 *  every `targetQuarter` already in use (so an existing far-future/past
 *  value never silently disappears from its own select). */
export function buildQuarterOptions(
  items: AdminRoadmapItemDTO[],
  currentQuarter: string | null,
): string[] {
  const { quarter, year } = quarterOfDate(new Date());
  const generated = Array.from({ length: 6 }, (_, index) => {
    const shifted = shiftQuarter(quarter, year, index - 1);
    return quarterLabel(shifted.quarter, shifted.year);
  });
  const existing = items
    .map((item) => item.targetQuarter)
    .filter((value): value is string => Boolean(value));
  if (currentQuarter) existing.push(currentQuarter);
  return Array.from(new Set([...generated, ...existing])).sort(
    (a, b) => quarterSortKey(a) - quarterSortKey(b),
  );
}

export const DEFAULT_GUIDE: RoadmapGuideDTO = {
  steps: {
    research: false,
    draft: false,
    lived: false,
    expert: false,
    translate: false,
    publish: false,
  },
  reviewer: "",
  credential: "",
  reVerifyBy: null,
  languages: { en: false, pt: false, br: false },
};

/** Starting values for a brand-new item's local draft — parked in backlog,
 *  mid confidence/priority, nothing public or committed yet. `sortOrder`
 *  goes to the end of the backlog column so it doesn't jump ahead of
 *  existing cards. */
export function buildDraftDefaults(items: AdminRoadmapItemDTO[]): RoadmapItemWriteBody {
  const nextSortOrder =
    items
      .filter((item) => item.column === "backlog")
      .reduce((max, item) => Math.max(max, item.sortOrder), -1) + 1;

  return {
    column: "backlog",
    category: CATEGORY_KEYS[0],
    name: "",
    description: "",
    publicNote: null,
    date: null,
    stage: null,
    eta: null,
    targetQuarter: null,
    progress: null,
    priority: "P2",
    confidence: "maybe",
    committed: false,
    isPublic: false,
    requested: false,
    hot: false,
    notified: false,
    spikeFlag: false,
    safetyStatus: 0,
    blockedBy: null,
    blockedWhy: null,
    paidKind: "volunteer",
    weeklyHours: 0,
    cost: "none",
    ownerId: null,
    votes: 0,
    guide: null,
    sortOrder: nextSortOrder,
  };
}

/** Sum of `weeklyHours` across every item this owner is actively building
 *  right now — the same "load" the Capacity view (a sibling task) computes,
 *  read here just to show one line next to the hours field. */
export function computeOwnerLoadHours(
  items: AdminRoadmapItemDTO[],
  ownerId: string | null,
): number {
  if (!ownerId) return 0;
  return items
    .filter((item) => item.ownerId === ownerId && item.column === "building")
    .reduce((total, item) => total + item.weeklyHours, 0);
}

const MS_PER_DAY = 86_400_000;

export function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / MS_PER_DAY));
}

export function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / MS_PER_DAY);
}
