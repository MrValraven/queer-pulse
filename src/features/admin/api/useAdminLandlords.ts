import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { ItemsPage } from "../../../shared/api/pagination";
import {
  ADMIN_LANDLORDS_DEMO,
  ADMIN_LANDLORD_INTRO_REQUESTS_DEMO,
} from "../adminLandlords.data";
import {
  getAdminIntroRequests,
  getAdminLandlords,
  removeAdminLandlord,
  setAdminLandlordStatus,
  triageAdminIntroRequest,
  type AdminLandlordDTO,
  type LandlordIntroFilter,
  type LandlordIntroRequestDTO,
  type LandlordStatus,
  type LandlordStatusFilter,
} from "./adminLandlords.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

export const ADMIN_LANDLORDS_KEY = "admin-landlords";
export const ADMIN_LANDLORD_INTROS_KEY = "admin-landlord-intro-requests";

function singlePage<T>(items: T[]): ItemsPage<T> {
  return { items, total: items.length, page: 1, pageSize: items.length || 1 };
}

/**
 * The landlord directory, paginated, newest first.
 *
 * Demo mode filters the colocated fixture the way the backend filters the real
 * table and never touches the network: this is a moderator-only endpoint that
 * 403s otherwise, and the fixture is fabricated data that must never surface as
 * platform truth. Live mode calls `GET /admin/landlords?status&hood&q&page`.
 */
export function useAdminLandlords(
  filter: LandlordStatusFilter,
  search: string,
) {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<ItemsPage<AdminLandlordDTO>>({
    queryKey: [ADMIN_LANDLORDS_KEY, demoMode, filter, search],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => {
      if (demoMode) {
        const needle = search.trim().toLowerCase();
        return Promise.resolve(
          singlePage(
            ADMIN_LANDLORDS_DEMO.filter(
              (landlord) =>
                (filter === "all" || landlord.status === filter) &&
                (!needle || landlord.name.toLowerCase().includes(needle)),
            ),
          ),
        );
      }
      return getAdminLandlords(
        {
          page: pageParam as number,
          status: filter === "all" ? undefined : filter,
          q: search.trim() || undefined,
        },
        signal,
      );
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const landlords = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, landlords, total };
}

/** One page of introduction requests, newest first. Same dual-mode contract. */
export function useAdminLandlordIntroRequests(filter: LandlordIntroFilter) {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<ItemsPage<LandlordIntroRequestDTO>>({
    queryKey: [ADMIN_LANDLORD_INTROS_KEY, demoMode, filter],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => {
      if (demoMode) {
        return Promise.resolve(
          singlePage(
            ADMIN_LANDLORD_INTRO_REQUESTS_DEMO.filter(
              (request) => filter === "all" || request.status === filter,
            ),
          ),
        );
      }
      return getAdminIntroRequests(
        {
          page: pageParam as number,
          status: filter === "all" ? undefined : filter,
        },
        signal,
      );
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const requests = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, requests, total };
}

type LandlordCache = InfiniteData<ItemsPage<AdminLandlordDTO>>;
type IntroCache = InfiniteData<ItemsPage<LandlordIntroRequestDTO>>;

export interface SetLandlordStatusVars {
  landlord: AdminLandlordDTO;
  status: LandlordStatus;
  reason?: string;
}

/**
 * Publish a suggested entry, or hold it back.
 *
 * The row is patched in place across every cached tab in BOTH modes (the
 * optimistic patch is demo mode's only source of truth) and then dropped from
 * any tab whose filter it no longer matches, so the "waiting" tab shrinks as
 * the moderator works. Live mode refetches to pick up the server's ordering.
 */
export function useSetAdminLandlordStatus() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useDemoAwareMutation<
    unknown,
    Error,
    SetLandlordStatusVars,
    { previous: [QueryKey, LandlordCache | undefined][] }
  >({
    demoMode,
    demoResult: () => undefined,
    live: ({ landlord, status, reason }) =>
      setAdminLandlordStatus(landlord.id, { status, reason }),
    logLabel: "admin.landlord.setStatus",
    logContext: ({ landlord, status }) => ({ id: landlord.id, status }),
    meta: { silentError: true }, // the console toasts locally
    onMutate: async ({ landlord, status, reason }) => {
      await queryClient.cancelQueries({ queryKey: [ADMIN_LANDLORDS_KEY] });
      const previous = queryClient.getQueriesData<LandlordCache>({
        queryKey: [ADMIN_LANDLORDS_KEY],
      });
      const decidedRow: AdminLandlordDTO = {
        ...landlord,
        status,
        decidedAt: new Date().toISOString(),
        decisionReason: reason?.trim() ? reason.trim() : null,
      };
      for (const [queryKey] of previous) {
        const keyFilter = queryKey[2];
        queryClient.setQueryData<LandlordCache>(queryKey, (current) =>
          current
            ? {
                ...current,
                pages: current.pages.map((page) => ({
                  ...page,
                  items: page.items
                    .map((row) => (row.id === landlord.id ? decidedRow : row))
                    .filter(
                      (row) => keyFilter === "all" || row.status === keyFilter,
                    ),
                })),
              }
            : current,
        );
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      for (const [queryKey, snapshot] of context?.previous ?? []) {
        queryClient.setQueryData(queryKey, snapshot);
      }
    },
    onLiveSettled: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_LANDLORDS_KEY] });
    },
  });
}

