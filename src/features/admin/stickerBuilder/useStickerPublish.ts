import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../shared/api/client";
import type {
  AdminStickerPackResponse,
  AdminStickerResponse,
} from "../../../shared/contracts/contracts";
import type { UpdateStickerBody } from "../../stickers/api/adminStickers.api";
import {
  useUploadImage,
  type UploadResult,
} from "../../members/api/useUploadImage";
import { renderStickerBlob } from "../../stickers/render/renderStickerBlob";
import { primitivesToSvg } from "../../stickers/render/primitivesToSvg";
import { STICKER_CANVAS_SIZE } from "../../stickers/templates/unoReverse.params";
import { templateById } from "../../stickers/templates/registry";
import type {
  StickerTemplate,
  TemplateStyle,
} from "../../stickers/templates/templateDefinition";
import {
  ADMIN_STICKER_PACKS_KEY,
  useAddSticker,
  useUpdateSticker,
} from "../../stickers/api/useAdminStickerPacks";
import type {
  ItemPlanEntry,
  ItemRunState,
  PublishFailureReason,
  PublishMode,
  StickerPublishRun,
  StickerPublishSummary,
} from "./stickerBuilder.types";
import { buildItemPlan, type StickerLabels } from "./stickerItems";

interface StartRunArgs {
  pack: AdminStickerPackResponse;
  template: StickerTemplate;
  plan: ItemPlanEntry[];
  mode: PublishMode;
  style: TemplateStyle;
  labelsByItemId: Record<string, StickerLabels>;
}

/** A failed item a retry found already in the pack, carried into the new run
 *  as done. */
interface LandedItem {
  itemId: string;
  action: StickerPublishRun["actionByItem"][string];
}

/** Counts a run's outcomes for the progress bar and the result line. */
export function summarizeRun(
  run: StickerPublishRun | null,
): StickerPublishSummary {
  const summary: StickerPublishSummary = {
    totalCount: 0,
    doneCount: 0,
    failedCount: 0,
    cancelledCount: 0,
    addedCount: 0,
    replacedCount: 0,
  };
  if (!run) return summary;
  summary.totalCount = run.itemIds.length;
  for (const itemId of run.itemIds) {
    const status = run.stateByItem[itemId]?.status;
    if (status === "done") {
      summary.doneCount += 1;
      if (run.actionByItem[itemId] === "replace") summary.replacedCount += 1;
      else summary.addedCount += 1;
    } else if (status === "failed") {
      summary.failedCount += 1;
    } else if (status === "cancelled") {
      summary.cancelledCount += 1;
    }
  }
  return summary;
}

/** How many `cause` links to follow before giving up, so a cyclic chain
 *  cannot loop forever. */
const MAX_CAUSE_DEPTH = 8;

/** The HTTP status of the first `ApiError` in the error's `cause` chain. The
 *  upload hook wraps a presign failure in an `ImageProcessingError` whose
 *  `cause` is the original `ApiError`, so a presign 429 is found here. */
function apiStatusInChain(error: unknown): number | null {
  let current: unknown = error;
  for (let depth = 0; depth < MAX_CAUSE_DEPTH; depth += 1) {
    if (current instanceof ApiError) return current.status;
    if (!(current instanceof Error)) return null;
    current = current.cause;
  }
  return null;
}

/** A status the backend answered with wins over the step that threw it: a
 *  409 means the slug or sticker clashed, a 429 means the rate limit bit. */
function failureReasonOf(
  error: unknown,
  isArtworkStep: boolean,
): PublishFailureReason {
  const apiStatus = apiStatusInChain(error);
  if (apiStatus === 409) return "conflict";
  if (apiStatus === 429) return "rate-limit";
  return isArtworkStep ? "upload" : "unknown";
}

/**
 * The failed items of a finished run, re-planned against the pack as it
 * stands now, against the template the run was drawn with (the caller
 * resolves it first and never calls this when the template is no longer
 * registered). An item whose add landed server-side (a POST that timed out
 * on the way back, then failed as "Already in this pack") becomes a skip in
 * "Add missing only", and a replace targets the sticker the pack holds
 * today.
 */
