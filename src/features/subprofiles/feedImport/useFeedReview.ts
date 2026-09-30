import { useState } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { FEED_ERROR_TOKENS, translateFeedError } from "../api/feedImportErrors";
import {
  MAX_ENTRIES_PER_PUBLISH,
  type FeedEntryDTO,
  type FeedEntryStatus,
  type SubprofileFeedDTO,
} from "../api/subprofileFeeds.api";
import { useSubprofileFeedMutations } from "../api/useSubprofileFeedMutations";
import { useFeedEntries } from "../api/useSubprofileFeeds";
import { MAX_ITEMS_PER_SECTION } from "../subprofileEditor.data";
import { useFeedPublish } from "./useFeedPublish";

export type FeedReviewView = Extract<FeedEntryStatus, "pending" | "dismissed">;

/** What the last action said, for the live region under the toolbar. */
export interface FeedReviewMessage {
  tone: "ok" | "error";
  text: string;
}

/** Entries shown before "Show more". Reviewing is done in batches, and a long
 *  backfill (up to 500 episodes) should not mount every row at once. */
const PAGE_SIZE = 20;

/**
 * One feed's review queue: which list is showing (new or dismissed), which
 * entries are ticked, and the publish / dismiss / restore actions with what
 * each one said. The selection is held as ids and read back through the
 * current list, so an entry that left the list (published elsewhere, say)
 * can never stay ticked.
 */
export function useFeedReview(feed: SubprofileFeedDTO) {
  const { t } = useTranslation();
  const { dismiss, restore } = useSubprofileFeedMutations();
  const { publishEntries, isPublishing, lockReasonKey } = useFeedPublish(feed);
  const [view, setViewState] = useState<FeedReviewView>("pending");
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [message, setMessage] = useState<FeedReviewMessage | null>(null);

  const entriesQuery = useFeedEntries(feed.subprofileId, feed.id, view);
  const entries: FeedEntryDTO[] = entriesQuery.data ?? [];
  const selectedEntries = entries.filter((entry) => selectedIds.has(entry.id));
  const isBusy = isPublishing || dismiss.isPending || restore.isPending;

  function setView(next: FeedReviewView) {
    setViewState(next);
    setSelectedIds(new Set());
    setVisibleCount(PAGE_SIZE);
    setMessage(null);
  }

  function toggle(entryId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (!next.delete(entryId)) next.add(entryId);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds(
      selectedEntries.length === entries.length
        ? new Set()
        : new Set(entries.map((entry) => entry.id)),
    );
  }

  async function publish(toPublish: FeedEntryDTO[]) {
    const entryIds = toPublish
      .slice(0, MAX_ENTRIES_PER_PUBLISH)
      .map((entry) => entry.id);
    if (entryIds.length === 0) return;
    setMessage(null);
    const outcome = await publishEntries(entryIds);
    if (outcome.kind === "failed") {
      setMessage({
        tone: "error",
        text: t(outcome.messageKey, FEED_ERROR_TOKENS),
      });
      return;
    }
    setSelectedIds(new Set());
    setMessage({
      tone: "ok",
      text:
        outcome.skipped > 0
          ? t("subprofiles:feedImport.review.result.partial", {
              published: outcome.published,
              skipped: outcome.skipped,
              max: MAX_ITEMS_PER_SECTION,
            })
          : t("subprofiles:feedImport.review.result.published", {
              count: outcome.published,
            }),
    });
  }

  async function moveEntries(
    kind: "dismiss" | "restore",
    moved: FeedEntryDTO[],
  ) {
    if (moved.length === 0) return;
    const target = {
      subprofileId: feed.subprofileId,
      feedId: feed.id,
      entryIds: moved.map((entry) => entry.id),
    };
    setMessage(null);
    try {
      const count =
        kind === "dismiss"
          ? (await dismiss.mutateAsync(target)).dismissed
          : (await restore.mutateAsync(target)).restored;
      setSelectedIds(new Set());
      setMessage({
        tone: "ok",
        text: t(
          kind === "dismiss"
            ? "subprofiles:feedImport.review.result.dismissed"
            : "subprofiles:feedImport.review.result.restored",
          { count },
        ),
      });
    } catch (error) {
      setMessage({
        tone: "error",
        text: translateFeedError(t, error),
      });
    }
  }

  return {
    view,
    setView,
    entriesQuery,
    entries,
    visibleEntries: entries.slice(0, visibleCount),
    hasMore: entries.length > visibleCount,
    showMore: () => setVisibleCount((count) => count + PAGE_SIZE),
    selectedIds,
    selectedEntries,
    toggle,
    toggleAll,
    message,
    isBusy,
    isPublishing,
    lockReasonKey,
    publishSelected: () => publish(selectedEntries),
    publishAll: () => publish(entries),
    dismissSelected: () => moveEntries("dismiss", selectedEntries),
    restoreEntry: (entry: FeedEntryDTO) => moveEntries("restore", [entry]),
  };
}
