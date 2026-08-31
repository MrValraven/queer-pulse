import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "./demoAwareMutation";
import {
  createLegalRequest,
  getAdminLegalRequest,
  getAdminLegalRequests,
  updateLegalRequest,
  voidLegalRequest,
  type AdminLegalRequestDTO,
  type AdminLegalRequestPageDTO,
  type CreateLegalRequestBody,
  type LegalRequestOutcome,
  type LegalRequestRegisterState,
  type LegalRequestType,
  type UpdateLegalRequestBody,
} from "./adminLegalRequests.api";

/** Shared prefix for every register query. The full list key also carries
 *  `demoMode` and the three active filters. */
export const ADMIN_LEGAL_REQUESTS_KEY = ["admin-legal-requests"] as const;

export interface AdminLegalRequestFilters {
  state: LegalRequestRegisterState;
  requestType: LegalRequestType | "all";
  outcome: LegalRequestOutcome | "all";
}

export const DEFAULT_LEGAL_REQUEST_FILTERS: AdminLegalRequestFilters = {
  state: "all",
  requestType: "all",
  outcome: "all",
};

/** Apply the console's filters to the demo fixture, so demo mode answers the
 *  same question the server would rather than always showing every row. */
function filterDemoRows(
  rows: AdminLegalRequestDTO[],
  filters: AdminLegalRequestFilters,
): AdminLegalRequestDTO[] {
  return rows.filter((row) => {
    if (filters.state === "active" && row.isVoided) return false;
    if (filters.state === "voided" && !row.isVoided) return false;
    if (
      filters.requestType !== "all" &&
      row.requestType !== filters.requestType
    ) {
      return false;
    }
    if (filters.outcome !== "all" && row.outcome !== filters.outcome) {
      return false;
    }
    return true;
  });
}

/**
 * One page of the register at a time, newest receipt first (the backend owns
 * that sort, so no client re-sort can disagree with the paging).
 *
 * Demo mode serves the colocated fixture as one synthetic page and never
 * touches the network: `/admin/legal-requests` is admin-only and 403s for
 * everyone else, and the fixture is fabricated data that must not surface as
 * platform truth.
 *
 * The whole query is returned, `isError` included. The caller MUST be able to
 * tell "the register holds nothing under these filters" from "the register
 * could not be read", because on this surface the two look identical and mean
 * opposite things.
 */
export function useAdminLegalRequests(filters: AdminLegalRequestFilters) {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<AdminLegalRequestPageDTO>({
    queryKey: [
      ...ADMIN_LEGAL_REQUESTS_KEY,
      "list",
      demoMode,
      filters.state,
      filters.requestType,
      filters.outcome,
    ],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { ADMIN_LEGAL_REQUESTS_DEMO } =
          await import("../adminLegalRequests.data");
        const rows = filterDemoRows(ADMIN_LEGAL_REQUESTS_DEMO, filters);
        // pageSize === rows.length (min 1) so getNextPageParam yields
        // undefined; demo never issues a page-2 fetch.
        return {
          items: rows,
          total: rows.length,
          page: 1,
          pageSize: rows.length || 1,
        };
      }
      return getAdminLegalRequests({
        page: pageParam as number,
        state: filters.state,
        ...(filters.requestType === "all"
          ? {}
          : { requestType: filters.requestType }),
        ...(filters.outcome === "all" ? {} : { outcome: filters.outcome }),
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });

  const records = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, records, total };
}

/** Query key for one record's detail pane, so a write can invalidate exactly
 *  the row it touched. */
export function legalRequestDetailKey(demoMode: boolean, id: string) {
  return [...ADMIN_LEGAL_REQUESTS_KEY, "detail", demoMode, id] as const;
}

/**
 * One record in full, fetched fresh when the detail pane opens rather than read
 * off the cached list page, so a row amended by a colleague since the page
 * loaded is the row an admin reads before striking it.
 *
 * `retry: false`: a register this sensitive should surface a failed read as a
 * failure straight away, never as a pane that quietly stays blank while it
 * retries.
 */
