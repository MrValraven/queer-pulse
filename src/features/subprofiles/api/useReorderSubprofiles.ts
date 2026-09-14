import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { reorderSubprofiles } from "./subprofiles.api";
import type { SubprofileView } from "./subprofiles.adapters";

export interface ReorderSubprofilesVariables {
  /** The member's COMPLETE persona id list in its new order, drafts and
   *  standalone personas included. The dashboard builds it as the reordered
   *  on-profile group followed by the not-on-profile personas in their
   *  existing relative order, because the endpoint rejects a partial list. */
  orderedIds: string[];
}

interface ReorderSubprofilesContext {
  previousSubprofiles: SubprofileView[] | undefined;
}

/** Put a cached persona list into `orderedIds` order. Ids the cache does not
 *  hold are skipped, and any cached persona the list does not mention keeps
 *  its place at the end, so a cache that raced ahead of the caller still comes
 *  out complete rather than losing a row. */
export function applySubprofileOrder(
  subprofiles: SubprofileView[],
  orderedIds: string[],
): SubprofileView[] {
  const byId = new Map(
    subprofiles.map((subprofile) => [subprofile.id, subprofile]),
  );
  const ordered: SubprofileView[] = [];
  for (const id of orderedIds) {
    const subprofile = byId.get(id);
    if (!subprofile) continue;
    byId.delete(id);
    ordered.push(subprofile);
  }
  return [...ordered, ...byId.values()];
}

/**
 * Persist the order a member's personas appear in, from the personas dashboard
 * (`MySubprofilesPage`). Live mode PUTs `/subprofiles/order` with the complete
 * id list; demo mode resolves locally and sends NO request, so the prototype
 * reorders exactly the same way with no backend.
 *
 * The reorder is optimistic against `["subprofiles", "mine", demoMode]`: a
 * drag moves a card several times per second, and waiting for a round trip
 * before the grid agreed with the finger would make every step lag and snap.
 * In-flight reads are cancelled first so a response already on the wire cannot
 * land on top of the new order, the previous array is snapshotted, and a
 * failure rolls the whole array back and says so in a toast.
 *
 * Invalidation on settle is LIVE ONLY. In demo mode the optimistic cache value
 * is the only place the new order exists — the mock registry it came from is a
 * static fixture that never learns about the move — so invalidating would
 * refetch the fixture and snap the cards straight back to their original
 * order, undoing the reorder the member just made.
 */
export function useReorderSubprofiles() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const queryKey = ["subprofiles", "mine", demoMode];

  return useMutation<
    void,
    Error,
    ReorderSubprofilesVariables,
    ReorderSubprofilesContext
  >({
    // This hook owns the failure message below, so the app-wide mutation error
    // handler stays quiet rather than toasting the same problem twice.
    meta: { silentError: true },
    mutationFn: async ({ orderedIds }) => {
      if (demoMode) return;
      await reorderSubprofiles(orderedIds);
    },
    onMutate: async ({ orderedIds }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousSubprofiles =
        queryClient.getQueryData<SubprofileView[]>(queryKey);
      if (previousSubprofiles) {
        queryClient.setQueryData<SubprofileView[]>(
          queryKey,
          applySubprofileOrder(previousSubprofiles, orderedIds),
        );
      }
      return { previousSubprofiles };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousSubprofiles) {
        queryClient.setQueryData<SubprofileView[]>(
          queryKey,
          context.previousSubprofiles,
        );
      }
      showToast(t("subprofiles:mine.order.saveError"), "error");
    },
    onSettled: () => {
      // Live only — see the doc comment: a demo invalidate would refetch the
      // static mock registry and throw the new order away.
      if (!demoMode) void queryClient.invalidateQueries({ queryKey });
    },
  });
}
