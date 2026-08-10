import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
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
