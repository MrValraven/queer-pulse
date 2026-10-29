import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  toBuyerPurchaseView,
  toPurchaseWallStateView,
  type StudioBuyerPurchaseView,
  type StudioPurchaseWallStateView,
} from "./studioPurchases.adapters";
import {
  getStudioPurchaseDownload,
  postStudioPurchase,
  postStudioPurchaseCancel,
  postStudioPurchaseConfirm,
  postStudioPurchaseDecline,
  putStudioPurchaseWall,
  toDownloadLinkView,
} from "./studioPurchases.api";
import { navigateToDownload } from "./studioPurchaseDownloadNavigation";
import type {
  CreateStudioPurchaseBody,
  DeclineStudioPurchaseBody,
  UpdateStudioPurchaseWallBody,
} from "./studioPurchases.types";
import { onStudioAccessLost, studioKeys } from "./studioQueryKeys";

const SILENT = { silentError: true } as const;

/** Every offer and every list of the buyer's purchases (contract 10.2). */
function invalidateBuyerSurfaces(queryClient: QueryClient, demoMode: boolean) {
  void queryClient.invalidateQueries({
    queryKey: studioKeys.offersAll(demoMode),
  });
  void queryClient.invalidateQueries({ queryKey: studioKeys.myPurchasesAll });
}

const firstOf = (keys: ReadonlySet<string>): string | null =>
  keys.values().next().value ?? null;

interface SaveWallVariables {
  purchaseId: string;
  releaseId: string | null;
  body: UpdateStudioPurchaseWallBody;
}

/** The buyer's writes: the "I've paid" claim, its cancel and the wall choice.
 *  Every mutation is silent; the caller names the reason from the error. */
export function useStudioPurchaseMutations(): {
  create: (body: CreateStudioPurchaseBody) => Promise<StudioBuyerPurchaseView>;
  cancel: (purchaseId: string) => Promise<void>;
  saveWall: (
    purchaseId: string,
    releaseId: string | null,
    body: UpdateStudioPurchaseWallBody,
  ) => Promise<StudioPurchaseWallStateView>;
  isCreating: boolean;
  isCancelling: boolean;
  isSavingWall: boolean;
} {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    meta: SILENT,
    mutationFn: async (body: CreateStudioPurchaseBody) => {
      const dto = demoMode
        ? (await import("./studioDemoPurchaseWrites")).demoCreateStudioPurchase(
            body,
          )
        : await postStudioPurchase(body);
      const purchase = toBuyerPurchaseView(dto);
      if (!purchase)
        throw new Error("The server sent a purchase this build cannot read");
      return purchase;
    },
    onError: (error) => onStudioAccessLost(queryClient, error),
    // A refused claim (price changed, code taken) also refetches the offer.
    onSettled: () => invalidateBuyerSurfaces(queryClient, demoMode),
  });
  const cancelMutation = useMutation({
    meta: SILENT,
    mutationFn: async (purchaseId: string): Promise<void> => {
      if (demoMode) {
        (await import("./studioDemoPurchaseWrites")).demoCancelStudioPurchase(
          purchaseId,
        );
        return;
      }
      await postStudioPurchaseCancel(purchaseId);
    },
    onError: (error) => onStudioAccessLost(queryClient, error),
    onSettled: () => invalidateBuyerSurfaces(queryClient, demoMode),
  });
  const wallMutation = useMutation({
    meta: SILENT,
    mutationFn: async ({ purchaseId, body }: SaveWallVariables) =>
      toPurchaseWallStateView(
        demoMode
          ? (
              await import("./studioDemoPurchaseWrites")
            ).demoPutStudioPurchaseWall(purchaseId, body)
          : await putStudioPurchaseWall(purchaseId, body),
      ),
    onError: (error) => onStudioAccessLost(queryClient, error),
    onSuccess: (_wall, { purchaseId, releaseId }) => {
      if (releaseId !== null) {
        void queryClient.invalidateQueries({
          queryKey: studioKeys.releaseWall(demoMode, releaseId),
        });
      }
      void queryClient.invalidateQueries({
        queryKey: studioKeys.purchaseWall(demoMode, purchaseId),
      });
      // The buy panel reads the wall choice from the cached offer.
      void queryClient.invalidateQueries({
        queryKey: studioKeys.offersAll(demoMode),
      });
      // The purchase rows carry the wall choice too.
      void queryClient.invalidateQueries({
        queryKey: studioKeys.myPurchasesAll,
      });
    },
  });
  return {
    create: createMutation.mutateAsync,
    cancel: cancelMutation.mutateAsync,
    saveWall: (purchaseId, releaseId, body) =>
      wallMutation.mutateAsync({ purchaseId, releaseId, body }),
    isCreating: createMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isSavingWall: wallMutation.isPending,
  };
}

