import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import { studioErrorCodeOf } from "./studio.api";
import {
  toLandingPreviewOwnerView,
  toLandingPreviewOwnerViews,
  type StudioLandingPreviewOwnerView,
} from "./studioLandingPreviews.adapters";
import {
  actOnStudioLandingPreview,
  getStudioLandingPreviews,
  type StudioLandingPreviewAction,
} from "./studioLandingPreviews.api";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

const SILENT = { silentError: true } as const;
const STALE_TIME_MILLISECONDS = 30_000;
const NO_PREVIEWS: StudioLandingPreviewOwnerView[] = [];

/** The preview requests waiting on one persona, then the ones it approved. A
 *  persona outside the artist kinds reads an empty list (the card hides). */
export function useStudioLandingPreviews(subprofileId: string): {
  previews: StudioLandingPreviewOwnerView[];
  loadState: StudioLoadState;
} {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useQuery({
    queryKey: studioKeys.landingPreviews(demoMode, subprofileId),
    enabled: subprofileId !== "" && (demoMode || hasAccess),
    staleTime: STALE_TIME_MILLISECONDS,
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toLandingPreviewOwnerViews(
          demoMode
            ? (
                await import("./studioDemoLandingPreviews")
              ).demoStudioLandingPreviews(subprofileId)
            : await getStudioLandingPreviews(subprofileId),
        ),
      ),
  });
  return {
    previews: query.data ?? NO_PREVIEWS,
    loadState: studioLoadStateOf(query, query.data !== undefined),
  };
}

/** Approve, decline or withdraw one row. The answer patches the cached list:
 *  an approved row replaces its row; a declined or withdrawn row leaves it (the
 *  card animates it out). A refusal reads as the server's code says: a 404
 *  folds the row away, a 409 refetches, a 403 leaves the list as it is. The
 *  card names the reason itself, so the global toast stays silent. */
export function useStudioLandingPreviewAction(
  subprofileId: string,
): UseMutationResult<
  StudioLandingPreviewOwnerView | null,
  unknown,
  { previewId: string; action: StudioLandingPreviewAction }
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const queryKey = studioKeys.landingPreviews(demoMode, subprofileId);
  return useMutation<
    StudioLandingPreviewOwnerView | null,
    unknown,
    { previewId: string; action: StudioLandingPreviewAction }
  >({
    meta: SILENT,
    mutationFn: async ({ previewId, action }) =>
      toLandingPreviewOwnerView(
        demoMode
          ? (
              await import("./studioDemoLandingPreviews")
            ).demoActOnStudioLandingPreview(subprofileId, previewId, action)
          : await actOnStudioLandingPreview(subprofileId, previewId, action),
      ),
    onSuccess: (answer, { previewId, action }) => {
      queryClient.setQueryData<StudioLandingPreviewOwnerView[]>(
        queryKey,
        (rows) => {
          if (!rows) return rows;
          if (answer?.status === "approved") {
            return rows.map((row) => (row.id === previewId ? answer : row));
          }
          return rows.filter((row) => row.id !== previewId);
        },
      );
      // An approval or a withdrawal changes which previews the public Studio
      // page may show.
      if (action === "approve" || action === "withdraw") {
        void queryClient.invalidateQueries({
          queryKey: studioKeys.landing(demoMode),
        });
      }
    },
    onError: (error, { previewId }) => {
      if (!(error instanceof ApiError)) return;
      const code = studioErrorCodeOf(error);
      if (error.status === 404 && code === "studio_landing_preview_not_found") {
        queryClient.setQueryData<StudioLandingPreviewOwnerView[]>(
          queryKey,
          (rows) => rows?.filter((row) => row.id !== previewId),
        );
      } else if (
        code === "studio_landing_preview_not_pending" ||
        code === "studio_landing_preview_not_approved"
      ) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}