export function useAdminLegalRequest(id: string | null) {
  const { demoMode } = useDemoMode();
  return useQuery<AdminLegalRequestDTO>({
    queryKey: legalRequestDetailKey(demoMode, id ?? ""),
    enabled: id !== null,
    retry: false,
    queryFn: async () => {
      const recordId = id as string;
      if (demoMode) {
        const { ADMIN_LEGAL_REQUESTS_DEMO } =
          await import("../adminLegalRequests.data");
        const row = ADMIN_LEGAL_REQUESTS_DEMO.find(
          (candidate) => candidate.id === recordId,
        );
        if (!row) throw new Error("No demo legal request with that id");
        return row;
      }
      return getAdminLegalRequest(recordId);
    },
  });
}

/** Every write refetches the list and the amended row. The register is small
 *  and rarely written, so a refetch is cheaper than a hand-patched cache that
 *  could disagree with what the server actually stored. */
function useInvalidateLegalRequests() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ADMIN_LEGAL_REQUESTS_KEY });
  };
}

/** A plausible saved record for demo mode, so the console can be walked through
 *  end to end with no backend. Never reaches the network and never persists. */
function demoRecordFrom(
  body: CreateLegalRequestBody,
  base?: AdminLegalRequestDTO,
): AdminLegalRequestDTO {
  const now = new Date().toISOString();
  return {
    id: base?.id ?? `demo-legal-request-${now}`,
    ...body,
    dataDisclosed: [...body.dataDisclosed],
    recordedByName: base?.recordedByName ?? null,
    isVoided: base?.isVoided ?? false,
    voidedAt: base?.voidedAt ?? null,
    voidReason: base?.voidReason ?? null,
    createdAt: base?.createdAt ?? now,
    updatedAt: now,
  };
}

export function useCreateLegalRequest() {
  const { demoMode } = useDemoMode();
  const invalidate = useInvalidateLegalRequests();
  return useDemoAwareMutation<
    AdminLegalRequestDTO,
    Error,
    CreateLegalRequestBody
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // AdminLegalRequestForm toasts locally
    demoResult: (body) => demoRecordFrom(body),
    live: (body) => createLegalRequest(body),
    logLabel: "admin.legalRequest.create",
    logContext: (body) => ({ requestType: body.requestType }),
    onLiveSuccess: invalidate,
  });
}

export interface UpdateLegalRequestVars {
  record: AdminLegalRequestDTO;
  body: UpdateLegalRequestBody;
}

export function useUpdateLegalRequest() {
  const { demoMode } = useDemoMode();
  const invalidate = useInvalidateLegalRequests();
  return useDemoAwareMutation<
    AdminLegalRequestDTO,
    Error,
    UpdateLegalRequestVars
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // AdminLegalRequestForm toasts locally
    demoResult: ({ record, body }) => ({
      ...record,
      ...body,
      updatedAt: new Date().toISOString(),
    }),
    live: ({ record, body }) => updateLegalRequest(record.id, body),
    logLabel: "admin.legalRequest.update",
    logContext: ({ record }) => ({ id: record.id }),
    onLiveSuccess: invalidate,
  });
}

export interface VoidLegalRequestVars {
  record: AdminLegalRequestDTO;
  reason: string;
}

/**
 * Strike a record from the published figures. The row stays, the reason is
 * stored, and the count of voided records is itself published, so a struck
 * record shows up as a number rather than as an absence.
 *
 * Not idempotent: a second void is a 409 rather than a fresh stamp, which is
 * what keeps the moment a record was actually struck.
 */
export function useVoidLegalRequest() {
  const { demoMode } = useDemoMode();
  const invalidate = useInvalidateLegalRequests();
  return useDemoAwareMutation<
    AdminLegalRequestDTO,
    Error,
    VoidLegalRequestVars
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // AdminLegalRequestVoidModal toasts locally
    demoResult: ({ record, reason }) => ({
      ...record,
      isVoided: true,
      voidedAt: new Date().toISOString(),
      voidReason: reason,
    }),
    live: ({ record, reason }) => voidLegalRequest(record.id, reason),
    logLabel: "admin.legalRequest.void",
    logContext: ({ record }) => ({ id: record.id }),
    onLiveSuccess: invalidate,
  });
}