export interface RemoveLandlordVars {
  landlord: AdminLandlordDTO;
  reason: string;
}

/** Delete a directory entry, telling whoever suggested it why. */
export function useRemoveAdminLandlord() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useDemoAwareMutation<
    void,
    Error,
    RemoveLandlordVars,
    { previous: [QueryKey, LandlordCache | undefined][] }
  >({
    demoMode,
    demoResult: () => undefined,
    live: ({ landlord, reason }) => removeAdminLandlord(landlord.id, reason),
    logLabel: "admin.landlord.remove",
    logContext: ({ landlord }) => ({ id: landlord.id }),
    meta: { silentError: true },
    onMutate: async ({ landlord }) => {
      await queryClient.cancelQueries({ queryKey: [ADMIN_LANDLORDS_KEY] });
      const previous = queryClient.getQueriesData<LandlordCache>({
        queryKey: [ADMIN_LANDLORDS_KEY],
      });
      for (const [queryKey] of previous) {
        queryClient.setQueryData<LandlordCache>(queryKey, (current) =>
          current
            ? {
                ...current,
                pages: current.pages.map((page) => ({
                  ...page,
                  items: page.items.filter((row) => row.id !== landlord.id),
                })),
              }
            : current,
        );
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      for (const [queryKey, snapshot] of context?.previous ?? []) {
        queryClient.setQueryData(queryKey, snapshot);
      }
    },
    onLiveSettled: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_LANDLORDS_KEY] });
    },
  });
}

export interface TriageIntroRequestVars {
  request: LandlordIntroRequestDTO;
  action: "accepted" | "declined";
  reason?: string;
}

/** Answer an introduction request, and tell the member who asked. */
export function useTriageAdminIntroRequest() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useDemoAwareMutation<
    LandlordIntroRequestDTO,
    Error,
    TriageIntroRequestVars,
    { previous: [QueryKey, IntroCache | undefined][] }
  >({
    demoMode,
    demoResult: ({ request, action, reason }) => ({
      ...request,
      status: action,
      decidedAt: new Date().toISOString(),
      decisionReason: reason?.trim() ? reason.trim() : null,
    }),
    live: ({ request, action, reason }) =>
      triageAdminIntroRequest(request.id, { action, reason }),
    logLabel: "admin.landlordIntro.triage",
    logContext: ({ request, action }) => ({ id: request.id, action }),
    meta: { silentError: true },
    onMutate: async ({ request, action, reason }) => {
      await queryClient.cancelQueries({
        queryKey: [ADMIN_LANDLORD_INTROS_KEY],
      });
      const previous = queryClient.getQueriesData<IntroCache>({
        queryKey: [ADMIN_LANDLORD_INTROS_KEY],
      });
      const decidedRow: LandlordIntroRequestDTO = {
        ...request,
        status: action,
        decidedAt: new Date().toISOString(),
        decisionReason: reason?.trim() ? reason.trim() : null,
      };
      for (const [queryKey] of previous) {
        const keyFilter = queryKey[2] as LandlordIntroFilter;
        queryClient.setQueryData<IntroCache>(queryKey, (current) =>
          current
            ? {
                ...current,
                pages: current.pages.map((page) => ({
                  ...page,
                  items: page.items
                    .map((row) => (row.id === request.id ? decidedRow : row))
                    .filter(
                      (row) => keyFilter === "all" || row.status === keyFilter,
                    ),
                })),
              }
            : current,
        );
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      for (const [queryKey, snapshot] of context?.previous ?? []) {
        queryClient.setQueryData(queryKey, snapshot);
      }
    },
    onLiveSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_LANDLORD_INTROS_KEY],
      });
    },
  });
}
