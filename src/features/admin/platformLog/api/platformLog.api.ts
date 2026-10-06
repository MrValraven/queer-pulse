import { apiGet } from "../../../../shared/api/client";

export type PlatformLogCategory =
  "moderation" | "staff" | "governance" | "reviews" | "members";

export const PLATFORM_LOG_CATEGORIES: readonly PlatformLogCategory[] = [
  "moderation",
  "staff",
  "governance",
  "reviews",
  "members",
];

export type PlatformLogRange = "today" | "week" | "month" | "quarter" | "all";

export const PLATFORM_LOG_RANGES: readonly PlatformLogRange[] = [
  "today",
  "week",
  "month",
  "quarter",
  "all",
];

export type PlatformLogPartyKind =
  "staff" | "member" | "system" | "anonymous" | "erased";

/** Mirrors the backend `PlatformLogPartyDTO`; `userId` is null unless the party can be filtered by. */
export interface PlatformLogPartyDTO {
  userId: string | null;
  name: string;
  kind: PlatformLogPartyKind;
}

export interface PlatformLogEntryDTO {
  id: string;
  occurredAt: string;
  category: PlatformLogCategory;
  kind: string;
  actor: PlatformLogPartyDTO;
  target: PlatformLogPartyDTO | null;
  subject: { label: string; route: string | null } | null;
  params: Record<string, string>;
  note: string | null;
}

export interface PlatformLogPageDTO {
  data: PlatformLogEntryDTO[];
  pageInfo: { nextCursor: string | null; hasMore: boolean };
}

export interface PlatformLogParams {
  cursor?: string;
  categories: readonly PlatformLogCategory[];
  range: PlatformLogRange;
  memberId: string | null;
}

export const PLATFORM_LOG_PAGE_SIZE = 30;

/** `GET /admin/log`. The server scopes a moderator to staff actions on its own. */
export function getPlatformLog(
  params: PlatformLogParams,
): Promise<PlatformLogPageDTO> {
  const search = new URLSearchParams();
  search.set("limit", String(PLATFORM_LOG_PAGE_SIZE));
  if (params.cursor) search.set("cursor", params.cursor);
  if (params.categories.length > 0) {
    search.set("categories", params.categories.join(","));
  }
  if (params.range !== "all") search.set("range", params.range);
  if (params.memberId) search.set("memberId", params.memberId);
  return apiGet<PlatformLogPageDTO>(`/admin/log?${search.toString()}`);
}