function retryPlanFor(
  run: StickerPublishRun,
  latestPack: AdminStickerPackResponse,
  template: StickerTemplate,
): ItemPlanEntry[] {
  const failedItemIds = run.itemIds.filter(
    (itemId) => run.stateByItem[itemId]?.status === "failed",
  );
  if (failedItemIds.length === 0) return [];
  return buildItemPlan(template, failedItemIds, latestPack, run.mode);
}

/** The retry plan's skips: items the pack already holds did land, so they
 *  read as done, under the action they were first sent as. */
function landedItemsOf(
  retryPlan: ItemPlanEntry[],
  run: StickerPublishRun,
): LandedItem[] {
  return retryPlan
    .filter((entry) => entry.action === "skip")
    .map((entry) => ({
      itemId: entry.itemId,
      action: run.actionByItem[entry.itemId] ?? "add",
    }));
}

/** One item's rendered artwork, uploaded and ready for `addSticker` or
 *  `updateSticker`, plus the local preview URL the caller must revoke once
 *  it is done with it. Pulled out of `publishItem` so the render-then-upload
 *  steps read as one call there. */
async function uploadItemArtwork(
  template: StickerTemplate,
  style: TemplateStyle,
  itemId: string,
  uploadImage: (file: File) => Promise<UploadResult>,
): Promise<{
  artwork: {
    storageKey: string;
    width: number;
    height: number;
    svgSource: string;
    templateId: string;
    templateParams: Record<string, unknown>;
  };
  previewUrl: string;
}> {
  const primitives = template.geometry(style, itemId);
  const blob = await renderStickerBlob(primitives);
  const file = new File([blob], `${itemId}.png`, { type: "image/png" });
  const uploaded = await uploadImage(file);
  return {
    previewUrl: uploaded.previewUrl,
    artwork: {
      storageKey: uploaded.key,
      width: STICKER_CANVAS_SIZE,
      height: STICKER_CANVAS_SIZE,
      svgSource: primitivesToSvg(primitives, STICKER_CANVAS_SIZE),
      templateId: template.id,
      templateParams: template.toParams(style, itemId),
    },
  };
}

/** A replace's body: the redrawn artwork, plus the Portuguese label whenever
 *  the sticker has none. That covers a sticker published before Portuguese
 *  names existed, and also one whose Portuguese name an admin cleared to
 *  null: a replace fills it again from the item data. The English label
 *  stays as the admin may have edited it. */
function replaceBodyFor(
  existingSticker: AdminStickerResponse,
  artwork: UpdateStickerBody["artwork"],
  labels: StickerLabels | undefined,
): UpdateStickerBody {
  if (!existingSticker.labelPt && labels) {
    return { artwork, labelPt: labels.pt };
  }
  return { artwork };
}

/** An add's English and Portuguese labels. The raw item id stands in only
 *  when the caller resolved no label for the item. */
function addLabelsFor(
  labels: StickerLabels | undefined,
  itemId: string,
): { label: string; labelPt: string | undefined } {
  return { label: labels?.en ?? itemId, labelPt: labels?.pt };
}

/**
 * Publish one sticker per planned item, sequentially, as a run the builder
 * can watch item by item.
 *
 * Sequential on purpose: every item is a presign round trip plus an S3 PUT
 * plus a metadata call, and firing twelve of those at once would burn the
 * per-user presign rate limit (20 per minute) and give no usable progress.
 *
 * An "add" creates the sticker with its English and Portuguese labels and the
 * template item's default keywords. A "replace" sends the redrawn artwork, so
 * the sticker keeps its id, order and cover status, and the label and
 * keywords an admin may have edited stay as they are. The one label a replace
 * does write is a missing Portuguese one, which fills in stickers published
 * before Portuguese names existed.
 *
 * A failure part-way leaves the stickers already written in place and marks
 * that item failed with a reason, so `retryFailed` re-runs only the items
 * that did not land, and the rest of the pack stays untouched.
 *
 * `labelsByItemId` carries both labels (English and Portuguese) for every
 * item the page currently shows, resolved by the caller through
 * `stickerLabelsFor`, each in its own language whatever language the admin
 * reads the builder in. This hook stays translation-free on purpose:
 * resolving labels once in the caller keeps the catalog reads to a single
 * pass, ahead of the sequential loop. A raw item id must never ship as a
 * sticker's label, because that label becomes the sticker's alt text and
 * its reply-quote line.
 */