/** The artist's decisions on a claimed payment (contract 3.9). The second of
 *  two deciders gets a 409 from the server; the lists refetch either way, so
 *  the row leaves the inbox. */
export function useStudioPurchaseDecisions(subprofileId: string): {
  confirm: (purchaseId: string) => Promise<void>;
  decline: (
    purchaseId: string,
    body: DeclineStudioPurchaseBody,
  ) => Promise<void>;
  busyPurchaseId: string | null;
} {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const refreshAfterDecision = () => {
    invalidateBuyerSurfaces(queryClient, demoMode);
    for (const queryKey of [
      studioKeys.purchaseInbox(demoMode, subprofileId),
      studioKeys.sales(demoMode, subprofileId),
      studioKeys.salesTotals(demoMode, subprofileId),
      studioKeys.salesPendingCount(demoMode),
      // A confirmed purchase can add its buyer to the release wall.
      ["studio", "releaseWall", demoMode],
    ]) {
      void queryClient.invalidateQueries({ queryKey });
    }
  };
  const confirmMutation = useMutation({
    meta: SILENT,
    mutationFn: async (purchaseId: string): Promise<void> => {
      if (demoMode) {
        (await import("./studioDemoPurchaseWrites")).demoConfirmStudioPurchase(
          subprofileId,
          purchaseId,
        );
        return;
      }
      await postStudioPurchaseConfirm(subprofileId, purchaseId);
    },
    onError: (error) => onStudioAccessLost(queryClient, error),
    onSettled: refreshAfterDecision,
  });
  const declineMutation = useMutation({
    meta: SILENT,
    mutationFn: async ({
      purchaseId,
      body,
    }: {
      purchaseId: string;
      body: DeclineStudioPurchaseBody;
    }): Promise<void> => {
      if (demoMode) {
        (await import("./studioDemoPurchaseWrites")).demoDeclineStudioPurchase(
          subprofileId,
          purchaseId,
          body,
        );
        return;
      }
      await postStudioPurchaseDecline(subprofileId, purchaseId, body);
    },
    onError: (error) => onStudioAccessLost(queryClient, error),
    onSettled: refreshAfterDecision,
  });
  let busyPurchaseId: string | null = null;
  if (confirmMutation.isPending) busyPurchaseId = confirmMutation.variables;
  else if (declineMutation.isPending)
    busyPurchaseId = declineMutation.variables.purchaseId;
  return {
    confirm: confirmMutation.mutateAsync,
    decline: (purchaseId, body) =>
      declineMutation.mutateAsync({ purchaseId, body }),
    busyPurchaseId,
  };
}

/** A confirmed purchase's track download (contract 3.7). Live reads the
 *  signed link and navigates to it; the link is never cached or logged, and
 *  nothing counts a download. The demo holds no audio files, so it checks the
 *  row's refusal like the server and then says so. A refusal rejects, and the
 *  caller names its reason. */
export function useStudioPurchaseDownload(): {
  download: (purchaseId: string, trackId: string) => Promise<void>;
  busyTrackKey: string | null;
  /** Every download in flight, so overlapping ones keep their own state. */
  busyTrackKeys: ReadonlySet<string>;
} {
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [busyTrackKeys, setBusyTrackKeys] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const download = async (purchaseId: string, trackId: string) => {
    const trackKey = `${purchaseId}:${trackId}`;
    setBusyTrackKeys((previous) => new Set(previous).add(trackKey));
    try {
      if (demoMode) {
        (await import("./studioDemoPurchaseWrites")).demoStudioPurchaseDownload(
          purchaseId,
          trackId,
        );
        showToast(t("studio:purchase.downloads.demoToast"), "info");
        return;
      }
      const link = await getStudioPurchaseDownload(purchaseId, trackId);
      navigateToDownload(toDownloadLinkView(link));
    } finally {
      setBusyTrackKeys((previous) => {
        const next = new Set(previous);
        next.delete(trackKey);
        return next;
      });
    }
  };
  return { download, busyTrackKey: firstOf(busyTrackKeys), busyTrackKeys };
}
