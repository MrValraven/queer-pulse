import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  demoHiddenRowFor,
  dropCommunityFromUpcomingPages,
  HIDEABLE_UPCOMING_LISTS,
  restoreUpcomingPages,
  type HiddenCommunityTarget,
  type HideCommunityOptions,
  type UnhideVariables,
  type UpcomingListSnapshot,
} from "../hiddenEventCommunities";
import { demoCommunityId } from "../hiddenEventCommunities.data";
import { eventKeys } from "./eventKeys";
import {
  hiddenCommunityErrorMessage,
  hiddenCommunityToastMessage,
  rememberHideToast,
  takeHideToast,
} from "./hiddenCommunityErrors";
import {
  hideEventCommunity,
  placeholderRowFor,
  unhideEventCommunity,
  withSavedRow,
  type HiddenEventCommunityDTO,
} from "./hiddenEventCommunities.api";
import {
  doesHiddenEventStay,
  findCachedCommunityId,
  keepDemoHiddenListForSession,
  refreshAfterLastHiddenChange,
  useIsHiddenCommunityChangePending,
} from "./useHiddenEventCommunities";

export type { HiddenCommunityTarget, HideCommunityOptions };

/**
 * Hide and unhide a community's events, both optimistic: the cards and the
 * hidden list change at once, and a failure puts both back and names the
 * reason. Errors are owned here (`silentError`), so no second generic toast.
 */
export function useHiddenEventCommunityActions() {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const { showToast, dismissToast } = useToast();
  const queryClient = useQueryClient();
  const hiddenListKey = eventKeys.hiddenCommunities(demoMode);

  const readHiddenList = () =>
    queryClient.getQueryData<HiddenEventCommunityDTO[]>(hiddenListKey) ?? [];
  const writeHiddenList = (
    update: (rows: HiddenEventCommunityDTO[]) => HiddenEventCommunityDTO[],
  ) => {
    if (demoMode) keepDemoHiddenListForSession(queryClient);
    queryClient.setQueryData<HiddenEventCommunityDTO[]>(hiddenListKey, (rows) =>
      update(rows ?? []),
    );
  };
  const refreshAfterLastChange = () =>
    refreshAfterLastHiddenChange(queryClient, demoMode);

  const unhideMutation = useMutation({
    mutationKey: [...eventKeys.hiddenCommunitiesRoot, "unhide"],
    meta: { silentError: true },
    mutationFn: (variables: UnhideVariables) =>
      demoMode
        ? Promise.resolve()
        : unhideEventCommunity(variables.communityId).then(() => undefined),
    onMutate: async (variables) => {
      const staleHideToastId = takeHideToast(variables.slug);
      if (staleHideToastId !== undefined) dismissToast(staleHideToastId);
      await queryClient.cancelQueries({ queryKey: hiddenListKey });
      const hiddenListSnapshot = readHiddenList();
      writeHiddenList((rows) =>
        rows.filter((row) => row.communityId !== variables.communityId),
      );
      return { hiddenListSnapshot };
    },
    onSuccess: (_result, variables) => {
      showToast(
        t("gatherings:hiddenCommunities.toast.shown", { name: variables.name }),
        "success",
      );
    },
    onError: (error, variables, context) => {
      if (context) writeHiddenList(() => context.hiddenListSnapshot);
      showToast(
        hiddenCommunityErrorMessage(error, "unhide", variables.name, t),
        "error",
      );
    },
    onSettled: () => void refreshAfterLastChange(),
  });

  /** Unhides a community on the hidden list. One already off it shows, so
   *  this does nothing (a stale toast's Undo, a second tap). */
  const unhide = (target: HiddenCommunityTarget) => {
    const hiddenRow = readHiddenList().find(
      (row) => row.slug === target.slug || row.communityId === target.id,
    );
    if (hiddenRow) unhideMutation.mutate(hiddenRow);
  };

  /** The hide toast; its Undo goes through `unhide`. */
  const showHiddenToast = (
    row: HiddenEventCommunityDTO,
    stayingTitle?: string,
  ) => {
    const toastId = showToast(
      hiddenCommunityToastMessage(row.name, stayingTitle, t),
      "success",
      6000,
      {
        label: t("gatherings:hiddenCommunities.toast.undo"),
        onClick: () => unhide(row),
      },
    );
    rememberHideToast(row.slug, toastId);
  };
  /** A hide from a co-hosted event's card says whether that event stays. */
  const announceCoHostedHide = async (
    row: HiddenEventCommunityDTO,
    fromEvent: { slug: string; title: string },
    refreshing: Promise<boolean>,
  ) => {
    const doesEventStay = await doesHiddenEventStay(
      queryClient,
      demoMode,
      fromEvent.slug,
      refreshing,
    );
    showHiddenToast(row, doesEventStay ? fromEvent.title : undefined);
  };

  const hideMutation = useMutation({
    mutationKey: [...eventKeys.hiddenCommunitiesRoot, "hide"],
    meta: { silentError: true },
    mutationFn: (target: HiddenCommunityTarget) =>
      demoMode
        ? Promise.resolve(demoHiddenRowFor(target))
        : hideEventCommunity(target.slug),
    onMutate: async (target) => {
      await queryClient.cancelQueries(HIDEABLE_UPCOMING_LISTS);
      await queryClient.cancelQueries({ queryKey: hiddenListKey });
      const communityId =
        target.id ??
        findCachedCommunityId(queryClient, target.slug) ??
        (demoMode ? demoCommunityId(target.slug) : undefined);
      const hiddenListSnapshot = readHiddenList();
      const upcomingSnapshot: UpcomingListSnapshot = communityId
        ? dropCommunityFromUpcomingPages(
            queryClient,
            communityId,
            demoMode ? hiddenListSnapshot : undefined,
          )
        : [];
      writeHiddenList((rows) =>
        rows.some((row) => row.slug === target.slug)
          ? rows
          : [placeholderRowFor(target, communityId), ...rows],
      );
      return { upcomingSnapshot, hiddenListSnapshot };
    },
    onSuccess: (row, target) => {
      writeHiddenList((rows) => withSavedRow(rows, row));
      // A hide from a co-hosted event's card is announced in onSettled.
      if (!target.fromEvent?.isCoHosted) showHiddenToast(row);
    },
    onError: (error, target, context) => {
      if (context) {
        restoreUpcomingPages(queryClient, context.upcomingSnapshot);
        writeHiddenList(() => context.hiddenListSnapshot);
      }
      showToast(
        hiddenCommunityErrorMessage(error, "hide", target.name, t),
        "error",
      );
    },
    onSettled: (row, _error, target) => {
      const refreshing = refreshAfterLastChange();
      const fromEvent = target.fromEvent;
      if (row && fromEvent?.isCoHosted) {
        void announceCoHostedHide(row, fromEvent, refreshing);
      }
    },
  });

  const hide = (
    target: HiddenCommunityTarget,
    options?: HideCommunityOptions,
  ) => hideMutation.mutate(target, { onSuccess: () => options?.onHidden?.() });

  const isPending = useIsHiddenCommunityChangePending();

  return { hide, unhide, isPending };
}
