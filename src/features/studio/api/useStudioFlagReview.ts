import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getOpenStudioDisputes,
  getWithdrawnStudioReleases,
  rejectStudioDispute,
  restoreStudioRelease,
  takeDownStudioRelease,
  upholdStudioDispute,
} from "../../admin/api/adminStudio.api";
import { actOnReport, getModReports } from "../../admin/api/moderation.api";
import {
  pageOf,
  toReviewDisputeView,
  toReviewReportView,
  toReviewWithdrawnView,
  type StudioReviewAction,
  type StudioReviewDisputeView,
  type StudioReviewPage,
  type StudioReviewReportView,
  type StudioReviewWithdrawnView,
} from "./studioFlagReview.adapters";
import { type StudioReleaseView } from "./studio.adapters";
import { demoWithdrawalStatus } from "./studioDemoMutations";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { studioKeys } from "./studioQueryKeys";
import {
  refreshReleaseLists,
  syncDemoReleaseLists,
} from "./useStudioReleaseMutations";

/** The panels own every failure state; nothing here toasts. */
const SILENT = { silentError: true } as const;

export interface StudioReviewList<Item> {
  items: Item[];
  loadState: StudioLoadState;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  fetchNextPage: () => void;
}

type ReviewPages<Item> = InfiniteData<StudioReviewPage<Item>, string | null>;

function useReviewList<Item>(
  queryKey: QueryKey,
  readPage: (cursor: string | null) => Promise<StudioReviewPage<Item>>,
): StudioReviewList<Item> {
  const query = useInfiniteQuery<
    StudioReviewPage<Item>,
    Error,
    ReviewPages<Item>,
    QueryKey,
    string | null
  >({
    queryKey,
    initialPageParam: null,
    queryFn: ({ pageParam }) => readPage(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    meta: SILENT,
  });
  return {
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
    loadState: studioLoadStateOf(query, query.data !== undefined),
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
    fetchNextPage: () => {
      void query.fetchNextPage();
    },
  };
}

/** Open reports about Studio releases, from the shared moderation queue. */
export function useStudioReviewReports(): StudioReviewList<StudioReviewReportView> {
  const { demoMode } = useDemoMode();
  return useReviewList(studioKeys.reviewReports(demoMode), async (cursor) => {
    if (demoMode)
      return (await import("./studioDemoFlagReview")).demoReviewReportsPage();
    const response = await getModReports({
      tab: "open",
      subjectType: "studio_release",
      cursor: cursor ?? undefined,
    });
    return pageOf(response.data.map(toReviewReportView), response.pageInfo);
  });
}

/** Open artist disputes, newest first. */
export function useStudioReviewDisputes(): StudioReviewList<StudioReviewDisputeView> {
  const { demoMode } = useDemoMode();
  return useReviewList(studioKeys.reviewDisputes(demoMode), async (cursor) => {
    if (demoMode)
      return (await import("./studioDemoFlagReview")).demoReviewDisputesPage();
    const page = await getOpenStudioDisputes(cursor);
    return pageOf(page.items.map(toReviewDisputeView), page.pageInfo);
  });
}

/** Every release our team has taken down, newest first. */
export function useStudioReviewWithdrawn(): StudioReviewList<StudioReviewWithdrawnView> {
  const { demoMode } = useDemoMode();
  return useReviewList(studioKeys.reviewWithdrawn(demoMode), async (cursor) => {
    if (demoMode)
      return (await import("./studioDemoFlagReview")).demoReviewWithdrawnPage();
    const page = await getWithdrawnStudioReleases(cursor);
    return pageOf(page.items.map(toReviewWithdrawnView), page.pageInfo);
  });
}

async function sendReviewAction(action: StudioReviewAction): Promise<void> {
  switch (action.kind) {
    case "takeDown":
      await takeDownStudioRelease(
        action.releaseId,
        action.reason,
        action.reportId,
      );
      return;
    case "dismiss":
      await actOnReport(action.reportId, {
        action: "dismiss",
        reasonCode: action.reasonCode,
        note: "",
      });
      return;
    case "uphold":
      await upholdStudioDispute(action.disputeId, action.reply);
      return;
    case "reject":
      await rejectStudioDispute(action.disputeId, action.reply);
      return;
    case "restore":
      await restoreStudioRelease(action.releaseId);
      return;
  }
}

function removeFromList<Item>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  isRemoved: (item: Item) => boolean,
): void {
  queryClient.setQueryData<ReviewPages<Item>>(queryKey, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.filter((item) => !isRemoved(item)),
          })),
        }
      : data,
  );
}

function updateInList<Item>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  update: (item: Item) => Item,
): void {
  queryClient.setQueryData<ReviewPages<Item>>(queryKey, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map(update),
          })),
        }
      : data,
  );
}

/** Re-reads all three queues and the moderation console's queue. */
export function refreshReviewQueues(
  queryClient: QueryClient,
  demoMode: boolean,
): void {
  for (const queryKey of [
    studioKeys.reviewReports(demoMode),
    studioKeys.reviewDisputes(demoMode),
    studioKeys.reviewWithdrawn(demoMode),
    ["mod-reports"],
  ])
    void queryClient.invalidateQueries({ queryKey });
}

/** A staff restore, as the server answers it: back to published when the
 *  release had gone live before, else back to draft. */
function restoredStatusOf(release: StudioReleaseView) {
  return release.publishedAt ? ("published" as const) : ("draft" as const);
}

