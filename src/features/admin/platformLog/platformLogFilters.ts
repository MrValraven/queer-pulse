import {
  PLATFORM_LOG_CATEGORIES,
  PLATFORM_LOG_RANGES,
  type PlatformLogCategory,
  type PlatformLogRange,
} from "./api/platformLog.api";

/** The log's filters, held in the URL as `category`, `range` and `member`. */
export interface PlatformLogFilters {
  categories: PlatformLogCategory[];
  range: PlatformLogRange;
  memberId: string | null;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isCategory(value: string): value is PlatformLogCategory {
  return (PLATFORM_LOG_CATEGORIES as readonly string[]).includes(value);
}

function isRange(value: string): value is PlatformLogRange {
  return (PLATFORM_LOG_RANGES as readonly string[]).includes(value);
}

export function readPlatformLogFilters(
  search: URLSearchParams,
  isAdmin: boolean,
): PlatformLogFilters {
  const categories = (search.get("category") ?? "")
    .split(",")
    .filter(isCategory)
    .filter((category) => isAdmin || category !== "members");
  const rangeValue = search.get("range") ?? "";
  const memberValue = search.get("member") ?? "";
  return {
    categories: [...new Set(categories)],
    range: isRange(rangeValue) ? rangeValue : "all",
    memberId: UUID_PATTERN.test(memberValue) ? memberValue : null,
  };
}

export function writePlatformLogFilters(
  filters: PlatformLogFilters,
): URLSearchParams {
  const search = new URLSearchParams();
  if (filters.categories.length > 0) {
    search.set("category", filters.categories.join(","));
  }
  if (filters.range !== "all") search.set("range", filters.range);
  if (filters.memberId) search.set("member", filters.memberId);
  return search;
}
