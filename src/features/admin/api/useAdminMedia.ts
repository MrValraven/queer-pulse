import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  deleteAdminMediaObject,
  getAdminMediaPage,
  type AdminMediaKind,
  type AdminMediaPageVM,
} from "./adminMedia.api";

export const ADMIN_MEDIA_KEY = "admin-media";

/**
 * Raw storage-bucket objects for the admin media console, paginated on the S3
 * continuation token. LIVE ONLY: in demo mode there is no meaningful bucket to
 * enumerate, so the query is disabled and `isDemo` is surfaced for the page to
 * render its "available in live mode only" state. This endpoint is Admin-only
 * (403s otherwise), so no fabricated data may stand in for it.
 */
export function useAdminMedia({ kind }: { kind: AdminMediaKind }) {
  const { demoMode } = useDemoMode();

  const query = useInfiniteQuery<AdminMediaPageVM>({
    queryKey: [ADMIN_MEDIA_KEY, kind],
    enabled: !demoMode,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      getAdminMediaPage({
        kind,
        continuationToken: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextContinuationToken ?? undefined,
  });

  const objects = query.data?.pages.flatMap((page) => page.objects) ?? [];

  return {
    ...query,
    objects,
    isDemo: demoMode,
  };
}

/**
 * Permanently delete one stored bucket object (admin-only, live-only). On
 * success every kind-filtered media page is invalidated so the deleted row
 * disappears from the console. Deletes the raw object only — the backend does
 * not clear DB references, so the caller must confirm the warning first.
 */
export function useDeleteAdminMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => deleteAdminMediaObject(key),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [ADMIN_MEDIA_KEY] }),
  });
}
