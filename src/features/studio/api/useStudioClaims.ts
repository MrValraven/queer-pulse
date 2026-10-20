import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { studioKeys } from "./studioQueryKeys";
import { toMyClaimView, type StudioMyClaimView } from "./studioSafety.adapters";
import {
  fileStudioClaim,
  getMyStudioClaims,
  replyToStudioClaim,
  withdrawStudioClaim,
} from "./studioSafety.api";
import { studioSafetyKeys } from "./studioSafetyQueryKeys";
import type { CreateStudioClaimBody } from "./studioSafety.types";
import {
  useStudioCursorPages,
  type StudioCursorPagesResult,
} from "./useStudioCursorPages";

/** The forms show every refusal themselves; nothing here toasts. */
const SILENT = { silentError: true } as const;
const loadDemo = () => import("./studioDemoSafety");

type MyClaimPages = InfiniteData<
  { items: StudioMyClaimView[]; nextCursor: string | null },
  string | null
>;

/** The claimant's claims, newest first, with Show more. A caller outside
 *  the claims page (the menu badge) can gate the read with `isEnabled` and
 *  keep a failure quiet with `silentError`; the defaults keep the page's
 *  behaviour. */
export function useStudioMyClaims(
  options: { isEnabled?: boolean; silentError?: boolean } = {},
): StudioCursorPagesResult<StudioMyClaimView> {
  const { demoMode } = useDemoMode();
  return useStudioCursorPages({
    queryKey: studioSafetyKeys.myClaims(demoMode),
    // The page is member-gated; reading needs no Studio grant (contract).
    enabled: options.isEnabled ?? true,
    silentError: options.silentError ?? false,
    read: async (cursor) =>
      demoMode
        ? (await loadDemo()).demoMyClaimsPage()
        : getMyStudioClaims(cursor),
    toView: toMyClaimView,
  });
}

function storeMyClaim(
  queryClient: QueryClient,
  demoMode: boolean,
  claim: StudioMyClaimView,
): void {
  queryClient.setQueryData<MyClaimPages>(
    studioSafetyKeys.myClaims(demoMode),
    (data) =>
      data
        ? {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                item.id === claim.id ? claim : item,
              ),
            })),
          }
        : data,
  );
}

export function useFileStudioClaim() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    StudioMyClaimView,
    Error,
    { trackId: string; body: CreateStudioClaimBody }
  >({
    meta: SILENT,
    mutationFn: async ({ trackId, body }) =>
      toMyClaimView(
        demoMode
          ? (await loadDemo()).demoFileClaim(trackId, body)
          : await fileStudioClaim(trackId, body),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: studioSafetyKeys.myClaims(demoMode),
      });
    },
  });
}

export function useReplyToStudioClaim() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    StudioMyClaimView,
    Error,
    { claimId: string; reply: string }
  >({
    meta: SILENT,
    mutationFn: async ({ claimId, reply }) =>
      toMyClaimView(
        demoMode
          ? (await loadDemo()).demoReplyToClaim(claimId, reply)
          : await replyToStudioClaim(claimId, { reply }),
      ),
    onSuccess: (claim) => storeMyClaim(queryClient, demoMode, claim),
  });
}

/** Withdrawing a held claim can bring the track back, so its release and
 *  track read again. */
export function useWithdrawStudioClaim() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<StudioMyClaimView, Error, { claim: StudioMyClaimView }>({
    meta: SILENT,
    mutationFn: async ({ claim }) =>
      toMyClaimView(
        demoMode
          ? (await loadDemo()).demoWithdrawClaim(claim.id)
          : await withdrawStudioClaim(claim.id),
      ),
    onSuccess: (claim) => {
      storeMyClaim(queryClient, demoMode, claim);
      if (claim.track.releaseId !== null) {
        void queryClient.invalidateQueries({
          queryKey: studioKeys.release(demoMode, claim.track.releaseId),
        });
      }
      if (claim.track.id !== null) {
        void queryClient.invalidateQueries({
          queryKey: studioKeys.track(demoMode, claim.track.id),
        });
      }
    },
  });
}
