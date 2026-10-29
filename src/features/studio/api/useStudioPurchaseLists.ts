import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import {
  STUDIO_NOT_FOUND_STATE,
  studioLoadStateOf,
  type StudioLoadState,
} from "./studioLoadState";
import {
  buyerPurchaseViewsPageOf,
  sellerPurchaseViewsPageOf,
  toPurchaseWallStateView,
  toSalesTotalsView,
  wallEntryViewsPageOf,
  type StudioBuyerPurchaseView,
  type StudioPurchaseWallStateView,
  type StudioSalesTotalsView,
  type StudioSellerPurchaseView,
  type StudioWallEntryView,
} from "./studioPurchases.adapters";
import {
  getMyStudioPurchases,
  getStudioPurchaseInbox,
  getStudioPurchaseWall,
  getStudioReleaseWall,
  getStudioSales,
  getStudioSalesTotals,
} from "./studioPurchases.api";
import { readStudio, studioKeys } from "./studioQueryKeys";
import {
  useStudioCursorPages,
  type StudioCursorPagesResult,
} from "./useStudioCursorPages";
import { useStudioAccess } from "./useStudioAccess";

// Every cursor list reads view pages (a row this build cannot read drops
// before the pager sees it), so `toView` is the identity.
const identity = <Value>(value: Value): Value => value;

/** The buyer's own purchases (contract 3.6). Outside the Studio gate: any
 *  signed-in member reads it, so the account page works without a grant.
 *  `silentError` is for a read that only decides whether to show an entry
 *  (the settings card): a failure there raises no toast. */
export function useStudioMyPurchases(
  status: "all" | "confirmed",
  options: { silentError?: boolean } = {},
): StudioCursorPagesResult<StudioBuyerPurchaseView> {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  return useStudioCursorPages({
    queryKey: studioKeys.myPurchases(demoMode, status),
    enabled: demoMode || user !== null,
    silentError: options.silentError,
    read: async (cursor) =>
      buyerPurchaseViewsPageOf(
        demoMode
          ? (await import("./studioDemoPurchases")).demoMyStudioPurchases(
              status,
              cursor,
            )
          : await getMyStudioPurchases(status, cursor),
      ),
    toView: identity,
  });
}

/** The supporter wall of one release, 24 a page (contract 3.5). A failure
 *  hides the wall and raises no toast. */
export function useStudioReleaseWall(
  releaseId: string,
  isEnabled: boolean,
): StudioCursorPagesResult<StudioWallEntryView> {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  return useStudioCursorPages({
    queryKey: studioKeys.releaseWall(demoMode, releaseId),
    enabled: isEnabled && (demoMode || hasAccess),
    silentError: true,
    read: async (cursor) =>
      wallEntryViewsPageOf(
        demoMode
          ? (await import("./studioDemoPurchases")).demoStudioReleaseWall(
              releaseId,
              cursor,
            )
          : await getStudioReleaseWall(releaseId, cursor),
      ),
    toView: identity,
  });
}

/** One persona's payments to confirm, oldest first (contract 3.8). */
export function useStudioPurchaseInbox(
  subprofileId: string | null,
): StudioCursorPagesResult<StudioSellerPurchaseView> {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  return useStudioCursorPages({
    queryKey: studioKeys.purchaseInbox(demoMode, subprofileId ?? ""),
    enabled: subprofileId !== null && (demoMode || hasAccess),
    read: async (cursor) =>
      sellerPurchaseViewsPageOf(
        demoMode
          ? (await import("./studioDemoPurchases")).demoStudioPurchaseInbox(
              subprofileId ?? "",
              cursor,
            )
          : await getStudioPurchaseInbox(subprofileId ?? "", cursor),
      ),
    toView: identity,
  });
}

/** One persona's confirmed sales, newest first (contract 3.10). */
export function useStudioSales(
  subprofileId: string | null,
): StudioCursorPagesResult<StudioSellerPurchaseView> {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  return useStudioCursorPages({
    queryKey: studioKeys.sales(demoMode, subprofileId ?? ""),
    enabled: subprofileId !== null && (demoMode || hasAccess),
    read: async (cursor) =>
      sellerPurchaseViewsPageOf(
        demoMode
          ? (await import("./studioDemoPurchases")).demoStudioSales(
              subprofileId ?? "",
              cursor,
            )
          : await getStudioSales(subprofileId ?? "", cursor),
      ),
    toView: identity,
  });
}

/** One persona's totals, the last 28 days and all time (contract 3.10). */
export function useStudioSalesTotals(subprofileId: string | null): {
  totals: StudioSalesTotalsView | null;
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.salesTotals(demoMode, subprofileId ?? ""),
    enabled: subprofileId !== null && (demoMode || hasAccess),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : 0,
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toSalesTotalsView(
          demoMode
            ? (await import("./studioDemoPurchases")).demoStudioSalesTotals(
                subprofileId ?? "",
              )
            : await getStudioSalesTotals(subprofileId ?? ""),
        ),
      ),
  });
  if (subprofileId === null)
    return { totals: null, loadState: STUDIO_NOT_FOUND_STATE };
  return {
    totals: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}

/** The buyer's wall choice for one purchase (contract 3.4). */
export function useStudioPurchaseWall(
  purchaseId: string,
  isEnabled: boolean,
): { wall: StudioPurchaseWallStateView | null; loadState: StudioLoadState } {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.purchaseWall(demoMode, purchaseId),
    enabled: isEnabled && (demoMode || hasAccess),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : 0,
    meta: { silentError: true },
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toPurchaseWallStateView(
          demoMode
            ? (await import("./studioDemoPurchases")).demoStudioPurchaseWall(
                purchaseId,
              )
            : await getStudioPurchaseWall(purchaseId),
        ),
      ),
  });
  return {
    wall: query.data ?? null,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}
