import type { PublishStatus } from "./PublishRail";

/**
 * The `PATCH .../article/publish` payload for the current click of the
 * Publish/Unpublish button, split out of `ArticleEditorPage#handlePublish`
 * to keep that component under the 200-line cap. Assumes the caller has
 * already gated the button so `scheduledAt` is a valid future instant
 * whenever `publishStatus === "schedule"` and `!published` — see
 * `isFutureInstant`/`publishDisabled` in `ArticleEditorPage`.
 */
export function buildPublishPayload(
  published: boolean,
  publishStatus: PublishStatus,
  scheduledAt: string | null,
): { publishedAt?: string | null } {
  if (published) return { publishedAt: null };
  if (publishStatus === "schedule") {
    return { publishedAt: new Date(scheduledAt!).toISOString() };
  }
  return {};
}

/** The i18n key for the success toast after that same publish action resolves. */
export function publishSuccessToastKey(published: boolean, publishStatus: PublishStatus): string {
  if (published) return "magazine:write.header.unpublishedToast";
  if (publishStatus === "schedule") return "magazine:write.header.scheduledToast";
  return "magazine:write.header.publishedToast";
}
