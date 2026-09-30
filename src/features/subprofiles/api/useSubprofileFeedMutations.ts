import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  connectFeed,
  disconnectFeed,
  dismissFeedEntries,
  previewFeed,
  publishFeedEntries,
  restoreFeedEntries,
  syncFeed,
  updateFeed,
  type ConnectFeedInput,
  type FeedPreviewDTO,
  type PublishEntriesResult,
  type SubprofileFeedDTO,
  type UpdateFeedInput,
} from "./subprofileFeeds.api";
import { subprofileToView } from "./subprofiles.adapters";
import { subprofileQueryKey } from "./useSubprofile";
import { feedQueryKeys, loadDemoFeeds } from "./useSubprofileFeeds";

export interface FeedTarget {
  subprofileId: string;
  feedId: string;
}

/**
 * Every write for podcast feed import. Each mutation branches demo to live:
 * demo runs the in-memory feed store, live calls the API. The feed components
 * toast their own errors in the member's language, so the global duplicate is
 * silenced on all of them.
 *
 * Invalidation is narrow: a feed write refreshes that persona's feeds list,
 * and entry moves also that feed's entries. A publish additionally adopts the
 * returned persona into the owner-editor cache, exactly as `replaceSection`
 * does, so the editor's baseline and `editVersion` move with it and the new
 * items show in the section editor.
 */
export function useSubprofileFeedMutations() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const refreshFeeds = (subprofileId: string) =>
    queryClient.invalidateQueries({
      queryKey: feedQueryKeys.list(demoMode, subprofileId),
    });
  const refreshEntries = (subprofileId: string, feedId: string) =>
    queryClient.invalidateQueries({
      queryKey: feedQueryKeys.entriesOfFeed(demoMode, subprofileId, feedId),
    });
  const refreshFeedAndEntries = async ({
    subprofileId,
    feedId,
  }: FeedTarget) => {
    await Promise.all([
      refreshFeeds(subprofileId),
      refreshEntries(subprofileId, feedId),
    ]);
  };

  const preview = useMutation<
    FeedPreviewDTO,
    Error,
    { url: string; subprofileId?: string }
  >({
    meta: { silentError: true },
    mutationFn: async ({ url, subprofileId }) => {
      if (!demoMode) return previewFeed(url, subprofileId);
      const { demoPreviewFeed } = await loadDemoFeeds();
      return demoPreviewFeed(url, subprofileId);
    },
  });

  const connect = useMutation<
    SubprofileFeedDTO,
    Error,
    { subprofileId: string; input: ConnectFeedInput }
  >({
    meta: { silentError: true },
    mutationFn: async ({ subprofileId, input }) => {
      if (!demoMode) return connectFeed(subprofileId, input);
      const { demoConnectFeed } = await loadDemoFeeds();
      return demoConnectFeed(subprofileId, input);
    },
    onSuccess: (_feed, { subprofileId }) => refreshFeeds(subprofileId),
  });

  const update = useMutation<
    SubprofileFeedDTO,
    Error,
    FeedTarget & { input: UpdateFeedInput }
  >({
    meta: { silentError: true },
    mutationFn: async ({ subprofileId, feedId, input }) => {
      if (!demoMode) return updateFeed(subprofileId, feedId, input);
      const { demoUpdateFeed } = await loadDemoFeeds();
      return demoUpdateFeed(subprofileId, feedId, input);
    },
    onSuccess: (_feed, { subprofileId }) => refreshFeeds(subprofileId),
  });

  const disconnect = useMutation<void, Error, FeedTarget>({
    meta: { silentError: true },
    mutationFn: async ({ subprofileId, feedId }) => {
      if (!demoMode) return disconnectFeed(subprofileId, feedId);
      const { demoDisconnectFeed } = await loadDemoFeeds();
      demoDisconnectFeed(subprofileId, feedId);
    },
    onSuccess: (_result, { subprofileId, feedId }) => {
      // The feed's entries go with it: drop them rather than refetch a 404.
      queryClient.removeQueries({
        queryKey: feedQueryKeys.entriesOfFeed(demoMode, subprofileId, feedId),
      });
      // Not awaited: the feed's card unmounts as the list refetches, and the
      // caller's follow-up (toast, focus) must not wait on that.
      void refreshFeeds(subprofileId);
    },
  });

  const sync = useMutation<SubprofileFeedDTO, Error, FeedTarget>({
    meta: { silentError: true },
    mutationFn: async ({ subprofileId, feedId }) => {
      if (!demoMode) return syncFeed(subprofileId, feedId);
      const { demoSyncFeed } = await loadDemoFeeds();
      return demoSyncFeed(subprofileId, feedId);
    },
    onSuccess: (_feed, target) => refreshFeedAndEntries(target),
  });

  const publish = useMutation<
    PublishEntriesResult,
    Error,
    FeedTarget & { entryIds: string[]; expectedEditVersion?: number }
  >({
    meta: { silentError: true },
    mutationFn: async ({
      subprofileId,
      feedId,
      entryIds,
      expectedEditVersion,
    }) => {
      const input = { entryIds, expectedEditVersion };
      if (!demoMode) return publishFeedEntries(subprofileId, feedId, input);
      const { demoPublishEntries } = await loadDemoFeeds();
      return demoPublishEntries(subprofileId, feedId, input);
    },
    onSuccess: (result, target) => {
      // The response is the whole owner view, so seed the owner-editor query
      // with it before invalidating (the same adoption `replaceSection` does):
      // the editor reads its `editVersion` and the new items from here.
      queryClient.setQueryData(
        subprofileQueryKey(demoMode, target.subprofileId),
        subprofileToView(result.subprofile),
      );
      void queryClient.invalidateQueries({ queryKey: ["subprofiles"] });
      void queryClient.invalidateQueries({
        queryKey: subprofileQueryKey(demoMode, target.subprofileId),
      });
      void queryClient.invalidateQueries({
        queryKey: ["subprofile", "public"],
      });
      // Not awaited: `mutateAsync` must resolve the moment the server has
      // answered, so the editor takes the new `editVersion` before anything
      // else (a Save in the meantime would carry the old one and conflict).
      void refreshFeedAndEntries(target);
    },
  });

  const dismiss = useMutation<
    { dismissed: number },
    Error,
    FeedTarget & { entryIds: string[] }
  >({
    meta: { silentError: true },
    mutationFn: async ({ subprofileId, feedId, entryIds }) => {
      if (!demoMode) return dismissFeedEntries(subprofileId, feedId, entryIds);
      const { demoDismissEntries } = await loadDemoFeeds();
      return demoDismissEntries(subprofileId, feedId, entryIds);
    },
    onSuccess: (_result, target) => refreshFeedAndEntries(target),
  });

  const restore = useMutation<
    { restored: number },
    Error,
    FeedTarget & { entryIds: string[] }
  >({
    meta: { silentError: true },
    mutationFn: async ({ subprofileId, feedId, entryIds }) => {
      if (!demoMode) return restoreFeedEntries(subprofileId, feedId, entryIds);
      const { demoRestoreEntries } = await loadDemoFeeds();
      return demoRestoreEntries(subprofileId, feedId, entryIds);
    },
    onSuccess: (_result, target) => refreshFeedAndEntries(target),
  });

  return {
    preview,
    connect,
    update,
    disconnect,
    sync,
    publish,
    dismiss,
    restore,
  };
}
