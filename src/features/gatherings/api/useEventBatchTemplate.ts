import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import {
  getEventBatchTemplate,
  type EventBatchTemplateDTO,
} from "./eventBatch.api";

/** Prefix of every batch-template read (any slug, any mode). */
export const EVENT_BATCH_TEMPLATE_KEY_ROOT = ["event-batch-template"] as const;

/** Retries a server fault or a dropped connection twice; a 4xx answer names
 *  a cause (no access, a missing event, a community-only event) that a retry cannot fix. */
function shouldRetryTemplateRead(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.status < 500) return false;
  return failureCount < 2;
}

/**
 * What a batch would copy from one of the member's events
 * (`GET /events/:slug/batch-template`), idle until a slug is picked. The page
 * names every failure reason itself, so the global error toast stays quiet.
 * Demo mode reads the stand-in in `addMonth/eventBatchDemo.ts`.
 */
export function useEventBatchTemplate(
  slug: string | undefined,
): UseQueryResult<EventBatchTemplateDTO, Error> {
  const { demoMode } = useDemoMode();
  return useQuery<EventBatchTemplateDTO, Error>({
    queryKey: [...EVENT_BATCH_TEMPLATE_KEY_ROOT, slug, demoMode],
    enabled: Boolean(slug),
    meta: { silentError: true },
    retry: shouldRetryTemplateRead,
    queryFn: async () => {
      const templateSlug = slug ?? "";
      if (demoMode) {
        const { demoEventBatchTemplate } =
          await import("../addMonth/eventBatchDemo");
        return demoEventBatchTemplate(templateSlug);
      }
      return getEventBatchTemplate(templateSlug);
    },
  });
}
