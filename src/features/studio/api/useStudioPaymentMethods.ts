import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  STUDIO_NOT_FOUND_STATE,
  studioLoadStateOf,
  type StudioLoadState,
} from "./studioLoadState";
import {
  toPaymentMethodsView,
  type StudioPaymentMethodsView,
} from "./studioPurchases.adapters";
import {
  getStudioPaymentMethods,
  putStudioPaymentMethods,
} from "./studioPurchases.api";
import type { ReplaceStudioPaymentMethodsBody } from "./studioPurchases.types";
import { onStudioAccessLost, readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/** One persona's ways to get paid (contract 2.2). */
export function useStudioPaymentMethods(subprofileId: string | null): {
  paymentMethods: StudioPaymentMethodsView | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.paymentMethods(demoMode, subprofileId ?? ""),
    enabled: subprofileId !== null && (demoMode || hasAccess),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : 0,
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toPaymentMethodsView(
          demoMode
            ? (await import("./studioDemoPurchases")).demoStudioPaymentMethods(
                subprofileId ?? "",
              )
            : await getStudioPaymentMethods(subprofileId ?? ""),
        ),
      ),
  });
  if (subprofileId === null)
    return { paymentMethods: null, loadState: STUDIO_NOT_FOUND_STATE };
  return {
    paymentMethods: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}

/** PUT the whole list (contract 2.3). The answer fills the cache, and every
 *  offer refetches because the buy panels read the methods. The caller names
 *  the refusal (the failed row is on the error). */
export function useSaveStudioPaymentMethods(subprofileId: string): {
  save: (
    body: ReplaceStudioPaymentMethodsBody,
  ) => Promise<StudioPaymentMethodsView>;
  isSaving: boolean;
} {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    meta: { silentError: true },
    mutationFn: async (body: ReplaceStudioPaymentMethodsBody) =>
      toPaymentMethodsView(
        demoMode
          ? (
              await import("./studioDemoPurchaseWrites")
            ).demoPutStudioPaymentMethods(subprofileId, body)
          : await putStudioPaymentMethods(subprofileId, body),
      ),
    onSuccess: (view) => {
      queryClient.setQueryData(
        studioKeys.paymentMethods(demoMode, subprofileId),
        view,
      );
      void queryClient.invalidateQueries({
        queryKey: studioKeys.offersAll(demoMode),
      });
    },
    onError: (error) => onStudioAccessLost(queryClient, error),
  });
  return { save: mutation.mutateAsync, isSaving: mutation.isPending };
}
