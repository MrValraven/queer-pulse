import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getAdminInvites,
  getAdminInviteInviters,
  type AdminInviteDTO,
  type AdminInviteInviterDTO,
  type AdminInviteStatus,
} from "./adminInvites.api";

export type AdminInviteFilter = AdminInviteStatus | "all";

interface AdminInvitesPageVM {
  items: AdminInviteDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Platform-wide invite list for the admin oversight page, paginated and
 * optionally filtered by status. Demo mode returns the colocated
 * `ADMIN_INVITES` fixture (filtered client-side) as a single synthetic page and
 * never hits the network — this is an admin-only endpoint that 403s otherwise,
 * and the fixture is fabricated data that must not surface as platform truth in
 * live mode. Live mode calls `GET /admin/invites?page&status`, stopping once
 * `page * pageSize` reaches the server's real `total`.
 */
export function useAdminInvites(
  filter: AdminInviteFilter,
  inviterSlug: string | null,
) {
  const { demoMode } = useDemoMode();
  const statusArg = filter === "all" ? undefined : filter;
  const inviterArg = inviterSlug ?? undefined;
  const query = useInfiniteQuery<AdminInvitesPageVM>({
    queryKey: ["admin-invites", demoMode, filter, inviterArg ?? null],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { ADMIN_INVITES } = await import("../adminInvites.data");
        const filtered = ADMIN_INVITES.filter(
          (invite) =>
            (!statusArg || invite.status === statusArg) &&
            (!inviterArg || invite.inviter.slug === inviterArg),
        );
        // pageSize === filtered.length (min 1) so getNextPageParam yields
        // undefined — demo never issues a page-2 fetch.
        return {
          items: filtered,
          total: filtered.length,
          page: 1,
          pageSize: filtered.length || 1,
        };
      }
      return getAdminInvites({
        page: pageParam as number,
        status: statusArg,
        inviterSlug: inviterArg,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const invites = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, invites, total };
}

/**
 * Every member who has sent an invite, for the oversight page's sender filter.
 * Demo mode derives the distinct senders (with counts) from the colocated
 * `ADMIN_INVITES` fixture; live mode calls `GET /admin/invites/inviters`. The
 * list is small and changes rarely, so it stays fresh for a few minutes.
 */
export function useAdminInviteInviters() {
  const { demoMode } = useDemoMode();
  const query = useQuery<AdminInviteInviterDTO[]>({
    queryKey: ["admin-invite-inviters", demoMode],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (demoMode) {
        const { ADMIN_INVITES } = await import("../adminInvites.data");
        const bySlug = new Map<string, AdminInviteInviterDTO>();
        for (const invite of ADMIN_INVITES) {
          const existing = bySlug.get(invite.inviter.slug);
          if (existing) {
            existing.count += 1;
          } else {
            bySlug.set(invite.inviter.slug, {
              slug: invite.inviter.slug,
              name: invite.inviter.name,
              avatarUrl: invite.inviter.avatarUrl ?? null,
              count: 1,
            });
          }
        }
        return [...bySlug.values()].sort((first, second) =>
          first.name.localeCompare(second.name),
        );
      }
      return getAdminInviteInviters();
    },
  });
  return { inviters: query.data ?? [], isLoading: query.isLoading };
}
