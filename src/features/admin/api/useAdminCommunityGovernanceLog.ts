import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getAdminCommunityGovernanceLog,
  type AdminGovernanceLogPageDTO,
  type GovernanceLogAction,
} from "./adminCommunityGovernanceLog.api";
import { ADMIN_COMMUNITIES_KEY } from "./useAdminCommunities";

/** Mirrors the backend's `PAGE_SIZE` (`src/common/pagination.ts`), which the
 *  governance-log endpoint paginates by. The response echoes `pageSize` back,
 *  so the reader prefers that and only falls back to this constant. */
export const GOVERNANCE_LOG_PAGE_SIZE = 20;

/** The exact key one page of a community's governance trail caches under.
 *  Nested under `ADMIN_COMMUNITIES_KEY` on purpose: the admin override
 *  mutations that write governance entries already invalidate that prefix, so
 *  the trail refreshes with the community it belongs to. */
export function adminCommunityGovernanceLogQueryKey(
  slug: string,
  demoMode: boolean,
  page: number,
  action: GovernanceLogAction | undefined,
) {
  return [
    ADMIN_COMMUNITIES_KEY,
    "governance-log",
    slug,
    demoMode,
    page,
    action ?? "all",
  ] as const;
}

/** Every cached page of one community's trail, for a mutation that just wrote
 *  a new entry to invalidate. */
export function adminCommunityGovernanceLogPrefix(slug: string) {
  return [ADMIN_COMMUNITIES_KEY, "governance-log", slug] as const;
}

async function buildDemoPage(
  slug: string,
  page: number,
  action: GovernanceLogAction | undefined,
): Promise<AdminGovernanceLogPageDTO> {
  const { GOVERNANCE_LOG_BY_SLUG } = await import(
    "../adminCommunityGovernanceLog.mock"
  );
  const trail = GOVERNANCE_LOG_BY_SLUG[slug] ?? [];
  const filtered = action
    ? trail.filter((entry) => entry.action === action)
    : trail;
  const start = (page - 1) * GOVERNANCE_LOG_PAGE_SIZE;
  return {
    items: filtered.slice(start, start + GOVERNANCE_LOG_PAGE_SIZE),
    total: filtered.length,
    page,
    pageSize: GOVERNANCE_LOG_PAGE_SIZE,
  };
}

/**
 * One page of a community's governance audit trail, newest first.
 *
 * Demo mode filters and slices the colocated fixture in memory (dynamically
 * imported, so it never reaches the live bundle); live mode calls
 * `GET /admin/communities/:slug/governance-log` with the same page/action as
 * server-side query params. Both branches return the backend's own
 * `Paginated` envelope, so nothing downstream branches on `demoMode`.
 *
 * The raw query is returned rather than a flattened `{ items, loading }`
 * shape: an admin must be able to tell a failed or forbidden request apart
 * from a community that genuinely has no governance history, and collapsing
 * `isError` into an empty list is exactly how an audit trail lies.
 */
export function useAdminCommunityGovernanceLog(
  slug: string,
  page: number,
  action: GovernanceLogAction | undefined,
) {
  const { demoMode } = useDemoMode();
  return useQuery<AdminGovernanceLogPageDTO>({
    queryKey: adminCommunityGovernanceLogQueryKey(slug, demoMode, page, action),
    queryFn: () =>
      demoMode
        ? buildDemoPage(slug, page, action)
        : getAdminCommunityGovernanceLog(slug, { page, action }),
  });
}