/** The demo's cached release as the decision leaves it. The demo store has
 *  no server to re-read, so the owner's page and the dispute panel patch in
 *  place, and the session's other edits stay. */
function patchDemoRelease(
  queryClient: QueryClient,
  action: StudioReviewAction,
): void {
  if (action.kind === "dismiss") return;
  const decidedAt = new Date().toISOString();
  queryClient.setQueryData<StudioReleaseView>(
    studioKeys.release(true, action.releaseId),
    (release) => {
      if (!release) return release;
      switch (action.kind) {
        case "takeDown":
          return {
            ...demoWithdrawalStatus(release, "taken_down"),
            takedownReason: action.reason,
            canDispute: release.isOwner && release.dispute?.status !== "open",
          };
        case "reject":
          return {
            ...release,
            dispute:
              release.dispute?.id === action.disputeId
                ? {
                    ...release.dispute,
                    status: "rejected",
                    staffReply: action.reply,
                    decidedAt,
                  }
                : release.dispute,
            canDispute: release.isOwner,
          };
        case "uphold":
        case "restore": {
          const status = restoredStatusOf(release);
          return {
            ...demoWithdrawalStatus(release, status),
            takedownReason: null,
            dispute:
              action.kind === "uphold" &&
              release.dispute?.id === action.disputeId
                ? {
                    ...release.dispute,
                    status: "upheld",
                    staffReply: action.reply,
                    decidedAt,
                  }
                : release.dispute,
            canDispute: false,
          };
        }
      }
    },
  );
  if (action.kind === "reject") return;
  // The demo has no refetch: owner lists and Upcoming follow the new status.
  const patched = queryClient.getQueryData<StudioReleaseView>(
    studioKeys.release(true, action.releaseId),
  );
  if (patched) syncDemoReleaseLists(queryClient, patched, false);
}

/**
 * The cards a decision settles leave their queues once the server confirms
 * (onSuccess), so the confirm dialog stays mounted while the request runs.
 * A takedown settles every report about its release (PLAN-1), an uphold the
 * release's Withdrawn row too, and a reject clears that row's open dispute.
 * Then all three queues read again. Live, every reader of the release reads
 * again too (its page, its tracks, the lists that show it, the report's
 * detail); the demo patches its cached release instead, since a re-read
 * would answer the fixtures and drop the session's edits.
 */
export function applyReviewOutcome(
  queryClient: QueryClient,
  demoMode: boolean,
  action: StudioReviewAction,
): void {
  const reports = studioKeys.reviewReports(demoMode);
  const disputes = studioKeys.reviewDisputes(demoMode);
  const withdrawn = studioKeys.reviewWithdrawn(demoMode);
  switch (action.kind) {
    case "takeDown":
      removeFromList<StudioReviewReportView>(
        queryClient,
        reports,
        (item) => item.releaseId === action.releaseId,
      );
      break;
    case "dismiss":
      removeFromList<StudioReviewReportView>(
        queryClient,
        reports,
        (item) => item.reportId === action.reportId,
      );
      break;
    case "uphold":
      removeFromList<StudioReviewDisputeView>(
        queryClient,
        disputes,
        (item) => item.disputeId === action.disputeId,
      );
      removeFromList<StudioReviewWithdrawnView>(
        queryClient,
        withdrawn,
        (item) => item.release.id === action.releaseId,
      );
      break;
    case "reject":
      removeFromList<StudioReviewDisputeView>(
        queryClient,
        disputes,
        (item) => item.disputeId === action.disputeId,
      );
      // The release stays down with no open dispute, so its Withdrawn row
      // restores through the plain restore from now on (as the demo store).
      updateInList<StudioReviewWithdrawnView>(queryClient, withdrawn, (item) =>
        item.openDisputeId === action.disputeId
          ? { ...item, openDisputeId: null }
          : item,
      );
      break;
    case "restore":
      removeFromList<StudioReviewWithdrawnView>(
        queryClient,
        withdrawn,
        (item) => item.release.id === action.releaseId,
      );
      break;
  }
  refreshReviewQueues(queryClient, demoMode);
  if (demoMode) {
    patchDemoRelease(queryClient, action);
    return;
  }
  void queryClient.invalidateQueries({ queryKey: ["mod-report"] });
  if (action.kind === "dismiss") return;
  void queryClient.invalidateQueries({ queryKey: ["admin-studio", "release"] });
  void queryClient.invalidateQueries({ queryKey: ["studio", "release"] });
  void queryClient.invalidateQueries({ queryKey: ["studio", "track"] });
  // A reject changes only the dispute: the release stays down, so no list
  // that shows it changes.
  if (action.kind !== "reject")
    refreshReleaseLists(queryClient, false, undefined);
}

/** One staff decision. The panel hosting the dialog waits for it; a refusal
 *  (an already decided dispute, an already handled report) re-reads the
 *  queues, since the card it was about has moved on. */
export function useStudioReviewAction() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, StudioReviewAction>({
    meta: SILENT,
    mutationFn: async (action) =>
      demoMode
        ? (await import("./studioDemoFlagReview")).demoApplyReviewAction(action)
        : sendReviewAction(action),
    onSuccess: (_result, action) =>
      applyReviewOutcome(queryClient, demoMode, action),
    onError: () => refreshReviewQueues(queryClient, demoMode),
  });
}
