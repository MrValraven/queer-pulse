import type { EventBrowseFilters } from "../api/events.api";

/**
 * Browse filters (LOC-17).
 *
 * "What is on this Friday near Arroios" is four clauses, and until now not one
 * of them was expressible: the search box and the chips filtered client-side
 * over whatever pages had already loaded, so every answer under-reported until
 * the member had scrolled the whole feed. These four axes go to the server,
 * which applies them in SQL, so a filtered browse survives pagination.
 *
 * Every one of them round-trips through the URL, so a filtered board can be
 * bookmarked, shared, and reloaded into the same view.
 *
 * Lisbon is the only city this product serves, so `hood` is a neighbourhood.
 */

/** URL parameter names, in one place so the reader and the writer agree. */
export const BROWSE_PARAMS = {
  query: "q",
  when: "when",
  hood: "hood",
  type: "type",
  cost: "cost",
} as const;

/** The date presets the chips offer. `any` is the absence of a bound. */
export const WHEN_PRESETS = [
  "any",
  "today",
  "weekend",
  "week",
  "month",
] as const;
export type WhenPreset = (typeof WHEN_PRESETS)[number];

export const WHEN_LABEL_KEYS: Record<WhenPreset, string> = {
  any: "gatherings:hub.browse.when.any",
  today: "gatherings:hub.browse.when.today",
  weekend: "gatherings:hub.browse.when.weekend",
  week: "gatherings:hub.browse.when.week",
  month: "gatherings:hub.browse.when.month",
};

/** The three cost states. Omitting the axis is its own answer: a gathering
 *  whose host has said nothing about cost belongs in neither bucket. */
export const COST_FILTERS = ["any", "free", "paid"] as const;
export type CostFilter = (typeof COST_FILTERS)[number];

export const COST_LABEL_KEYS: Record<CostFilter, string> = {
  any: "gatherings:hub.browse.cost.any",
  free: "gatherings:hub.browse.cost.free",
  paid: "gatherings:hub.browse.cost.paid",
};

/** What the browse controls hold, before it becomes a query string. */
export interface BrowseFilterState {
  query: string;
  when: WhenPreset;
  hood: string;
  type: string;
  cost: CostFilter;
}

export const EMPTY_BROWSE_FILTERS: BrowseFilterState = {
  query: "",
  when: "any",
  hood: "",
  type: "",
  cost: "any",
};

function isWhenPreset(value: string): value is WhenPreset {
  return (WHEN_PRESETS as readonly string[]).includes(value);
}

function isCostFilter(value: string): value is CostFilter {
  return (COST_FILTERS as readonly string[]).includes(value);
}

/** Read the filter state back out of the URL. Anything unrecognised falls back
 *  to the neutral value rather than narrowing the board to nothing. */
export function readBrowseFilters(params: URLSearchParams): BrowseFilterState {
  const when = params.get(BROWSE_PARAMS.when) ?? "";
  const cost = params.get(BROWSE_PARAMS.cost) ?? "";
  return {
    query: params.get(BROWSE_PARAMS.query) ?? "",
    when: isWhenPreset(when) ? when : "any",
    hood: params.get(BROWSE_PARAMS.hood) ?? "",
    type: params.get(BROWSE_PARAMS.type) ?? "",
    cost: isCostFilter(cost) ? cost : "any",
  };
}

/** Write one filter change back into a URLSearchParams, dropping neutral
 *  values so a default board keeps a clean URL. */
export function writeBrowseFilters(
  previous: URLSearchParams,
  next: BrowseFilterState,
): URLSearchParams {
  const params = new URLSearchParams(previous);
  const set = (key: string, value: string, neutral: string) => {
    if (value && value !== neutral) params.set(key, value);
    else params.delete(key);
  };
  set(BROWSE_PARAMS.query, next.query.trim(), "");
  set(BROWSE_PARAMS.when, next.when, "any");
  set(BROWSE_PARAMS.hood, next.hood, "");
  set(BROWSE_PARAMS.type, next.type, "");
  set(BROWSE_PARAMS.cost, next.cost, "any");
  return params;
}

/** True when the member has narrowed the board at all. */
export function hasActiveBrowseFilters(state: BrowseFilterState): boolean {
  return (
    state.query.trim() !== "" ||
    state.when !== "any" ||
    state.hood !== "" ||
    state.type !== "" ||
    state.cost !== "any"
  );
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/**
 * Turn a date preset into the two instants the server filters on.
 *
 * "This weekend" means the coming Friday evening through Sunday night, which
 * is what somebody asking the question means by it. When it is already the
 * weekend, it means the rest of this one rather than the next.
 */
export function whenPresetRange(
  preset: WhenPreset,
  now: Date,
): { from?: string; to?: string } {
  if (preset === "any") return {};
  if (preset === "today") {
    return { from: now.toISOString(), to: endOfDay(now).toISOString() };
  }
  if (preset === "week") {
    return {
      from: now.toISOString(),
      to: endOfDay(addDays(now, 7)).toISOString(),
    };
  }
  if (preset === "month") {
    return {
      from: now.toISOString(),
      to: endOfDay(addDays(now, 30)).toISOString(),
    };
  }
  // Weekend: Friday 17:00 through Sunday night.
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  const isAlreadyWeekend =
    dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;
  const friday = startOfDay(addDays(now, daysUntilFriday));
  friday.setHours(17, 0, 0, 0);
  const from = isAlreadyWeekend ? now : friday;
  const daysUntilSunday = isAlreadyWeekend
    ? (7 - dayOfWeek) % 7
    : daysUntilFriday + 2;
  return {
    from: from.toISOString(),
    to: endOfDay(addDays(now, daysUntilSunday)).toISOString(),
  };
}

/** The filter state as the query the API takes. */
export function toEventBrowseFilters(
  state: BrowseFilterState,
  now: Date,
): EventBrowseFilters {
  const range = whenPresetRange(state.when, now);
  return {
    ...range,
    ...(state.hood ? { hood: state.hood } : {}),
    ...(state.type ? { type: state.type } : {}),
    ...(state.query.trim() ? { q: state.query.trim() } : {}),
    ...(state.cost !== "any" ? { cost: state.cost } : {}),
  };
}
