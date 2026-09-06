import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
import {
  approveResourceSuggestion,
  archiveResourceSuggestion,
  declineResourceSuggestion,
  type AdminResourceSuggestionListDTO,
  type ResourceListingWriteBody,
  type ResourceSuggestionDecision,
  type ResourceSuggestionStatus,
} from "./adminResourceSuggestions.api";
import { DEMO_LATENCY_MS } from "./demoAwareMutation";

/** Shared prefix for every `useAdminResourceSuggestions` infinite query (the
 *  full key also carries `demoMode` + the active filter). Patched/invalidated
 *  by decision so the row's status updates across every filter tab at once. */
const SUGGESTIONS_QUERY_KEY = ["admin-resource-suggestions"] as const;

const STATUS_BY_DECISION: Record<
  ResourceSuggestionDecision,
  ResourceSuggestionStatus
> = {
  approve: "approved",
  decline: "declined",
  archive: "archived",
};

// Thin passthrough wrappers, deliberately NOT `{ approve: approveResourceSuggestion }`
// (a direct reference): an object literal captures the imported binding's
// VALUE once, at module-evaluation time — before any `vi.spyOn` in a test
// ever runs — so a later spy on the named export would never be seen through
// a stale captured reference. Wrapping in a function defers the name lookup
// to call time, which reads the current (possibly spied) live binding, same
// as calling the export directly inline.
const LIVE_CALL: Record<
  ResourceSuggestionDecision,
  (vars: DecideResourceSuggestionVars) => Promise<unknown>
> = {
  approve: ({ id, listing, note }) => {
    // Guarded rather than assumed: `listing` is optional on the vars because
    // decline and archive never carry one, and an approve that reached here
    // without it would otherwise POST a body the endpoint rejects with a
    // validation error the reviewer cannot act on. The page never opens the
    // approve path without a draft, so this is a contract statement.
    if (!listing) {
      throw new Error(
        "Approving a resource suggestion needs the reviewed listing body.",
      );
    }
    return approveResourceSuggestion(id, listing, note);
  },
  decline: ({ id, note }) => declineResourceSuggestion(id, note),
  archive: ({ id, note }) => archiveResourceSuggestion(id, note),
};

export interface DecideResourceSuggestionVars {
  id: string;
  decision: ResourceSuggestionDecision;
  note?: string;
  /**
   * The reviewed directory listing an APPROVAL publishes (PRD-269). Absent on
   * decline and archive, which produce nothing public.
   */
  listing?: ResourceListingWriteBody;
}

type SuggestionsData = InfiniteData<AdminResourceSuggestionListDTO>;
type CachedEntry = [QueryKey, SuggestionsData | undefined];
interface DecideContext {
  previous: CachedEntry[];
}

/**
 * Approve / decline / archive a resource suggestion from the admin review
 * queue. Dual-mode: in demo mode the optimistic cache patch IS the source of
 * truth (no network, no invalidation — the fixture never goes stale); in live
 * mode it calls `POST /admin/resource-suggestions/:id/{approve|decline|archive}`
 * and reconciles by invalidating on settle. Both modes patch the row's
 * `status` across every cached filter tab optimistically and roll back on
 * error.
 *
 * Approving carries the reviewed listing body (PRD-269): the endpoint
 * publishes the organisation to the public directory in the same transaction
 * as the decision, so the row comes back with a `createdListingId` and can
 * never be approved a second time. The optimistic patch stamps that field too,
 * which is what keeps the console's approve action off a row that is already
 * live in demo mode, where nothing is ever re-fetched to correct it.
 */
export function useAdminResourceSuggestionMutations() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const patchStatus = (id: string, status: ResourceSuggestionStatus) => {
    queryClient.setQueriesData<SuggestionsData>(
      { queryKey: SUGGESTIONS_QUERY_KEY },
      (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items: page.items.map((item) =>
                  item.id === id
                    ? {
                        ...item,
                        status,
                        decidedAt: item.decidedAt ?? new Date().toISOString(),
                        // An approval publishes a listing, so the row is now
                        // live. The id is a placeholder until the invalidation
                        // brings the real one back; in demo mode there is no
                        // invalidation and the placeholder IS the record, which
                        // is the same contract the rest of this patch keeps.
                        createdListingId:
                          status === "approved"
                            ? (item.createdListingId ?? "pending")
                            : item.createdListingId,
                      }
                    : item,
                ),
              })),
            }
          : data,
    );
  };

  const mutation = useMutation<
    ResourceSuggestionStatus,
    Error,
    DecideResourceSuggestionVars,
    DecideContext
  >({
    mutationFn: async (variables) => {
      const { id, decision } = variables;
      const status = STATUS_BY_DECISION[decision];
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("admin.resourceSuggestion.decide (demo, no network)", {
          id,
          decision,
        });
        return status;
      }
      await LIVE_CALL[decision](variables);
      return status;
    },
    onMutate: async ({ id, decision }) => {
      await queryClient.cancelQueries({ queryKey: SUGGESTIONS_QUERY_KEY });
      const previous = queryClient.getQueriesData<SuggestionsData>({
        queryKey: SUGGESTIONS_QUERY_KEY,
      });
      patchStatus(id, STATUS_BY_DECISION[decision]);
      return { previous };
    },
    onError: (_error, _vars, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      if (!demoMode) {
        void queryClient.invalidateQueries({ queryKey: SUGGESTIONS_QUERY_KEY });
      }
    },
    meta: { silentError: true },
  });

  return { decide: mutation.mutate, pending: mutation.isPending };
}