export function useStickerPublish() {
  const queryClient = useQueryClient();
  const uploadImage = useUploadImage("sticker");
  const addSticker = useAddSticker();
  const updateSticker = useUpdateSticker();
  const [run, setRun] = useState<StickerPublishRun | null>(null);
  const isCancelRequestedRef = useRef(false);
  const isRunningRef = useRef(false);
  // True while this hook instance is mounted. `retryFailed` checks it after
  // its refetch await, so a refetch that resolves once the builder has
  // navigated away stops there rather than starting a run or updating state.
  const isMountedRef = useRef(true);
  // The inputs of the last run, kept so `retryFailed` can rebuild it from
  // its failed items with the same mode, style and labels (the pack itself
  // is read fresh from the admin list, see `retryPlanFor`).
  const lastRunArgsRef = useRef<StartRunArgs | null>(null);
  // Set while `retryFailed` refetches the pack list, so a second tap on
  // Retry in that window does not start a second retry. The ref is the guard
  // (read synchronously inside the callback); the state mirrors it so the
  // Retry button can show that it is busy.
  const isRetryPendingRef = useRef(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const setItemState = useCallback(
    (itemId: string, itemState: ItemRunState) => {
      // Functional on purpose: a fast item can land its "running" and "done"
      // updates in the same tick, and a closure over `run` would drop one.
      setRun((previous) =>
        previous
          ? {
              ...previous,
              stateByItem: { ...previous.stateByItem, [itemId]: itemState },
            }
          : previous,
      );
    },
    [],
  );

  const publishItem = useCallback(
    async (entry: ItemPlanEntry, args: StartRunArgs) => {
      const { itemId } = entry;
      const existingSticker = entry.existingSticker;
      if (entry.action === "replace" && existingSticker === null) {
        // A replace with nothing to replace is a broken plan. Failing the
        // item keeps it visible, where adding would quietly create a second
        // sticker the admin never asked for.
        setItemState(itemId, { status: "failed", failureReason: "unknown" });
        return;
      }
      let isArtworkStep = true;
      let previewUrl: string | null = null;
      try {
        const uploaded = await uploadItemArtwork(
          args.template,
          args.style,
          itemId,
          uploadImage,
        );
        previewUrl = uploaded.previewUrl;
        isArtworkStep = false;
        const labels = args.labelsByItemId[itemId];
        if (existingSticker !== null && entry.action === "replace") {
          await updateSticker.mutateAsync({
            packId: args.pack.id,
            stickerId: existingSticker.id,
            body: replaceBodyFor(existingSticker, uploaded.artwork, labels),
          });
        } else {
          const item = args.template.items.find(
            (templateItem) => templateItem.id === itemId,
          );
          await addSticker.mutateAsync({
            packId: args.pack.id,
            body: {
              ...uploaded.artwork,
              slug: args.template.slugFor(itemId),
              ...addLabelsFor(labels, itemId),
              keywords: item?.keywords,
            },
          });
        }
        setItemState(itemId, { status: "done" });
      } catch (error) {
        setItemState(itemId, {
          status: "failed",
          failureReason: failureReasonOf(error, isArtworkStep),
        });
      } finally {
        // The upload hands its local preview URL to the caller; this loop
        // never shows it, so it is released here.
        if (previewUrl) URL.revokeObjectURL(previewUrl);
      }
    },
    [uploadImage, addSticker, updateSticker, setItemState],
  );

  // `landedItems` are items a retry found already in the pack. They join the
  // new run as done, with the action they were first sent as, so the result
  // line keeps counting them as part of the run they now belong to.
  const startRun = useCallback(
    async (args: StartRunArgs, landedItems: readonly LandedItem[]) => {
      if (isRunningRef.current) return;
      const entries = args.plan.filter((entry) => entry.action !== "skip");
      if (entries.length === 0) return;
      isRunningRef.current = true;
      isCancelRequestedRef.current = false;
      lastRunArgsRef.current = args;
      const actionByItem: StickerPublishRun["actionByItem"] = {};
      const stateByItem: StickerPublishRun["stateByItem"] = {};
      for (const landed of landedItems) {
        actionByItem[landed.itemId] = landed.action;
        stateByItem[landed.itemId] = { status: "done" };
      }
      for (const entry of entries) {
        actionByItem[entry.itemId] =
          entry.action === "replace" ? "replace" : "add";
        stateByItem[entry.itemId] = { status: "queued" };
      }
      setRun({
        packId: args.pack.id,
        packName: args.pack.name,
        mode: args.mode,
        templateId: args.template.id,
        itemIds: [
          ...landedItems.map((landed) => landed.itemId),
          ...entries.map((entry) => entry.itemId),
        ],
        actionByItem,
        stateByItem,
        isRunning: true,
      });
      // The teardown belongs in `finally`, structurally, rather than as the
      // loop's last statements: a synchronous throw between iterations, or a
      // step added later outside its own inner try, must still clear
      // `isRunning`, or the publish bar stays dead until a page reload.
      try {
        for (const [index, entry] of entries.entries()) {
          if (isCancelRequestedRef.current) {
            for (const remaining of entries.slice(index)) {
              setItemState(remaining.itemId, { status: "cancelled" });
            }
            break;
          }
          setItemState(entry.itemId, { status: "running" });
          await publishItem(entry, args);
        }
      } finally {
        isRunningRef.current = false;
        setRun((previous) =>
          previous ? { ...previous, isRunning: false } : previous,
        );
      }
    },
    [publishItem, setItemState],
  );

  const start = useCallback(
    (args: StartRunArgs) => startRun(args, []),
    [startRun],
  );

  const cancel = useCallback(() => {
    if (isRunningRef.current) isCancelRequestedRef.current = true;
  }, []);

  const retryFailed = useCallback(async () => {
    const lastRunArgs = lastRunArgsRef.current;
    if (!run || run.isRunning || !lastRunArgs || isRetryPendingRef.current) {
      return;
    }
    // A template dropped from the registry between the failed run and this
    // retry leaves nothing to redraw the failed items with.
    const template = templateById(run.templateId);
    if (!template) return;
    isRetryPendingRef.current = true;
    setIsRetrying(true);
    try {
      // The cached list can predate a POST that landed and then timed out on
      // the way back. Re-planning from it would send that item as an add
      // again, so the list is read fresh from the server first.
      await queryClient.refetchQueries({
        queryKey: ADMIN_STICKER_PACKS_KEY,
        exact: true,
      });
    } catch {
      // A failed refetch leaves the cache as it was; plan from that.
    }
    // The builder unmounted while the refetch was in flight, so nothing else
    // about this retry proceeds.
    if (!isMountedRef.current) return;
    // Dismissing the run while the list loaded drops the retry, and a run
    // started in that window wins over it.
    const isRetryStillWanted = isRetryPendingRef.current;
    isRetryPendingRef.current = false;
    setIsRetrying(false);
    if (!isRetryStillWanted || isRunningRef.current) return;
    const latestPack =
      queryClient
        .getQueryData<AdminStickerPackResponse[]>(ADMIN_STICKER_PACKS_KEY)
        ?.find((pack) => pack.id === run.packId) ?? lastRunArgs.pack;
    const retryPlan = retryPlanFor(run, latestPack, template);
    if (retryPlan.length === 0) return;
    const landedItems = landedItemsOf(retryPlan, run);
    if (landedItems.length === retryPlan.length) {
      // Nothing is left to send, so this is the whole retry: the marks go on
      // the finished run, and its result line and the grid badges agree with
      // the pack.
      for (const landed of landedItems) {
        setItemState(landed.itemId, { status: "done" });
      }
      return;
    }
    await startRun(
      { ...lastRunArgs, pack: latestPack, template, plan: retryPlan },
      landedItems,
    );
  }, [queryClient, run, setItemState, startRun]);

  const dismiss = useCallback(() => {
    if (isRunningRef.current) return;
    isRetryPendingRef.current = false;
    setIsRetrying(false);
    setRun(null);
  }, []);

  // Leaving the page mid-run strands the items still queued, so the browser
  // asks first while a run is in flight.
  const isRunning = run?.isRunning ?? false;
  useEffect(() => {
    if (!isRunning) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRunning]);

  // An in-app navigation away unmounts the builder; the item in flight
  // finishes and the rest stop, so no sticker lands where nobody can see it.
  // `isMountedRef` is cleared at the same time, so a retry's refetch that
  // resolves after this point sees it and stops in `retryFailed`.
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isCancelRequestedRef.current = true;
      isMountedRef.current = false;
    };
  }, []);

  return { run, isRetrying, start, cancel, retryFailed, dismiss };
}
