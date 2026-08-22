import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  deleteAdminMediaObject,
  getAdminMediaPage,
  searchAdminMediaUploaders,
  type AdminMediaKind,
  type AdminMediaPageVM,
  type AdminMediaUploaderResult,
} from "./adminMedia.api";

export const ADMIN_MEDIA_KEY = "admin-media";

/** Shortest term the uploader typeahead fires on — matches the backend's
 *  `MIN_UPLOADER_SEARCH_LENGTH` (a 1-char `ILIKE` would match almost everyone). */
const MIN_UPLOADER_SEARCH_LENGTH = 2;

/**
 * Raw storage-bucket objects for the admin media console, paginated on the S3
 * continuation token. LIVE ONLY: in demo mode there is no meaningful bucket to
 * enumerate, so the query is disabled and `isDemo` is surfaced for the page to
 * render its "available in live mode only" state. This endpoint is Admin-only
 * (403s otherwise), so no fabricated data may stand in for it.
 */
export function useAdminMedia({
  kind,
  uploaderId,
}: {
  kind: AdminMediaKind;
  /** When set, the query lists this member's uploads across all kinds in one
   *  page (no continuation token) and `kind` is ignored. */
  uploaderId?: string;
}) {
  const { demoMode } = useDemoMode();

  const query = useInfiniteQuery<AdminMediaPageVM>({
    queryKey: [ADMIN_MEDIA_KEY, kind, uploaderId ?? null],
    enabled: !demoMode,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      getAdminMediaPage({
        kind,
        uploaderId,
        continuationToken: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextContinuationToken ?? undefined,
  });

  const objects = query.data?.pages.flatMap((page) => page.objects) ?? [];
  // Any degraded page taints the whole console: some reference checks failed,
  // so an object's empty `references` can't be presented as "safe to delete".
  const degraded = query.data?.pages.some((page) => page.degraded) ?? false;

  return {
    ...query,
    objects,
    degraded,
    isDemo: demoMode,
  };
}

/**
 * Member typeahead for the media console's "filter by uploader" search box.
 * Live-only (like the console itself) and disabled until the term reaches
 * `MIN_UPLOADER_SEARCH_LENGTH`, mirroring the backend's short-term guard so a
 * one-character query never fires. `keepPreviousData` keeps the last results
 * on screen while the next keystroke's request is in flight.
 */
export function useAdminMediaUploaders(term: string) {
  const { demoMode } = useDemoMode();
  const trimmed = term.trim();
  const enabled = !demoMode && trimmed.length >= MIN_UPLOADER_SEARCH_LENGTH;

  const query = useQuery<AdminMediaUploaderResult[]>({
    queryKey: [ADMIN_MEDIA_KEY, "uploaders", trimmed],
    enabled,
    queryFn: () => searchAdminMediaUploaders(trimmed),
    placeholderData: (previous) => previous,
  });

  return { ...query, uploaders: query.data ?? [] };
}

/**
 * Permanently delete one stored bucket object (admin-only, live-only). On
 * success every kind-filtered media page is invalidated so the deleted row
 * disappears from the console. Deletes the raw object only — the backend does
 * not clear DB references, so the caller must confirm the warning first.
 *
 * The route refuses a still-referenced object with `409` (the body lists every
 * reference) and an unverifiable one with `503`. `isForced` is the deliberate
 * override for a takedown that must go through anyway; the caller only sets it
 * after showing the admin what breaks.
 */
export function useDeleteAdminMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, isForced }: { key: string; isForced: boolean }) =>
      deleteAdminMediaObject(key, isForced),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [ADMIN_MEDIA_KEY] }),
  });
}
